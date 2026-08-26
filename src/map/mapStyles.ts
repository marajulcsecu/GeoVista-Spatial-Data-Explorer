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
    key: 'esri-topo',
    label: 'Topographic Map',
    thumbnail: '🏔️',
    style: {
      version: 8,
      sources: {
        'esri-topo-source': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 15,
          attribution:
            'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        }
      },
      layers: [
        {
          id: 'esri-topo-tiles',
          type: 'raster',
          source: 'esri-topo-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'osm-standard',
    label: 'OpenStreetMap',
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
    key: 'esri-natgeo',
    label: 'National Geographic',
    thumbnail: '🧭',
    style: {
      version: 8,
      sources: {
        'esri-natgeo-source': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          maxzoom: 12,
          attribution:
            'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
        }
      },
      layers: [
        {
          id: 'esri-natgeo-tiles',
          type: 'raster',
          source: 'esri-natgeo-source',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    }
  },
  {
    key: 'osm',
    label: 'Voyager (Streets)',
    thumbnail: '🏙️',
    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  },
  {
    key: 'carto-dark',
    label: 'Dark Matter',
    thumbnail: '🌙',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  },
  {
    key: 'carto-light',
    label: 'Positron (Light)',
    thumbnail: '☀️',
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  }
];

export function getBasemapStyle(key: BasemapKey): string | object {
  const option = BASEMAP_OPTIONS.find((b) => b.key === key);
  return option ? option.style : BASEMAP_OPTIONS[0].style;
}
