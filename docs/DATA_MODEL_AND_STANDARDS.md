# Data Model & Spatial Standards Specification

## 1. Internal Spatial Data Model

Every ingested spatial file (whether GeoJSON, Zipped Shapefile, or Coordinate CSV) is parsed and transformed into a unified TypeScript interface: `SpatialDataset`.

```typescript
export interface SpatialDataset {
  id: string;                         // UUID or nanoid
  name: string;                       // Clean display name (derived from filename)
  sourceFormat: "geojson" | "shapefile" | "csv";
  originalFileName: string;
  fileSizeBytes: number;
  
  // Normalized GeoJSON Data
  featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry, NormalizedFeatureProperties>;
  
  // Spatial Extent & CRS
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  detectedCrs?: string;                   // E.g., 'EPSG:4326 (WGS 84)' or 'WGS 84 / UTM zone 46N'
  crsWarning?: string;                    // If missing .prj or assumed default
  
  // Attribute & Category Metadata
  attributeSchema: AttributeFieldMeta[];  // List of fields, types, and sample values
  categories: CategoryMeta[];             // Extracted categories, counts, and assigned colors
  primaryCategoryField?: string;          // Auto-detected categorical column (e.g. 'Category', 'type')
  primaryLabelField?: string;             // Auto-detected label column (e.g. 'Point_Name', 'name')
  
  // Validation Diagnostics
  validationReport: ValidationReport;     // Structured Errors, Warnings, and Info notes
  
  // Layer Display State
  style: LayerStyleConfig;
  visible: boolean;
  opacity: number;
  createdAt: number;
}
```

---

## 2. Normalized Feature Properties

To maintain pristine separation between user-supplied raw data and UI metadata, all internal application fields use double-underscore prefixes (`__*`). Original properties are strictly preserved:

```typescript
export interface NormalizedFeatureProperties {
  // Reserved Internal Metadata
  __internalId: string;           // Stable unique identifier (e.g. 'feat_0', 'feat_1')
  __displayName: string;          // Auto-resolved label fallback (e.g. 'Botanical Garden Main Gate' or 'Feature #1')
  __datasetId: string;            // Reference to parent dataset
  __category?: string;            // Resolved category value for symbology
  __formattedCoords?: string;     // Formatted Longitude, Latitude string
  __geometryType: string;         // 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' etc.
  
  // Dynamic User Properties (sanitized for XSS)
  [userKey: string]: unknown;
}
```

---

## 3. Coordinate Reference System (CRS) & Projection Rules

1. **GeoJSON Standard (RFC 7946)**:
   - GeoJSON specifications mandate WGS 84 (`EPSG:4326`) coordinate reference system.
   - Coordinate order is strictly **`[longitude, latitude]`** (X, Y).
   - Longitudes must lie within `[-180.0, 180.0]`.
   - Latitudes must lie within `[-90.0, 90.0]`.

2. **Zipped Shapefiles**:
   - `shpjs` parses coordinates from binary `.shp` records and reads `.prj` strings to reproject projected coordinate systems (e.g. UTM) into `EPSG:4326` decimal degrees.
   - If a `.prj` file is present, its WKT string is analyzed and recorded in `detectedCrs`.
   - If a `.prj` file is missing, the importer displays a **Warning**: `"No .prj coordinate reference system file found in ZIP. Coordinates assumed to be WGS 84 decimal degrees."`

3. **Coordinate CSV Files**:
   - Longitude and Latitude columns are mapped and validated.
   - If values lie between `[-180, 180]` and `[-90, 90]`, they are treated as WGS 84 decimal degrees.
   - The user is notified of coordinate assumptions in the validation panel.

---

## 4. Input Format Validation Rules

### 4.1 GeoJSON Validation

| Check | Severity | Action / Rule |
|---|---|---|
| Valid JSON syntax | Error | Abort with syntax error message and line hint |
| Root structure | Error | Must be `FeatureCollection` or single `Feature` (auto-wrapped into FeatureCollection) |
| Empty FeatureCollection | Warning | Flag as empty; map will show warning notice |
| Valid geometry type | Error/Warning | Must be Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon, GeometryCollection |
| Coordinate Bounds | Error | Filter out features whose coordinates fall outside `[-180, 180]` and `[-90, 90]` |
| Missing properties | Info | Assign empty object `{}` and generate `Feature #N` label |

