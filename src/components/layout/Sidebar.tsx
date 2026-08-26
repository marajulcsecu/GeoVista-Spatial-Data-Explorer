import { type FC } from 'react';
import {
  Layers,
  Palette,
  ShieldCheck,
  BarChart3,
  Search,
  RotateCcw
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

      {/* Sidebar Segmented Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-surface)',
          padding: '4px 6px',
          gap: 2,
          flexShrink: 0
        }}
      >
        {/* Layers Tab */}
        <button
          onClick={() => setActiveSidebarTab('layers')}
          style={{
            flex: 1,
            padding: '6px 2px',
            fontSize: 11,
            fontWeight: activeSidebarTab === 'layers' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            color:
              activeSidebarTab === 'layers' ? '#ffffff' : 'var(--text-secondary)',
            background:
              activeSidebarTab === 'layers' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeSidebarTab === 'layers' ? '1px solid var(--border-color)' : '1px solid transparent',
            gap: 4
          }}
          title="Layer Management"
        >
          <Layers size={13} style={{ color: activeSidebarTab === 'layers' ? 'var(--accent-cyan)' : 'inherit' }} />
          <span>Layers</span>
          {datasets.length > 0 && (
            <span
              style={{
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                padding: '0 4px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-cyan)',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              {datasets.length}
            </span>
          )}
        </button>

        {/* Legend Tab */}
        <button
          onClick={() => setActiveSidebarTab('legend')}
          style={{
            flex: 1,
            padding: '6px 2px',
            fontSize: 11,
            fontWeight: activeSidebarTab === 'legend' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            color:
              activeSidebarTab === 'legend' ? '#ffffff' : 'var(--text-secondary)',
            background:
              activeSidebarTab === 'legend' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeSidebarTab === 'legend' ? '1px solid var(--border-color)' : '1px solid transparent',
            gap: 4
          }}
          title="Symbology & Categorical Legend"
        >
          <Palette size={13} style={{ color: activeSidebarTab === 'legend' ? 'var(--accent-emerald)' : 'inherit' }} />
          <span>Legend</span>
        </button>

        {/* Validation Tab */}
        <button
          onClick={() => setActiveSidebarTab('validation')}
          style={{
            flex: 1,
            padding: '6px 2px',
            fontSize: 11,
            fontWeight: activeSidebarTab === 'validation' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            color:
              activeSidebarTab === 'validation' ? '#ffffff' : 'var(--text-secondary)',
            background:
              activeSidebarTab === 'validation' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeSidebarTab === 'validation' ? '1px solid var(--border-color)' : '1px solid transparent',
            gap: 4
          }}
          title="Topological QA/QC & Diagnostics"
        >
          <ShieldCheck size={13} style={{ color: errorCount > 0 ? 'var(--accent-rose)' : 'inherit' }} />
          <span>QA/QC</span>
          {(errorCount > 0 || warningCount > 0) && (
            <span
              style={{
                fontSize: 9,
                fontFamily: 'var(--font-mono)',
                padding: '0 3px',
                background: errorCount > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: errorCount > 0 ? 'var(--accent-rose)' : 'var(--accent-amber)',
                borderRadius: 'var(--radius-xs)'
              }}
            >
              {errorCount + warningCount}
            </span>
          )}
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveSidebarTab('summary')}
          style={{
            flex: 1,
            padding: '6px 2px',
            fontSize: 11,
            fontWeight: activeSidebarTab === 'summary' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            color:
              activeSidebarTab === 'summary' ? '#ffffff' : 'var(--text-secondary)',
            background:
              activeSidebarTab === 'summary' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeSidebarTab === 'summary' ? '1px solid var(--border-color)' : '1px solid transparent',
            gap: 4
          }}
          title="Dataset Spatial Statistics"
        >
          <BarChart3 size={13} style={{ color: activeSidebarTab === 'summary' ? 'var(--accent-amber)' : 'inherit' }} />
          <span>Stats</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => setActiveSidebarTab('search')}
          style={{
            flex: 1,
            padding: '6px 2px',
            fontSize: 11,
            fontWeight: activeSidebarTab === 'search' ? 600 : 500,
            borderRadius: 'var(--radius-xs)',
            color:
              activeSidebarTab === 'search' ? '#ffffff' : 'var(--text-secondary)',
            background:
              activeSidebarTab === 'search' ? 'var(--bg-surface-elevated)' : 'transparent',
            border: activeSidebarTab === 'search' ? '1px solid var(--border-color)' : '1px solid transparent',
            gap: 4
          }}
          title="Attribute Search"
        >
          <Search size={13} style={{ color: activeSidebarTab === 'search' ? 'var(--accent-indigo)' : 'inherit' }} />
          <span>Query</span>
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
            padding: '6px 14px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {datasets.length} LAYER{datasets.length !== 1 ? 'S' : ''} ACTIVE
          </span>
          <button
            onClick={() => {
              if (window.confirm('Clear all spatial datasets and reset map workspace?')) {
                resetAll();
              }
            }}
            className="btn-ghost"
            style={{ fontSize: 11, color: 'var(--accent-rose)', padding: '2px 6px', gap: 4 }}
          >
            <RotateCcw size={11} />
            <span>Reset Workspace</span>
          </button>
        </div>
      )}
    </aside>
  );
};
