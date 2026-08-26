import { useState, useRef, useEffect, type FC } from 'react';
import { ChevronDown, Check, Layers } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { BASEMAP_OPTIONS } from '../../map/mapStyles';

export const BasemapSwitcher: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { basemapStyle, setBasemap } = useAppStore();

  const currentBasemap = BASEMAP_OPTIONS.find((b) => b.key === basemapStyle) || BASEMAP_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="map-hud-control"
        style={{
          padding: '5px 10px',
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 500,
          height: 28
        }}
        title="Switch Cartographic Basemap"
      >
        <span>{currentBasemap.thumbnail}</span>
        <span style={{ fontWeight: 600 }}>{currentBasemap.label}</span>
        <ChevronDown size={11} style={{ opacity: 0.6 }} />
      </button>

      {isOpen && (
        <div
          className="map-hud-control"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 5px)',
            right: 0,
            width: 190,
            padding: 4,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div
            style={{
              padding: '4px 6px',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Select Basemap Style
          </div>

          {BASEMAP_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setBasemap(opt.key);
                setIsOpen(false);
              }}
              className="btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '5px 8px',
                fontSize: 11,
                borderRadius: 'var(--radius-xs)',
                background: opt.key === basemapStyle ? 'var(--bg-active)' : 'transparent',
                color: opt.key === basemapStyle ? '#ffffff' : 'var(--text-primary)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{opt.thumbnail}</span>
                <span style={{ fontWeight: opt.key === basemapStyle ? 600 : 400 }}>{opt.label}</span>
              </div>
              {opt.key === basemapStyle && (
                <Check size={12} style={{ color: 'var(--accent-cyan)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
