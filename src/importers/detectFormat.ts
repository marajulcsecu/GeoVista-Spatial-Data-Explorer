import type { SupportedFormat } from '../types/spatial';

/**
 * Detects format based on filename and magic bytes.
 */
export async function detectFormat(file: File): Promise<SupportedFormat> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.geojson') || name.endsWith('.json')) {
    return 'geojson';
  }

  if (name.endsWith('.zip')) {
    return 'shapefile';
  }

  if (name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt')) {
    return 'csv';
  }

  // Inspect first 4 magic bytes for ZIP archives (PK..)
  try {
    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      return 'shapefile';
    }
  } catch {
    // fallback to unknown
  }

  return 'unknown';
}
