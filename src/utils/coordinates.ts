import bbox from '@turf/bbox';
import type { FeatureCollection, Geometry } from 'geojson';

/**
 * Validates whether numeric coordinates are in valid WGS 84 range.
 */
export function isValidWgs84(lng: number, lat: number): boolean {
  return (
    typeof lng === 'number' &&
    typeof lat === 'number' &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    isFinite(lng) &&
    isFinite(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Formats a decimal degree coordinate pair into human-readable representation.
 */
export function formatCoordinates(lng: number, lat: number, decimals: number = 5): string {
  const latCard = lat >= 0 ? 'N' : 'S';
  const lngCard = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(decimals)}° ${latCard}, ${Math.abs(lng).toFixed(decimals)}° ${lngCard}`;
}

/**
 * Converts decimal degrees to Degrees, Minutes, Seconds (DMS).
 */
export function decimalToDMS(deg: number, isLatitude: boolean): string {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
  const direction = isLatitude ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W';
  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/**
 * Converts DMS strings to decimal degrees.
 */
export function dmsToDecimal(degrees: number, minutes: number, seconds: number, direction: 'N' | 'S' | 'E' | 'W'): number {
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    decimal *= -1;
  }
  return decimal;
}

/**
 * Calculates a bounding box [minLng, minLat, maxLng, maxLat] with safety padding for single points.
 */
export function calculateFeatureCollectionBbox(fc: FeatureCollection<Geometry, any>): [number, number, number, number] {
  if (!fc || !fc.features || fc.features.length === 0) {
    return [-180, -90, 180, 90];
  }
  try {
    const rawBbox = bbox(fc as any);
    let [minX, minY, maxX, maxY] = rawBbox;

    // Guard against single point or zero-area extent
    if (minX === maxX && minY === maxY) {
      const delta = 0.005; // ~500m padding
      return [minX - delta, minY - delta, maxX + delta, maxY + delta];
    }

    // Add 5% visual padding
    const width = maxX - minX;
    const height = maxY - minY;
    const paddingX = Math.max(width * 0.05, 0.002);
    const paddingY = Math.max(height * 0.05, 0.002);

    return [
      Math.max(-180, minX - paddingX),
      Math.max(-90, minY - paddingY),
      Math.min(180, maxX + paddingX),
      Math.min(90, maxY + paddingY)
    ];
  } catch {
    return [-180, -90, 180, 90];
  }
}
