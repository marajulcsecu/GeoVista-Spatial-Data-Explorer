import { useState, useRef, useEffect, type FC } from 'react';
import { Map as MapIcon, ChevronDown, Check } from 'lucide-react';
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
        className="glass-panel"
        style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 500
        }}
        title="Switch Basemap Style"
      >
        <span>{currentBasemap.thumbnail}</span>
        <span>{currentBasemap.label}</span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>

      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            right: 0,
            width: 180,
            borderRadius: 'var(--radius-md)',
            padding: 4,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
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
                padding: '6px 8px',
                fontSize: 12,
                background: opt.key === basemapStyle ? 'var(--bg-hover)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{opt.thumbnail}</span>
                <span>{opt.label}</span>
              </div>
              {opt.key === basemapStyle && (
                <Check size={14} style={{ color: 'var(--accent-primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
