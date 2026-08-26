import { useState, useMemo, type FC } from 'react';
import {
  Ruler,
  Pentagon,
  Undo2,
  CheckCircle2,
  Trash2,
  Copy,
  Download,
  ChevronDown,
  ChevronUp,
  Compass,
  Check
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import {
  formatDistance,
  formatArea,
  calculateBearing,
  DISTANCE_UNIT_OPTIONS,
  AREA_UNIT_OPTIONS
} from '../../map/measurements';
import type { DistanceUnit, AreaUnit } from '../../types/spatial';

export const MeasurementOverlay: FC = () => {
  const {
    activeTool,
    measurementState,
    undoMeasurementPoint,
    finishMeasurement,
    clearMeasurement,
    setMeasurementUnits,
    startMeasurement
  } = useAppStore();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    mode,
    points = [],
    totalDistanceMeters = 0,
    totalAreaSquareMeters = 0,
    perimeterMeters = 0,
    segments = [],
    isFinished = false,
    distanceUnit = 'auto',
    areaUnit = 'auto'
  } = measurementState || {};

  // Formatted main values
  const formattedDistance = formatDistance(totalDistanceMeters, distanceUnit);
  const formattedArea = formatArea(totalAreaSquareMeters, areaUnit);
  const formattedPerimeter = formatDistance(perimeterMeters, distanceUnit);

  // Detailed segment calculation - HOOK AT TOP LEVEL
  const segmentDetails = useMemo(() => {
    if (!points || points.length < 2) return [];
    const details = [];
    let cumDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const segDist = segments[i] || 0;
      cumDist += segDist;
      const bearing = calculateBearing(points[i], points[i + 1]);
      details.push({
        index: i + 1,
        from: points[i],
        to: points[i + 1],
        lengthMeters: segDist,
        lengthFormatted: formatDistance(segDist, distanceUnit),
        cumFormatted: formatDistance(cumDist, distanceUnit),
        bearing: `${bearing.degrees}° ${bearing.compass}`
      });
    }
    return details;
  }, [points, segments, distanceUnit]);

  const isMeasuring =
    activeTool === 'measure-distance' || activeTool === 'measure-area';

  // Safe early return ONLY AFTER all hooks have executed
  if (!isMeasuring && points.length === 0) {
    return null;
  }

  const handleCopySummary = () => {
    let text = `[GeoVista GIS Measurement Report]\n`;
    text += `Mode: ${mode === 'distance' ? 'Geodesic Distance' : 'Geodesic Polygon Area'}\n`;
    if (mode === 'distance') {
      text += `Total Distance: ${formattedDistance}\n`;
      text += `Vertices: ${points.length}\n`;
    } else {
      text += `Enclosed Area: ${formattedArea}\n`;
      text += `Perimeter: ${formattedPerimeter}\n`;
      text += `Vertices: ${points.length}\n`;
    }
    if (segmentDetails.length > 0) {
      text += `\nSegment Breakdown:\n`;
      segmentDetails.forEach((seg) => {
        text += `Leg ${seg.index}: ${seg.lengthFormatted} (Heading: ${seg.bearing})\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportGeoJSON = () => {
    if (points.length < 2) return;
    const geom =
      mode === 'area' && points.length >= 3
        ? {
            type: 'Polygon',
            coordinates: [[...points, points[0]]]
          }
        : {
            type: 'LineString',
            coordinates: points
          };

    const feature = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: geom,
          properties: {
            mode,
            totalDistanceMeters,
            totalAreaSquareMeters,
            perimeterMeters,
            formattedDistance,
            formattedArea,
            created: new Date().toISOString()
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(feature, null, 2)], {
      type: 'application/geo+json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurement_${mode}_${Date.now()}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="map-hud-control"
      style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        minWidth: 420,
        maxWidth: 580,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}
    >
      {/* Top Header Row: Mode Switcher & Tools */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 6
        }}
      >
        {/* Mode Toggle Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => startMeasurement('distance')}
            className={mode === 'distance' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '3px 8px', fontSize: 11, height: 24 }}
          >
            <Ruler size={12} />
            <span>Distance</span>
          </button>
          <button
            onClick={() => startMeasurement('area')}
            className={mode === 'area' ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '3px 8px', fontSize: 11, height: 24 }}
          >
            <Pentagon size={12} />
            <span>Polygon Area</span>
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {points.length > 0 && !isFinished && (
            <button
              onClick={() => undoMeasurementPoint()}
              className="btn-ghost"
              style={{ padding: '3px 6px', fontSize: 11, height: 24 }}
              title="Undo last placed point (Ctrl+Z)"
            >
              <Undo2 size={12} />
              <span>Undo</span>
            </button>
          )}

          {points.length >= (mode === 'area' ? 3 : 2) && !isFinished && (
            <button
              onClick={() => finishMeasurement()}
              className="btn-primary"
              style={{ padding: '3px 8px', fontSize: 11, height: 24 }}
              title="Finish active measurement"
            >
              <CheckCircle2 size={12} />
              <span>Finish</span>
            </button>
          )}

          <button
            onClick={() => clearMeasurement()}
            className="btn-ghost"
            style={{ padding: '3px 6px', color: 'var(--accent-rose)', height: 24 }}
            title="Reset and clear measurement"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Main Measurement Readout Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {mode === 'distance' ? 'Total Path Distance' : 'Enclosed Polygon Area'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em'
              }}
            >
              {mode === 'distance' ? formattedDistance : formattedArea}
            </span>
            {mode === 'area' && perimeterMeters > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                Perimeter: <strong style={{ color: 'var(--text-primary)' }}>{formattedPerimeter}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Unit Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Unit:</span>
          {mode === 'distance' ? (
            <select
              value={distanceUnit}
              onChange={(e) => setMeasurementUnits({ distanceUnit: e.target.value as DistanceUnit })}
              style={{
                padding: '3px 8px',
                fontSize: 11,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
            >
              {DISTANCE_UNIT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.symbol})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={areaUnit}
              onChange={(e) => setMeasurementUnits({ areaUnit: e.target.value as AreaUnit })}
              style={{
                padding: '3px 8px',
                fontSize: 11,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer'
              }}
            >
              {AREA_UNIT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.symbol})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Vertex Count & Guidance Instructions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 10,
          color: 'var(--text-secondary)'
        }}
      >
        <span>
          <strong>{points.length}</strong> {points.length === 1 ? 'vertex' : 'vertices'} placed
          {isFinished ? ' (Measurement locked)' : ' — Click map to add next vertex'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {points.length >= 2 && (
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="btn-ghost"
              style={{ padding: '2px 4px', fontSize: 10, height: 20 }}
            >
              <span>Legs breakdown ({segmentDetails.length})</span>
              {isDetailsOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}

          {points.length >= 2 && (
            <button
              onClick={handleCopySummary}
              className="btn-ghost"
              style={{ padding: '2px 4px', fontSize: 10, height: 20 }}
              title="Copy measurement summary to clipboard"
            >
              {copied ? <Check size={11} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {points.length >= 2 && (
            <button
              onClick={handleExportGeoJSON}
              className="btn-ghost"
              style={{ padding: '2px 4px', fontSize: 10, height: 20 }}
              title="Export as GeoJSON feature"
            >
              <Download size={11} />
              <span>GeoJSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Segment Details Drawer */}
      {isDetailsOpen && segmentDetails.length > 0 && (
        <div
          style={{
            marginTop: 4,
            maxHeight: 140,
            overflowY: 'auto',
            background: 'var(--bg-surface-sunken)',
            borderRadius: 'var(--radius-xs)',
            padding: 4,
            border: '1px solid var(--border-color)',
            fontSize: 10,
            fontFamily: 'var(--font-mono)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '2px 4px' }}>Leg</th>
                <th style={{ padding: '2px 4px' }}>Distance</th>
                <th style={{ padding: '2px 4px' }}>Cumulative</th>
                <th style={{ padding: '2px 4px' }}>Bearing</th>
              </tr>
            </thead>
            <tbody>
              {segmentDetails.map((seg) => (
                <tr key={seg.index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '3px 4px', color: 'var(--accent-cyan)' }}>#{seg.index}</td>
                  <td style={{ padding: '3px 4px' }}>{seg.lengthFormatted}</td>
                  <td style={{ padding: '3px 4px', color: 'var(--text-secondary)' }}>{seg.cumFormatted}</td>
                  <td style={{ padding: '3px 4px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Compass size={10} />
                      <span>{seg.bearing}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
