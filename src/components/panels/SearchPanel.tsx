import { type FC } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
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
      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Search size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>No dataset to search</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px' }}>
      {/* Search Input Box */}
      <div style={{ position: 'relative' }}>
        <Search
          size={13}
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        />
        <input
          type="text"
          placeholder="Filter features, categories, IDs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: 26,
            paddingRight: searchQuery ? 24 : 8,
            height: 28,
            fontSize: 11
          }}
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results Count */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {query
          ? `FOUND ${results.length} MATCHING FEATURE${results.length !== 1 ? 'S' : ''}`
          : `QUERYING ACROSS ${features.length} FEATURES`}
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 380, overflowY: 'auto' }}>
        {results.map((feat) => {
          const props = feat.properties;
          const categoryColor =
            activeDataset.style.customColorMap?.[props.__category || ''] || '#38bdf8';

          return (
            <div
              key={props.__internalId}
              onClick={() => handleSelectResult(feat)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xs)',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 'var(--radius-xs)',
                    background: categoryColor,
                    flexShrink: 0
                  }}
                />
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {props.__displayName}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    CLASS: {props.__category || 'UNCATEGORIZED'}
                  </div>
                </div>
              </div>

              <ArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          );
        })}

        {query && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 11 }}>
            No features match "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