### 4.2 Zipped Shapefile Validation

| Check | Severity | Action / Rule |
|---|---|---|
| Valid ZIP container | Error | Abort if ZIP buffer is corrupt |
| Required `.shp` file | Error | Abort if no `.shp` file is found |
| Required `.dbf` file | Warning | If missing, geometry renders but properties are unavailable |
| Required `.shx` file | Warning | If missing, indexing warning displayed |
| Coordinate `.prj` file| Warning | If missing, warn that CRS is unverified WGS 84 |
| Filename matching | Warning | Verify components share the same base name (e.g., `Group6_Points.*`) |
| Multiple Shapefiles | Info | Allow selection or load primary shapefile |

### 4.3 Coordinate CSV Validation

| Check | Severity | Action / Rule |
|---|---|---|
| Delimiter & Header detection | Error | Check RFC 4180 parsing with comma, semicolon, or tab |
| Coordinate column detection | Error / Interactive | Match common names (`longitude`, `lon`, `lng`, `x`, `latitude`, `lat`, `y`). If ambiguous, open mapping modal |
| Non-numeric coordinates | Warning | Skip invalid row, record row number and raw value |
| Missing / Blank coordinates | Warning | Skip row and record row number |
| Out of range values | Warning | Flag coordinate values > 90 lat or > 180 lon |
| Duplicate IDs | Info / Warning | Warn if ID field contains duplicate keys (e.g. two `P01` records) |
| Exact Duplicate Coordinates | Info | Warn if two points share exact identical `[lng, lat]` coordinates |

---

## 5. Field Detection Heuristics

### 5.1 Coordinate Columns (Case-insensitive)
- **Longitude (X)**: `longitude`, `long`, `lng`, `lon`, `x`, `east`, `easting`, `coord_x`, `gps_lng`
- **Latitude (Y)**: `latitude`, `lat`, `y`, `north`, `northing`, `coord_y`, `gps_lat`

### 5.2 Primary Label / Name Columns
Ordered priority:
1. `Point_Name` (Group 6 exact match)
2. `name`
3. `Name`
4. `title`
5. `Title`
6. `label`
7. `Label`
8. `Point_ID` / `id`
9. `__displayName` generated fallback (`Feature #N`)

### 5.3 Categorical Symbology Columns
Ordered priority:
1. `Category`
2. `category`
3. `Type`
4. `type`
5. `Class`
6. `class`
7. `Zone`
8. `group`

---

## 6. Color Palette & Symbology Assignment

For categorical datasets, GeoVista automatically assigns a distinct, harmonized, high-contrast HSL palette:

| Category (Sample: Group 6) | Hex Color | Symbology Role |
|---|---|---|
| **Administration** | `#3B82F6` (Electric Blue) | Institutional & management points |
| **Entrance** | `#10B981` (Emerald Green) | Gateways & primary access portals |
| **Facility** | `#F59E0B` (Amber Orange) | Utilities, restrooms, public facilities |
| **Open Space** | `#84CC16` (Lime Green) | Lawns, plazas, clearings |
| **Recreation** | `#EC4899` (Vibrant Pink) | Playgrounds, sports, seating |
| **Road** | `#6B7280` (Cool Slate) | Pavements, paths, intersections |
| **Terrain Feature** | `#8B5CF6` (Purple) | Ridges, hills, contours, geological |
| **Vegetation** | `#059669` (Forest Green) | Trees, arboretum sections, nursery |
| **Viewpoint** | `#06B6D4` (Cyan) | Scenic overlooks, observation desks |
| **Water Channel** | `#0284C7` (Sky Blue) | Streams, canals, runoff paths |
| **Water Feature** | `#2563EB` (Deep Royal Blue) | Ponds, lakes, fountains |

If more than 11 categories exist, colors are algorithmically generated using golden-ratio hue distribution (`(index * 137.508) % 360`) to maximize visual distinctness on both dark and light basemaps.
