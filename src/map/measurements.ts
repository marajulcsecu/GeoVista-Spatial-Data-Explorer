import distance from '@turf/distance';
import area from '@turf/area';
import { point, polygon } from '@turf/helpers';
import type { MeasurementState, DistanceUnit, AreaUnit } from '../types/spatial';

export const INITIAL_MEASUREMENT_STATE: MeasurementState = {
  mode: 'none',
  points: [],
  totalDistanceMeters: 0,
  totalAreaSquareMeters: 0,
  perimeterMeters: 0,
  segments: [],
  isFinished: false,
  distanceUnit: 'auto',
  areaUnit: 'auto'
};

export interface DistanceUnitOption {
  key: DistanceUnit;
  label: string;
  symbol: string;
}

export const DISTANCE_UNIT_OPTIONS: DistanceUnitOption[] = [
  { key: 'auto', label: 'Auto (m / km)', symbol: 'auto' },
  { key: 'm', label: 'Meters', symbol: 'm' },
  { key: 'km', label: 'Kilometers', symbol: 'km' },
  { key: 'ft', label: 'Feet', symbol: 'ft' },
  { key: 'mi', label: 'Miles', symbol: 'mi' },
  { key: 'yd', label: 'Yards', symbol: 'yd' },
  { key: 'nm', label: 'Nautical Miles', symbol: 'NM' }
];

export interface AreaUnitOption {
  key: AreaUnit;
  label: string;
  symbol: string;
}

export const AREA_UNIT_OPTIONS: AreaUnitOption[] = [
  { key: 'auto', label: 'Auto (m² / ha / km²)', symbol: 'auto' },
  { key: 'ha', label: 'Hectares', symbol: 'ha' },
  { key: 'acre', label: 'Acres', symbol: 'ac' },
  { key: 'sqm', label: 'Square Meters', symbol: 'm²' },
  { key: 'sqkm', label: 'Square Kilometers', symbol: 'km²' },
  { key: 'sqft', label: 'Square Feet', symbol: 'sq ft' },
  { key: 'sqmi', label: 'Square Miles', symbol: 'sq mi' },
  { key: 'bigha', label: 'Bigha (South Asia)', symbol: 'bigha' }
];

/**
 * Calculates geodesic distance between two [lng, lat] coordinates in meters.
 */
export function calculateSegmentDistance(p1: [number, number], p2: [number, number]): number {
  try {
    const pt1 = point(p1);
    const pt2 = point(p2);
    return distance(pt1, pt2, { units: 'meters' });
  } catch {
    return 0;
  }
}

/**
 * Calculates cumulative distance and segment lengths for a list of [lng, lat] points.
 */
export function calculatePolylineDistance(points: [number, number][]): { total: number; segments: number[] } {
  if (points.length < 2) {
    return { total: 0, segments: [] };
  }
  const segments: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segDist = calculateSegmentDistance(points[i], points[i + 1]);
    segments.push(segDist);
    total += segDist;
  }
  return { total, segments };
}

/**
 * Calculates spherical area and perimeter for a closed polygon formed by [lng, lat] points.
 */
export function calculatePolygonAreaAndPerimeter(points: [number, number][]): { area: number; perimeter: number; segments: number[] } {
  if (points.length < 3) {
    const { total, segments } = calculatePolylineDistance(points);
    return { area: 0, perimeter: total, segments };
  }
  try {
    // Close ring if needed
    const ring = [...points];
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push(first);
    }

    const poly = polygon([ring]);
    const polyArea = area(poly); // square meters
    const { total: perimeter, segments } = calculatePolylineDistance(ring);

    return { area: polyArea, perimeter, segments };
  } catch {
    return { area: 0, perimeter: 0, segments: [] };
  }
}

/**
 * Calculates geographic azimuth / compass bearing between two points in degrees (0 - 360).
 */
export function calculateBearing(p1: [number, number], p2: [number, number]): { degrees: number; compass: string } {
  const lon1 = (p1[0] * Math.PI) / 180;
  const lat1 = (p1[1] * Math.PI) / 180;
  const lon2 = (p2[0] * Math.PI) / 180;
  const lat2 = (p2[1] * Math.PI) / 180;

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const idx = Math.round(brng / 45);
  return {
    degrees: Math.round(brng * 10) / 10,
    compass: directions[idx]
  };
}

/**
 * Formats distance according to selected unit.
 */
export function formatDistance(meters: number, unit: DistanceUnit = 'auto'): string {
  if (meters === 0) return '0 m';

  switch (unit) {
    case 'm':
      return `${meters >= 100 ? Math.round(meters).toLocaleString() : meters.toFixed(1)} m`;
    case 'km':
      return `${(meters / 1000).toFixed(3)} km`;
    case 'ft': {
      const ft = meters * 3.28084;
      return `${ft >= 100 ? Math.round(ft).toLocaleString() : ft.toFixed(1)} ft`;
    }
    case 'mi':
      return `${(meters / 1609.344).toFixed(3)} mi`;
    case 'yd': {
      const yd = meters * 1.09361;
      return `${yd >= 100 ? Math.round(yd).toLocaleString() : yd.toFixed(1)} yd`;
    }
    case 'nm':
      return `${(meters / 1852).toFixed(3)} NM`;
    case 'auto':
    default:
      if (meters < 1000) {
        return `${meters >= 10 ? Math.round(meters) : meters.toFixed(1)} m`;
      }
      return `${(meters / 1000).toFixed(2)} km`;
  }
}

/**
 * Formats area in square meters according to selected unit.
 */
export function formatArea(sqMeters: number, unit: AreaUnit = 'auto'): string {
  if (sqMeters === 0) return '0 m²';

  switch (unit) {
    case 'sqm':
      return `${Math.round(sqMeters).toLocaleString()} m²`;
    case 'ha':
      return `${(sqMeters / 10000).toFixed(2)} ha`;
    case 'acre':
      return `${(sqMeters / 4046.8564224).toFixed(2)} ac`;
    case 'sqkm':
      return `${(sqMeters / 1000000).toFixed(3)} km²`;
    case 'sqft': {
      const sqft = sqMeters * 10.7639;
      return `${Math.round(sqft).toLocaleString()} sq ft`;
    }
    case 'sqmi':
      return `${(sqMeters / 2589988.11).toFixed(3)} sq mi`;
    case 'bigha': {
      // 1 Standard Bigha = 1337.8 sq meters (20 Katha)
      const bigha = sqMeters / 1337.8;
      return `${bigha.toFixed(2)} bigha`;
    }
    case 'auto':
    default:
      if (sqMeters < 10000) {
        return `${Math.round(sqMeters).toLocaleString()} m²`;
      }
      if (sqMeters < 1000000) {
        return `${(sqMeters / 10000).toFixed(2)} ha`;
      }
      return `${(sqMeters / 1000000).toFixed(2)} km²`;
  }
}
