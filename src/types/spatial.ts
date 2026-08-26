import type { Feature, FeatureCollection, Geometry } from 'geojson';

export type SupportedFormat = 'geojson' | 'shapefile' | 'csv' | 'unknown';

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

export interface CategoryMeta {
  name: string;
  color: string;
  count: number;
  visible: boolean;
}

export interface AttributeFieldMeta {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  uniqueCount: number;
  sampleValues: unknown[];
}

export interface LayerStyleConfig {
  pointRadius: number;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  fillOpacity: number;
  categoryField?: string;
  customColorMap?: Record<string, string>;
}

export interface NormalizedFeatureProperties {
  __internalId: string;
  __displayName: string;
  __datasetId: string;
  __category?: string;
  __formattedCoords?: string;
  __geometryType: string;
  [key: string]: unknown;
}

export type NormalizedFeature = Feature<Geometry, NormalizedFeatureProperties>;
export type NormalizedFeatureCollection = FeatureCollection<Geometry, NormalizedFeatureProperties>;

export interface SpatialDataset {
  id: string;
  name: string;
  sourceFormat: SupportedFormat;
  originalFileName: string;
  fileSizeBytes: number;
  featureCollection: NormalizedFeatureCollection;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  detectedCrs?: string;
  crsWarning?: string;
  attributeSchema: AttributeFieldMeta[];
  categories: CategoryMeta[];
  primaryCategoryField?: string;
  primaryLabelField?: string;
  validationReport: ValidationReport;
  style: LayerStyleConfig;
  visible: boolean;
  opacity: number;
  createdAt: number;
}

export interface SelectedFeatureRef {
  datasetId: string;
  internalId: string;
  feature: NormalizedFeature;
}

export type BasemapKey =
  | 'esri-satellite'
  | 'esri-topo'
  | 'osm-standard'
  | 'esri-natgeo'
  | 'osm'
  | 'carto-dark'
  | 'carto-light';

export interface CsvColumnMapping {
  longitudeField: string;
  latitudeField: string;
  labelField?: string;
  categoryField?: string;
  descriptionField?: string;
}

export interface MeasurementState {
  mode: 'none' | 'distance' | 'area';
  points: [number, number][]; // [lng, lat]
  totalDistanceMeters: number;
  totalAreaSquareMeters: number;
  perimeterMeters: number;
  segments: number[]; // individual segment lengths in meters
  isFinished: boolean;
}
