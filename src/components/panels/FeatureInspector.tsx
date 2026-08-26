import { useState, type FC } from 'react';
import {
  X,
  MapPin,
  Maximize2,
  Copy,
  Check,
  Tag,
  Layers,
  Compass,
  FileText
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCoordinates, decimalToDMS } from '../../utils/coordinates';
import { formatValueForDisplay } from '../../utils/sanitization';

export const FeatureInspector: FC = () => {
  const {
    selectedFeature,
    datasets,
    isInspectorOpen,
    setInspectorOpen,
    clearSelection,
    triggerFlyTo
  } = useAppStore();

  const [copied, setCopied] = useState(false);

  if (!isInspectorOpen || !selectedFeature) return null;

  const dataset = datasets.find((d) => d.id === selectedFeature.datasetId);
  const feature = selectedFeature.feature;
  const props = feature.properties;

  let coordinates: [number, number] | null = null;
  if (feature.geometry.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
    coordinates = feature.geometry.coordinates as [number, number];
  }

  const categoryColor =
    dataset?.style.customColorMap?.[props.__category || ''] || '#3b82f6';

  const handleCopy = () => {
    if (!coordinates) return;
    const text = `${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleZoomTo = () => {
    if (coordinates) {
      triggerFlyTo(coordinates[0], coordinates[1], 17.5);
    }
  };

  // Filter out internal __ properties for display table
  const userAttributes = Object.entries(props).filter(([k]) => !k.startsWith('__'));

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        bottom: 16,
        width: 'var(--inspector-width)',
        borderRadius: 'var(--radius-lg)',
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeIn var(--transition-normal)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 'var(--radius-full)',
              background: categoryColor,
              boxShadow: `0 0 8px ${categoryColor}88`
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Feature Inspector
          </span>
        </div>

        <button
          onClick={() => {
            setInspectorOpen(false);
            clearSelection();
          }}
          className="btn-icon"
          style={{ width: 28, height: 28 }}
          title="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          padding: 16,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          flex: 1
        }}
      >
        {/* Title Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 12
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {props.__displayName}
          </h2>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: `${categoryColor}22`,
                color: categoryColor,
                border: `1px solid ${categoryColor}55`
              }}
            >
              {props.__category || 'Uncategorized'}
            </span>
            <span className="badge badge-info">{feature.geometry.type}</span>
          </div>
        </div>

        {/* Spatial Coordinates & Actions */}
        {coordinates && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>Geographic Position</span>
              </div>

              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={handleCopy}
                  className="btn-ghost"
                  style={{ padding: '3px 6px', fontSize: 11 }}
                  title="Copy Lat, Lng coordinates"
                >
                  {copied ? (
                    <>
                      <Check size={12} style={{ color: 'var(--accent-emerald)' }} />
                      <span style={{ color: 'var(--accent-emerald)' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleZoomTo}
                  className="btn-ghost"
                  style={{ padding: '3px 6px', fontSize: 11 }}
                  title="Zoom to Feature"
                >
                  <Maximize2 size={12} />
                  <span>Zoom</span>
                </button>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-secondary)',
                background: 'var(--bg-app)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div>Lat: {coordinates[1].toFixed(6)}° ({decimalToDMS(coordinates[1], true)})</div>
              <div>Lng: {coordinates[0].toFixed(6)}° ({decimalToDMS(coordinates[0], false)})</div>
            </div>
          </div>
        )}

        {/* User Attributes Table */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
            <FileText size={14} style={{ color: 'var(--accent-amber)' }} />
            <span>Attributes ({userAttributes.length})</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden'
            }}
          >
            {userAttributes.map(([key, val], idx) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  fontSize: 12,
                  padding: '6px 10px',
                  background: idx % 2 === 0 ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderBottom:
                    idx !== userAttributes.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    width: '40%',
                    flexShrink: 0,
                    paddingRight: 6
                  }}
                >
                  {key}
                </span>
                <span
                  style={{
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word',
                    flex: 1
                  }}
                >
                  {formatValueForDisplay(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
