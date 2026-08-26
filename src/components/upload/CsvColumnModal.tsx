import { useState, useEffect, type FC } from 'react';
import { X, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { inferCsvMapping, importCSV } from '../../importers/importCSV';
import type { CsvColumnMapping } from '../../types/spatial';

export const CsvColumnModal: FC = () => {
  const {
    isColumnModalOpen,
    pendingCsvInfo,
    setColumnModalOpen,
    setPendingCsvInfo,
    addDataset,
    triggerFlyTo
  } = useAppStore();

  const [mapping, setMapping] = useState<CsvColumnMapping>({
    longitudeField: '',
    latitudeField: '',
    labelField: '',
    categoryField: '',
    descriptionField: ''
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingCsvInfo?.headers) {
      const inferred = inferCsvMapping(pendingCsvInfo.headers);
      setMapping({
        longitudeField: inferred.longitudeField || '',
        latitudeField: inferred.latitudeField || '',
        labelField: inferred.labelField || '',
        categoryField: inferred.categoryField || '',
        descriptionField: inferred.descriptionField || ''
      });
      setError(null);
    }
  }, [pendingCsvInfo]);

  if (!isColumnModalOpen || !pendingCsvInfo) return null;

  const handleConfirm = async () => {
    if (!mapping.longitudeField || !mapping.latitudeField) {
      setError('Please select both Longitude (X) and Latitude (Y) columns.');
      return;
    }

    try {
      const dataset = await importCSV(pendingCsvInfo.file, mapping);
      addDataset(dataset);
      const [minX, minY, maxX, maxY] = dataset.bbox;
      triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2);
      setColumnModalOpen(false);
      setPendingCsvInfo(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to import CSV with selected column mapping.');
    }
  };

  const handleCancel = () => {
    setColumnModalOpen(false);
    setPendingCsvInfo(null);
  };

  const { headers, rows } = pendingCsvInfo;
  const sampleRows = rows.slice(0, 4);

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
          maxWidth: 680,
          maxHeight: '90vh',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Modal Header */}
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
            <FileSpreadsheet size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>Map CSV Columns</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {pendingCsvInfo.file.name} ({rows.length} rows detected)
              </p>
            </div>
          </div>
          <button onClick={handleCancel} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#fb7185',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Longitude (X) */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Longitude (X) Column <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <select
                value={mapping.longitudeField}
                onChange={(e) => setMapping({ ...mapping, longitudeField: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">-- Select Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Latitude (Y) */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Latitude (Y) Column <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <select
                value={mapping.latitudeField}
                onChange={(e) => setMapping({ ...mapping, latitudeField: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">-- Select Column --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Label / Feature Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Label / Name Column (Optional)
              </label>
              <select
                value={mapping.labelField || ''}
                onChange={(e) => setMapping({ ...mapping, labelField: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">-- None (Auto-generate #ID) --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Category / Group Column (Optional)
              </label>
              <select
                value={mapping.categoryField || ''}
                onChange={(e) => setMapping({ ...mapping, categoryField: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">-- None (Single Color) --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sample Data Preview Grid */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Sample Data Preview (First {sampleRows.length} Rows)
            </div>
            <div
              style={{
                overflowX: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-app)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                    {headers.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--border-color)',
                          color:
                            h === mapping.longitudeField || h === mapping.latitudeField
                              ? 'var(--accent-cyan)'
                              : 'var(--text-primary)',
                          fontWeight: 600
                        }}
                      >
                        {h}
                        {h === mapping.longitudeField && ' (Lng)'}
                        {h === mapping.latitudeField && ' (Lat)'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {headers.map((h) => (
                        <td
                          key={h}
                          style={{
                            padding: '6px 12px',
                            color: 'var(--text-secondary)',
                            fontFamily:
                              h === mapping.longitudeField || h === mapping.latitudeField
                                ? 'var(--font-mono)'
                                : 'inherit'
                          }}
                        >
                          {String(row[h] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10
          }}
        >
          <button onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary">
            <Check size={16} />
            <span>Apply Mapping & Render</span>
          </button>
        </div>
      </div>
    </div>
  );
};
