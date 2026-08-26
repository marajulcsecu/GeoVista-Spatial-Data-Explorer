import type { FeatureCollection, Geometry } from 'geojson';
import type { SpatialDataset } from '../types/spatial';
import { validateGeoJSON } from '../validation/validateGeoJSON';
import { normalizeDataset } from './normalizeDataset';

export async function importGeoJSON(
  input: File | string,
  fileName?: string
): Promise<SpatialDataset> {
  let text = '';
  let name = fileName || 'dataset.geojson';
  let size = 0;

  if (typeof input === 'string') {
    text = input;
    size = new Blob([text]).size;
  } else {
    name = input.name;
    size = input.size;
    text = await input.text();
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (err: any) {
    throw new Error(`Malformed JSON file: ${err?.message || 'Invalid syntax'}`);
  }

  let fc: FeatureCollection<Geometry, any>;

  if (parsed.type === 'FeatureCollection') {
    fc = parsed;
  } else if (parsed.type === 'Feature') {
    fc = {
      type: 'FeatureCollection',
      features: [parsed]
    };
  } else if (parsed.type && ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].includes(parsed.type)) {
    fc = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: parsed,
          properties: {}
        }
      ]
    };
  } else {
    throw new Error(`Unsupported GeoJSON structure "${parsed.type || 'Object'}". Expected a FeatureCollection or Feature.`);
  }

  const validationReport = validateGeoJSON(fc);

  return normalizeDataset(fc, {
    sourceFormat: 'geojson',
    originalFileName: name,
    fileSizeBytes: size,
    detectedCrs: 'EPSG:4326 (WGS 84)',
    validationReport
  });
}
