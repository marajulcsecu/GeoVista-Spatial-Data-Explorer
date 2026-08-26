import { useState, useMemo, type FC } from 'react';
import {
  X,
  ArrowUpDown,
  Search,
  Download,
  Maximize2,
  Table as TableIcon,
  Filter
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
          padding: '8px 16px',
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TableIcon size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Attribute Table: {activeDataset.name}
          </span>
          <span className="badge badge-info" style={{ fontSize: 11 }}>
            {processedRows.length} of {features.length} records
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quick Filter */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Filter table rows..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                fontSize: 12,
                paddingLeft: 26,
                paddingRight: 8,
                height: 28,
                width: 180
              }}
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={() => exportDatasetToCSV(activeDataset)}
            className="btn-ghost"
            style={{ fontSize: 12, padding: '4px 8px' }}
            title="Download CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Close button */}
          <button
            onClick={() => setAttributeTableOpen(false)}
            className="btn-icon"
            style={{ width: 26, height: 26 }}
            title="Close Table"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-app)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: 'var(--bg-surface)',
              zIndex: 5,
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            <tr>
              <th
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  width: 40,
                  textAlign: 'center'
                }}
              >
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border-color)',
                    color: sortField === col ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>{col}</span>
                    <ArrowUpDown size={12} style={{ opacity: sortField === col ? 1 : 0.4 }} />
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
                      ? 'rgba(59, 130, 246, 0.22)'
                      : idx % 2 === 0
                      ? 'transparent'
                      : 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-color)',
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
                      padding: '6px 12px',
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
                        padding: '6px 12px',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        maxWidth: 260,
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
