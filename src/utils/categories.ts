import type { CategoryMeta } from '../types/spatial';

/**
 * Standard palette for curated categories (e.g. Group 6 survey)
 */
export const PRESET_CATEGORY_COLORS: Record<string, string> = {
  Administration: '#3B82F6', // Blue
  Entrance: '#10B981',       // Emerald Green
  Facility: '#F59E0B',       // Amber
  'Open Space': '#84CC16',   // Lime Green
  Recreation: '#EC4899',     // Pink
  Road: '#94A3B8',           // Slate
  'Terrain Feature': '#8B5CF6', // Purple
  Vegetation: '#059669',     // Forest Green
  Viewpoint: '#06B6D4',      // Cyan
  'Water Channel': '#0284C7',// Sky Blue
  'Water Feature': '#2563EB',// Royal Blue
};

/**
 * Generates an accessible, distinct HSL color based on index.
 */
export function generateDistinctColor(index: number): string {
  // Golden angle approximation for optimal hue distribution
  const hue = (index * 137.508) % 360;
  return `hsl(${Math.round(hue)}, 75%, 52%)`;
}

/**
 * Extracts unique categories and assigns balanced color swatches.
 */
export function extractCategoriesFromValues(
  rawValues: (string | undefined | null)[]
): CategoryMeta[] {
  const counts = new Map<string, number>();

  rawValues.forEach((val) => {
    const category = val && String(val).trim().length > 0 ? String(val).trim() : 'Uncategorized';
    counts.set(category, (counts.get(category) || 0) + 1);
  });

  const categories: CategoryMeta[] = [];
  let colorIndex = 0;

  counts.forEach((count, name) => {
    let color = PRESET_CATEGORY_COLORS[name];
    if (!color) {
      color = generateDistinctColor(colorIndex);
      colorIndex++;
    }
    categories.push({
      name,
      color,
      count,
      visible: true
    });
  });

  // Sort descending by count, but put 'Uncategorized' at the end
  return categories.sort((a, b) => {
    if (a.name === 'Uncategorized') return 1;
    if (b.name === 'Uncategorized') return -1;
    return b.count - a.count;
  });
}
