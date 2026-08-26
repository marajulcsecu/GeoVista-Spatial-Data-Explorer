import { describe, it, expect } from 'vitest';
import {
  calculateSegmentDistance,
  calculatePolylineDistance,
  calculatePolygonAreaAndPerimeter,
  formatDistance,
  formatArea
} from '../../src/map/measurements';

describe('Measurement Engine', () => {
  it('calculates distance between two points accurately', () => {
    // 1 degree longitude at equator is ~111.32 km
    const p1: [number, number] = [0, 0];
    const p2: [number, number] = [1, 0];
    const dist = calculateSegmentDistance(p1, p2);
    expect(dist).toBeGreaterThan(111000);
    expect(dist).toBeLessThan(112000);
  });

  it('calculates cumulative polyline distances', () => {
    const p1: [number, number] = [91.7899, 22.4612];
    const p2: [number, number] = [91.7899, 22.4616];
    const p3: [number, number] = [91.7921, 22.4609];

    const { total, segments } = calculatePolylineDistance([p1, p2, p3]);
    expect(segments).toHaveLength(2);
    expect(total).toBe(segments[0] + segments[1]);
    expect(total).toBeGreaterThan(0);
  });

  it('calculates polygon area and perimeter', () => {
    const ring: [number, number][] = [
      [91.789, 22.460],
      [91.791, 22.460],
      [91.791, 22.462],
      [91.789, 22.462]
    ];

    const { area, perimeter } = calculatePolygonAreaAndPerimeter(ring);
    expect(area).toBeGreaterThan(1000);
    expect(perimeter).toBeGreaterThan(100);
  });

  it('formats distance and area units nicely', () => {
    expect(formatDistance(450)).toBe('450 m');
    expect(formatDistance(1450)).toBe('1.45 km');
    expect(formatArea(500)).toContain('500 m²');
    expect(formatArea(25000)).toBe('2.50 ha');
  });
});
