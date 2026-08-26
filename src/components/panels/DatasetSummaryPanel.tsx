import { type FC } from 'react';
import { BarChart3, Database, MapPin, Globe, Tag } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const DatasetSummaryPanel: FC = () => {
  const { datasets, activeDatasetId } = useAppStore();
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  if (!activeDataset) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <BarChart3 size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>No dataset loaded</p>
      </div>
    );
  }

  const [minX, minY, maxX, maxY] = activeDataset.bbox;
  const geomCounts = activeDataset.validationReport.geometryTypeCounts || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px' }}>
      {/* Basic Meta Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
            DATASET METADATA
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', fontSize: 11 }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>File: </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {activeDataset.originalFileName}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Format: </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              {activeDataset.sourceFormat}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Features: </span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {activeDataset.featureCollection.features.length}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Classes: </span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {activeDataset.categories.length}
            </span>
          </div>
        </div>
      </div>

      {/* Geometry Breakdown */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={13} style={{ color: 'var(--accent-emerald)' }} />
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
            GEOMETRY SUMMARY
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(geomCounts).map(([gType, count]) => (
            <div
              key={gType}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                padding: '3px 8px',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{gType}:</span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Bounding Box Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={13} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
            BOUNDING EXTENT (BBOX)
          </span>
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
          <div>MIN: [{minX.toFixed(5)}, {minY.toFixed(5)}]</div>
          <div>MAX: [{maxX.toFixed(5)}, {maxY.toFixed(5)}]</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 9, marginTop: 1 }}>
            NATIVE CRS: {activeDataset.detectedCrs || 'EPSG:4326 (WGS 84)'}
          </div>
        </div>
      </div>

      {/* Attribute Fields Schema */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={13} style={{ color: 'var(--accent-indigo)' }} />
          <span style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
            SCHEMA ({activeDataset.attributeSchema.length} FIELDS)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 150, overflowY: 'auto' }}>
          {activeDataset.attributeSchema.map((field) => (
            <div
              key={field.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 10,
                padding: '3px 6px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface-elevated)'
              }}
            >
              <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{field.name}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {field.type.toUpperCase()} ({field.uniqueCount} UNIQUE)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
