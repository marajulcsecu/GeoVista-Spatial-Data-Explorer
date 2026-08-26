import { describe, it, expect } from 'vitest';
import { normalizeDataset } from '../../src/importers/normalizeDataset';
import { createEmptyValidationReport } from '../../src/validation/validationTypes';
import type { FeatureCollection, Point } from 'geojson';

describe('normalizeDataset', () => {
  it('normalizes a raw Point FeatureCollection and generates internal IDs and display names', () => {
    const rawFC: FeatureCollection<Point, any> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            Point_ID: 1,
            Point_Name: 'Test Gate',
            Category: 'Entrance',
            Description: 'Main entry'
          },
          geometry: {
            type: 'Point',
            coordinates: [91.7899, 22.4616]
          }
        },
        {
          type: 'Feature',
          properties: {
            Point_ID: 2,
            Point_Name: 'Test Lake',
            Category: 'Water Feature'
          },
          geometry: {
            type: 'Point',
            coordinates: [91.7915, 22.4607]
          }
        }
      ]
    };

    const dataset = normalizeDataset(rawFC, {
      sourceFormat: 'geojson',
      originalFileName: 'test_dataset.geojson',
      fileSizeBytes: 1024,
      validationReport: createEmptyValidationReport()
    });

    expect(dataset.name).toBe('Test Dataset');
    expect(dataset.sourceFormat).toBe('geojson');
    expect(dataset.featureCollection.features).toHaveLength(2);

    const feat0 = dataset.featureCollection.features[0];
    expect(feat0.properties.__internalId).toBe('feat_0');
    expect(feat0.properties.__displayName).toBe('Test Gate');
    expect(feat0.properties.__category).toBe('Entrance');
    expect(feat0.properties.Description).toBe('Main entry'); // preserved original
    expect(feat0.properties.__formattedCoords).toBeDefined();

    expect(dataset.categories).toHaveLength(2);
    expect(dataset.primaryCategoryField).toBe('Category');
    expect(dataset.primaryLabelField).toBe('Point_Name');

    // Bbox should contain points
    expect(dataset.bbox[0]).toBeLessThanOrEqual(91.7899);
    expect(dataset.bbox[1]).toBeLessThanOrEqual(22.4607);
    expect(dataset.bbox[2]).toBeGreaterThanOrEqual(91.7915);
    expect(dataset.bbox[3]).toBeGreaterThanOrEqual(22.4616);
  });
});
