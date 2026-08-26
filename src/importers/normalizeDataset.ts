import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type {
  AttributeFieldMeta,
  NormalizedFeature,
  NormalizedFeatureCollection,
  NormalizedFeatureProperties,
  SpatialDataset,
  SupportedFormat,
  ValidationReport
} from '../types/spatial';
import { calculateFeatureCollectionBbox, formatCoordinates } from '../utils/coordinates';
import { extractCategoriesFromValues, PRESET_CATEGORY_COLORS } from '../utils/categories';
import { cleanDatasetName } from '../utils/fileNames';

export interface DatasetMetaOptions {
  id?: string;
  name?: string;
  sourceFormat: SupportedFormat;
  originalFileName: string;
  fileSizeBytes: number;
  detectedCrs?: string;
  crsWarning?: string;
  validationReport: ValidationReport;
}

const CANDIDATE_LABEL_FIELDS = [
  'Point_Name',
  'point_name',
  'name',
  'Name',
  'NAME',
  'title',
  'Title',
  'label',
  'Label',
  'Point_ID',
  'point_id',
  'id',
  'ID'
];

const CANDIDATE_CATEGORY_FIELDS = [
  'Category',
  'category',
  'CATEGORY',
  'Type',
  'type',
  'TYPE',
  'Class',
  'class',
  'Zone',
  'zone',
  'group',
  'Group'
];

export function normalizeDataset(
  rawFC: FeatureCollection<Geometry, any>,
  meta: DatasetMetaOptions
): SpatialDataset {
  const datasetId = meta.id || `ds_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const datasetName = meta.name || cleanDatasetName(meta.originalFileName);

  const rawFeatures = Array.isArray(rawFC?.features) ? rawFC.features : [];

  // Determine available user fields from first few features
  const propertyKeysSet = new Set<string>();
  rawFeatures.slice(0, 50).forEach((f) => {
    if (f.properties && typeof f.properties === 'object') {
      Object.keys(f.properties).forEach((k) => {
        if (!k.startsWith('__')) propertyKeysSet.add(k);
      });
    }
  });
  const propertyKeys = Array.from(propertyKeysSet);

  // Auto-detect label field
  const primaryLabelField = CANDIDATE_LABEL_FIELDS.find((f) => propertyKeys.includes(f));

  // Auto-detect category field
  const primaryCategoryField = CANDIDATE_CATEGORY_FIELDS.find((f) => propertyKeys.includes(f));

  // Extract raw category values
  const rawCategoryValues = rawFeatures.map((f) => {
    if (primaryCategoryField && f.properties) {
      return f.properties[primaryCategoryField];
    }
    return undefined;
  });

  const categories = extractCategoriesFromValues(rawCategoryValues);

  // Normalized feature list
  const normalizedFeatures: NormalizedFeature[] = [];

  rawFeatures.forEach((feat, index) => {
    if (!feat || !feat.geometry) return;

    const rawProps = (feat.properties && typeof feat.properties === 'object') ? { ...feat.properties } : {};
    const internalId = `feat_${index}`;

    // Resolve display name
    let displayName = '';
    if (primaryLabelField && rawProps[primaryLabelField]) {
      displayName = String(rawProps[primaryLabelField]).trim();
    }
    if (!displayName && feat.id) {
      displayName = String(feat.id);
    }
    if (!displayName) {
      displayName = `Feature #${index + 1}`;
    }

    // Resolve category
    let categoryVal = 'Uncategorized';
    if (primaryCategoryField && rawProps[primaryCategoryField]) {
      categoryVal = String(rawProps[primaryCategoryField]).trim();
    }

    // Formatted coords
    let formattedCoords: string | undefined;
    if (feat.geometry.type === 'Point' && Array.isArray(feat.geometry.coordinates)) {
      const [lng, lat] = feat.geometry.coordinates;
      if (typeof lng === 'number' && typeof lat === 'number') {
        formattedCoords = formatCoordinates(lng, lat);
      }
    }

    const normalizedProps: NormalizedFeatureProperties = {
      ...rawProps,
      __internalId: internalId,
      __displayName: displayName,
      __datasetId: datasetId,
      __category: categoryVal,
      __formattedCoords: formattedCoords,
      __geometryType: feat.geometry.type
    };

    normalizedFeatures.push({
      type: 'Feature',
      id: internalId,
      geometry: feat.geometry,
      properties: normalizedProps
    });
  });

  const normalizedFC: NormalizedFeatureCollection = {
    type: 'FeatureCollection',
    features: normalizedFeatures
  };

  // Compute bounding box
  const bbox = calculateFeatureCollectionBbox(normalizedFC);

  // Build attribute schema metadata
  const attributeSchema: AttributeFieldMeta[] = propertyKeys.map((key) => {
    const values = normalizedFeatures.map((f) => f.properties[key]).filter((v) => v !== undefined && v !== null);
    const uniqueValues = Array.from(new Set(values));
    const firstVal = values[0];
    let type: AttributeFieldMeta['type'] = 'string';
    if (typeof firstVal === 'number') type = 'number';
    else if (typeof firstVal === 'boolean') type = 'boolean';
    else if (firstVal instanceof Date) type = 'date';
    else if (typeof firstVal === 'object') type = 'object';

    return {
      name: key,
      type,
      uniqueCount: uniqueValues.length,
      sampleValues: uniqueValues.slice(0, 5)
    };
  });

  // Build custom color mapping
  const customColorMap: Record<string, string> = {};
  categories.forEach((cat) => {
    customColorMap[cat.name] = cat.color;
  });

  return {
    id: datasetId,
    name: datasetName,
    sourceFormat: meta.sourceFormat,
    originalFileName: meta.originalFileName,
    fileSizeBytes: meta.fileSizeBytes,
    featureCollection: normalizedFC,
    bbox,
    detectedCrs: meta.detectedCrs || 'EPSG:4326 (WGS 84)',
    crsWarning: meta.crsWarning,
    attributeSchema,
    categories,
    primaryCategoryField,
    primaryLabelField,
    validationReport: meta.validationReport,
    style: {
      pointRadius: 7,
      strokeColor: '#ffffff',
      strokeWidth: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.35,
      categoryField: primaryCategoryField,
      customColorMap
    },
    visible: true,
    opacity: 1,
    createdAt: Date.now()
  };
}
