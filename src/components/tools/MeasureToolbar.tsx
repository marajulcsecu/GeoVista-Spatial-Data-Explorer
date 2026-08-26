import { type FC } from 'react';
import { Ruler, Pentagon, Trash2 } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const MeasureToolbar: FC = () => {
  const {
    activeTool,
    measurementState,
    startMeasurement,
    clearMeasurement
  } = useAppStore();

  const isMeasuringDistance = activeTool === 'measure-distance';
  const isMeasuringArea = activeTool === 'measure-area';
  const isMeasuring = isMeasuringDistance || isMeasuringArea;

  return (
    <div
      className="map-hud-control"
      style={{
        position: 'absolute',
        top: 14,
        left: 14,
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        zIndex: 10
      }}
    >
      {/* Distance Measurement Button */}
      <button
        onClick={() => {
          if (isMeasuringDistance) {
            clearMeasurement();
          } else {
            startMeasurement('distance');
          }
        }}
        className={isMeasuringDistance ? 'btn-primary' : 'btn-ghost'}
        style={{ padding: '5px 8px', fontSize: 11, height: 26 }}
        title="Measure Geodesic Distance (Click points along path)"
      >
        <Ruler size={13} />
        <span>Distance</span>
      </button>

      {/* Area Measurement Button */}
      <button
        onClick={() => {
          if (isMeasuringArea) {
            clearMeasurement();
          } else {
            startMeasurement('area');
          }
        }}
        className={isMeasuringArea ? 'btn-primary' : 'btn-ghost'}
        style={{ padding: '5px 8px', fontSize: 11, height: 26 }}
        title="Measure Geodesic Polygon Area (Click polygon vertices)"
      >
        <Pentagon size={13} />
        <span>Area</span>
      </button>

      {/* Clear Measurement */}
      {isMeasuring && measurementState.points.length > 0 && (
        <>
          <div style={{ width: 1, height: 16, background: 'var(--border-color)', margin: '0 1px' }} />
          <button
            onClick={() => clearMeasurement()}
            className="btn-ghost"
            style={{ padding: '4px 6px', color: 'var(--accent-rose)', height: 26 }}
            title="Reset active measurement"
          >
            <Trash2 size={13} />
          </button>
        </>
      )}
    </div>
  );
};
