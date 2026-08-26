import type { FeatureCollection, Point } from 'geojson';
import type { SpatialDataset } from '../types/spatial';
import { normalizeDataset } from '../importers/normalizeDataset';
import { validateGeoJSON } from '../validation/validateGeoJSON';

export const BOTANICAL_GARDEN_GEOJSON: any = {
  type: "FeatureCollection",
  name: "Group6_Botanical_Garden_Final_14_Points",
  features: [
    {
      type: "Feature",
      properties: {
        Point_ID: 1,
        Point_Name: "Botanical Garden Road",
        Category: "Road",
        Description: "Road segment within the Botanical Garden area.",
        Latitude: 22.4612294,
        Longitude: 91.7899949
      },
      geometry: {
        type: "Point",
        coordinates: [91.7899949, 22.4612294]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 2,
        Point_Name: "Botanical Garden Main Gate",
        Category: "Entrance",
        Description: "Main entrance to the Botanical Garden area.",
        Latitude: 22.461664,
        Longitude: 91.789986
      },
      geometry: {
        type: "Point",
        coordinates: [91.789986, 22.461664]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 3,
        Point_Name: "Botanical Garden Hill",
        Category: "Terrain Feature",
        Description: "Elevated hill location within the Botanical Garden.",
        Latitude: 22.460961,
        Longitude: 91.792114
      },
      geometry: {
        type: "Point",
        coordinates: [91.792114, 22.460961]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 4,
        Point_Name: "Botanical Garden Lake",
        Category: "Water Feature",
        Description: "Lake location within the Botanical Garden.",
        Latitude: 22.46075,
        Longitude: 91.791564
      },
      geometry: {
        type: "Point",
        coordinates: [91.791564, 22.46075]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 5,
        Point_Name: "Botanical Garden Picnic Spot",
        Category: "Recreation",
        Description: "Designated picnic and visitor recreation spot.",
        Latitude: 22.460592,
        Longitude: 91.789942
      },
      geometry: {
        type: "Point",
        coordinates: [91.789942, 22.460592]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 6,
        Point_Name: "Botanical Garden Office",
        Category: "Administration",
        Description: "Administrative office of the Botanical Garden.",
        Latitude: 22.460467,
        Longitude: 91.789525
      },
      geometry: {
        type: "Point",
        coordinates: [91.789525, 22.460467]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 7,
        Point_Name: "Lakeside Viewpoint",
        Category: "Viewpoint",
        Description: "Observation point beside the Botanical Garden lake.",
        Latitude: 22.460983,
        Longitude: 91.791172
      },
      geometry: {
        type: "Point",
        coordinates: [91.791172, 22.460983]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 8,
        Point_Name: "Botanical Palm Garden",
        Category: "Vegetation",
        Description: "Area featuring palm plants within the Botanical Garden.",
        Latitude: 22.460625,
        Longitude: 91.791192
      },
      geometry: {
        type: "Point",
        coordinates: [91.791192, 22.460625]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 9,
        Point_Name: "Botanical Garden Field",
        Category: "Open Space",
        Description: "Open field area within the Botanical Garden.",
        Latitude: 22.460444,
        Longitude: 91.790378
      },
      geometry: {
        type: "Point",
        coordinates: [91.790378, 22.460444]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 10,
        Point_Name: "Botanical Garden Pond",
        Category: "Water Feature",
        Description: "Pond location within the Botanical Garden.",
        Latitude: 22.4604886,
        Longitude: 91.7887035
      },
      geometry: {
        type: "Point",
        coordinates: [91.7887035, 22.4604886]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 11,
        Point_Name: "Central Garden Structure",
        Category: "Facility",
        Description: "Built facility located near the central path of the Botanical Garden.",
        Latitude: 22.4604724,
        Longitude: 91.7901066
      },
      geometry: {
        type: "Point",
        coordinates: [91.7901066, 22.4604724]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 12,
        Point_Name: "Southern Stream Bend",
        Category: "Water Channel",
        Description: "Distinct bend along the stream in the southern Botanical Garden area.",
        Latitude: 22.4600084,
        Longitude: 91.7904458
      },
      geometry: {
        type: "Point",
        coordinates: [91.7904458, 22.4600084]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 13,
        Point_Name: "Southern Open Field",
        Category: "Open Space",
        Description: "Open field located in the southern section of the Botanical Garden area.",
        Latitude: 22.4600464,
        Longitude: 91.7908787
      },
      geometry: {
        type: "Point",
        coordinates: [91.7908787, 22.4600464]
      }
    },
    {
      type: "Feature",
      properties: {
        Point_ID: 14,
        Point_Name: "Winding Stream Observation Point",
        Category: "Water Channel",
        Description: "Observation point beside the winding stream in the southern Botanical Garden area.",
        Latitude: 22.4594814,
        Longitude: 91.7909176
      },
      geometry: {
        type: "Point",
        coordinates: [91.7909176, 22.4594814]
      }
    }
  ]
};

export function createBotanicalGardenDemoDataset(): SpatialDataset {
  const report = validateGeoJSON(BOTANICAL_GARDEN_GEOJSON as any);
  return normalizeDataset(BOTANICAL_GARDEN_GEOJSON as any, {
    id: 'demo_botanical_garden_group6',
    name: 'Group 6 Botanical Garden Survey (CU)',
    sourceFormat: 'geojson',
    originalFileName: 'Group6_Botanical_Garden_Final_14_Points.geojson',
    fileSizeBytes: 6398,
    detectedCrs: 'EPSG:4326 (WGS 84)',
    validationReport: report
  });
}
