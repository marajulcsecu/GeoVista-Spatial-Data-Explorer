import { useEffect, type FC } from 'react';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { StatusBar } from '../components/layout/StatusBar';
import { MapView } from '../map/MapView';
import { FeatureInspector } from '../components/panels/FeatureInspector';
import { AttributeTable } from '../components/panels/AttributeTable';
import { MeasureToolbar } from '../components/tools/MeasureToolbar';
import { BasemapSwitcher } from '../components/tools/BasemapSwitcher';
import { CoordinateFlyTo } from '../components/tools/CoordinateFlyTo';
import { CsvColumnModal } from '../components/upload/CsvColumnModal';
import { HelpModal } from '../components/modals/HelpModal';
import { useAppStore } from './store';
import { applyTheme } from './theme';

export const App: FC = () => {
  const { theme, initFromStorage } = useAppStore();

  useEffect(() => {
    applyTheme(theme);
    initFromStorage();
  }, [theme, initFromStorage]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Top Header */}
      <Header />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Interactive Sidebar */}
        <Sidebar />

        {/* Center Interactive Map */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapView />

          {/* Floating Measurement Toolbar */}
          <MeasureToolbar />

          {/* Floating Map Bottom-Right Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 10
            }}
          >
            <CoordinateFlyTo />
            <BasemapSwitcher />
          </div>

          {/* Right Feature Inspector */}
          <FeatureInspector />

          {/* Expandable Bottom Attribute Table */}
          <AttributeTable />
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Modals */}
      <CsvColumnModal />
      <HelpModal />
    </div>
  );
};
