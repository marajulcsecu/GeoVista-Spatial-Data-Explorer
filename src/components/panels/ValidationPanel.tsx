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
      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <ShieldCheck size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p style={{ fontSize: 13 }}>No dataset loaded.</p>
      </div>
    );
  }

  const { validationReport } = activeDataset;
  const { errors, warnings, info, validFeaturesCount, invalidFeaturesCount } = validationReport;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
      {/* Overview Card */}
      <div
        style={{
          background: errors.length === 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
          border: `1px solid ${errors.length === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        {errors.length === 0 ? (
          <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0 }} />
        ) : (
          <XCircle size={24} style={{ color: '#f43f5e', flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {errors.length === 0 ? 'Dataset Valid & Renderable' : 'Validation Issues Detected'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {validFeaturesCount} valid features rendered
            {invalidFeaturesCount > 0 && `, ${invalidFeaturesCount} skipped`}
          </div>
        </div>
      </div>

      {/* Metric Breakdown Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Errors</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: errors.length > 0 ? '#f43f5e' : 'var(--text-primary)',
              marginTop: 2
            }}
          >
            {errors.length}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Warnings</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: warnings.length > 0 ? '#f59e0b' : 'var(--text-primary)',
              marginTop: 2
            }}
          >
            {warnings.length}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Info Notes</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginTop: 2 }}>
            {info.length}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {/* Errors */}
        {errors.map((err) => (
          <div
            key={err.id}
            style={{
              padding: '10px 12px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fb7185', fontWeight: 600 }}>
              <XCircle size={14} />
              <span>{err.title}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{err.message}</div>
          </div>
        ))}

        {/* Warnings */}
        {warnings.map((warn) => (
          <div
            key={warn.id}
            style={{
              padding: '10px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 600 }}>
              <AlertTriangle size={14} />
              <span>{warn.title}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{warn.message}</div>
          </div>
        ))}

        {/* Info */}
        {info.map((inf) => (
          <div
            key={inf.id}
            style={{
              padding: '10px 12px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontWeight: 600 }}>
              <Info size={14} />
              <span>{inf.title}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{inf.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
