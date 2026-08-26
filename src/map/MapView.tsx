import { useEffect, useRef, type FC } from 'react';
import maplibregl, { type Map, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAppStore } from '../app/store';
import { getBasemapStyle } from './mapStyles';
import { createDatasetLayerSpecs } from './mapLayers';
import { ScaleWidget } from '../components/tools/ScaleWidget';
import { MeasurementOverlay } from '../components/tools/MeasurementOverlay';
import type { SpatialDataset, SelectedFeatureRef } from '../types/spatial';

export const MapView: FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const hoveredFeatureRef = useRef<{ source: string; id: string | number } | null>(null);

  const {
    datasets,
    selectedFeature,
    basemapStyle,
    activeTool,
    measurementState,
    categoryFilter,
    labelsVisible,
    flyToTrigger,
    selectFeature,
    setCursorCoordinates,
    setMapViewport,
    addMeasurementPoint,
    undoMeasurementPoint,
    finishMeasurement,
    clearMeasurement
  } = useAppStore();

  // Keep a mutable ref of all reactive layer props so map event handlers always have fresh data
  const stateRef = useRef({
    datasets,
    categoryFilter,
    labelsVisible,
    selectedFeature,
    measurementState,
    activeTool
  });

  stateRef.current = {
    datasets,
    categoryFilter,
    labelsVisible,
    selectedFeature,
    measurementState,
    activeTool
  };

  // Dedicated function to sync all datasets, layers, and measurements to the map
  const syncLayersToMap = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const {
      datasets: currentDatasets,
      categoryFilter: currentCategoryFilter,
      labelsVisible: currentLabelsVisible,
      selectedFeature: currentSelectedFeature,
      measurementState: currentMeasurementState
    } = stateRef.current;

    // 1. Sync all active datasets
    currentDatasets.forEach((dataset) => {
      const sourceId = `source_${dataset.id}`;
      let source = map.getSource(sourceId) as GeoJSONSource | undefined;

      const filteredFeatures = dataset.featureCollection.features
        .filter((f: any) => {
          const cat = f.properties?.__category || 'Uncategorized';
          return currentCategoryFilter[cat] !== false;
        })
        .map((f: any) => {
          const isSelected =
            currentSelectedFeature?.datasetId === dataset.id &&
            currentSelectedFeature?.internalId === f.properties?.__internalId;
          return {
            ...f,
            properties: {
              ...f.properties,
              __isSelected: isSelected
            }
          };
        });

      const fcData = {
        type: 'FeatureCollection',
        features: filteredFeatures
      };

      if (!source) {
        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: fcData as any,
            generateId: true
          });
        } catch {
          // Source already exists or style in transition
        }
      } else {
        source.setData(fcData as any);
      }

      // Add or ensure layer specs
      const layerSpecs = createDatasetLayerSpecs(dataset);
      layerSpecs.forEach((spec) => {
        if (!map.getLayer(spec.id)) {
          try {
            map.addLayer(spec);
          } catch {
            // Layer add in progress
          }
        }
      });

      // Update layout & paint properties
      const pointLayer = `layer_${dataset.id}_point`;
      const fillLayer = `layer_${dataset.id}_fill`;
      const lineLayer = `layer_${dataset.id}_line`;
      const labelLayer = `layer_${dataset.id}_label`;

      if (map.getLayer(pointLayer)) {
        map.setLayoutProperty(pointLayer, 'visibility', dataset.visible ? 'visible' : 'none');
        map.setPaintProperty(pointLayer, 'circle-opacity', dataset.opacity);
        map.setPaintProperty(pointLayer, 'circle-stroke-opacity', dataset.opacity);
      }
      if (map.getLayer(fillLayer)) {
        map.setLayoutProperty(fillLayer, 'visibility', dataset.visible ? 'visible' : 'none');
        map.setPaintProperty(fillLayer, 'fill-opacity', dataset.style.fillOpacity * dataset.opacity);
      }
      if (map.getLayer(lineLayer)) {
        map.setLayoutProperty(lineLayer, 'visibility', dataset.visible ? 'visible' : 'none');
        map.setPaintProperty(lineLayer, 'line-opacity', dataset.opacity);
      }
      if (map.getLayer(labelLayer)) {
        map.setLayoutProperty(
          labelLayer,
          'visibility',
          dataset.visible && currentLabelsVisible ? 'visible' : 'none'
        );
      }
    });

    // 2. Clean up removed datasets
    const currentDatasetSourceIds = new Set(currentDatasets.map((d) => `source_${d.id}`));
    try {
      const allStyleSources = Object.keys(map.getStyle()?.sources || {});
      allStyleSources.forEach((srcId) => {
        if (srcId.startsWith('source_') && !currentDatasetSourceIds.has(srcId)) {
          const layers = map.getStyle()?.layers || [];
          layers.forEach((l) => {
            if ((l as any).source === srcId) {
              map.removeLayer(l.id);
            }
          });
          map.removeSource(srcId);
        }
      });
    } catch {
      // Style in transition
    }

    // 3. Sync Measurement Layers
    syncMeasurementLayers(map, currentMeasurementState);
  };

  // Initialize MapLibre Map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getBasemapStyle(basemapStyle) as any,
      center: [91.7905, 22.4608], // University of Chittagong Botanical Garden center
      zoom: 15,
      minZoom: 2,
      maxZoom: 20,
      pitchWithRotate: false
    });

    // Add navigation controls (zoom, compass)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    // Synchronize live viewport zoom and center
    const handleViewportUpdate = () => {
      setMapViewport(map.getZoom(), { lng: map.getCenter().lng, lat: map.getCenter().lat });
    };

    // Automatic re-sync whenever style loads or changes
    const handleStyleUpdate = () => {
      syncLayersToMap();
      handleViewportUpdate();
    };

    map.on('load', handleStyleUpdate);
    map.on('styledata', handleStyleUpdate);
    map.on('move', handleViewportUpdate);

    // Unified click handler for measurement and feature selection
    map.on('click', (e) => {
      const state = stateRef.current;
      if (state.activeTool === 'measure-distance' || state.activeTool === 'measure-area') {
        if (!state.measurementState.isFinished) {
          addMeasurementPoint([e.lngLat.lng, e.lngLat.lat]);
        }
        return;
      }

      // Query rendered features under click across all active dataset layers
      const interactiveLayers = state.datasets
        .filter((d) => d.visible)
        .flatMap((d) => [`layer_${d.id}_point`, `layer_${d.id}_fill`, `layer_${d.id}_line`])
        .filter((layerId) => map.getLayer(layerId));

      if (interactiveLayers.length > 0) {
        const features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers });
        if (features && features.length > 0) {
          const feat = features[0];
          const internalId = feat.properties?.__internalId;
          const layerId = (feat.layer as any)?.id || '';
          const matchingDataset = state.datasets.find((d) => layerId.startsWith(`layer_${d.id}`));
          if (matchingDataset && internalId) {
            selectFeature(matchingDataset.id, internalId);
          }
        }
      }
    });

    map.on('mousemove', (e) => {
      setCursorCoordinates({
        lng: Number(e.lngLat.lng.toFixed(6)),
        lat: Number(e.lngLat.lat.toFixed(6))
      });

      const state = stateRef.current;
      const isMeasureTool = state.activeTool === 'measure-distance' || state.activeTool === 'measure-area';

      if (isMeasureTool) {
        map.getCanvas().style.cursor = 'crosshair';

        // Update live smooth rubberband line to cursor
        const rSource = map.getSource('source_measurement_rubberband') as GeoJSONSource | undefined;
        if (rSource && state.measurementState.points.length >= 1 && !state.measurementState.isFinished) {
          const lastPt = state.measurementState.points[state.measurementState.points.length - 1];
          const curPt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          const rFeatures: any[] = [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [lastPt, curPt]
              },
              properties: {}
            }
          ];

          if (state.activeTool === 'measure-area' && state.measurementState.points.length >= 2) {
            rFeatures.push({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [curPt, state.measurementState.points[0]]
              },
              properties: {}
            });
          }

          rSource.setData({
            type: 'FeatureCollection',
            features: rFeatures
          });
        }
        return;
      }

      const interactiveLayers = state.datasets
        .filter((d) => d.visible)
        .flatMap((d) => [`layer_${d.id}_point`, `layer_${d.id}_fill`, `layer_${d.id}_line`])
        .filter((layerId) => map.getLayer(layerId));

      if (interactiveLayers.length > 0) {
        const features = map.queryRenderedFeatures(e.point, { layers: interactiveLayers });
        map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : '';
      } else {
        map.getCanvas().style.cursor = '';
      }
    });

    map.on('mouseout', () => {
      setCursorCoordinates(null);
      const rSource = map.getSource('source_measurement_rubberband') as GeoJSONSource | undefined;
      if (rSource) {
        rSource.setData({ type: 'FeatureCollection', features: [] });
      }
    });

    map.on('dblclick', (e) => {
      const state = stateRef.current;
      if (state.activeTool === 'measure-distance' || state.activeTool === 'measure-area') {
        e.preventDefault();
        finishMeasurement();
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Style on basemapStyle change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const newStyle = getBasemapStyle(basemapStyle);
    map.setStyle(newStyle as any);
  }, [basemapStyle]);

  // Synchronize Dataset Sources, Layers, and Measurements on React state changes
  useEffect(() => {
    syncLayersToMap();
  }, [datasets, categoryFilter, labelsVisible, selectedFeature, measurementState]);

  // Handle Fly-To Trigger
  useEffect(() => {
    if (!flyToTrigger || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTrigger.lng, flyToTrigger.lat],
      zoom: flyToTrigger.zoom ?? 16,
      essential: true,
      duration: 1200
    });
  }, [flyToTrigger]);

  // Measurement keyboard shortcuts (Ctrl+Z to undo, Enter to finish, Esc to clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTool !== 'measure-distance' && activeTool !== 'measure-area') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoMeasurementPoint();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        finishMeasurement();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearMeasurement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, undoMeasurementPoint, finishMeasurement, clearMeasurement]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Precision Cartographic Scale Suite (Representative Fraction & Dual Unit Bar) */}
      <ScaleWidget />

      {/* Advanced Geodesic Measurement Workstation Overlay */}
      <MeasurementOverlay />
    </div>
  );
};

