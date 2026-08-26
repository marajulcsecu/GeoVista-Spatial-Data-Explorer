import { type FC } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Trash2,
  Tag,
  MapPin,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const LayerPanel: FC = () => {
  const {
    datasets,
    activeDatasetId,
    labelsVisible,
    toggleLayerVisibility,
    setLayerOpacity,
    removeDataset,
    setActiveDataset,
    setLabelsVisible,
    triggerFlyTo
  } = useAppStore();

  if (datasets.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Layers size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>No layers in project</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Ingest a spatial dataset above or click "Load Sample Survey".</p>
      </div>
    );
  }

  const handleZoomToLayer = (bbox: [number, number, number, number]) => {
    const [minX, minY, maxX, maxY] = bbox;
    triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2, 16);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px' }}>
      {/* Global Label Visibility Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-color)',
          fontSize: 11
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontWeight: 500 }}>Vector Feature Labels</span>
        </div>
        <button
          onClick={() => setLabelsVisible(!labelsVisible)}
          className={labelsVisible ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '2px 8px', fontSize: 10, height: 22 }}
        >
          {labelsVisible ? 'VISIBLE' : 'HIDDEN'}
        </button>
      </div>

      {/* Layer Cards */}
      {datasets.map((dataset) => {
        const isActive = dataset.id === activeDatasetId;
        const featureCount = dataset.featureCollection.features.length;

        return (
          <div
            key={dataset.id}
            onClick={() => setActiveDataset(dataset.id)}
            style={{
              background: isActive ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              border: `1px solid ${isActive ? 'var(--border-focus)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition-fast)'
            }}
          >
            {/* Title & Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                {dataset.sourceFormat === 'csv' ? (
                  <FileSpreadsheet size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                ) : dataset.sourceFormat === 'shapefile' ? (
                  <FileCode size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
                ) : (
                  <MapPin size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={dataset.name}
                >
                  {dataset.name}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(dataset.id);
                  }}
                  className="btn-icon"
                  style={{ width: 24, height: 24 }}
                  title={dataset.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {dataset.visible ? <Eye size={13} /> : <EyeOff size={13} style={{ color: 'var(--accent-rose)' }} />}
                </button>

                {/* Zoom to Extent */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomToLayer(dataset.bbox);
                  }}
                  className="btn-icon"
                  style={{ width: 24, height: 24 }}
                  title="Zoom to Extent"
                >
                  <Maximize2 size={13} />
                </button>

                {/* Delete Layer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDataset(dataset.id);
                  }}
                  className="btn-icon"
                  style={{ width: 24, height: 24, color: 'var(--accent-rose)' }}
                  title="Remove Layer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Sub-info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 10,
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>{featureCount} FEATURES ({dataset.sourceFormat.toUpperCase()})</span>
              <span>{dataset.categories.length} CATEGORIES</span>
            </div>

            {/* Opacity Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', minWidth: 42, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                OPACITY:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={dataset.opacity}
                onChange={(e) => setLayerOpacity(dataset.id, parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1, accentColor: '#38bdf8', height: 4 }}
              />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {Math.round(dataset.opacity * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
