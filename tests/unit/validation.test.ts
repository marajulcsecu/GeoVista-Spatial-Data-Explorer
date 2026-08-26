import { describe, it, expect } from 'vitest';
import { validateGeoJSON } from '../../src/validation/validateGeoJSON';
import { validateShapefileZip } from '../../src/validation/validateShapefile';
import { validateCsvRows } from '../../src/validation/validateCSV';

describe('Validation Engine', () => {
  describe('validateGeoJSON', () => {
    it('passes for valid FeatureCollection', () => {
      const fc: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [91.78, 22.46] },
            properties: { name: 'P1' }
          }
        ]
      };
      const report = validateGeoJSON(fc);
      expect(report.isValid).toBe(true);
      expect(report.errors).toHaveLength(0);
      expect(report.validFeaturesCount).toBe(1);
    });

    it('detects out-of-bounds coordinates', () => {
      const fc: any = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [200.0, 95.0] }, // invalid!
            properties: { name: 'Invalid Point' }
          }
        ]
      };
      const report = validateGeoJSON(fc);
      expect(report.warnings.length).toBeGreaterThan(0);
      expect(report.invalidFeaturesCount).toBe(1);
    });
  });

  describe('validateShapefileZip', () => {
    it('flags error when .shp is missing', () => {
      const report = validateShapefileZip(['data.dbf', 'data.prj']);
      expect(report.isValid).toBe(false);
      expect(report.errors[0].id).toBe('err_no_shp');
    });

    it('flags warning when .dbf or .prj is missing', () => {
      const report = validateShapefileZip(['data.shp']);
      expect(report.isValid).toBe(true);
      expect(report.warnings.some((w) => w.id === 'warn_missing_dbf')).toBe(true);
      expect(report.warnings.some((w) => w.id === 'warn_missing_prj')).toBe(true);
    });
  });

  describe('validateCsvRows', () => {
    it('validates CSV rows with correct mapping and skips invalid rows', () => {
      const rows = [
        { Longitude: 91.789, Latitude: 22.461, Name: 'Valid 1' },
        { Longitude: 'not-a-number', Latitude: 22.461, Name: 'Bad Coord' },
        { Longitude: 91.790, Latitude: 22.462, Name: 'Valid 2' }
      ];

      const { report, validRows } = validateCsvRows(rows, {
        longitudeField: 'Longitude',
        latitudeField: 'Latitude',
        labelField: 'Name'
      });

      expect(report.isValid).toBe(true);
      expect(validRows).toHaveLength(2);
      expect(report.warnings.some((w) => w.id.includes('warn_nan_coords'))).toBe(true);
    });
  });
});
