# GeoVista: Spatial Data Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive, client-side geospatial data explorer web application that accepts GeoJSON, zipped Shapefiles, and coordinate CSVs, normalizes them into an internal GeoJSON structure, and provides rich interactive mapping, validation, measurement, inspection, filtering, attribute tables, and export capabilities.

**Architecture:** A modern single-page React + TypeScript + Vite web app utilizing MapLibre GL JS for vector GPU map rendering, Zustand for reactive state management, `@turf/turf` for geodesic spatial calculations, `shpjs` for in-browser shapefile unpacking, and `PapaParse` for CSV parsing. Zero backend required; 100% local client-side processing.

**Tech Stack:** React 18/19, TypeScript, Vite, MapLibre GL JS, Zustand, shpjs, Papa Parse, @turf/turf, Lucide React, Vitest.

## Global Constraints
- Coordinate order in GeoJSON must always be `[longitude, latitude]`.
- All uploaded property values must be sanitized to protect against XSS before rendering into HTML.
- Do not upload or transmit spatial files to any external remote server; keep all processing local in browser memory.
- The application must not be hardcoded to only 14 Botanical Garden points; it must generically support arbitrary Point, LineString, and Polygon datasets.
- Shapefile imports must extract DBF attributes, check `.prj` projections, and convert projected coordinates to WGS 84.
- High aesthetic standards: modern dark/light mode with CSS variables, rich typography, glassmorphism accents, smooth fly-to animations, and clear error diagnostics.

---

