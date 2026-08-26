# API & Module Technical Specification

## 1. Importer Module (`src/importers/`)

### 1.1 `detectFormat(file: File): Promise<SupportedFormat>`
Determines the data format by inspecting file extension and binary magic bytes.
```typescript
export type SupportedFormat = 'geojson' | 'shapefile' | 'csv' | 'unknown';

export async function detectFormat(file: File): Promise<SupportedFormat>;
```
- `.geojson`, `.json` ➔ `'geojson'`
- `.zip` (checks PK magic header `0x50 0x4B 0x03 0x04`) ➔ `'shapefile'`
- `.csv`, `.txt`, `.tsv` ➔ `'csv'`

---

### 1.2 `importGeoJSON(file: File | string): Promise<SpatialDataset>`
Parses raw GeoJSON string or file buffer.
```typescript
export async function importGeoJSON(
  input: File | string,
  fileName?: string
): Promise<SpatialDataset>;
```
- Validates JSON format.
- Extracts geometries and properties.
- Returns normalized `SpatialDataset`.

---

### 1.3 `importShapefileZip(file: File | ArrayBuffer): Promise<SpatialDataset>`
Unpacks shapefile components using `shpjs` and parses `.prj` projection strings.
```typescript
export async function importShapefileZip(
  input: File | ArrayBuffer,
  fileName?: string
): Promise<SpatialDataset>;
```
- Verifies `.shp`, `.dbf`, `.shx`, `.prj` consistency.
- Reprojects coordinates to `EPSG:4326` if projected.
- Retains DBF attributes and maps truncated field names.

---

### 1.4 `importCSV(file: File, columnMapping?: CsvColumnMapping): Promise<SpatialDataset>`
Parses CSV with PapaParse, checks headers against known coordinate variations, or accepts manual mapping.
```typescript
export interface CsvColumnMapping {
  longitudeField: string;
  latitudeField: string;
  labelField?: string;
  categoryField?: string;
  descriptionField?: string;
}

export async function importCSV(
  file: File,
  mapping?: CsvColumnMapping
): Promise<SpatialDataset>;
```

---

### 1.5 `normalizeDataset(rawFC: GeoJSON.FeatureCollection, meta: DatasetMeta): SpatialDataset`
Central normalizer ensuring consistent `__internalId`, bounding box calculation, category extraction, and auto-styling configuration.
```typescript
export function normalizeDataset(
  rawFC: GeoJSON.FeatureCollection,
  meta: DatasetMeta
): SpatialDataset;
```

---

## 2. Validation Module (`src/validation/`)

### 2.1 Validation Data Types (`src/validation/validationTypes.ts`)
```typescript
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationMessage {
  id: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  context?: {
    rowNumber?: number;
    featureId?: string;
    field?: string;
    rawCoordinate?: unknown;
  };
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
  totalFeatures: number;
  validFeaturesCount: number;
  invalidFeaturesCount: number;
  geometryTypeCounts: Record<string, number>;
  duplicateCoordinatesCount: number;
}
```

### 2.2 Format Validators
- `validateGeoJSON(fc: GeoJSON.FeatureCollection): ValidationReport`
- `validateShapefileZip(zipEntries: string[], prjContent?: string): ValidationReport`
- `validateCsvRows(rows: Record<string, unknown>[], mapping: CsvColumnMapping): ValidationReport`

---

## 3. Map & Measurement Services (`src/map/`)

### 3.1 `computeDatasetExtent(fc: GeoJSON.FeatureCollection): [number, number, number, number]`
Computes the geographic bounding box `[minLng, minLat, maxLng, maxLat]` using `@turf/bbox` with padding guards for single-point datasets.

### 3.2 `generateCategoryExpressions(categories: CategoryMeta[]): MapboxGL.Expression`
Builds MapLibre GL categorical color expressions for circles, fills, and lines:
```typescript
// E.g.: ['match', ['get', '__category'], 'Administration', '#3B82F6', 'Entrance', '#10B981', '#6B7280']
```

### 3.3 Spatial Measurement Module (`src/map/measurements.ts`)
Calculates geodesic distances and spherical polygon areas:
```typescript
export interface MeasurementState {
  mode: 'none' | 'distance' | 'area';
  points: [number, number][]; // [lng, lat] coordinates
  totalDistanceMeters: number;
  totalAreaSquareMeters: number;
  perimeterMeters: number;
  segments: number[]; // individual segment lengths in meters
  isFinished: boolean;
}

export function calculateDistance(coord1: [number, number], coord2: [number, number]): number;
export function calculatePolylineDistance(coords: [number, number][]): { total: number; segments: number[] };
export function calculatePolygonAreaAndPerimeter(coords: [number, number][]): { area: number; perimeter: number };
export function formatDistance(meters: number, unit?: 'metric' | 'imperial'): string;
export function formatArea(sqMeters: number, unit?: 'metric' | 'imperial'): string;
```

---

## 4. Export Service (`src/export/`)

### 4.1 `exportGeoJSON(dataset: SpatialDataset, options?: { visibleOnly?: boolean; activeFilter?: Record<string, boolean> }): void`
Downloads formatted `.geojson` file to client machine with metadata stripped of temporary internal keys while preserving original user properties.

### 4.2 `exportCSV(dataset: SpatialDataset, options?: { visibleOnly?: boolean }): void`
Transforms point coordinates and attribute tables into a clean RFC 4180 CSV download.

### 4.3 `exportMapImage(mapInstance: maplibregl.Map, filename?: string): Promise<void>`
Captures WebGL canvas pixel buffer alongside attribution watermark to produce a PNG map image.

---

## 5. Global State Store API (`src/app/store.ts`)

```typescript
export const useAppStore = create<AppState>((set, get) => ({
  // Datasets
  datasets: [],
  activeDatasetId: null,
  selectedFeature: null,
  
  // UI & Tools
  activeTool: 'select',
  theme: 'dark',
  basemapStyle: 'carto-dark',
  isAttributeTableOpen: false,
  isInspectorOpen: false,
  categoryFilter: {},
  searchQuery: '',
  labelsVisible: true,
  
  // Implemented Store Actions
  addDataset: (ds) => ...,
  removeDataset: (id) => ...,
  selectFeature: (datasetId, internalId) => ...,
  setCategoryVisibility: (cat, visible) => ...,
  toggleAllCategories: (visible) => ...,
  startMeasurement: (mode) => ...,
  addMeasurementPoint: (pt) => ...,
  finishMeasurement: () => ...,
  clearMeasurement: () => ...,
  loadDemoDataset: async () => ...,
  resetAll: () => ...
}));
```
