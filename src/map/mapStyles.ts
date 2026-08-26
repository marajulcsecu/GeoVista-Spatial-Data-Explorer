import type { BasemapKey } from '../types/spatial';

export interface BasemapOption {
  key: BasemapKey;
  label: string;
  thumbnail: string;
  style: string | object;
}

export const BASEMAP_OPTIONS: BasemapOption[] = [
  {
    key: 'esri-satellite',
    label: 'Satellite Imagery',
    thumbnail: '🛰️',
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
    key: 'esri-hybrid',
    label: 'Satellite (Roads & Labels)',
    thumbnail: '🌍',
    style: {
      version: 8,
      sources: {
        'satellite-base': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution: 'Tiles &copy; Esri'
        },
        'reference-roads': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 18
        },
        'reference-labels': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 18
        }
      },
      layers: [
        {
          id: 'satellite-base-layer',
          type: 'raster',
          source: 'satellite-base',
          minzoom: 0,
          maxzoom: 22
        },
        {
          id: 'reference-roads-layer',
          type: 'raster',
          source: 'reference-roads',
          minzoom: 0,
          maxzoom: 22
        },
        {
          id: 'reference-labels-layer',
          type: 'raster',
          source: 'reference-labels',
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
