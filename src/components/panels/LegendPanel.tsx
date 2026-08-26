import { type FC } from 'react';
import { Palette, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const LegendPanel: FC = () => {
  const {
    datasets,
    activeDatasetId,
    categoryFilter,
    setCategoryVisibility,
    toggleAllCategories,
    setLayerStyle
  } = useAppStore();

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  if (!activeDataset || activeDataset.categories.length === 0) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Palette size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>No categorical classes</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Load a dataset with categorical classification attributes.</p>
      </div>
    );
  }

  const allVisible = activeDataset.categories.every(
    (c) => categoryFilter[c.name] !== false
  );

  const handleColorChange = (catName: string, newColor: string) => {
    const updatedCustomMap = {
      ...(activeDataset.style.customColorMap || {}),
      [catName]: newColor
    };
    setLayerStyle(activeDataset.id, { customColorMap: updatedCustomMap });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px' }}>
      {/* Legend Header with Select All / Clear All */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            Categorical Symbology
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            FIELD: <span style={{ color: 'var(--accent-cyan)' }}>{activeDataset.primaryCategoryField || 'Category'}</span>
          </div>
        </div>

        <button
          onClick={() => toggleAllCategories(!allVisible)}
          className="btn-ghost"
          style={{ fontSize: 10, padding: '2px 6px', height: 22 }}
        >
          {allVisible ? (
            <>
              <Square size={11} />
              <span>Deselect All</span>
            </>
          ) : (
            <>
              <CheckSquare size={11} />
              <span>Select All</span>
            </>
          )}
        </button>
      </div>

      {/* Category List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {activeDataset.categories.map((cat) => {
          const isVisible = categoryFilter[cat.name] !== false;
          const currentColor = activeDataset.style.customColorMap?.[cat.name] || cat.color;

          return (
            <div
              key={cat.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 8px',
                background: isVisible ? 'var(--bg-surface)' : 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                opacity: isVisible ? 1 : 0.6,
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                {/* Color Swatch with native color picker */}
                <label
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 'var(--radius-xs)',
                    background: currentColor,
                    boxShadow: `0 0 6px ${currentColor}88`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                  title="Click to customize category color"
                >
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => handleColorChange(cat.name, e.target.value)}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0,
                      position: 'absolute',
                      pointerEvents: 'none'
                    }}
                  />
                </label>

                {/* Category Name */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={cat.name}
                >
                  {cat.name}
                </span>
              </div>

              {/* Count & Toggle Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {cat.count}
                </span>

                <button
                  onClick={() => setCategoryVisibility(cat.name, !isVisible)}
                  className="btn-ghost"
                  style={{ padding: 2, height: 20, width: 20 }}
                  title={isVisible ? 'Hide category from map' : 'Show category on map'}
                >
                  {isVisible ? (
                    <Eye size={12} style={{ color: 'var(--accent-cyan)' }} />
                  ) : (
                    <EyeOff size={12} style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
