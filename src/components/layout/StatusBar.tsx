import { useState, type FC } from 'react';
import { Globe, MapPin, Check, Copy, Layers, Activity } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCoordinates, decimalToDMS } from '../../utils/coordinates';

export const StatusBar: FC = () => {
  const {
    datasets,
    activeDatasetId,
    cursorCoordinates,
    activeTool
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
        padding: '0 14px',
        fontSize: 11,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        zIndex: 20
      }}
    >
      {/* Left side: CRS & Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Globe size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ color: 'var(--text-muted)' }}>CRS:</span>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {activeDataset?.detectedCrs || 'EPSG:4326 (WGS 84)'}
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Layers size={13} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ color: 'var(--text-muted)' }}>ACTIVE FEATURES:</span>
          <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{totalFeatures}</strong>
        </div>

        {activeTool !== 'select' && (
          <div
            className="badge badge-info"
            style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}
          >
            <Activity size={10} />
            <span>TOOL: {activeTool.replace('-', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Right side: Cursor Coordinates with One-Click Copy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {cursorCoordinates ? (
          <div
            onClick={handleCopy}
            title="Click to copy geographic coordinates"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              padding: '1px 6px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)'
            }}
          >
            <MapPin size={11} style={{ color: 'var(--accent-cyan)' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              {dmsMode
                ? `${decimalToDMS(cursorCoordinates.lat, true)} ${decimalToDMS(cursorCoordinates.lng, false)}`
                : formatCoordinates(cursorCoordinates.lng, cursorCoordinates.lat)}
            </span>
            {copied ? (
              <Check size={11} style={{ color: 'var(--accent-emerald)' }} />
            ) : (
              <Copy size={11} style={{ opacity: 0.5 }} />
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>
            HOVER OVER MAP TO INSPECT COORDINATES
          </span>
        )}

        <button
          onClick={() => setDmsMode(!dmsMode)}
          style={{
            fontSize: 10,
            color: dmsMode ? 'var(--accent-cyan)' : 'var(--text-muted)',
            fontWeight: 600,
            padding: '1px 4px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-surface)'
          }}
          title="Toggle Decimal Degrees / Degrees Minutes Seconds"
        >
          {dmsMode ? 'DEC' : 'DMS'}
        </button>
      </div>
    </footer>
  );
};
