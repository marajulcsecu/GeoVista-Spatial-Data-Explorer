import { type FC } from 'react';
import {
  Compass,
  Sparkles,
  Download,
  Moon,
  Sun,
  HelpCircle,
  Layers,
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

  const totalFeatures = datasets.reduce(
    (acc, d) => acc + (d.visible ? d.featureCollection.features.length : 0),
    0
  );

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 20,
        position: 'relative'
      }}
    >
      {/* App Brand & University GIS Lab Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Compass size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}
            >
              GeoVista
            </h1>
            <span
              className="badge badge-info"
              style={{ fontSize: 9, padding: '1px 5px' }}
            >
              GIS WORKSTATION
            </span>
          </div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.01em'
            }}
          >
            Spatial Data Ingestion & Cartographic Exploration Engine
          </p>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Load Demo Dataset */}
        <button
          onClick={() => loadDemoDataset()}
          className="btn-primary"
          title="Load University Botanical Garden Survey sample dataset"
        >
          <Sparkles size={14} />
          <span>Load Sample Survey</span>
        </button>

        {/* Toggle Attribute Table */}
        <button
          onClick={() => setAttributeTableOpen(!isAttributeTableOpen)}
          className={isAttributeTableOpen ? 'btn-primary' : 'btn-secondary'}
          title="Toggle Attribute Data Grid"
          disabled={datasets.length === 0}
          style={{ opacity: datasets.length === 0 ? 0.5 : 1, cursor: datasets.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <TableIcon size={14} />
          <span>Attribute Grid</span>
          {datasets.length > 0 && (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                padding: '1px 4px',
                background: isAttributeTableOpen ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-xs)',
                marginLeft: 2
              }}
            >
              {totalFeatures}
            </span>
          )}
        </button>

        {/* Export Dropdown */}
        <ExportMenu />

        <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 2px' }} />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light Workstation' : 'Dark Workstation'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Help / Guide Modal */}
        <button
          onClick={() => setHelpOpen(true)}
          className="btn-icon"
          title="GIS Technical Information & Specifications"
        >
          <HelpCircle size={15} />
        </button>
      </div>
    </header>
  );
};
