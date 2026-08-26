import { type FC } from 'react';
import { X, HelpCircle, FileText, Compass, Shield, Sparkles } from 'lucide-react';
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
        padding: 20
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '85vh',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>GeoVista Help & Documentation</h2>
          </div>
          <button onClick={() => setHelpOpen(false)} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: 20,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text-secondary)'
          }}
        >
          {/* Section 1 */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Supported File Formats
            </h3>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>GeoJSON (.geojson, .json):</strong> Standard FeatureCollections or Features with Point, LineString, or Polygon geometries.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Shapefile Archive (.zip):</strong> A ZIP file containing <code>.shp</code> (geometry), <code>.dbf</code> (attributes), and <code>.prj</code> (projection).
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Coordinate CSV (.csv):</strong> Spreadsheets with Latitude & Longitude columns.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Key GIS Rules & Coordinate Order
            </h3>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>GeoJSON coordinate pairs are always ordered as <code>[Longitude, Latitude]</code> (X, Y).</li>
              <li>Valid Longitudes range from <code>-180.0</code> to <code>+180.0</code>; Latitudes range from <code>-90.0</code> to <code>+90.0</code>.</li>
              <li>Shapefiles with planar coordinates (e.g. UTM) are automatically reprojected to WGS 84.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Group 6 Botanical Garden Reference Dataset
            </h3>
            <p>
              The reference GPS survey dataset includes 14 survey points collected at the University of Chittagong Botanical Garden. Click the <strong>⚡ Load Demo Data</strong> button in the header to immediately explore the reference dataset, test category styling, measure distances, and verify attribute tables.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Privacy Guarantee
            </h3>
            <p>
              All spatial calculations, parsing, and rendering take place 100% inside your browser client using Web Workers and WebGL. Your data never leaves your device.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button onClick={() => setHelpOpen(false)} className="btn-primary">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
