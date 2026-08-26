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
        style={{ fontSize: 13, padding: '7px 12px', opacity: 0.5, cursor: 'not-allowed' }}
        disabled
      >
        <Download size={16} />
        <span>Export</span>
      </button>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary"
        style={{ fontSize: 13, padding: '7px 12px' }}
      >
        <Download size={16} />
        <span>Export</span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 220,
            borderRadius: 'var(--radius-md)',
            padding: 6,
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Export Options ({activeDataset.name})
          </div>

          {/* Export Normalized GeoJSON */}
          <button
            onClick={() => {
              exportDatasetToGeoJSON(activeDataset, { visibleCategoriesOnly: false });
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', fontSize: 13 }}
          >
            <FileJson size={16} style={{ color: '#3b82f6' }} />
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
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', fontSize: 13 }}
          >
            <FileJson size={16} style={{ color: '#06b6d4' }} />
            <span>Visible Only (GeoJSON)</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => {
              exportDatasetToCSV(activeDataset, { visibleCategoriesOnly: false });
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', fontSize: 13 }}
          >
            <FileSpreadsheet size={16} style={{ color: '#10b981' }} />
            <span>Attribute Table (CSV)</span>
          </button>

          {/* Export PNG Map Image */}
          <button
            onClick={() => {
              exportMapScreenshot(activeDataset.name);
              setIsOpen(false);
            }}
            className="btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', fontSize: 13 }}
          >
            <ImageIcon size={16} style={{ color: '#f59e0b' }} />
            <span>Map Screenshot (PNG)</span>
          </button>
        </div>
      )}
    </div>
  );
};
