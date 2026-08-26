import { type FC } from 'react';
import { Ruler, Pentagon, Trash2, Check } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const MeasureToolbar: FC = () => {
  const {
    activeTool,
    measurementState,
    startMeasurement,
    finishMeasurement,
    clearMeasurement
  } = useAppStore();

  const isMeasuringDistance = activeTool === 'measure-distance';
  const isMeasuringArea = activeTool === 'measure-area';
  const isMeasuring = isMeasuringDistance || isMeasuringArea;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        borderRadius: 'var(--radius-md)',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
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
        style={{ padding: '6px 10px', fontSize: 12 }}
        title="Measure Distance (Click points on map)"
      >
        <Ruler size={15} />
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
        style={{ padding: '6px 10px', fontSize: 12 }}
        title="Measure Area (Click vertices of polygon)"
      >
        <Pentagon size={15} />
        <span>Area</span>
      </button>

      {/* Clear Measurement */}
      {isMeasuring && measurementState.points.length > 0 && (
        <>
          <div style={{ width: 1, height: 18, background: 'var(--border-color)', margin: '0 2px' }} />
          <button
            onClick={() => clearMeasurement()}
            className="btn-ghost"
            style={{ padding: '6px', color: 'var(--accent-rose)' }}
            title="Clear measurement"
          >
            <Trash2 size={15} />
          </button>
        </>
      )}
    </div>
  );
};
