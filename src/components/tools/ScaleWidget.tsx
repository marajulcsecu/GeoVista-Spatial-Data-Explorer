import { useState, useMemo, type FC } from 'react';
import { useAppStore } from '../../app/store';

const NICE_METRIC_STEPS = [
  1, 2, 5, 10, 20, 50, 100, 200, 500,
  1000, 2000, 5000, 10000, 20000, 50000,
  100000, 200000, 500000, 1000000, 2000000, 5000000
];

export const ScaleWidget: FC = () => {
  const { mapZoom, mapCenter } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const scaleData = useMemo(() => {
    const lat = mapCenter?.lat ?? 22.4608;
    const zoom = mapZoom ?? 15;

    // Ground resolution in meters per pixel in Web Mercator projection
    const resolutionMetersPerPixel =
      (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);

    // Representative Fraction (RF) scale ratio at standard 96 DPI screen
    // (1 inch = 0.0254m, 1 pixel = 0.000264583m)
    const rawRf = Math.round(resolutionMetersPerPixel / 0.000264583);
    
    // Nice rounded RF scale for clean cartographic display
    let roundedRf = rawRf;
    if (rawRf >= 1000000) {
      roundedRf = Math.round(rawRf / 100000) * 100000;
    } else if (rawRf >= 100000) {
      roundedRf = Math.round(rawRf / 10000) * 10000;
    } else if (rawRf >= 10000) {
      roundedRf = Math.round(rawRf / 1000) * 1000;
    } else if (rawRf >= 1000) {
      roundedRf = Math.round(rawRf / 100) * 100;
    } else if (rawRf >= 100) {
      roundedRf = Math.round(rawRf / 10) * 10;
    }

    // Determine target bar pixel width (ideal between 90px and 150px)
    const targetPixelWidth = 110;
    const targetDistanceMeters = targetPixelWidth * resolutionMetersPerPixel;

    // Find the closest nice metric round number
    let metricDistance = NICE_METRIC_STEPS[0];
    for (const step of NICE_METRIC_STEPS) {
      if (step <= targetDistanceMeters) {
        metricDistance = step;
      } else {
        break;
      }
    }

    // Actual bar width in pixels for this metric distance
    const barWidthPx = Math.max(60, Math.round(metricDistance / resolutionMetersPerPixel));

    // Metric labels
    const metricLabelTotal =
      metricDistance >= 1000
        ? `${metricDistance / 1000} km`
        : `${metricDistance} m`;
    const metricHalfDistance = metricDistance / 2;
    const metricLabelHalf =
      metricHalfDistance >= 1000
        ? `${metricHalfDistance / 1000} km`
        : `${metricHalfDistance} m`;

    // Corresponding Imperial values
    const totalFeet = metricDistance * 3.28084;
    let imperialLabelTotal = '';
    let imperialLabelHalf = '';

    if (totalFeet >= 5280) {
      const miles = totalFeet / 5280;
      imperialLabelTotal = `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
      const halfMiles = miles / 2;
      imperialLabelHalf = `${halfMiles >= 10 ? Math.round(halfMiles) : halfMiles.toFixed(1)} mi`;
    } else {
      imperialLabelTotal = `${Math.round(totalFeet)} ft`;
      imperialLabelHalf = `${Math.round(totalFeet / 2)} ft`;
    }

    return {
      rfString: `1:${roundedRf.toLocaleString()}`,
      zoomString: zoom.toFixed(2),
      barWidthPx,
      metricLabelTotal,
      metricLabelHalf,
      imperialLabelTotal,
      imperialLabelHalf
    };
  }, [mapZoom, mapCenter]);

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="map-hud-control"
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        padding: '5px 8px',
        zIndex: 15,
        cursor: 'pointer',
        userSelect: 'none',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        lineHeight: 1.2,
        transition: 'var(--transition-fast)'
      }}
      title="Click to toggle detailed / compact cartographic scale"
    >
      {/* Top Header: Representative Fraction & Zoom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 3,
          color: 'var(--text-muted)'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>SCALE </span>
          <strong style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            {scaleData.rfString}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Z </span>
          <strong style={{ color: 'var(--text-primary)' }}>{scaleData.zoomString}</strong>
        </div>
      </div>

      {/* Metric Axis Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: scaleData.barWidthPx,
          fontSize: 8.5,
          color: 'var(--text-secondary)',
          marginBottom: 1
        }}
      >
        <span>0</span>
        <span style={{ textAlign: 'center' }}>{scaleData.metricLabelHalf}</span>
        <span style={{ textAlign: 'right' }}>{scaleData.metricLabelTotal}</span>
      </div>

      {/* Alternating Graphic Scale Bar */}
      <div
        style={{
          width: scaleData.barWidthPx,
          height: 4,
          display: 'flex',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          position: 'relative'
        }}
      >
        {/* Left Segment (Primary Accent) */}
        <div
          style={{
            flex: 1,
            background: 'var(--accent-cyan)',
            borderRight: '1px solid rgba(0, 0, 0, 0.5)'
          }}
        />
        {/* Right Segment (Slate / High Contrast) */}
        <div
          style={{
            flex: 1,
            background: '#ffffff'
          }}
        />
      </div>

      {/* Imperial Axis Labels (Dual Unit) */}
      {isExpanded && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: scaleData.barWidthPx,
            fontSize: 8,
            color: 'var(--text-muted)',
            marginTop: 1
          }}
        >
          <span>0</span>
          <span style={{ textAlign: 'center' }}>{scaleData.imperialLabelHalf}</span>
          <span style={{ textAlign: 'right' }}>{scaleData.imperialLabelTotal}</span>
        </div>
      )}
    </div>
  );
};
