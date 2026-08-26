import { type FC } from 'react';
import { BarChart3, Database, MapPin, Globe, Check, Tag } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const DatasetSummaryPanel: FC = () => {
  const { datasets, activeDatasetId } = useAppStore();
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  if (!activeDataset) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <BarChart3 size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p style={{ fontSize: 13 }}>No dataset loaded.</p>
      </div>
    );
  }

  const [minX, minY, maxX, maxY] = activeDataset.bbox;
  const geomCounts = activeDataset.validationReport.geometryTypeCounts || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '14px 16px' }}>
      {/* Basic Meta Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Dataset Metadata</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 12 }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>File Name: </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {activeDataset.originalFileName}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Format: </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'uppercase' }}>
              {activeDataset.sourceFormat}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Features: </span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {activeDataset.featureCollection.features.length}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Categories: </span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
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
          borderRadius: 'var(--radius-md)',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Geometry Breakdown</span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(geomCounts).map(([gType, count]) => (
            <div
              key={gType}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{gType}:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Bounding Box Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={16} style={{ color: 'var(--accent-amber)' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Spatial Extent (BBOX)</span>
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
          <div>Min: [{minX.toFixed(5)}, {minY.toFixed(5)}]</div>
          <div>Max: [{maxX.toFixed(5)}, {maxY.toFixed(5)}]</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 2 }}>
            CRS: {activeDataset.detectedCrs || 'EPSG:4326 (WGS 84)'}
          </div>
        </div>
      </div>

      {/* Attribute Fields Schema */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={16} style={{ color: 'var(--accent-purple)' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            Attribute Schema ({activeDataset.attributeSchema.length} fields)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
          {activeDataset.attributeSchema.map((field) => (
            <div
              key={field.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                padding: '4px 6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)'
              }}
            >
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{field.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {field.type} ({field.uniqueCount} unique)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
