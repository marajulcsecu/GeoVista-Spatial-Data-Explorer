import { create } from 'zustand';
import type {
  BasemapKey,
  CsvColumnMapping,
  LayerStyleConfig,
  MeasurementState,
  DistanceUnit,
  AreaUnit,
  NormalizedFeature,
  SelectedFeatureRef,
  SpatialDataset
} from '../types/spatial';
import { applyTheme, getInitialTheme } from './theme';
import {
  calculatePolygonAreaAndPerimeter,
  calculatePolylineDistance,
  INITIAL_MEASUREMENT_STATE
} from '../map/measurements';
import { createBotanicalGardenDemoDataset } from '../data/demoBotanicalGarden';

import {
  saveDatasetsToStorage,
  loadDatasetsFromStorage,
  clearDatasetsFromStorage
} from '../utils/storage';

export interface PendingCsvInfo {
  file: File;
  headers: string[];
  rows: Record<string, unknown>[];
}

export interface AppState {
  // Datasets
  datasets: SpatialDataset[];
  activeDatasetId: string | null;
  selectedFeature: SelectedFeatureRef | null;
  hoveredFeatureId: string | null;
  isInitialized: boolean;

  // Sidebar & Modals
  activeSidebarTab: 'layers' | 'legend' | 'validation' | 'summary' | 'search';
  isAttributeTableOpen: boolean;
  isInspectorOpen: boolean;
  isHelpOpen: boolean;
  isColumnModalOpen: boolean;
  pendingCsvInfo: PendingCsvInfo | null;

  // Tools & Measurement
  activeTool: 'select' | 'measure-distance' | 'measure-area' | 'fly-to';
  measurementState: MeasurementState;

  // Visual settings & Filters
  basemapStyle: BasemapKey;
  theme: 'dark' | 'light';
  categoryFilter: Record<string, boolean>; // categoryName -> boolean
  searchQuery: string;
  labelsVisible: boolean;
  labelFieldOverride: string | null;
  cursorCoordinates: { lng: number; lat: number } | null;

  // Fly-to target coordinate trigger
  flyToTrigger: { lng: number; lat: number; zoom?: number; timestamp: number } | null;

  // Live Map Viewport (Zoom & Center)
  mapZoom: number;
  mapCenter: { lng: number; lat: number };

  // Actions
  initFromStorage: () => Promise<void>;
  addDataset: (dataset: SpatialDataset) => void;
  removeDataset: (id: string) => void;
  setActiveDataset: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerStyle: (id: string, style: Partial<LayerStyleConfig>) => void;

  selectFeature: (datasetId: string, internalId: string) => void;
  clearSelection: () => void;
  setHoveredFeature: (id: string | null) => void;

  setActiveSidebarTab: (tab: 'layers' | 'legend' | 'validation' | 'summary' | 'search') => void;
  setAttributeTableOpen: (open: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setColumnModalOpen: (open: boolean) => void;
  setPendingCsvInfo: (info: PendingCsvInfo | null) => void;

  setActiveTool: (tool: 'select' | 'measure-distance' | 'measure-area' | 'fly-to') => void;
  startMeasurement: (mode: 'distance' | 'area') => void;
  addMeasurementPoint: (pt: [number, number]) => void;
  undoMeasurementPoint: () => void;
  finishMeasurement: () => void;
  clearMeasurement: () => void;
  setMeasurementUnits: (units: { distanceUnit?: DistanceUnit; areaUnit?: AreaUnit }) => void;

  setCategoryVisibility: (category: string, visible: boolean) => void;
  toggleAllCategories: (visible: boolean) => void;
  setSearchQuery: (q: string) => void;
  setLabelsVisible: (visible: boolean) => void;
  setLabelFieldOverride: (field: string | null) => void;

  setBasemap: (style: BasemapKey) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCursorCoordinates: (coords: { lng: number; lat: number } | null) => void;
  setMapViewport: (zoom: number, center: { lng: number; lat: number }) => void;
  triggerFlyTo: (lng: number, lat: number, zoom?: number) => void;

  loadDemoDataset: () => Promise<void>;
  resetAll: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  datasets: [],
  activeDatasetId: null,
  selectedFeature: null,
  hoveredFeatureId: null,
  isInitialized: false,

  activeSidebarTab: 'layers',
  isAttributeTableOpen: false,
  isInspectorOpen: false,
  isHelpOpen: false,
  isColumnModalOpen: false,
  pendingCsvInfo: null,

  activeTool: 'select',
  measurementState: { ...INITIAL_MEASUREMENT_STATE },

  basemapStyle: 'google-satellite',
  theme: getInitialTheme(),
  categoryFilter: {},
  searchQuery: '',
  labelsVisible: true,
  labelFieldOverride: null,
  cursorCoordinates: null,
  flyToTrigger: null,
  mapZoom: 15,
  mapCenter: { lng: 91.7905, lat: 22.4608 },

  initFromStorage: async () => {
    if (get().isInitialized) return;
    const stored = await loadDatasetsFromStorage();
    if (stored && stored.length > 0) {
      const categoryMap: Record<string, boolean> = {};
      stored.forEach((ds) => {
        ds.categories.forEach((cat) => {
          categoryMap[cat.name] = true;
        });
      });
      set({
        datasets: stored,
        activeDatasetId: stored[0].id,
        categoryFilter: categoryMap,
        isInitialized: true
      });
      // Fly to active dataset bounds
      const [minX, minY, maxX, maxY] = stored[0].bbox;
      get().triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2, 16);
    } else {
      set({ isInitialized: true });
    }
  },

