import { useState, useRef, useEffect, type FC } from 'react';
import { Download, ChevronDown, FileJson, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { exportDatasetToGeoJSON } from '../../export/exportGeoJSON';
import { exportDatasetToCSV } from '../../export/exportCSV';
import { exportMapScreenshot } from '../../export/exportMapImage';

export const ExportMenu: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { datasets, activeDatasetId, categoryFilter } = useAppStore();

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!activeDataset) {
    return (
      <button
        className="btn-secondary"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
        disabled
      >
        <Download size={13} />
        <span>Export</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
        title="Export spatial layers or map rendering"
      >
        <Download size={13} />
        <span>Export</span>
        <ChevronDown size={11} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            right: 0,
            width: 210,
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div
            style={{
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Export: {activeDataset.name}
          </div>

          {/* Export Normalized GeoJSON */}
          <button
            onClick={() => {
              exportDatasetToGeoJSON(activeDataset, { visibleCategoriesOnly: false });
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px', fontSize: 12, borderRadius: 'var(--radius-xs)' }}
          >
            <FileJson size={14} style={{ color: '#38bdf8' }} />
            <span>Normalized GeoJSON</span>
          </button>

          {/* Export Filtered GeoJSON */}
          <button
            onClick={() => {
              exportDatasetToGeoJSON(activeDataset, {
                visibleCategoriesOnly: true,
                categoryFilter
              });
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px', fontSize: 12, borderRadius: 'var(--radius-xs)' }}
          >
            <FileJson size={14} style={{ color: '#06b6d4' }} />
            <span>Filtered Features Only</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => {
              exportDatasetToCSV(activeDataset, { visibleCategoriesOnly: false });
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px', fontSize: 12, borderRadius: 'var(--radius-xs)' }}
          >
            <FileSpreadsheet size={14} style={{ color: '#10b981' }} />
            <span>Attribute Table (CSV)</span>
          </button>

          {/* Export PNG Map Image */}
          <button
            onClick={() => {
              exportMapScreenshot(activeDataset.name);
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px', fontSize: 12, borderRadius: 'var(--radius-xs)' }}
          >
            <ImageIcon size={14} style={{ color: '#f59e0b' }} />
            <span>Map Render (PNG)</span>
          </button>
        </div>
      )}
    </div>
  );
};