/**
 * Helper to update dynamic MapLibre measurement vector layers.
 */
function syncMeasurementLayers(map: Map, state: any) {
  const sourceId = 'source_measurement';
  const points = state.points || [];

  const pointsGeoJSON: any = {
    type: 'FeatureCollection',
    features: points.map((pt: [number, number], idx: number) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: pt },
      properties: { index: idx + 1 }
    }))
  };

  const isArea = state.mode === 'area';
  const shouldClosePolygon = isArea && points.length >= 3;
  const polygonCoords = shouldClosePolygon ? [...points, points[0]] : points;

  const lineFeatures: any[] = [];
  if (points.length >= 2) {
    lineFeatures.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: polygonCoords
      },
      properties: {}
    });

    if (shouldClosePolygon) {
      lineFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoords]
        },
        properties: {}
      });
    }
  }

  const lineGeoJSON: any = {
    type: 'FeatureCollection',
    features: lineFeatures
  };

  const lineSourceId = 'source_measurement_lines';

  if (!map.getSource(sourceId)) {
    try {
      map.addSource(sourceId, {
        type: 'geojson',
        data: pointsGeoJSON
      });
    } catch {
      // Source add in progress
    }
  } else {
    (map.getSource(sourceId) as GeoJSONSource).setData(pointsGeoJSON);
  }

  if (!map.getSource(lineSourceId)) {
    try {
      map.addSource(lineSourceId, {
        type: 'geojson',
        data: lineGeoJSON
      });
    } catch {
      // Source add in progress
    }
  } else {
    (map.getSource(lineSourceId) as GeoJSONSource).setData(lineGeoJSON);
  }

  // Fill layer for Area measurement (live rendered)
  if (!map.getLayer('layer_measure_fill')) {
    try {
      map.addLayer({
        id: 'layer_measure_fill',
        type: 'fill',
        source: lineSourceId,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.22
        }
      });
    } catch {
      // Layer add in progress
    }
  }

  // Dark outline casing for crisp contrast & no flickering
  if (!map.getLayer('layer_measure_line_casing')) {
    try {
      map.addLayer({
        id: 'layer_measure_line_casing',
        type: 'line',
        source: lineSourceId,
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#030712',
          'line-width': 5,
          'line-opacity': 0.85
        }
      });
    } catch {
      // Layer add in progress
    }
  }

  // Core Solid Measurement Line (Round caps/joins -> Ultra Smooth & Zero Blinking)
  if (!map.getLayer('layer_measure_line')) {
    try {
      map.addLayer({
        id: 'layer_measure_line',
        type: 'line',
        source: lineSourceId,
        filter: ['==', ['geometry-type'], 'LineString'],
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.5,
          'line-opacity': 1
        }
      });
    } catch {
      // Layer add in progress
    }
  }

  // Rubberband dynamic preview source & layers
  const rubberbandSourceId = 'source_measurement_rubberband';
  if (!map.getSource(rubberbandSourceId)) {
    try {
      map.addSource(rubberbandSourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
    } catch {
      // Source add in progress
    }
  }

  if (!map.getLayer('layer_measure_rubberband_casing')) {
    try {
      map.addLayer({
        id: 'layer_measure_rubberband_casing',
        type: 'line',
        source: rubberbandSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#030712',
          'line-width': 4.5,
          'line-opacity': 0.75
        }
      });
    } catch {
      // Layer add in progress
    }
  }

  if (!map.getLayer('layer_measure_rubberband')) {
    try {
      map.addLayer({
        id: 'layer_measure_rubberband',
        type: 'line',
        source: rubberbandSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-opacity': 0.85
        }
      });
    } catch {
      // Layer add in progress
    }
  }

  // Vertex Points layer with stylized start vs intermediate markers
  if (!map.getLayer('layer_measure_points')) {
    try {
      map.addLayer({
        id: 'layer_measure_points',
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': ['case', ['==', ['get', 'index'], 1], 7, 5.5],
          'circle-color': ['case', ['==', ['get', 'index'], 1], '#10b981', '#38bdf8'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    } catch {
      // Layer add in progress
    }
  }
}
