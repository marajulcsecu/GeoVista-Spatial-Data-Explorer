import { type FC } from 'react';
import { Search, MapPin, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const SearchPanel: FC = () => {
  const {
    datasets,
    activeDatasetId,
    searchQuery,
    setSearchQuery,
    selectFeature,
    triggerFlyTo
  } = useAppStore();

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  if (!activeDataset) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Search size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
        <p style={{ fontSize: 13 }}>No dataset loaded to search.</p>
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const features = activeDataset.featureCollection.features;

  const results = query
    ? features.filter((feat) => {
        const props = feat.properties;
        const nameMatch = props.__displayName.toLowerCase().includes(query);
        const catMatch = (props.__category || '').toLowerCase().includes(query);
        const propMatch = Object.entries(props).some(
          ([k, v]) => !k.startsWith('__') && String(v).toLowerCase().includes(query)
        );
        return nameMatch || catMatch || propMatch;
      })
    : [];

  const handleSelectResult = (feat: any) => {
    selectFeature(activeDataset.id, feat.properties.__internalId);
    if (feat.geometry.type === 'Point' && Array.isArray(feat.geometry.coordinates)) {
      const [lng, lat] = feat.geometry.coordinates;
      triggerFlyTo(lng, lat, 17);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px' }}>
      {/* Search Input Box */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        />
        <input
          type="text"
          placeholder="Search features, categories, IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: 34,
            paddingRight: searchQuery ? 30 : 10,
            height: 36
          }}
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results Count */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {query
          ? `Found ${results.length} matching feature${results.length !== 1 ? 's' : ''}`
          : `Type to search across ${features.length} features`}
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 380, overflowY: 'auto' }}>
        {results.map((feat) => {
          const props = feat.properties;
          const categoryColor =
            activeDataset.style.customColorMap?.[props.__category || ''] || '#3b82f6';

          return (
            <div
              key={props.__internalId}
              onClick={() => handleSelectResult(feat)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 'var(--radius-full)',
                    background: categoryColor,
                    flexShrink: 0
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {props.__displayName}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    Category: {props.__category || 'Uncategorized'}
                  </div>
                </div>
              </div>

              <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          );
        })}

        {query && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>
            No features match "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
