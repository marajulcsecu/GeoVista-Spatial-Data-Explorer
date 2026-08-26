import { useState, type FC } from 'react';
import {
  X,
  MapPin,
  Maximize2,
  Copy,
  Check,
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
    dataset?.style.customColorMap?.[props.__category || ''] || '#38bdf8';

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
        top: 14,
        right: 14,
        bottom: 14,
        width: 'var(--inspector-width)',
        borderRadius: 'var(--radius-sm)',
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
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--radius-xs)',
              background: categoryColor,
              boxShadow: `0 0 6px ${categoryColor}aa`
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
            FEATURE INSPECTOR
          </span>
        </div>

        <button
          onClick={() => {
            setInspectorOpen(false);
            clearSelection();
          }}
          className="btn-icon"
          style={{ width: 22, height: 22 }}
          title="Close Inspector"
        >
          <X size={13} />
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          padding: 12,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1
        }}
      >
        {/* Title Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xs)',
            padding: 10
          }}
        >
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {props.__displayName}
          </h2>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: `${categoryColor}18`,
                color: categoryColor,
                border: `1px solid ${categoryColor}44`,
                fontSize: 9
              }}
            >
              {props.__category || 'UNCATEGORIZED'}
            </span>
            <span className="badge badge-info" style={{ fontSize: 9 }}>{feature.geometry.type}</span>
          </div>
        </div>

        {/* Spatial Coordinates & Actions */}
        {coordinates && (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xs)',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600 }}>
                <MapPin size={12} style={{ color: 'var(--accent-cyan)' }} />
                <span>Geographic Position</span>
              </div>

              <div style={{ display: 'flex', gap: 3 }}>
                <button
                  onClick={handleCopy}
                  className="btn-ghost"
                  style={{ padding: '2px 5px', fontSize: 10, height: 20 }}
                  title="Copy Lat, Lng coordinates"
                >
                  {copied ? (
                    <>
                      <Check size={11} style={{ color: 'var(--accent-emerald)' }} />
                      <span style={{ color: 'var(--accent-emerald)' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleZoomTo}
                  className="btn-ghost"
                  style={{ padding: '2px 5px', fontSize: 10, height: 20 }}
                  title="Zoom to Feature"
                >
                  <Maximize2 size={11} />
                  <span>Zoom</span>
                </button>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-secondary)',
                background: 'var(--bg-app)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <div>LAT: {coordinates[1].toFixed(6)}° ({decimalToDMS(coordinates[1], true)})</div>
              <div>LNG: {coordinates[0].toFixed(6)}° ({decimalToDMS(coordinates[0], false)})</div>
            </div>
          </div>
        )}

        {/* User Attributes Table */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xs)',
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600 }}>
            <FileText size={12} style={{ color: 'var(--accent-amber)' }} />
            <span>Attributes ({userAttributes.length})</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden'
            }}
          >
            {userAttributes.map(([key, val], idx) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  fontSize: 11,
                  padding: '5px 8px',
                  background: idx % 2 === 0 ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderBottom:
                    idx !== userAttributes.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                }}
              >
                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    width: '42%',
                    flexShrink: 0,
                    paddingRight: 4,
                    fontFamily: 'var(--font-mono)'
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
