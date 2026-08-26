import { type FC } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Trash2,
  Sliders,
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
      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Layers size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p style={{ fontSize: 13 }}>No layers loaded yet.</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Drop a file above or click "Load Demo Data".</p>
      </div>
    );
  }

  const handleZoomToLayer = (bbox: [number, number, number, number]) => {
    const [minX, minY, maxX, maxY] = bbox;
    triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2, 16);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
      {/* Global Label Visibility Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          fontSize: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Feature Labels</span>
        </div>
        <button
          onClick={() => setLabelsVisible(!labelsVisible)}
          className={labelsVisible ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '3px 10px', fontSize: 11 }}
        >
          {labelsVisible ? 'Enabled' : 'Disabled'}
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
              borderRadius: 'var(--radius-md)',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: isActive ? 'var(--shadow-md)' : 'none',
              transition: 'var(--transition-fast)'
            }}
          >
            {/* Title & Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                {dataset.sourceFormat === 'csv' ? (
                  <FileSpreadsheet size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                ) : dataset.sourceFormat === 'shapefile' ? (
                  <FileCode size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                ) : (
                  <MapPin size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                )}
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Visibility Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(dataset.id);
                  }}
                  className="btn-icon"
                  style={{ width: 28, height: 28 }}
                  title={dataset.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {dataset.visible ? <Eye size={14} /> : <EyeOff size={14} style={{ color: 'var(--accent-rose)' }} />}
                </button>

                {/* Zoom to Extent */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomToLayer(dataset.bbox);
                  }}
                  className="btn-icon"
                  style={{ width: 28, height: 28 }}
                  title="Zoom to Extent"
                >
                  <Maximize2 size={14} />
                </button>

                {/* Delete Layer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDataset(dataset.id);
                  }}
                  className="btn-icon"
                  style={{ width: 28, height: 28, color: 'var(--accent-rose)' }}
                  title="Remove Layer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Sub-info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--text-muted)'
              }}
            >
              <span>{featureCount} feature{featureCount !== 1 ? 's' : ''} ({dataset.sourceFormat.toUpperCase()})</span>
              <span>{dataset.categories.length} categories</span>
            </div>

            {/* Opacity Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 45 }}>
                Opacity:
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={dataset.opacity}
                onChange={(e) => setLayerOpacity(dataset.id, parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1, accentColor: 'var(--accent-primary)', height: 4 }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>
                {Math.round(dataset.opacity * 100)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
