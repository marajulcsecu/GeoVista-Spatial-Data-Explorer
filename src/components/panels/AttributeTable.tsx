import { useState, useMemo, type FC } from 'react';
import {
  X,
  ArrowUpDown,
  Search,
  Download,
  Table as TableIcon
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatValueForDisplay } from '../../utils/sanitization';
import { exportDatasetToCSV } from '../../export/exportCSV';

export const AttributeTable: FC = () => {
  const {
    datasets,
    activeDatasetId,
    selectedFeature,
    isAttributeTableOpen,
    setAttributeTableOpen,
    selectFeature,
    triggerFlyTo
  } = useAppStore();

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];
  const features = activeDataset ? activeDataset.featureCollection.features : [];

  // Extract columns (skip internal __ fields)
  const columns = useMemo(() => {
    if (!activeDataset) return [];
    const colSet = new Set<string>();
    // Priority columns first
    if (activeDataset.primaryLabelField) colSet.add(activeDataset.primaryLabelField);
    if (activeDataset.primaryCategoryField) colSet.add(activeDataset.primaryCategoryField);

    features.forEach((f) => {
      Object.keys(f.properties).forEach((k) => {
        if (!k.startsWith('__')) colSet.add(k);
      });
    });
    return Array.from(colSet);
  }, [activeDataset, features]);

  // Filter & Sort Rows
  const processedRows = useMemo(() => {
    if (!activeDataset) return [];
    let rows = features;

    // Filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      rows = rows.filter((f) => {
        return Object.entries(f.properties).some(([k, v]) => {
          if (k.startsWith('__')) return false;
          return String(v).toLowerCase().includes(q);
        });
      });
    }

    // Sort
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        const valA = a.properties[sortField];
        const valB = b.properties[sortField];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [activeDataset, features, filterText, sortField, sortDirection]);

  if (!isAttributeTableOpen || !activeDataset) return null;

  const handleSort = (col: string) => {
    if (sortField === col) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
      }
    } else {
      setSortField(col);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (feat: any) => {
    selectFeature(activeDataset.id, feat.properties.__internalId);
    if (feat.geometry.type === 'Point' && Array.isArray(feat.geometry.coordinates)) {
      const [lng, lat] = feat.geometry.coordinates;
      triggerFlyTo(lng, lat, 17);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        bottom: 'var(--status-bar-height)',
        left: 0,
        right: 0,
        height: 'var(--table-height)',
        zIndex: 18,
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn var(--transition-normal)'
      }}
    >
      {/* Table Toolbar */}
      <div
        style={{
          padding: '6px 14px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TableIcon size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            ATTRIBUTE DATA GRID: <span style={{ color: 'var(--text-muted)' }}>{activeDataset.name}</span>
          </span>
          <span className="badge badge-info" style={{ fontSize: 9 }}>
            {processedRows.length} / {features.length} RECORDS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Quick Filter */}
          <div style={{ position: 'relative' }}>
            <Search
              size={12}
              style={{
                position: 'absolute',
                left: 7,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search table values..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                fontSize: 11,
                paddingLeft: 24,
                paddingRight: 6,
                height: 24,
                width: 170
              }}
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => exportDatasetToCSV(activeDataset)}
            className="btn-ghost"
            style={{ fontSize: 11, padding: '2px 6px', height: 24 }}
            title="Download CSV"
          >
            <Download size={12} />
            <span>Export CSV</span>
          </button>

          {/* Close button */}
          <button
            onClick={() => setAttributeTableOpen(false)}
            className="btn-icon"
            style={{ width: 24, height: 24 }}
            title="Close Table"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-app)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: 'var(--bg-surface)',
              zIndex: 5,
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            <tr>
              <th
                style={{
                  padding: '6px 10px',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  width: 36,
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{
                    padding: '6px 10px',
                    borderBottom: '1px solid var(--border-color)',
                    color: sortField === col ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>{col}</span>
                    <ArrowUpDown size={10} style={{ opacity: sortField === col ? 1 : 0.3 }} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedRows.map((feat, idx) => {
              const internalId = feat.properties.__internalId;
              const isSelected =
                selectedFeature?.datasetId === activeDataset.id &&
                selectedFeature?.internalId === internalId;

              return (
                <tr
                  key={internalId}
                  onClick={() => handleRowClick(feat)}
                  style={{
                    background: isSelected
                      ? 'rgba(56, 189, 248, 0.15)'
                      : idx % 2 === 0
                      ? 'transparent'
                      : 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background =
                        idx % 2 === 0 ? 'transparent' : 'var(--bg-surface)';
                    }
                  }}
                >
                  <td
                    style={{
                      padding: '5px 10px',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {idx + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{
                        padding: '5px 10px',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        maxWidth: 240,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {formatValueForDisplay(feat.properties[col])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
