import { type FC } from 'react';
import {
  Compass,
  Sparkles,
  Download,
  Moon,
  Sun,
  HelpCircle,
  Layers,
  UploadCloud,
  Table as TableIcon
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { ExportMenu } from '../tools/ExportMenu';

export const Header: FC = () => {
  const {
    theme,
    datasets,
    isAttributeTableOpen,
    setTheme,
    setHelpOpen,
    loadDemoDataset,
    setAttributeTableOpen
  } = useAppStore();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 20,
        position: 'relative'
      }}
    >
      {/* App Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
          }}
        >
          <Compass size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}
            >
              GeoVista
            </h1>
            <span
              className="badge badge-info"
              style={{ fontSize: 10, padding: '1px 6px' }}
            >
              Explorer
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            Spatial Data Viewer & Ingestion Engine
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Load Demo Dataset */}
        <button
          onClick={() => loadDemoDataset()}
          className="btn-primary"
          title="Load Group 6 Botanical Garden Survey demo dataset"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            fontSize: 13,
            padding: '7px 14px'
          }}
        >
          <Sparkles size={16} />
          <span>Load Demo Data</span>
        </button>

        {/* Toggle Attribute Table */}
        <button
          onClick={() => setAttributeTableOpen(!isAttributeTableOpen)}
          className={isAttributeTableOpen ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: 13, padding: '7px 12px' }}
          title="Toggle Attribute Table"
          disabled={datasets.length === 0}
        >
          <TableIcon size={16} />
          <span>Table</span>
        </button>

        {/* Export Dropdown */}
        <ExportMenu />

        <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 4px' }} />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Help Modal */}
        <button
          onClick={() => setHelpOpen(true)}
          className="btn-icon"
          title="Help & GIS Information"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
};
