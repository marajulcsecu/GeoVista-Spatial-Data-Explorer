import { type FC } from 'react';
import {
  Layers,
  Palette,
  ShieldCheck,
  BarChart3,
  Search,
  RotateCcw,
  UploadCloud
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { FileDropzone } from '../upload/FileDropzone';
import { LayerPanel } from '../panels/LayerPanel';
import { LegendPanel } from '../panels/LegendPanel';
import { ValidationPanel } from '../panels/ValidationPanel';
import { DatasetSummaryPanel } from '../panels/DatasetSummaryPanel';
import { SearchPanel } from '../panels/SearchPanel';

export const Sidebar: FC = () => {
  const {
    datasets,
    activeDatasetId,
    activeSidebarTab,
    setActiveSidebarTab,
    resetAll
  } = useAppStore();

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  const errorCount = activeDataset?.validationReport?.errors?.length || 0;
  const warningCount = activeDataset?.validationReport?.warnings?.length || 0;

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: 'calc(100% - var(--header-height) - var(--status-bar-height))',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      {/* Upload Dropzone Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <FileDropzone />
      </div>

      {/* Sidebar Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface-elevated)',
          flexShrink: 0
        }}
      >
        {/* Layers Tab */}
        <button
          onClick={() => setActiveSidebarTab('layers')}
          className="btn-ghost"
          style={{
            flex: 1,
            borderRadius: 0,
            padding: '10px 4px',
            fontSize: 12,
            fontWeight: activeSidebarTab === 'layers' ? 600 : 400,
            color:
              activeSidebarTab === 'layers' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom:
              activeSidebarTab === 'layers' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            gap: 4
          }}
          title="Layer Management"
        >
          <Layers size={15} />
          <span>Layers</span>
          {datasets.length > 0 && (
            <span
              className="badge badge-info"
              style={{ fontSize: 10, padding: '0 5px' }}
            >
              {datasets.length}
            </span>
          )}
        </button>

        {/* Legend Tab */}
        <button
          onClick={() => setActiveSidebarTab('legend')}
          className="btn-ghost"
          style={{
            flex: 1,
            borderRadius: 0,
            padding: '10px 4px',
            fontSize: 12,
            fontWeight: activeSidebarTab === 'legend' ? 600 : 400,
            color:
              activeSidebarTab === 'legend' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom:
              activeSidebarTab === 'legend' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            gap: 4
          }}
          title="Symbology & Legend"
        >
          <Palette size={15} />
          <span>Legend</span>
        </button>

        {/* Validation Tab */}
        <button
          onClick={() => setActiveSidebarTab('validation')}
          className="btn-ghost"
          style={{
            flex: 1,
            borderRadius: 0,
            padding: '10px 4px',
            fontSize: 12,
            fontWeight: activeSidebarTab === 'validation' ? 600 : 400,
            color:
              activeSidebarTab === 'validation'
                ? 'var(--accent-primary)'
                : errorCount > 0
                ? 'var(--accent-rose)'
                : 'var(--text-secondary)',
            borderBottom:
              activeSidebarTab === 'validation'
                ? '2px solid var(--accent-primary)'
                : '2px solid transparent',
            gap: 4
          }}
          title="Validation Diagnostics"
        >
          <ShieldCheck size={15} />
          <span>Health</span>
          {(errorCount > 0 || warningCount > 0) && (
            <span
              className={errorCount > 0 ? 'badge badge-error' : 'badge badge-warning'}
              style={{ fontSize: 9, padding: '0 4px' }}
            >
              {errorCount + warningCount}
            </span>
          )}
        </button>

        {/* Summary Tab */}
        <button
          onClick={() => setActiveSidebarTab('summary')}
          className="btn-ghost"
          style={{
            flex: 1,
            borderRadius: 0,
            padding: '10px 4px',
            fontSize: 12,
            fontWeight: activeSidebarTab === 'summary' ? 600 : 400,
            color:
              activeSidebarTab === 'summary' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom:
              activeSidebarTab === 'summary' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            gap: 4
          }}
          title="Dataset Summary & Statistics"
        >
          <BarChart3 size={15} />
          <span>Stats</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => setActiveSidebarTab('search')}
          className="btn-ghost"
          style={{
            flex: 1,
            borderRadius: 0,
            padding: '10px 4px',
            fontSize: 12,
            fontWeight: activeSidebarTab === 'search' ? 600 : 400,
            color:
              activeSidebarTab === 'search' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom:
              activeSidebarTab === 'search' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            gap: 4
          }}
          title="Fuzzy Search"
        >
          <Search size={15} />
          <span>Search</span>
        </button>
      </div>

      {/* Tab Panels Body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeSidebarTab === 'layers' && <LayerPanel />}
        {activeSidebarTab === 'legend' && <LegendPanel />}
        {activeSidebarTab === 'validation' && <ValidationPanel />}
        {activeSidebarTab === 'summary' && <DatasetSummaryPanel />}
        {activeSidebarTab === 'search' && <SearchPanel />}
      </div>

      {/* Footer Reset Action */}
      {datasets.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} loaded
          </span>
          <button
            onClick={() => {
              if (window.confirm('Clear all datasets and reset map?')) {
                resetAll();
              }
            }}
            className="btn-ghost"
            style={{ fontSize: 11, color: 'var(--accent-rose)', padding: '4px 8px' }}
          >
            <RotateCcw size={12} />
            <span>Clear All</span>
          </button>
        </div>
      )}
    </aside>
  );
};
