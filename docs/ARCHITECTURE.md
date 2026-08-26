# System Architecture & Technical Design

## 1. Overview & Vision

**GeoVista: Spatial Data Explorer** is a high-performance, client-side geospatial viewer built for interactive inspection, validation, measurement, and visualization of spatial datasets. It eliminates the need to install or configure heavy desktop GIS software (like QGIS or ArcGIS) for quick exploration tasks while maintaining spatial precision, rich symbology, and zero-server local privacy.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            User Browser Client                              │
│                                                                             │
│  ┌───────────────────────┐   ┌───────────────────┐   ┌───────────────────┐  │
│  │   File Ingestion &    │──>│ Normalization &   │──>│  Zustand Global   │  │
│  │   Format Detection    │   │ Spatial Validation│   │   Spatial Store   │  │
│  └───────────────────────┘   └───────────────────┘   └─────────┬─────────┘  │
│                                                                │            │
│         ┌──────────────────────────────────────────────────────┴─────────┐  │
│         │                                                                │  │
│         ▼                                                                ▼  │
│  ┌───────────────────────────────┐              ┌────────────────────────┐  │
│  │   MapLibre GL Map Engine      │<════════════>│  Reactive UI Panels    │  │
│  │   - Vector GeoJSON Sources    │   Bidirectional  │  - Layer Management    │  │
│  │   - Categorical Symbology     │   Selection &│  - Feature Inspector   │  │
│  │   - Measurement Overlays      │   Filtering  │  - Attribute Table     │  │
│  │   - Dynamic Labeling Rules    │              │  - Legend & Stats      │  │
│  └───────────────────────────────┘              └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

1. **100% Client-Side Ingestion & Privacy**: All file parsing (GeoJSON, zipped Shapefiles via `shpjs`, coordinate CSVs via `PapaParse`) runs locally in the browser. No geometry or attribute data is sent over the network.
2. **Unified Internal GeoJSON Representation**: All input formats are converted into a standardized `SpatialDataset` wrapping a standard `GeoJSON.FeatureCollection`.
3. **Reactive Single-Source-of-Truth**: Zustand acts as the centralized reactive state manager, synchronizing MapLibre layers, attribute tables, search indices, and inspector panels.
4. **Resilient Defensive Validation**: Three-tier validation (Error, Warning, Info) ensures bad data produces actionable diagnostic warnings rather than silent UI crashes.
5. **Decoupled Modular Design**: Independent modules for file ingestion, validation, map rendering, measurement math, attribute processing, and exports.

---

## 3. Technology Stack

| Layer | Selected Technology | Rationale |
|---|---|---|
| **Framework** | React 18 / 19 + TypeScript | Component modularity, type-safety, rich ecosystem |
| **Build Tool** | Vite | Ultra-fast HMR, lightweight bundling, ESM native |
| **Map Engine** | MapLibre GL JS | High-performance WebGL/WebGPU vector map rendering, open source, no proprietary tokens required |
| **State Management**| Zustand | Minimal boilerplate, direct reactive subscriptions, high performance |
| **Shapefile Parser**| `shpjs` | In-browser parsing of `.shp`, `.dbf`, `.prj`, `.shx` from `.zip` buffers |
| **CSV Parser** | `PapaParse` | Stream/chunk parsing, robust RFC 4180 handling, auto-delimiter detection |
| **Spatial Math** | Turf.js (`@turf/turf` / modular) | Geodesic distance, polygon area, bbox calculation, coordinate validation |
| **Styling** | Vanilla CSS + CSS Design Tokens | Zero Tailwind dependency, modern glassmorphism, responsive grid/flexbox, CSS variables |
| **Icons** | Lucide React | Clean, scalable GIS and interface iconography |
| **Testing** | Vitest + Testing Library | Fast unit and integration tests for parsers, validators, math, and UI components |

---

## 4. Component Hierarchy

