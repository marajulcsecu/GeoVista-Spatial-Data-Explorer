import Papa from 'papaparse';
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { CsvColumnMapping, SpatialDataset } from '../types/spatial';
import { validateCsvRows } from '../validation/validateCSV';
import { normalizeDataset } from './normalizeDataset';

export const LON_CANDIDATES = ['longitude', 'long', 'lng', 'lon', 'x', 'east', 'easting', 'coord_x', 'gps_lng', 'gps_lon'];
export const LAT_CANDIDATES = ['latitude', 'lat', 'y', 'north', 'northing', 'coord_y', 'gps_lat'];
export const LABEL_CANDIDATES = ['point_name', 'pointname', 'name', 'title', 'label', 'point_id', 'id'];
export const CAT_CANDIDATES = ['category', 'type', 'class', 'zone', 'group', 'layer'];
export const DESC_CANDIDATES = ['description', 'details', 'remarks', 'desc', 'comment'];

/**
 * Automatically infers best-guess column mapping from header list.
 */
export function inferCsvMapping(headers: string[]): Partial<CsvColumnMapping> {
  const mapping: Partial<CsvColumnMapping> = {};
  const lower = headers.map(h => h.toLowerCase().trim());

  const findMatch = (candidates: string[]): string | undefined => {
    for (const cand of candidates) {
      const idx = lower.findIndex(h => h === cand || h.includes(cand));
      if (idx !== -1) return headers[idx];
    }
    return undefined;
  };

  mapping.longitudeField = findMatch(LON_CANDIDATES);
  mapping.latitudeField = findMatch(LAT_CANDIDATES);
  mapping.labelField = findMatch(LABEL_CANDIDATES);
  mapping.categoryField = findMatch(CAT_CANDIDATES);
  mapping.descriptionField = findMatch(DESC_CANDIDATES);

  return mapping;
}

export async function parseCsvFile(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = (results.data as Record<string, unknown>[]).filter(r => Object.keys(r).length > 0);
        resolve({ headers, rows });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
}

export async function importCSV(
  file: File,
  explicitMapping?: CsvColumnMapping
): Promise<SpatialDataset> {
  const { headers, rows } = await parseCsvFile(file);

  let mapping: CsvColumnMapping;

  if (explicitMapping && explicitMapping.longitudeField && explicitMapping.latitudeField) {
    mapping = explicitMapping;
  } else {
    const inferred = inferCsvMapping(headers);
    if (!inferred.longitudeField || !inferred.latitudeField) {
      const error: any = new Error('CSV coordinate columns could not be automatically determined.');
      error.needsMapping = true;
      error.headers = headers;
      error.rawRows = rows;
      throw error;
    }
    mapping = {
      longitudeField: inferred.longitudeField,
      latitudeField: inferred.latitudeField,
      labelField: inferred.labelField,
      categoryField: inferred.categoryField,
      descriptionField: inferred.descriptionField
    };
  }

  const { report, validRows } = validateCsvRows(rows, mapping);

  if (validRows.length === 0) {
    throw new Error('No valid coordinate rows could be found in the CSV file.');
  }

  const features: Feature<Point, any>[] = validRows.map(({ row, lng, lat }, idx) => {
    return {
      type: 'Feature',
      id: idx + 1,
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: { ...row }
    };
  });

  const fc: FeatureCollection<Point, any> = {
    type: 'FeatureCollection',
    features
  };

  return normalizeDataset(fc, {
    sourceFormat: 'csv',
    originalFileName: file.name,
    fileSizeBytes: file.size,
    detectedCrs: 'WGS 84 (Mapped from CSV Coordinates)',
    validationReport: report
  });
}
