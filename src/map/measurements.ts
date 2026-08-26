import distance from '@turf/distance';
import area from '@turf/area';
import { point, polygon, lineString } from '@turf/helpers';
import type { MeasurementState } from '../types/spatial';

export const INITIAL_MEASUREMENT_STATE: MeasurementState = {
  mode: 'none',
  points: [],
  totalDistanceMeters: 0,
  totalAreaSquareMeters: 0,
  perimeterMeters: 0,
  segments: [],
  isFinished: false
};

/**
 * Calculates geodesic distance between two [lng, lat] coordinates in meters.
 */
export function calculateSegmentDistance(p1: [number, number], p2: [number, number]): number {
  try {
    const pt1 = point(p1);
    const pt2 = point(p2);
    // turf distance returns kilometers by default
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
export function calculatePolygonAreaAndPerimeter(points: [number, number][]): { area: number; perimeter: number } {
  if (points.length < 3) {
    return { area: 0, perimeter: 0 };
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
    const { total: perimeter } = calculatePolylineDistance(ring);

    return { area: polyArea, perimeter };
  } catch {
    return { area: 0, perimeter: 0 };
  }
}

/**
 * Formats distance in meters into human-readable string (m or km).
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Formats area in square meters into human-readable string (m², ha, km²).
 */
export function formatArea(sqMeters: number): string {
  if (sqMeters < 10000) {
    return `${Math.round(sqMeters).toLocaleString()} m²`;
  }
  if (sqMeters < 1000000) {
    return `${(sqMeters / 10000).toFixed(2)} ha`;
  }
  return `${(sqMeters / 1000000).toFixed(2)} km²`;
}
