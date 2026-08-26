import type { CsvColumnMapping, ValidationMessage, ValidationReport } from '../types/spatial';
import { isValidWgs84 } from '../utils/coordinates';

export function validateCsvRows(
  rows: Record<string, unknown>[],
  mapping: CsvColumnMapping
): { report: ValidationReport; validRows: { row: Record<string, unknown>; lng: number; lat: number; originalRowIndex: number }[] } {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const info: ValidationMessage[] = [];
  const validRows: { row: Record<string, unknown>; lng: number; lat: number; originalRowIndex: number }[] = [];

  const pointCoordsSet = new Set<string>();
  const idSet = new Set<string>();
  let duplicatePoints = 0;
  let duplicateIds = 0;

  if (!rows || rows.length === 0) {
    errors.push({
      id: 'err_empty_csv',
      severity: 'error',
      title: 'Empty CSV File',
      message: 'The uploaded CSV file has no data rows.'
    });
    return {
      report: {
        isValid: false,
        errors,
        warnings,
        info,
        totalFeatures: 0,
        validFeaturesCount: 0,
        invalidFeaturesCount: 0,
        geometryTypeCounts: {},
        duplicateCoordinatesCount: 0
      },
      validRows: []
    };
  }

  if (!mapping.longitudeField || !mapping.latitudeField) {
    errors.push({
      id: 'err_no_coord_mapping',
      severity: 'error',
      title: 'Missing Coordinate Columns',
      message: 'Please map the Longitude (X) and Latitude (Y) columns to proceed.'
    });
    return {
      report: {
        isValid: false,
        errors,
        warnings,
        info,
        totalFeatures: rows.length,
        validFeaturesCount: 0,
        invalidFeaturesCount: rows.length,
        geometryTypeCounts: {},
        duplicateCoordinatesCount: 0
      },
      validRows: []
    };
  }

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // account for 1-based index and header row
    const rawLng = row[mapping.longitudeField];
    const rawLat = row[mapping.latitudeField];

    if (rawLng === undefined || rawLng === null || rawLng === '' ||
        rawLat === undefined || rawLat === null || rawLat === '') {
      warnings.push({
        id: `warn_blank_coords_${idx}`,
        severity: 'warning',
        title: `Row ${rowNum}: Blank Coordinates`,
        message: `Missing coordinate values in row ${rowNum}. Row will be skipped.`,
        context: { rowNumber: rowNum }
      });
      return;
    }

    const lng = parseFloat(String(rawLng).trim().replace(/[^\d.-]/g, ''));
    const lat = parseFloat(String(rawLat).trim().replace(/[^\d.-]/g, ''));

    if (isNaN(lng) || isNaN(lat)) {
      warnings.push({
        id: `warn_nan_coords_${idx}`,
        severity: 'warning',
        title: `Row ${rowNum}: Non-Numeric Coordinates`,
        message: `Coordinates '${rawLng}', '${rawLat}' could not be parsed as numbers.`,
        context: { rowNumber: rowNum, rawCoordinate: { rawLng, rawLat } }
      });
      return;
    }

    if (!isValidWgs84(lng, lat)) {
      warnings.push({
        id: `warn_out_of_bounds_${idx}`,
        severity: 'warning',
        title: `Row ${rowNum}: Coordinates Out of Range`,
        message: `Coordinates [${lng}, ${lat}] fall outside valid WGS 84 bounds [-180..180, -90..90].`,
        context: { rowNumber: rowNum, rawCoordinate: [lng, lat] }
      });
      return;
    }

    // Check duplicate coords
    const coordKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
    if (pointCoordsSet.has(coordKey)) {
      duplicatePoints++;
    } else {
      pointCoordsSet.add(coordKey);
    }

    // Check duplicate ID
    if (mapping.labelField && row[mapping.labelField]) {
      const idVal = String(row[mapping.labelField]);
      if (idSet.has(idVal)) {
        duplicateIds++;
      } else {
        idSet.add(idVal);
      }
    }

    validRows.push({ row, lng, lat, originalRowIndex: rowNum });
  });

  if (duplicatePoints > 0) {
    info.push({
      id: 'info_duplicate_points_csv',
      severity: 'info',
      title: 'Identical Coordinates Detected',
      message: `Found ${duplicatePoints} point(s) sharing exact identical coordinates with another row.`
    });
  }

  if (duplicateIds > 0) {
    warnings.push({
      id: 'warn_duplicate_ids',
      severity: 'warning',
      title: 'Duplicate Identifiers Found',
      message: `Found ${duplicateIds} row(s) with duplicate label / ID values.`
    });
  }

  info.push({
    id: 'info_csv_mapped',
    severity: 'info',
    title: 'CSV Column Mapping Successful',
    message: `Mapped X: '${mapping.longitudeField}', Y: '${mapping.latitudeField}' across ${validRows.length} valid feature rows.`
  });

  return {
    report: {
      isValid: errors.length === 0 && validRows.length > 0,
      errors,
      warnings,
      info,
      totalFeatures: rows.length,
      validFeaturesCount: validRows.length,
      invalidFeaturesCount: rows.length - validRows.length,
      geometryTypeCounts: { Point: validRows.length },
      duplicateCoordinatesCount: duplicatePoints
    },
    validRows
  };
}