### Task 1: Project Scaffolding & Design System Tokens

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/app/theme.ts`

**Interfaces:**
- CSS tokens for `--bg-primary`, `--bg-surface`, `--text-primary`, `--accent-primary`, `--border-color`, `--shadow-elevation`, `--font-sans`, `--font-mono`.
- Theme toggle helper: `applyTheme(theme: 'dark' | 'light'): void`.

- [ ] **Step 1: Setup `package.json` with dependencies** (react, react-dom, maplibre-gl, zustand, shpjs, papaparse, @turf/turf, lucide-react, vitest).
- [ ] **Step 2: Setup Vite & TypeScript configuration** (`vite.config.ts`, `tsconfig.json`, `index.html`).
- [ ] **Step 3: Implement `src/index.css`** with comprehensive CSS tokens, reset, glassmorphic card utilities, custom scrollbars, and theme variables.
- [ ] **Step 4: Verify initial build** runs clean with `npm install` and `npm run build`.

---

### Task 2: Core Spatial Types & Normalization Pipeline

**Files:**
- Create: `src/types/spatial.ts`
- Create: `src/utils/sanitization.ts`
- Create: `src/utils/coordinates.ts`
- Create: `src/utils/categories.ts`
- Create: `src/importers/normalizeDataset.ts`
- Test: `tests/unit/normalizeDataset.test.ts`

**Interfaces:**
- `SpatialDataset`, `NormalizedFeatureProperties`, `CategoryMeta`, `LayerStyleConfig`, `ValidationReport`.
- `normalizeDataset(rawFC: GeoJSON.FeatureCollection, meta: DatasetMeta): SpatialDataset`.
- `sanitizePropertyValue(val: unknown): string`.

- [ ] **Step 1: Write unit tests for `normalizeDataset` and sanitization**.
- [ ] **Step 2: Implement `src/types/spatial.ts`** and utility functions.
- [ ] **Step 3: Implement `src/importers/normalizeDataset.ts`** generating `__internalId`, bounding box, categories, and field metadata.
- [ ] **Step 4: Run tests** with `npx vitest run tests/unit/normalizeDataset.test.ts` and verify PASS.

---

### Task 3: Ingestion Parsers (GeoJSON, Shapefile ZIP, CSV)

**Files:**
- Create: `src/importers/detectFormat.ts`
- Create: `src/importers/importGeoJSON.ts`
- Create: `src/importers/importShapefileZip.ts`
- Create: `src/importers/importCSV.ts`
- Test: `tests/unit/importers.test.ts`

**Interfaces:**
- `detectFormat(file: File): Promise<'geojson' | 'shapefile' | 'csv' | 'unknown'>`.
- `importGeoJSON(input: File | string, fileName?: string): Promise<SpatialDataset>`.
- `importShapefileZip(input: File | ArrayBuffer, fileName?: string): Promise<SpatialDataset>`.
- `importCSV(file: File, mapping?: CsvColumnMapping): Promise<SpatialDataset>`.

- [ ] **Step 1: Write unit tests for format detection and parsers**.
- [ ] **Step 2: Implement `detectFormat.ts`** with extension & magic byte checks.
- [ ] **Step 3: Implement `importGeoJSON.ts`** with RFC 7946 parsing.
- [ ] **Step 4: Implement `importShapefileZip.ts`** using `shpjs` for unpacking `.shp`, `.dbf`, and `.prj`.
- [ ] **Step 5: Implement `importCSV.ts`** using `PapaParse` with smart header matching.
- [ ] **Step 6: Run tests** with `npx vitest run tests/unit/importers.test.ts` and verify PASS.

---

### Task 4: Defensive Validation Engine

**Files:**
- Create: `src/validation/validationTypes.ts`
- Create: `src/validation/validateGeoJSON.ts`
- Create: `src/validation/validateShapefile.ts`
- Create: `src/validation/validateCSV.ts`
- Test: `tests/unit/validation.test.ts`

**Interfaces:**
- `validateGeoJSON(fc: GeoJSON.FeatureCollection): ValidationReport`.
- `validateShapefileZip(entries: string[], prj?: string): ValidationReport`.
- `validateCsvRows(rows: Record<string, unknown>[], mapping: CsvColumnMapping): ValidationReport`.

- [ ] **Step 1: Write unit tests for validation rules** (out-of-bound coords, missing DBF, duplicate IDs).
- [ ] **Step 2: Implement validation modules** with Error, Warning, and Info severity classifications.
- [ ] **Step 3: Run tests** with `npx vitest run tests/unit/validation.test.ts` and verify PASS.

---

### Task 5: Zustand Reactive State Store & Demo Dataset

**Files:**
- Create: `src/app/store.ts`
- Create: `src/data/demoBotanicalGarden.ts`
- Test: `tests/unit/store.test.ts`

**Interfaces:**
- `useAppStore`: Zustand hook exposing state & actions (`addDataset`, `removeDataset`, `selectFeature`, `setCategoryVisibility`, `loadDemoDataset`, `startMeasurement`, etc.).
- Embedded Group 6 Botanical Garden 14 points GeoJSON dataset.

- [ ] **Step 1: Write unit tests for store actions**.
- [ ] **Step 2: Implement `src/data/demoBotanicalGarden.ts`** with the 14 reference points and attributes.
- [ ] **Step 3: Implement `src/app/store.ts`** with full dataset, selection, and tool lifecycle.
- [ ] **Step 4: Run tests** with `npx vitest run tests/unit/store.test.ts` and verify PASS.

---

### Task 6: MapLibre GL Integration, Basemaps & Dynamic Symbology

**Files:**
- Create: `src/map/mapStyles.ts`
- Create: `src/map/mapLayers.ts`
- Create: `src/map/labelRules.ts`
- Create: `src/map/animations.ts`
- Create: `src/map/MapView.tsx`

**Interfaces:**
- Basemap styles: Carto Dark Matter, Carto Positron, OpenStreetMap, Esri Satellite.
- Vector rendering for Points (circles with halos), LineStrings, Polygons with opacity.
- Staggered feature reveal and selection pulse animations.

- [ ] **Step 1: Implement `mapStyles.ts`** with reliable vector/raster tile style endpoints.
- [ ] **Step 2: Implement `mapLayers.ts` and `labelRules.ts`** generating MapLibre GL layer specs.
- [ ] **Step 3: Implement `MapView.tsx`** handling map initialization, GeoJSON source synchronization, click/hover interactions, and bounds animation.

---

### Task 7: Main UI Shell & Upload Components

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/StatusBar.tsx`
- Create: `src/components/upload/FileDropzone.tsx`
- Create: `src/components/upload/CsvColumnModal.tsx`
- Create: `src/components/modals/HelpModal.tsx`
- Create: `src/app/App.tsx`

**Interfaces:**
- Responsive layout supporting Desktop split panels, collapsible drawers, and mobile viewports.
- File dropzone supporting drag-over visual feedback, file picker, and format guidance.
- CSV interactive column mapping dialog with preview.

- [ ] **Step 1: Implement Header** with Logo, Demo Loader, Export dropdown, Theme Toggle, and Help modal.
- [ ] **Step 2: Implement Sidebar & Tabs** (Layers, Legend, Validation, Summary, Search).
- [ ] **Step 3: Implement FileDropzone and CsvColumnModal**.
- [ ] **Step 4: Implement StatusBar** showing live coordinates, CRS, and feature count.
- [ ] **Step 5: Connect App.tsx layout shell**.

---

### Task 8: Dynamic Legend, Layer Controls & Category Filtering

**Files:**
- Create: `src/components/panels/LayerPanel.tsx`
- Create: `src/components/panels/LegendPanel.tsx`
- Create: `src/components/panels/ValidationPanel.tsx`
- Create: `src/components/panels/DatasetSummaryPanel.tsx`

