import { useState, useRef, useEffect, type FC, type FormEvent } from 'react';
import { Navigation, MapPin, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { isValidWgs84 } from '../../utils/coordinates';

export const CoordinateFlyTo: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { triggerFlyTo } = useAppStore();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleFly = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lat = parseFloat(latInput.trim());
    const lng = parseFloat(lngInput.trim());

    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid numeric coordinates.');
      return;
    }

    if (!isValidWgs84(lng, lat)) {
      setError('Latitude must be [-90..90] and Longitude [-180..180].');
      return;
    }

    triggerFlyTo(lng, lat, 16.5);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
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
        title="Jump to specific Latitude/Longitude"
      >
        <Navigation size={14} style={{ color: 'var(--accent-cyan)' }} />
        <span>Go to Coord</span>
      </button>

      {isOpen && (
        <form
          onSubmit={handleFly}
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            right: 0,
            width: 240,
            borderRadius: 'var(--radius-md)',
            padding: 12,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Fly to Coordinate</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{ padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
              Latitude (-90 to 90)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 22.461664"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              style={{ width: '100%', fontSize: 12 }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
              Longitude (-180 to 180)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 91.789986"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              style={{ width: '100%', fontSize: 12 }}
              required
            />
          </div>

          {error && (
            <div style={{ fontSize: 11, color: 'var(--accent-rose)', lineHeight: 1.2 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '6px', fontSize: 12, marginTop: 4 }}
          >
            <span>Navigate</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}
    </div>
  );
};
