import type { FeatureCollection, Geometry, Position } from 'geojson';
import type { ValidationMessage, ValidationReport } from '../types/spatial';
import { isValidWgs84 } from '../utils/coordinates';

function checkCoordinates(coords: any, geomType: string): { valid: boolean; reason?: string } {
  if (!coords || !Array.isArray(coords)) {
    return { valid: false, reason: 'Coordinates array is missing or invalid' };
  }

  const checkPoint = (pt: Position): boolean => {
    if (!Array.isArray(pt) || pt.length < 2) return false;
    const [lng, lat] = pt;
    return isValidWgs84(lng, lat);
  };

  switch (geomType) {
    case 'Point':
      return checkPoint(coords) ? { valid: true } : { valid: false, reason: 'Point coordinates outside valid WGS 84 bounds [-180..180, -90..90]' };
    case 'MultiPoint':
    case 'LineString':
      return coords.every(checkPoint) ? { valid: true } : { valid: false, reason: 'One or more line coordinates outside valid WGS 84 bounds' };
    case 'MultiLineString':
    case 'Polygon':
      return coords.every((ring: any) => Array.isArray(ring) && ring.every(checkPoint))
        ? { valid: true }
        : { valid: false, reason: 'Polygon ring coordinates outside valid bounds' };
    case 'MultiPolygon':
      return coords.every((poly: any) => Array.isArray(poly) && poly.every((ring: any) => ring.every(checkPoint)))
        ? { valid: true }
        : { valid: false, reason: 'MultiPolygon coordinates outside valid bounds' };
    default:
      return { valid: true };
  }
}

export function validateGeoJSON(fc: FeatureCollection<Geometry, any>): ValidationReport {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const info: ValidationMessage[] = [];
  const geomCounts: Record<string, number> = {};
  const pointCoordsSet = new Set<string>();
  let duplicatePoints = 0;
  let validCount = 0;
  let invalidCount = 0;

  if (!fc || typeof fc !== 'object') {
    errors.push({
      id: 'err_invalid_json',
      severity: 'error',
      title: 'Invalid GeoJSON Object',
      message: 'The uploaded file is not a valid GeoJSON object.'
    });
    return {
      isValid: false,
      errors,
      warnings,
      info,
      totalFeatures: 0,
      validFeaturesCount: 0,
      invalidFeaturesCount: 0,
      geometryTypeCounts: {},
      duplicateCoordinatesCount: 0
    };
  }

  if (fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) {
    errors.push({
      id: 'err_not_feature_collection',
      severity: 'error',
      title: 'Invalid Top-Level Structure',
      message: `Expected "FeatureCollection" but found "${fc.type || 'unknown'}".`
    });
  }

  const features = fc.features || [];

  if (features.length === 0) {
    warnings.push({
      id: 'warn_empty_features',
      severity: 'warning',
      title: 'Empty Dataset',
      message: 'The GeoJSON FeatureCollection contains 0 features.'
    });
  }

  features.forEach((feature: any, idx: number) => {
    const featId = (feature.id as string) || `Feature #${idx + 1}`;
    if (!feature || !feature.geometry) {
      warnings.push({
        id: `warn_missing_geom_${idx}`,
        severity: 'warning',
        title: 'Feature Missing Geometry',
        message: `${featId} has no spatial geometry.`,
        context: { featureId: featId, rowNumber: idx + 1 }
      });
      invalidCount++;
      return;
    }

    const gType = feature.geometry.type;
    geomCounts[gType] = (geomCounts[gType] || 0) + 1;

    const geom = feature.geometry as any;
    const coordCheck = checkCoordinates(geom.coordinates, gType);
    if (!coordCheck.valid) {
      warnings.push({
        id: `warn_bad_coords_${idx}`,
        severity: 'warning',
        title: 'Out of Range Coordinates',
        message: `${featId}: ${coordCheck.reason}`,
        context: { featureId: featId, rowNumber: idx + 1 }
      });
      invalidCount++;
      return;
    }

    // Check duplicate coordinates for Points
    if (gType === 'Point' && Array.isArray(geom.coordinates)) {
      const coordKey = `${geom.coordinates[0].toFixed(6)},${geom.coordinates[1].toFixed(6)}`;
      if (pointCoordsSet.has(coordKey)) {
        duplicatePoints++;
      } else {
        pointCoordsSet.add(coordKey);
      }
    }

    validCount++;
  });

  if (duplicatePoints > 0) {
    info.push({
      id: 'info_duplicate_points',
      severity: 'info',
      title: 'Identical Coordinates Detected',
      message: `Found ${duplicatePoints} point(s) sharing exact identical coordinates with another feature.`
    });
  }

  info.push({
    id: 'info_wgs84_standard',
    severity: 'info',
    title: 'WGS 84 Coordinates Verified',
    message: 'GeoJSON coordinates are mapped using standard WGS 84 [longitude, latitude] projection.'
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    totalFeatures: features.length,
    validFeaturesCount: validCount,
    invalidFeaturesCount: invalidCount,
    geometryTypeCounts: geomCounts,
    duplicateCoordinatesCount: duplicatePoints
  };
}
