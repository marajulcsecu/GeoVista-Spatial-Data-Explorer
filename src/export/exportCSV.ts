import Papa from 'papaparse';
import type { SpatialDataset } from '../types/spatial';
import { generateExportFileName } from '../utils/fileNames';

/**
 * Exports spatial dataset features as a clean CSV file.
 */
export function exportDatasetToCSV(
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

  const rows: Record<string, unknown>[] = features.map((f) => {
    const row: Record<string, unknown> = {};

    // Coordinates
    if (f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates)) {
      row['Longitude'] = f.geometry.coordinates[0];
      row['Latitude'] = f.geometry.coordinates[1];
    }

    // Original properties
    Object.entries(f.properties).forEach(([k, v]) => {
      if (!k.startsWith('__')) {
        row[k] = v;
      }
    });

    return row;
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const filename = generateExportFileName(dataset.name, 'csv');

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
