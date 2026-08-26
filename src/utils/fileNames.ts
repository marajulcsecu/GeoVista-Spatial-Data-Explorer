/**
 * Cleans a filename into a user-friendly layer title.
 */
export function cleanDatasetName(fileName: string): string {
  if (!fileName) return 'Untitled Dataset';
  // Strip extension
  let base = fileName.replace(/\.[^/.]+$/, '');
  // Replace underscores and hyphens with spaces
  base = base.replace(/[_-]+/g, ' ');
  // Title case words
  return base
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates an export filename with timestamp and clean prefix.
 */
export function generateExportFileName(datasetName: string, extension: string): string {
  const clean = datasetName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${clean || 'geovista_export'}_${timestamp}.${extension.replace(/^\./, '')}`;
}