**Interfaces:**
- Layer visibility toggle, opacity slider, zoom-to-extent, and delete layer actions.
- Interactive legend with category swatches, counts, and checkbox filters.
- Validation diagnostics tab showing Errors, Warnings, and Info badges with row hints.

- [ ] **Step 1: Implement LayerPanel and LegendPanel**.
- [ ] **Step 2: Implement ValidationPanel and DatasetSummaryPanel**.
- [ ] **Step 3: Integrate category filtering** directly into MapLibre GL layer filters and UI state.

---

### Task 9: Feature Inspector, Search with Fly-To & Coordinate Tools

**Files:**
- Create: `src/components/panels/FeatureInspector.tsx`
- Create: `src/components/panels/SearchPanel.tsx`
- Create: `src/components/tools/CoordinateFlyTo.tsx`

**Interfaces:**
- Slide-out inspector showing feature name, category, geometry, coordinates, and formatted attribute table.
- Copy coordinates button (decimal & DMS).
- Live fuzzy search across feature properties with auto-zoom.
- Coordinate input box to jump to specific lat/lon.

- [ ] **Step 1: Implement FeatureInspector with copy action and zoom-to-feature**.
- [ ] **Step 2: Implement SearchPanel with highlighted query matching**.
- [ ] **Step 3: Implement CoordinateFlyTo tool**.

---

### Task 10: Virtualized Attribute Table with Selection Synchronization

**Files:**
- Create: `src/components/panels/AttributeTable.tsx`
- Test: `tests/unit/attributeTable.test.ts`

**Interfaces:**
- Collapsible bottom drawer containing full tabular feature properties.
- Column sorting (ascending/descending), text search, and row count metrics.
- Bidirectional selection: clicking a table row selects & flies to the map feature; clicking a map feature highlights the table row.

- [ ] **Step 1: Write tests for sorting and filtering logic**.
- [ ] **Step 2: Implement `AttributeTable.tsx`** with responsive table layout and column headers.
- [ ] **Step 3: Connect bidirectional selection sync** with Zustand store.

---

### Task 11: Geodesic Measurement Tools (Distance & Area)

**Files:**
- Create: `src/map/measurements.ts`
- Create: `src/components/tools/MeasureToolbar.tsx`
- Test: `tests/unit/measurements.test.ts`

**Interfaces:**
- `calculateDistance`, `calculatePolylineDistance`, `calculatePolygonAreaAndPerimeter`.
- Interactive drawing mode on map: click vertices, live rubberband line/polygon, segment badges in meters/km or m²/ha/km².

- [ ] **Step 1: Write unit tests for geodesic distance & area math**.
- [ ] **Step 2: Implement `measurements.ts`** with Turf geodesic formulas.
- [ ] **Step 3: Implement `MeasureToolbar.tsx`** with toggle buttons, finish, and clear actions.
- [ ] **Step 4: Integrate measurement preview layers** into MapView.

---

### Task 12: Export Engine (GeoJSON, CSV, Screenshot)

**Files:**
- Create: `src/export/exportGeoJSON.ts`
- Create: `src/export/exportCSV.ts`
- Create: `src/export/exportMapImage.ts`
- Create: `src/components/tools/ExportMenu.tsx`
- Test: `tests/unit/exports.test.ts`

**Interfaces:**
- Export normalized or filtered GeoJSON (stripping internal `__*` fields).
- Export point dataset records to CSV.
- Capture WebGL map canvas to PNG image.

- [ ] **Step 1: Write unit tests for GeoJSON and CSV export formatters**.
- [ ] **Step 2: Implement export utilities and `ExportMenu.tsx` dropdown**.

---

### Task 13: Integration, Group 6 Dataset Verification & Polishing

**Files:**
- Copy / Verify reference datasets:
  - GeoJSON: `Group6_Botanical_Garden_Final_14_Points.geojson`
  - Shapefile ZIP: `Group6_Botanical_Garden_Points.zip`
  - CSV: `Group6_Botanical_Garden_Final_14_Points.csv`
- Test: Full integration test suite.

- [ ] **Step 1: Test GeoJSON import** with Group 6 reference data (14 points render, extent fits, attributes match).
- [ ] **Step 2: Test Shapefile ZIP import** (verify DBF properties, PRJ detection, equivalence with GeoJSON).
- [ ] **Step 3: Test CSV import with column mapping modal** (verify equivalent points and attributes).
- [ ] **Step 4: Run full Vitest test suite** (`npm test`).
- [ ] **Step 5: Perform visual and interaction verification** across Dark and Light modes.
