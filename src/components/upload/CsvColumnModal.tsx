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
      setError('Please map both Longitude (X) and Latitude (Y) columns.');
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
        padding: 16
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 660,
          maxHeight: '90vh',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Modal Header */}
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
            <FileSpreadsheet size={16} style={{ color: 'var(--accent-emerald)' }} />
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-mono)' }}>
                CSV SPATIAL ATTRIBUTE MAPPING
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {pendingCsvInfo.file.name} ({rows.length} records detected)
              </p>
            </div>
          </div>
          <button onClick={handleCancel} className="btn-icon" style={{ width: 24, height: 24 }}>
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 'var(--radius-xs)',
                color: '#fb7185',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Longitude (X) */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                LONGITUDE (X) COLUMN <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <select
                value={mapping.longitudeField}
                onChange={(e) => setMapping({ ...mapping, longitudeField: e.target.value })}
                style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
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
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                LATITUDE (Y) COLUMN <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <select
                value={mapping.latitudeField}
                onChange={(e) => setMapping({ ...mapping, latitudeField: e.target.value })}
                style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
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
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                LABEL / NAME FIELD (OPTIONAL)
              </label>
              <select
                value={mapping.labelField || ''}
                onChange={(e) => setMapping({ ...mapping, labelField: e.target.value })}
                style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              >
                <option value="">-- None (Auto ID) --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
                CATEGORY / CLASS FIELD (OPTIONAL)
              </label>
              <select
                value={mapping.categoryField || ''}
                onChange={(e) => setMapping({ ...mapping, categoryField: e.target.value })}
                style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              >
                <option value="">-- None (Single Symbol) --</option>
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
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>
              SAMPLE DATA PREVIEW ({sampleRows.length} ROWS)
            </div>
            <div
              style={{
                overflowX: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-app)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', textAlign: 'left' }}>
                    {headers.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '6px 10px',
                          borderBottom: '1px solid var(--border-color)',
                          color:
                            h === mapping.longitudeField || h === mapping.latitudeField
                              ? 'var(--accent-cyan)'
                              : 'var(--text-primary)',
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)'
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
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {headers.map((h) => (
                        <td
                          key={h}
                          style={{
                            padding: '5px 10px',
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
            padding: '10px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8
          }}
        >
          <button onClick={handleCancel} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary" style={{ padding: '4px 12px', fontSize: 11 }}>
            <Check size={13} />
            <span>Apply Mapping & Render</span>
          </button>
        </div>
      </div>
    </div>
  );
};
