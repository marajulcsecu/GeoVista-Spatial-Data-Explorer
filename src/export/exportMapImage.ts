import { generateExportFileName } from '../utils/fileNames';

/**
 * Captures the current WebGL map view and triggers image download.
 */
export async function exportMapScreenshot(datasetName?: string): Promise<void> {
  const canvas = document.querySelector('.maplibregl-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('Map canvas not found for screenshot export.');
  }

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const filename = generateExportFileName(datasetName || 'map_view', 'png');

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err: any) {
    throw new Error(`Failed to capture map image: ${err?.message || 'Canvas tainted'}`);
  }
}
