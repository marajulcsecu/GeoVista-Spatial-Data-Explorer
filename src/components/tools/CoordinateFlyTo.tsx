import { useState, useRef, useEffect, type FC, type FormEvent } from 'react';
import { Navigation, X, ArrowRight, Crosshair } from 'lucide-react';
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
      setError('Enter valid decimal coordinates.');
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
        title="Jump to specific Latitude/Longitude"
      >
        <Crosshair size={13} style={{ color: 'var(--accent-cyan)' }} />
        <span>Go to Coord</span>
      </button>

      {isOpen && (
        <form
          onSubmit={handleFly}
          className="map-hud-control"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 5px)',
            right: 0,
            width: 230,
            padding: 10,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
              Coordinate Navigation
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-ghost"
              style={{ padding: 2, height: 20, width: 20 }}
            >
              <X size={12} />
            </button>
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
              LATITUDE (WGS 84)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 22.461664"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
              LONGITUDE (WGS 84)
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 91.789986"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
              style={{ width: '100%', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          {error && (
            <div style={{ fontSize: 10, color: 'var(--accent-rose)', lineHeight: 1.2 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '5px', fontSize: 11, marginTop: 2, justifyContent: 'center' }}
          >
            <span>Jump to Location</span>
            <ArrowRight size={12} />
          </button>
        </form>
      )}
    </div>
  );
};