  addDataset: (dataset) => {
    // Populate category filter map for new categories
    const nextFilter = { ...get().categoryFilter };
    dataset.categories.forEach((c) => {
      if (nextFilter[c.name] === undefined) {
        nextFilter[c.name] = true;
      }
    });

    const updated = [...get().datasets.filter((d) => d.id !== dataset.id), dataset];
    saveDatasetsToStorage(updated);

    set({
      datasets: updated,
      activeDatasetId: dataset.id,
      categoryFilter: nextFilter,
      activeSidebarTab: 'layers'
    });
  },

  removeDataset: (id) => {
    const remaining = get().datasets.filter((d) => d.id !== id);
    saveDatasetsToStorage(remaining);
    const isRemovingActive = get().activeDatasetId === id;
    const isRemovingSelected = get().selectedFeature?.datasetId === id;

    set({
      datasets: remaining,
      activeDatasetId: isRemovingActive ? (remaining[0]?.id || null) : get().activeDatasetId,
      selectedFeature: isRemovingSelected ? null : get().selectedFeature,
      isInspectorOpen: isRemovingSelected ? false : get().isInspectorOpen
    });
  },

  setActiveDataset: (id) => set({ activeDatasetId: id }),

  toggleLayerVisibility: (id) => {
    const updated = get().datasets.map((d) => (d.id === id ? { ...d, visible: !d.visible } : d));
    saveDatasetsToStorage(updated);
    set({ datasets: updated });
  },

  setLayerOpacity: (id, opacity) => {
    const updated = get().datasets.map((d) => (d.id === id ? { ...d, opacity } : d));
    saveDatasetsToStorage(updated);
    set({ datasets: updated });
  },

  setLayerStyle: (id, style) => {
    const updated = get().datasets.map((d) =>
      d.id === id ? { ...d, style: { ...d.style, ...style } } : d
    );
    saveDatasetsToStorage(updated);
    set({ datasets: updated });
  },

  selectFeature: (datasetId, internalId) => {
    const dataset = get().datasets.find((d) => d.id === datasetId);
    if (!dataset) return;

    const feature = dataset.featureCollection.features.find(
      (f) => f.properties.__internalId === internalId
    );

    if (feature) {
      set({
        selectedFeature: { datasetId, internalId, feature },
        isInspectorOpen: true
      });
    }
  },

  clearSelection: () => {
    set({
      selectedFeature: null,
      isInspectorOpen: false
    });
  },

  setHoveredFeature: (id) => set({ hoveredFeatureId: id }),

  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setAttributeTableOpen: (open) => set({ isAttributeTableOpen: open }),
  setInspectorOpen: (open) => set({ isInspectorOpen: open }),
  setHelpOpen: (open) => set({ isHelpOpen: open }),
  setColumnModalOpen: (open) => set({ isColumnModalOpen: open }),
  setPendingCsvInfo: (info) => set({ pendingCsvInfo: info, isColumnModalOpen: !!info }),

  setActiveTool: (tool) => {
    if (tool !== 'measure-distance' && tool !== 'measure-area') {
      set({ activeTool: tool, measurementState: { ...INITIAL_MEASUREMENT_STATE } });
    } else {
      set({ activeTool: tool });
    }
  },