```text
src/
├── app/
│   ├── App.tsx                    # Main layout shell with Header, Sidebar, Map, Table, Modals
│   ├── store.ts                  # Global Zustand store for datasets, active tool, selection
│   └── theme.ts                  # Theme switching (dark / light mode tokens)
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # App branding, Demo button, Theme toggle, Help modal
│   │   ├── Sidebar.tsx           # Accordion / Tabbed left sidebar: Layers, Legend, Validation, Stats
│   │   └── StatusBar.tsx         # Live coordinates (Lng/Lat), CRS status, Active feature count
│   ├── upload/
│   │   ├── FileDropzone.tsx      # Drag-and-drop file target & file input
│   │   ├── CsvColumnModal.tsx    # Interactive column mapper (Lng, Lat, Label, Category, Desc)
│   │   └── UploadProgress.tsx    # Parsing & validation progress bar
│   ├── panels/
│   │   ├── LayerPanel.tsx        # Layer list, visibility toggle, opacity sliders, zoom-to, delete
│   │   ├── LegendPanel.tsx       # Dynamic category color swatch, category counts, hide/show categories
│   │   ├── FeatureInspector.tsx  # Right slide-out panel for selected feature properties & coords
│   │   ├── AttributeTable.tsx    # Bottom expandable virtualized grid, sorting, filtering, selection sync
│   │   ├── ValidationPanel.tsx   # Structured error/warning/info diagnostic report list
│   │   └── SearchPanel.tsx       # Live fuzzy-search across properties with fly-to
│   └── tools/
│       ├── MeasureToolbar.tsx    # Distance (multi-point) & Area (polygon) interactive tools
│       ├── BasemapSwitcher.tsx   # Street, Dark, Light, Satellite basemap picker
│       ├── CoordinateFlyTo.tsx   # Jump-to-coordinate dialog & DMS conversion
│       └── ExportMenu.tsx        # Normalized GeoJSON, Point CSV, and Map Screenshot exports
├── map/
│   ├── MapView.tsx               # Main MapLibre GL wrapper with resize observer & event hooks
│   ├── mapLayers.ts              # GeoJSON source and layer generation (Circle, Line, Fill, Symbol)
│   ├── mapStyles.ts              # Basemap style definitions (Carto Positron, Dark Matter, OSM, Esri World Imagery)
│   ├── labelRules.ts             # Smart auto-detection of label fields with halos and zoom thresholds
│   ├── animations.ts             # Staggered reveal animations, selection pulse, fly-to easing
│   └── measurements.ts           # Dynamic measurement line/polygon overlays and segment distance badges
├── importers/
│   ├── detectFormat.ts           # Magic byte & extension-based format detector (.geojson, .zip, .csv)
│   ├── importGeoJSON.ts          # GeoJSON parser & schema sanitizer
│   ├── importShapefileZip.ts     # shpjs ZIP parser, DBF property extractor, PRJ checker
│   ├── importCSV.ts              # PapaParse CSV reader with intelligent header heuristics
│   └── normalizeDataset.ts       # Unified normalization pipeline to SpatialDataset
├── validation/
│   ├── validateGeoJSON.ts        # Geometry coordinate bounds, valid RFC 7946 checks
│   ├── validateShapefile.ts      # ZIP component consistency (.shp, .dbf, .shx, .prj)
│   ├── validateCSV.ts            # Coordinate number checks, duplicate IDs/coords, row diagnostics
│   └── validationTypes.ts        # ValidationMessage, Severity, ValidationReport
├── export/
│   ├── exportGeoJSON.ts          # Filtered / complete GeoJSON export
│   ├── exportCSV.ts              # Point property table export to CSV
│   └── exportMapImage.ts         # High-resolution canvas screenshot capture
├── types/
│   └── spatial.ts                # TypeScript types (SpatialDataset, LayerStyleConfig, FeatureSelection, etc.)
└── utils/
    ├── coordinates.ts            # Formatting, DMS conversion, bbox expansion
    ├── categories.ts             # Palette generation, unique category extraction
    ├── sanitization.ts          # XSS property escaping and value formatting
    └── fileNames.ts              # Clean export filenames and format labels
```

---

## 5. Data Flow Lifecycle

