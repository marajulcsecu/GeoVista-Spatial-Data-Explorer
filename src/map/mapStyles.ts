import type { BasemapKey } from '../types/spatial';

export interface BasemapOption {
  key: BasemapKey;
  label: string;
  thumbnail: string;
  style: string | object;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    key: 'google-satellite',
    label: 'Google Satellite (Latest)',
    thumbnail: '🛰️',
    style: {
      version: 8,
      sources: {
        'google-satellite-source': {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          maxzoom: 21,
          attribution: '&copy; Google Maps Satellite'
        }
      },
      layers: [
        {
          id: 'google-satellite-tiles',
          type: 'raster',
          source: 'google-satellite-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'google-hybrid',
    label: 'Google Hybrid (Roads & Labels)',
    thumbnail: '🌍',
    style: {
      version: 8,
      sources: {
        'google-hybrid-source': {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          maxzoom: 21,
          attribution: '&copy; Google Maps Imagery'
        }
      },
      layers: [
        {
          id: 'google-hybrid-tiles',
          type: 'raster',
          source: 'google-hybrid-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'esri-satellite',
    label: 'Esri World Imagery',
    thumbnail: '📡',
    style: {
      version: 8,
      sources: {
        'esri-satellite-source': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      },
      layers: [
        {
          id: 'esri-satellite-tiles',
          type: 'raster',
          source: 'esri-satellite-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'open-topo',
    label: 'OpenTopoMap (Elevation Contours)',
    thumbnail: '🏔️',
    style: {
      version: 8,
      sources: {
        'opentopo-source': {
          type: 'raster',
          tiles: [
            'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
            'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          maxzoom: 17,
          attribution:
            'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
        }
      },
      layers: [
        {
          id: 'opentopo-layer',
          type: 'raster',
          source: 'opentopo-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'osm-standard',
    label: 'OpenStreetMap Standard',
    thumbnail: '🗺️',
    style: {
      version: 8,
      sources: {
        'osm-standard-source': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
      },
      layers: [
        {
          id: 'osm-standard-tiles',
          type: 'raster',
          source: 'osm-standard-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'cyclosm',
    label: 'CyclOSM (Outdoor & Topo)',
    thumbnail: '🌲',
    style: {
      version: 8,
      sources: {
        'cyclosm-source': {
          type: 'raster',
          tiles: [
            'https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
            'https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
            'https://c.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution:
            '&copy; <a href="https://www.cyclosm.org">CyclOSM</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      },
      layers: [
        {
          id: 'cyclosm-layer',
          type: 'raster',
          source: 'cyclosm-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'esri-street',
    label: 'ESRI World Street Map',
    thumbnail: '🏙️',
    style: {
      version: 8,
      sources: {
        'esri-street-source': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        }
      },
      layers: [
        {
          id: 'esri-street-layer',
          type: 'raster',
          source: 'esri-street-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'carto-dark',
    label: 'Dark Matter (GIS Analysis)',
    thumbnail: '🌙',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  }
];

export function getBasemapStyle(key: BasemapKey): string | object {
  const option = BASEMAP_OPTIONS.find((b) => b.key === key);
  return option ? option.style : BASEMAP_OPTIONS[0].style;
}