  startMeasurement: (mode) => {
    set({
      activeTool: mode === 'distance' ? 'measure-distance' : 'measure-area',
      measurementState: {
        ...INITIAL_MEASUREMENT_STATE,
        mode,
        isFinished: false
      }
    });
  },

  addMeasurementPoint: (pt) => {
    const current = get().measurementState;
    if (current.mode === 'none' || current.isFinished) return;

    const newPoints: [number, number][] = [...current.points, pt];

    if (current.mode === 'distance') {
      const { total, segments } = calculatePolylineDistance(newPoints);
      set({
        measurementState: {
          ...current,
          points: newPoints,
          totalDistanceMeters: total,
          segments
        }
      });
    } else if (current.mode === 'area') {
      const { area, perimeter, segments } = calculatePolygonAreaAndPerimeter(newPoints);
      set({
        measurementState: {
          ...current,
          points: newPoints,
          totalAreaSquareMeters: area,
          perimeterMeters: perimeter,
          segments
        }
      });
    }
  },

  undoMeasurementPoint: () => {
    const current = get().measurementState;
    if (current.points.length === 0) return;
    const newPoints = current.points.slice(0, -1);
    if (current.mode === 'distance') {
      const { total, segments } = calculatePolylineDistance(newPoints);
      set({
        measurementState: {
          ...current,
          points: newPoints,
          totalDistanceMeters: total,
          segments,
          isFinished: false
        }
      });
    } else if (current.mode === 'area') {
      const { area, perimeter, segments } = calculatePolygonAreaAndPerimeter(newPoints);
      set({
        measurementState: {
          ...current,
          points: newPoints,
          totalAreaSquareMeters: area,
          perimeterMeters: perimeter,
          segments,
          isFinished: false
        }
      });
    }
  },

  finishMeasurement: () => {
    const current = get().measurementState;
    set({
      measurementState: {
        ...current,
        isFinished: true
      }
    });
  },

  clearMeasurement: () => {
    set({
      activeTool: 'select',
      measurementState: { ...INITIAL_MEASUREMENT_STATE }
    });
  },

  setMeasurementUnits: ({ distanceUnit, areaUnit }) => {
    set((state) => ({
      measurementState: {
        ...state.measurementState,
        distanceUnit: distanceUnit ?? state.measurementState.distanceUnit,
        areaUnit: areaUnit ?? state.measurementState.areaUnit
      }
    }));
  },

  setCategoryVisibility: (category, visible) => {
    set((state) => ({
      categoryFilter: { ...state.categoryFilter, [category]: visible }
    }));
  },

  toggleAllCategories: (visible) => {
    const next: Record<string, boolean> = {};
    get().datasets.forEach((ds) => {
      ds.categories.forEach((cat) => {
        next[cat.name] = visible;
      });
    });
    set({ categoryFilter: next });
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setLabelsVisible: (visible) => set({ labelsVisible: visible }),
  setLabelFieldOverride: (field) => set({ labelFieldOverride: field }),

  setBasemap: (style) => set({ basemapStyle: style }),

  setTheme: (theme) => {
    applyTheme(theme);
    const currentBasemap = get().basemapStyle;
    let nextBasemap = currentBasemap;
    if (theme === 'light' && currentBasemap === 'carto-dark') {
      nextBasemap = 'osm-standard';
    }
    set({ theme, basemapStyle: nextBasemap });
  },

  setCursorCoordinates: (coords) => set({ cursorCoordinates: coords }),
  setMapViewport: (zoom, center) => set({ mapZoom: zoom, mapCenter: center }),

  triggerFlyTo: (lng, lat, zoom = 16) => {
    set({ flyToTrigger: { lng, lat, zoom, timestamp: Date.now() } });
  },

  loadDemoDataset: async () => {
    const demo = createBotanicalGardenDemoDataset();
    get().addDataset(demo);
    // trigger fly to demo extent
    const [minX, minY, maxX, maxY] = demo.bbox;
    get().triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2, 16.5);
  },

  resetAll: () => {
    clearDatasetsFromStorage();
    set({
      datasets: [],
      activeDatasetId: null,
      selectedFeature: null,
      hoveredFeatureId: null,
      activeSidebarTab: 'layers',
      isAttributeTableOpen: false,
      isInspectorOpen: false,
      activeTool: 'select',
      measurementState: { ...INITIAL_MEASUREMENT_STATE },
      categoryFilter: {},
      searchQuery: '',
      pendingCsvInfo: null,
      isColumnModalOpen: false
    });
  }
}));
