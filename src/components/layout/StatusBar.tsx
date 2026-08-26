import { useState, type FC } from 'react';
import { Globe, MapPin, Check, Copy, Layers, Activity } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCoordinates, decimalToDMS } from '../../utils/coordinates';

export const StatusBar: FC = () => {
  const {
    datasets,
    activeDatasetId,
    cursorCoordinates,
    activeTool,
    measurementState
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [dmsMode, setDmsMode] = useState(false);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];
  const totalFeatures = datasets.reduce(
    (acc, d) => acc + (d.visible ? d.featureCollection.features.length : 0),
    0
  );

  const handleCopy = () => {
    if (!cursorCoordinates) return;
    const text = `${cursorCoordinates.lat.toFixed(6)}, ${cursorCoordinates.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <footer
      style={{
        height: 'var(--status-bar-height)',
        background: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: 12,
        color: 'var(--text-secondary)',
        zIndex: 20
      }}
    >
      {/* Left side: CRS & Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>CRS:</span>
          <strong style={{ color: 'var(--text-primary)' }}>
            {activeDataset?.detectedCrs || 'EPSG:4326 (WGS 84)'}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} style={{ color: 'var(--accent-emerald)' }} />
          <span>Active Features:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{totalFeatures}</strong>
        </div>

        {activeTool !== 'select' && (
          <div
            className="badge badge-info"
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Activity size={12} />
            <span>Mode: {activeTool.replace('-', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Right side: Cursor Coordinates with One-Click Copy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {cursorCoordinates ? (
          <div
            onClick={handleCopy}
            title="Click to copy coordinates"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <MapPin size={13} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              {dmsMode
                ? `${decimalToDMS(cursorCoordinates.lat, true)} | ${decimalToDMS(cursorCoordinates.lng, false)}`
                : formatCoordinates(cursorCoordinates.lng, cursorCoordinates.lat)}
            </span>
            {copied ? (
              <Check size={13} style={{ color: 'var(--accent-emerald)' }} />
            ) : (
              <Copy size={13} style={{ opacity: 0.6 }} />
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Hover over map for coordinates
          </span>
        )}

        <button
          onClick={() => setDmsMode(!dmsMode)}
          style={{
            fontSize: 11,
            color: dmsMode ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            textDecoration: 'underline'
          }}
          title="Toggle Decimal / DMS coordinate display"
        >
          {dmsMode ? 'DEC' : 'DMS'}
        </button>
      </div>
    </footer>
  );
};
