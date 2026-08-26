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
      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Palette size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p style={{ fontSize: 13 }}>No categories detected.</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Load a dataset with categorical fields to view legend symbology.</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
      {/* Legend Header with Select All / Clear All */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 8,
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Categorical Legend
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Field: <code style={{ color: 'var(--accent-cyan)' }}>{activeDataset.primaryCategoryField || 'Category'}</code>
          </div>
        </div>

        <button
          onClick={() => toggleAllCategories(!allVisible)}
          className="btn-ghost"
          style={{ fontSize: 11, padding: '4px 8px' }}
        >
          {allVisible ? (
            <>
              <Square size={13} />
              <span>Clear All</span>
            </>
          ) : (
            <>
              <CheckSquare size={13} />
              <span>Select All</span>
            </>
          )}
        </button>
      </div>

      {/* Category List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                padding: '7px 10px',
                background: isVisible ? 'var(--bg-surface)' : 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                opacity: isVisible ? 1 : 0.6,
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                {/* Color Swatch with native color picker */}
                <label
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 'var(--radius-full)',
                    background: currentColor,
                    boxShadow: `0 0 8px ${currentColor}66`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    position: 'relative'
                  }}
                  title="Click to change category color"
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
                    fontSize: 12,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className="badge badge-info"
                  style={{ fontSize: 10, padding: '1px 6px', fontWeight: 600 }}
                >
                  {cat.count}
                </span>

                <button
                  onClick={() => setCategoryVisibility(cat.name, !isVisible)}
                  className="btn-ghost"
                  style={{ padding: 4 }}
                  title={isVisible ? 'Hide this category' : 'Show this category'}
                >
                  {isVisible ? (
                    <Eye size={14} style={{ color: 'var(--accent-primary)' }} />
                  ) : (
                    <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />
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
