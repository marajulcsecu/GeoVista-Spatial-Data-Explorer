import type { LayerSpecification } from 'maplibre-gl';
import type { SpatialDataset } from '../types/spatial';

/**
 * Builds a MapLibre categorical color expression matching feature `__category`.
 */
export function buildCategoryColorExpression(
  dataset: SpatialDataset,
  fallbackColor: string = '#3B82F6'
): any {
  const customMap = dataset.style.customColorMap || {};
  const entries: any[] = ['match', ['get', '__category']];

  Object.entries(customMap).forEach(([catName, color]) => {
    entries.push(catName, color);
  });

  // fallback default color
  entries.push(dataset.style.fillColor || fallbackColor);

  return entries.length > 3 ? entries : dataset.style.fillColor || fallbackColor;
}

/**
 * Generates all MapLibre GL layer specifications for a SpatialDataset.
 */
export function createDatasetLayerSpecs(dataset: SpatialDataset): LayerSpecification[] {
  const sourceId = `source_${dataset.id}`;
  const colorExpr = buildCategoryColorExpression(dataset);

  const polygonFillLayer: LayerSpecification = {
    id: `layer_${dataset.id}_fill`,
    type: 'fill',
    source: sourceId,
    filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
    paint: {
      'fill-color': colorExpr,
      'fill-opacity': dataset.style.fillOpacity * dataset.opacity
    },
    layout: {
      visibility: dataset.visible ? 'visible' : 'none'
    }
  };

  const lineLayer: LayerSpecification = {
    id: `layer_${dataset.id}_line`,
    type: 'line',
    source: sourceId,
    filter: ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon']]],
    paint: {
      'line-color': colorExpr,
      'line-width': dataset.style.strokeWidth,
      'line-opacity': dataset.opacity
    },
    layout: {
      visibility: dataset.visible ? 'visible' : 'none',
      'line-join': 'round',
      'line-cap': 'round'
    }
  };

  const pointCircleLayer: LayerSpecification = {
    id: `layer_${dataset.id}_point`,
    type: 'circle',
    source: sourceId,
    filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        dataset.style.pointRadius + 3,
        dataset.style.pointRadius
      ],
      'circle-color': colorExpr,
      'circle-stroke-width': dataset.style.strokeWidth,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': dataset.opacity,
      'circle-stroke-opacity': dataset.opacity
    },
    layout: {
      visibility: dataset.visible ? 'visible' : 'none'
    }
  };

  const labelLayer: LayerSpecification = {
    id: `layer_${dataset.id}_label`,
    type: 'symbol',
    source: sourceId,
    filter: ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
    layout: {
      visibility: dataset.visible ? 'visible' : 'none',
      'text-field': ['get', '__displayName'],
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-size': 12,
      'text-offset': [0, 1.2],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-ignore-placement': false
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#090d16',
      'text-halo-width': 1.5,
      'text-opacity': dataset.opacity
    }
  };

  return [polygonFillLayer, lineLayer, pointCircleLayer, labelLayer];
}

/**
 * Creates selection halo highlight layer.
 */
export function createSelectionHighlightLayer(sourceId: string): LayerSpecification {
  return {
    id: 'layer_selection_highlight',
    type: 'circle',
    source: sourceId,
    filter: ['==', ['get', '__isSelected'], true],
    paint: {
      'circle-radius': 14,
      'circle-color': 'transparent',
      'circle-stroke-width': 3,
      'circle-stroke-color': '#38bdf8', // Cyan glow
      'circle-stroke-opacity': 0.95
    }
  };
}