```
[User Drop/Select File]
           │
           ▼
[detectFormat(file)] ──> Determines 'geojson' | 'shapefile' | 'csv'
           │
           ├────────────────────────┬────────────────────────┐
           ▼                        ▼                        ▼
  [importGeoJSON]         [importShapefileZip]          [importCSV]
  - Parse JSON            - shpjs unpacks buffer        - PapaParse to rows
  - Validate Feature/FC   - Extract DBF & PRJ           - Run Header Heuristic
           │                        │                   - If uncertain: prompt CsvColumnModal
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                                    ▼
                         [validate<Format>]
                         - Collect Errors & Warnings
                         - Filter unrenderable geometries
                                    │
                                    ▼
                        [normalizeDataset]
                        - Assign __internalId
                        - Determine __displayName
                        - Extract Bounding Box & Categories
                        - Generate LayerStyleConfig
                                    │
                                    ▼
                        [Zustand Store: addDataset]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        [MapView -> MapLibre]               [UI Reactive Updates]
        - Add GeoJSON Source                - Update Layer List & Legend
        - Add Fill/Line/Circle Layers       - Populate Attribute Table
        - Add Symbol/Label Layer            - Show Validation Warnings
        - FlyTo(dataset.bbox)               - Update Status Bar Statistics
```

---

## 6. Map Rendering & Layering Architecture

To support mixed point, line, and polygon datasets without layer collision, MapLibre manages layers in a strict Z-index hierarchy:

1. **Basemap Tile Layer** (Bottom): Carto Voyager / Positron / Dark Matter / OSM / Esri Satellite.
2. **Polygon Fill Layer**: `fill` layer with configurable opacity (`0.4` default) and category or custom fill color.
3. **Polygon/LineString Stroke Layer**: `line` layer with anti-aliasing and width controls.
4. **Point Circle Layer**: `circle` layer with category color expressions, white/dark halos, and hover scaling.
5. **Selection & Highlight Layer**: Dynamic high-contrast animated halo around the selected feature.
6. **Symbol / Text Label Layer**: Crisp text with contrasting halos (`text-halo-color`, `text-halo-width`).
7. **Measurement & Interaction Overlay** (Top): Active drawing rubberband lines, polygon preview, vertex markers, and segment distance badges.

---

## 7. State Management Structure (Zustand)

```typescript
interface AppState {
  // Datasets & Layers
  datasets: SpatialDataset[];
  activeDatasetId: string | null;
  selectedFeature: SelectedFeatureRef | null;
  hoveredFeatureId: string | null;
  
  // UI Panels
  activeSidebarTab: 'layers' | 'legend' | 'validation' | 'summary' | 'search';
  isAttributeTableOpen: boolean;
  isInspectorOpen: boolean;
  isHelpOpen: boolean;
  isColumnModalOpen: boolean;
  pendingCsvFile: { file: File; rawData: unknown[] } | null;
  
  // Tools & Interaction
  activeTool: 'select' | 'measure-distance' | 'measure-area' | 'fly-to';
  measurementState: MeasurementState;
  
  // Display & Filtering
  basemapStyle: BasemapKey;
  theme: 'dark' | 'light';
  categoryFilter: Record<string, boolean>; // category -> visible
  searchQuery: string;
  labelsVisible: boolean;
  labelFieldOverride: string | null;
  
  // Actions
  addDataset: (dataset: SpatialDataset) => void;
  removeDataset: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  setLayerStyle: (id: string, style: Partial<LayerStyleConfig>) => void;
  selectFeature: (datasetId: string, internalId: string) => void;
  clearSelection: () => void;
  setCategoryVisibility: (category: string, visible: boolean) => void;
  toggleAllCategories: (visible: boolean) => void;
  setBasemap: (style: BasemapKey) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  startMeasurement: (mode: 'distance' | 'area') => void;
  addMeasurementPoint: (coord: [number, number]) => void;
  finishMeasurement: () => void;
  clearMeasurement: () => void;
  loadDemoDataset: () => Promise<void>;
  resetAll: () => void;
}
```

---

## 8. Security, Memory & Performance Best Practices

1. **DOM Virtualization**: The attribute table virtualizes row rendering so datasets with thousands of records scroll at 60fps without DOM bloat.
2. **WebGL Vector Rendering**: Features are rendered as native vector GPU layers via MapLibre GL JS GeoJSON sources rather than thousands of heavy HTML DOM markers.
3. **Memory Cleanup**: When layers are cleared or replaced, MapLibre sources, layers, event handlers, and image resources are explicitly detached and garbage-collected.
4. **XSS Defense**: All user-supplied attribute strings are sanitized before being rendered into HTML/React DOM nodes.
5. **No Network Leakage**: Ingested datasets never leave browser memory.
