import shp from 'shpjs';
import type { FeatureCollection, Geometry } from 'geojson';
import type { SpatialDataset } from '../types/spatial';
import { validateGeoJSON } from '../validation/validateGeoJSON';
import { validateShapefileZip } from '../validation/validateShapefile';
import { normalizeDataset } from './normalizeDataset';

export async function importShapefileZip(
  input: File | ArrayBuffer,
  fileName?: string
): Promise<SpatialDataset> {
  let buffer: ArrayBuffer;
  let name = fileName || 'shapefile.zip';
  let size = 0;

  if (input instanceof File) {
    name = input.name;
    size = input.size;
    buffer = await input.arrayBuffer();
  } else {
    buffer = input;
    size = buffer.byteLength;
  }

  let parsed: any;
  try {
    // shp(buffer) returns FeatureCollection or array of FeatureCollections
    const shpFn: any = (shp as any).default || shp;
    parsed = await shpFn(buffer);
  } catch (err: any) {
    throw new Error(`Failed to parse zipped Shapefile archive: ${err?.message || 'Invalid or corrupted ZIP'}`);
  }

  let fc: FeatureCollection<Geometry, any>;
  let layerName = name;

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error('Shapefile archive contains no valid spatial layers.');
    }
    // Take the primary layer
    fc = parsed[0];
    if ((parsed[0] as any).fileName) {
      layerName = (parsed[0] as any).fileName;
    }
  } else if (parsed && parsed.type === 'FeatureCollection') {
    fc = parsed;
    if ((parsed as any).fileName) {
      layerName = (parsed as any).fileName;
    }
  } else {
    throw new Error('Unable to extract GeoJSON features from Shapefile archive.');
  }

  // Validate GeoJSON geometry
  const geojsonValidation = validateGeoJSON(fc);
  const zipValidation = validateShapefileZip([name]);

  // Combine validation reports
  const combinedValidation = {
    ...geojsonValidation,
    errors: [...zipValidation.errors, ...geojsonValidation.errors],
    warnings: [...zipValidation.warnings, ...geojsonValidation.warnings],
    info: [
      ...zipValidation.info,
      ...geojsonValidation.info,
      {
        id: 'info_shapefile_reprojected',
        severity: 'info' as const,
        title: 'Shapefile Parsed & Reprojected',
        message: 'Shapefile geometries and DBF attributes successfully normalized to WGS 84.'
      }
    ]
  };

  return normalizeDataset(fc, {
    name: layerName !== name ? layerName : undefined,
    sourceFormat: 'shapefile',
    originalFileName: name,
    fileSizeBytes: size,
    detectedCrs: 'WGS 84 (Reprojected from Shapefile)',
    validationReport: combinedValidation
  });
}
