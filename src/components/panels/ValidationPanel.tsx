import { type FC } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const ValidationPanel: FC = () => {
  const { datasets, activeDatasetId } = useAppStore();
  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  if (!activeDataset) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ShieldCheck size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>No dataset loaded</p>
      </div>
    );
  }

  const { validationReport } = activeDataset;
  const { errors, warnings, info, validFeaturesCount, invalidFeaturesCount } = validationReport;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px' }}>
      {/* Overview Card */}
      <div
        style={{
          background: errors.length === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
          border: `1px solid ${errors.length === 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
          borderRadius: 'var(--radius-xs)',
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        {errors.length === 0 ? (
          <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
        ) : (
          <XCircle size={20} style={{ color: '#f43f5e', flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
            {errors.length === 0 ? 'Topology & Coordinates Valid' : 'Validation Issues Detected'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>
            {validFeaturesCount} VALID FEATURES RENDERED
            {invalidFeaturesCount > 0 && ` • ${invalidFeaturesCount} SKIPPED`}
          </div>
        </div>
      </div>

      {/* Metric Breakdown Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xs)',
            padding: '6px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ERRORS</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: errors.length > 0 ? '#f43f5e' : 'var(--text-primary)',
              marginTop: 1,
              fontFamily: 'var(--font-mono)'
            }}
          >
            {errors.length}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xs)',
            padding: '6px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WARNINGS</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: warnings.length > 0 ? '#f59e0b' : 'var(--text-primary)',
              marginTop: 1,
              fontFamily: 'var(--font-mono)'
            }}
          >
            {warnings.length}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xs)',
            padding: '6px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>NOTES</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#38bdf8', marginTop: 1, fontFamily: 'var(--font-mono)' }}>
            {info.length}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
        {/* Errors */}
        {errors.map((err) => (
          <div
            key={err.id}
            style={{
              padding: '8px 10px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 11
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fb7185', fontWeight: 600 }}>
              <XCircle size={13} />
              <span>{err.title}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{err.message}</div>
          </div>
        ))}

        {/* Warnings */}
        {warnings.map((warn) => (
          <div
            key={warn.id}
            style={{
              padding: '8px 10px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 11
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fbbf24', fontWeight: 600 }}>
              <AlertTriangle size={13} />
              <span>{warn.title}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{warn.message}</div>
          </div>
        ))}

        {/* Info */}
        {info.map((inf) => (
          <div
            key={inf.id}
            style={{
              padding: '8px 10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 11
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8', fontWeight: 600 }}>
              <Info size={13} />
              <span>{inf.title}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{inf.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
