import type { SpatialDataset } from '../types/spatial';
import { generateExportFileName } from '../utils/fileNames';

/**
 * Downloads normalized GeoJSON for a dataset, stripping internal reserved keys.
 */
export function exportDatasetToGeoJSON(
  dataset: SpatialDataset,
  options?: { visibleCategoriesOnly?: boolean; categoryFilter?: Record<string, boolean> }
): void {
  let features = dataset.featureCollection.features;

  if (options?.visibleCategoriesOnly && options.categoryFilter) {
    features = features.filter((f) => {
      const cat = f.properties.__category || 'Uncategorized';
      return options.categoryFilter![cat] !== false;
    });
  }

  // Clean properties by removing internal __ fields
  const cleanFeatures = features.map((f) => {
    const cleanProps: Record<string, unknown> = {};
    Object.entries(f.properties).forEach(([key, val]) => {
      if (!key.startsWith('__')) {
        cleanProps[key] = val;
      }
    });
    return {
      type: 'Feature',
      id: f.id,
      geometry: f.geometry,
      properties: cleanProps
    };
  });

  const exportObj = {
    type: 'FeatureCollection',
    name: dataset.name,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: cleanFeatures
  };

  const jsonStr = JSON.stringify(exportObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/geo+json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = generateExportFileName(dataset.name, 'geojson');

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
