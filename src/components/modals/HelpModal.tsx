import { type FC } from 'react';
import { X, HelpCircle, FileText, Compass, Shield, Check } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const HelpModal: FC = () => {
  const { isHelpOpen, setHelpOpen } = useAppStore();

  if (!isHelpOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '85vh',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={16} style={{ color: 'var(--accent-cyan)' }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
              GEOVISTA GIS SPECIFICATION & METHODOLOGY
            </h2>
          </div>
          <button onClick={() => setHelpOpen(false)} className="btn-icon" style={{ width: 24, height: 24 }}>
            <X size={14} />
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
            fontSize: 12,
            lineHeight: 1.55,
            color: 'var(--text-secondary)'
          }}
        >
          {/* Section 1 */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              1. Spatial Ingestion Architecture
            </h3>
            <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>GeoJSON (.json, .geojson):</strong> WGS 84 RFC 7946 standard representations with dynamic property normalization.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>ESRI Shapefile Archive (.zip):</strong> Binary <code>.shp</code> vector geometry, <code>.dbf</code> attribute records, and <code>.prj</code> projection definition parsing.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Coordinate CSV (.csv):</strong> Delimited tables with automatic or manual Latitude/Longitude coordinate mapping.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              2. Coordinate Reference Systems (CRS) & Projection
            </h3>
            <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>All map renderings are normalized to <strong>EPSG:4326 (WGS 84)</strong> geographic coordinates.</li>
              <li>Coordinate pairs in GeoJSON follow standard <code>[Longitude, Latitude]</code> (X, Y) sequence.</li>
              <li>Planar projection datasets (e.g. UTM Zone 46N / BTM) are reprojected in-memory.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              3. Botanical Garden Reference GPS Survey
            </h3>
            <p>
              Includes 14 ground-truth GPS survey points mapped across the University of Chittagong Botanical Garden. Features include ponds, picnic points, viewpoints, and road intersections with multi-attribute classification.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              4. Client-Side Security & Persistence
            </h3>
            <p>
              Spatial layers are processed 100% in-browser using Web Workers and stored in the browser's persistent IndexedDB instance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button onClick={() => setHelpOpen(false)} className="btn-primary" style={{ padding: '4px 12px', fontSize: 11 }}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
