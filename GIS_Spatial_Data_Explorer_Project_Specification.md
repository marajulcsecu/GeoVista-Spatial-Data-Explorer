# GIS Spatial Data Explorer

## Project Specification

**Document type:** Product and Feature Specification  
**Status:** Initial implementation specification  
**Primary platform:** Modern web browser  
**Optional future platform:** Ubuntu desktop package using the same web codebase  
**Reference dataset:** Group 6 Botanical Garden GPS survey, University of Chittagong  

---

## 1. Project Summary

GIS Spatial Data Explorer is a polished, interactive geospatial data viewer that allows a user to upload common GIS files and immediately inspect the spatial features on a map.

The application must accept GeoJSON, a complete zipped Shapefile dataset, and coordinate-based CSV files. All supported input formats must be converted to one internal GeoJSON representation before rendering. The application must display feature geometry, labels, categories, attributes, validation findings, measurements, and dataset statistics through a responsive and visually refined interface.

The Botanical Garden point dataset is the first demonstration dataset, but the application must be reusable. The implementation must not be hardcoded only for the 14 Botanical Garden points.

---

## 2. Product Goals

The application should:

1. Make GIS files easy to open without requiring QGIS.
2. Display Point, LineString, Polygon, and corresponding multi-geometries when present.
3. Preserve and display feature attributes from uploaded files.
4. Explain invalid or incomplete input instead of failing silently.
5. Provide useful GIS interaction tools such as distance and area measurement.
6. Provide smooth, purposeful animation and a modern presentation suitable for a university demonstration.
7. Work with the Group 6 Botanical Garden Shapefile, GeoJSON, and CSV datasets and produce equivalent map results for all three.
8. Keep all uploaded data local to the browser unless a future backend is explicitly introduced.

---

## 3. Non-Goals for the Initial Version

The initial product is not intended to be:

- A complete replacement for QGIS or ArcGIS.
- A full GIS editing suite.
- A spatial database administration tool.
- A multi-user collaboration platform.
- A routing engine.
- A remote cloud data catalog.
- A cadastral or survey-grade measurement system.
- A system that silently guesses or changes an unknown coordinate reference system.

These capabilities may be considered later, but they must not complicate the first reliable version.

---

## 4. Intended Users

### 4.1 Primary User

A student or instructor who wants to upload a spatial dataset and inspect it interactively without manually configuring a desktop GIS project.

### 4.2 Secondary User

A developer or GIS learner who wants to verify geometry, attributes, coordinate order, category values, and basic measurements.

### 4.3 User Skill Assumption

The interface should not assume advanced GIS knowledge. When GIS-specific concepts are necessary, the application should show short explanations, such as:

- GeoJSON coordinates use `[longitude, latitude]` order.
- A Shapefile is a group of related files rather than a single `.shp` file.
- A missing `.prj` file means the CRS may be unknown.
- Measurements are approximate and depend on valid spatial coordinates.

---

## 5. Recommended Product Name

Working name:

**GeoVista: Spatial Data Explorer**

The name may be changed without affecting this specification.

Suggested subtitle:

> Upload, validate, explore, measure, and export spatial data.

---

## 6. Core User Journey

1. The user opens the application and sees an empty interactive map with an upload panel.
2. The user drags a supported file into the upload area or selects it using a file picker.
3. The application detects the file type.
4. The application parses the data locally.
5. The application validates the file structure, geometry, attributes, and coordinates.
6. If CSV is uploaded, the application detects or asks the user to map longitude, latitude, label, category, and description columns.
7. The parsed data is normalized to a GeoJSON `FeatureCollection`.
8. The application displays a validation summary before or alongside rendering.
9. The map smoothly fits the dataset extent.
10. Features appear with a short staggered reveal animation.
11. The user clicks a feature to inspect all properties.
12. The user searches, filters, changes styles, measures distance or area, and switches basemaps.
13. The user may download normalized GeoJSON, cleaned CSV when applicable, or a map image.
14. The user may clear the dataset and upload another file.

---

## 7. Supported Input Formats

### 7.1 GeoJSON

Accepted extensions:

- `.geojson`
- `.json`

Expected top-level structures:

- `FeatureCollection`
- A single `Feature`, which the application should wrap in a `FeatureCollection`

Supported geometry types:

- `Point`
- `MultiPoint`
- `LineString`
- `MultiLineString`
- `Polygon`
- `MultiPolygon`
- `GeometryCollection`, if the map engine and normalizer can process it safely

The application must preserve the `properties` object of every feature.

### 7.2 Zipped Shapefile

Accepted extension:

- `.zip`

Expected files inside the ZIP:

- `.shp` for geometry, required
- `.dbf` for attributes, strongly expected
- `.shx` for index, expected
- `.prj` for coordinate reference system, strongly expected
- `.cpg` for text encoding, optional but recommended

All related components must normally share the same base filename.

Example:

```text
Group6_Botanical_Garden_Points.shp
Group6_Botanical_Garden_Points.dbf
Group6_Botanical_Garden_Points.shx
Group6_Botanical_Garden_Points.prj
Group6_Botanical_Garden_Points.cpg
```

If a lone `.shp` file is selected, the interface should explain that attributes and CRS may be unavailable and request a complete ZIP. Lone `.shp` upload is not required for the first version.

If a ZIP contains multiple shapefiles, the application should either:

1. Create one application layer for each shapefile, or
2. Show a dataset selection screen before rendering.

The implementation must not merge unrelated shapefiles automatically.

### 7.3 Coordinate CSV

Accepted extension:

- `.csv`

Minimum required semantic fields:

- Longitude
- Latitude

Recommended fields for the Group 6 dataset:

```text
Point_ID
Point_Name
Category
Description
Latitude
Longitude
```

The importer should recognize common case-insensitive header variations including:

```text
longitude, lon, lng, x
latitude, lat, y
point_name, name, title, label
category, type, class
Description, description, details, remarks
```

If automatic detection is uncertain, show a column-mapping dialog. Never silently swap coordinate columns.

CSV coordinate validation rules:

- Latitude must be numeric and between `-90` and `90`.
- Longitude must be numeric and between `-180` and `180`.
- Blank coordinate rows are invalid.
- A blank name is allowed only if the application generates a display fallback such as `Feature 12`.
- Invalid rows must be reported with their original row number.
- The user should be able to continue with valid rows or cancel the import.

CSV coordinates are assumed to be WGS 84 decimal degrees only after the user confirms that assumption or the source is explicitly known.

---

## 8. Internal Data Model

All importers must convert input into a common internal model based on GeoJSON.

```ts
interface SpatialDataset {
  id: string;
  name: string;
  sourceFormat: "geojson" | "shapefile" | "csv";
  originalFileName: string;
  featureCollection: GeoJSON.FeatureCollection;
  detectedCrs?: string;
  warnings: ValidationMessage[];
  errors: ValidationMessage[];
  style: LayerStyleConfig;
  visible: boolean;
  opacity: number;
}
```

Every feature should receive a stable internal identifier even if the source has no ID.

```ts
interface NormalizedFeatureProperties {
  __internalId: string;
  __displayName: string;
  [key: string]: unknown;
}
```

The normalizer must not remove original user properties. Internal fields should use a clear reserved prefix such as `__`.

---

## 9. Coordinate Reference System Rules

1. GeoJSON input is expected to use WGS 84 longitude/latitude coordinates.
2. A zipped Shapefile should use its `.prj` file when present.
3. If the Shapefile parser converts projected coordinates to WGS 84, the normalized output must record that transformation in dataset metadata.
4. If a Shapefile has no `.prj`, display a warning that the CRS is unknown.
5. The application must not pretend an unknown CRS is WGS 84 without user confirmation.
6. The coordinate display should identify the output as longitude and latitude.
7. GeoJSON coordinate order must be treated as `[longitude, latitude]`.
8. Invalid or impossible coordinates must not be placed on the map.

---

## 10. Main User Interface

### 10.1 Application Layout

Recommended desktop layout:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Logo / Product Name      Upload   Export   Theme   Help              │
├───────────────────┬───────────────────────────────────┬──────────────┤
│ Layers            │                                   │ Inspector    │
│ Search            │                                   │              │
│ Categories        │          Interactive Map          │ Properties   │
│ Validation        │                                   │ Coordinates  │
│ Dataset Summary   │                                   │ Actions      │
├───────────────────┴───────────────────────────────────┴──────────────┤
│ CRS | Cursor coordinates | Feature count | Measurement result       │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.2 Responsive Behaviour

- Desktop: persistent left layer panel and optional right feature inspector.
- Tablet: collapsible panels.
- Mobile: map-first interface with bottom sheets or drawers.
- The map must resize correctly when panels open or close.

### 10.3 Visual Design

- Modern, clean, academic-professional appearance.
- Support light and dark themes.
- Use accessible contrast.
- Avoid excessive decoration that hides geospatial content.
- Use subtle motion, rounded panels, consistent spacing, and readable typography.
- Map controls should have tooltips and keyboard focus states.

---

## 11. Upload Experience

The upload component must support:

- Drag and drop.
- File picker.
- Clear accepted-format text.
- File-size display.
- Parsing state.
- Success state.
- Structured errors and warnings.
- Retry and clear actions.

Suggested empty state text:

> Drop a GeoJSON, coordinate CSV, or zipped Shapefile here.

Suggested Shapefile helper text:

> ZIP the matching `.shp`, `.dbf`, `.shx`, `.prj`, and optional `.cpg` files together.

No uploaded data should be sent to a server in the initial version.

---

## 12. Map Rendering

### 12.1 Basemap

The application should offer at least:

- A street basemap.
- A light basemap.
- A dark basemap.
- An optional satellite basemap only if licensing and access requirements are satisfied.

The basemap attribution must always remain visible.

### 12.2 Geometry Rendering

#### Point

- Render as circles or symbols.
- Use category-based colors when a meaningful categorical field exists.
- Provide an outline for contrast.
- Support hover and selected states.

#### LineString

- Render with configurable color, width, and opacity.
- Highlight on hover and selection.

#### Polygon

- Render with fill color, outline color, and adjustable opacity.
- Keep the basemap visible beneath polygon fills.

### 12.3 Automatic Extent

After successful upload:

- Calculate the dataset bounding box.
- Smoothly fit the map to the dataset with padding.
- Avoid an excessive zoom level for a single point.
- Provide a `Zoom to Layer` action for every layer.

### 12.4 Labels

The application should automatically look for a suitable label property using this preference order:

1. `Point_Name`
2. `name`
3. `Name`
4. `title`
5. `label`
6. Generated fallback

The user must be able to:

- Turn labels on or off.
- Select another label field.
- Change label size.
- Change label color.
- Enable a halo or outline.

Labels should not be permanently forced at a zoom level where they become unreadable.

---

## 13. Dynamic Styling and Legend

### 13.1 Categorized Styling

If a `Category`-like field is detected:

- List all unique values.
- Assign distinct colors.
- Build an interactive legend.
- Show the number of features in each category.
- Allow category visibility toggling.
- Allow category color customization.

For the Group 6 Botanical Garden dataset, expected categories include:

- Administration
- Entrance
- Facility
- Open Space
- Recreation
- Road
- Terrain Feature
- Vegetation
- Viewpoint
- Water Channel
- Water Feature

The implementation must still work with entirely different category values.

### 13.2 Single Style

If no useful category field exists, use a clear default style and allow the user to choose a field for categorized styling.

### 13.3 Layer Controls

For each layer provide:

- Show or hide.
- Opacity slider.
- Zoom to extent.
- Rename display title.
- Remove layer.
- Change style mode.
- View metadata.

---

## 14. Feature Inspection

Clicking a feature must open a popup or side inspector containing:

- Display name.
- Geometry type.
- All original properties.
- Longitude and latitude for points.
- Calculated centroid for non-point geometry, clearly labelled as calculated.
- Copy-coordinate action.
- Zoom-to-feature action.
- Highlight state on the map.

Properties must be rendered generically. Do not hardcode only the Botanical Garden fields.

For the reference dataset, the inspector should present fields such as:

```text
Point_ID
Point_Name
Category
Description or Descriptio
Latitude
Longitude
```

Because Shapefile attribute names may be truncated, the interface should display the actual imported field name and may optionally map known truncated names to a friendly display label without changing source data.

---

## 15. Search and Filtering

### 15.1 Search

The search tool should:

- Search across string and numeric properties.
- Update results while typing.
- Show feature name and matching field.
- Fly to and select a chosen result.
- Work across multiple uploaded layers.

### 15.2 Category Filter

- Allow category checkboxes.
- Support `Select all` and `Clear all`.
- Update map and visible feature count immediately.
- Preserve hidden category state until reset.

### 15.3 Attribute Filter

Nice-to-have for the first polished version:

- Field selector.
- Operators such as equals, contains, greater than, and less than.
- Multiple filters combined using AND.

---

## 16. Attribute Table

Provide a table view linked to the map.

Required behaviour:

- One row per feature.
- Sortable columns.
- Column visibility controls.
- Text filter.
- Row click selects and zooms to the feature.
- Map selection highlights the corresponding row.
- Show total and filtered feature counts.
- Support horizontal scrolling for wide schemas.
- Preserve original values.

Optional enhancement:

- Export visible or filtered records as CSV.

---

## 17. Measurement Tools

### 17.1 Distance Measurement

The user should be able to:

1. Activate distance mode.
2. Click multiple map positions.
3. See segment distances.
4. See cumulative distance.
5. Finish the measurement using double-click or a finish action.
6. Clear the measurement.

Supported display units:

- metres
- kilometres

Optional:

- feet
- miles

### 17.2 Area Measurement

The user should be able to draw a polygon and view:

- Area.
- Perimeter.

Supported display units:

- square metres
- hectares
- square kilometres

### 17.3 Measurement Accuracy Notice

Measurement results should be presented as approximate. The application should warn when source CRS information is missing or coordinates appear invalid.

### 17.4 Measurement Export

Nice-to-have:

- Download completed measurement geometry as GeoJSON.

---

## 18. Coordinate Tools

Required:

- Show current cursor longitude and latitude in the status bar.
- Click to copy coordinates.
- Display point coordinates in the feature inspector.
- Accept an entered longitude and latitude and fly to that location.

Optional:

- Decimal degrees to DMS conversion.
- DMS to decimal degrees conversion.
- Add a temporary coordinate marker.

---

## 19. Dataset Summary and Statistics

After import, show:

- Dataset name.
- Source format.
- Feature count.
- Geometry type counts.
- Detected CRS or CRS warning.
- Bounding box.
- Attribute field count.
- Category count when applicable.
- Valid and invalid CSV row counts.
- Duplicate ID count when an ID-like field exists.
- Exact duplicate coordinate count for points.

Do not claim duplicate physical locations solely because two points are geographically close. Near-duplicate detection may be a warning with a configurable threshold, not an automatic deletion rule.

---

## 20. Validation and Error Handling

### 20.1 Severity Levels

Use three levels:

- Error: import cannot safely continue.
- Warning: import may continue, but the user should review an issue.
- Information: useful metadata or normalization notice.

### 20.2 GeoJSON Validation

Detect:

- Invalid JSON.
- Unsupported top-level structure.
- Missing geometry.
- Invalid coordinate arrays.
- Unsupported geometry.
- Empty feature collection.
- Coordinates outside valid longitude/latitude range.

### 20.3 Shapefile ZIP Validation

Detect:

- ZIP cannot be read.
- No `.shp` file.
- Missing `.dbf` warning.
- Missing `.shx` warning.
- Missing `.prj` warning.
- Mismatched base filenames.
- Multiple shapefiles.
- Empty dataset.
- Parsing or encoding failure.

### 20.4 CSV Validation

Detect:

- Empty file.
- Missing header row.
- Missing coordinate fields.
- Non-numeric coordinate value.
- Blank coordinates.
- Out-of-range latitude or longitude.
- Duplicate IDs.
- Exact duplicate coordinates.
- Completely empty row.

### 20.5 Error Presentation

Errors must:

- Use human-readable language.
- Identify the affected file, layer, feature, or CSV row where possible.
- Explain a practical correction.
- Never show only a raw stack trace to the user.
- Remain available in a validation panel after import.

---

## 21. Animation and Interaction Design

Animation should improve orientation and feedback, not distract from the map.

Required motion:

- Smooth map fly-to after import.
- Short fade or staggered reveal for newly loaded features.
- Selected point pulse or halo.
- Smooth inspector and sidebar transitions.
- Animated category filter transitions.
- Loading indicator during parsing.

Optional motion:

- Animated drawing of line features.
- Play/pause route animation.
- Time slider for datasets with a reliable time field.
- Intro tour for demonstration mode.

Motion accessibility:

- Respect the operating system's reduced-motion preference.
- Provide a reduced-motion mode.
- Do not continuously animate every marker.

---

## 22. Export Features

### 22.1 Normalized GeoJSON

The user should be able to download the currently loaded or filtered dataset as valid GeoJSON.

The export should:

- Preserve original properties.
- Use WGS 84 longitude/latitude coordinates.
- Include only visible features if the user explicitly selects `Export visible features`.
- Use a meaningful filename.

### 22.2 CSV Export

For point datasets, allow export to CSV with:

- All selected properties.
- Longitude.
- Latitude.

For non-point datasets, CSV export is optional or should use calculated centroid fields with clear names.

### 22.3 Map Image

Provide a map image export if technically reliable.

The image should include:

- Current map extent.
- Visible layers.
- Visible labels.
- Required attribution.

A complete print-layout designer is not required.

### 22.4 Project State

Optional:

Download and reload a lightweight project-state JSON containing:

- Layer names.
- Visibility.
- Opacity.
- Styles.
- Filters.
- Current map view.

The project state should not embed large source files unless explicitly designed to do so.

---

## 23. Demo Mode for the Group 6 Dataset

The repository should include a sample/demo action that loads the Group 6 Botanical Garden GeoJSON.

Expected demo result:

- 14 point features.
- Automatic fit to the Botanical Garden survey extent.
- Category-based colors.
- Point name labels.
- Search for `Botanical Garden Main Gate`.
- Attribute inspection showing ID, name, category, description, latitude, and longitude.
- Distance measurement between selected locations.
- Category filtering.
- Download of normalized GeoJSON.

The sample data must remain replaceable. Production import logic must not depend on exactly 14 features or the Botanical Garden field names.

---

## 24. Accessibility

The interface should:

- Support keyboard navigation for all major controls.
- Show visible focus indicators.
- Provide labels for icon-only buttons.
- Use accessible color contrast.
- Avoid relying only on color to indicate selection or validation severity.
- Support reduced motion.
- Provide text equivalents for feature count and validation results.
- Keep map attribution readable.

---

## 25. Privacy and Security Requirements

1. Parse files locally in the browser for the initial version.
2. Do not upload user files to an external server.
3. Do not execute scripts or HTML embedded in feature properties.
4. Escape all property values before rendering them in popups or tables.
5. Limit accepted file types.
6. Apply a configurable file-size limit.
7. Handle malformed ZIP and JSON files safely.
8. Prevent prototype pollution when copying arbitrary property objects.
9. Do not expose stack traces or internal filesystem details in user-facing errors.
10. Display a clear notice that uploaded files remain local to the current session.

---

## 26. Performance Expectations

The application should remain responsive for the small Group 6 dataset and reasonably sized classroom datasets.

Implementation expectations:

- Parse large files without freezing the interface when practical.
- Use Web Workers for expensive parsing if needed.
- Avoid creating thousands of individual DOM markers; prefer map-engine layers.
- Cluster large point datasets at lower zoom levels when enabled.
- Virtualize large attribute tables.
- Debounce search and filter input.
- Remove map sources, layers, listeners, and object URLs when a dataset is cleared.

No fixed maximum feature count is mandated in this specification. The implementation should show an informative warning if a file is too large for safe client-side processing.

---

## 27. Recommended Technical Direction

This section is a recommendation, not a mandatory product requirement.

### Application stack

- React
- TypeScript
- Vite
- MapLibre GL JS
- `shpjs` for zipped Shapefile conversion
- Papa Parse for CSV
- Turf modules for spatial calculations
- Zod or equivalent schema validation
- Zustand or equivalent lightweight state management
- Framer Motion or CSS motion for interface transitions

### Optional Ubuntu desktop packaging

Use Tauri after the web application is stable. The desktop version should reuse the web UI and parsing code rather than becoming a separate implementation.

---

## 28. Suggested Application Modules

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── store.ts
├── components/
│   ├── FileDropzone.tsx
│   ├── LayerPanel.tsx
│   ├── FeatureInspector.tsx
│   ├── AttributeTable.tsx
│   ├── Legend.tsx
│   ├── ValidationPanel.tsx
│   ├── SearchPanel.tsx
│   └── MeasureToolbar.tsx
├── map/
│   ├── MapView.tsx
│   ├── mapLayers.ts
│   ├── mapStyles.ts
│   ├── labelRules.ts
│   ├── animations.ts
│   └── measurements.ts
├── importers/
│   ├── detectFormat.ts
│   ├── importGeoJSON.ts
│   ├── importShapefileZip.ts
│   ├── importCSV.ts
│   └── normalizeDataset.ts
├── validation/
│   ├── validateGeoJSON.ts
│   ├── validateShapefile.ts
│   ├── validateCSV.ts
│   └── validationTypes.ts
├── export/
│   ├── exportGeoJSON.ts
│   ├── exportCSV.ts
│   └── exportMapImage.ts
├── types/
│   └── spatial.ts
└── utils/
    ├── coordinates.ts
    ├── categories.ts
    ├── sanitization.ts
    └── fileNames.ts
```

---

## 29. Functional Acceptance Criteria

The product is functionally acceptable when all of the following are true.

### Upload and parsing

- A valid GeoJSON file can be uploaded and rendered.
- A ZIP containing the Group 6 Shapefile components can be uploaded and rendered.
- The Group 6 CSV can be uploaded using `Longitude` as X and `Latitude` as Y.
- Invalid files show understandable errors.
- Missing Shapefile components show appropriate warnings.

### Data equivalence

- Group 6 GeoJSON, Shapefile ZIP, and CSV each render the same 14 survey locations.
- Important attributes are available after all three imports.
- The Shapefile import includes DBF attributes.
- Features appear in the expected geographic area.

### Map interaction

- The map automatically fits the uploaded dataset.
- Zoom, pan, and basemap switching work.
- Clicking a feature opens its details.
- The selected feature is visibly highlighted.
- Labels can be turned on and off.
- Category colors and legend agree.

### Search and filters

- A user can find a feature by name.
- Selecting a search result zooms to the feature.
- Category filtering updates the map and feature count.

### Measurement

- The user can measure a multi-segment distance.
- The user can measure polygon area.
- Measurements can be cleared.
- Units are clearly displayed.

### Table

- A linked attribute table is available.
- Rows can be sorted and filtered.
- Selecting a row selects the map feature.

### Export

- The user can download normalized GeoJSON.
- Point data can be exported to CSV.
- Exported data preserves the visible feature properties.

### Usability

- The interface works on a typical laptop display.
- Loading, success, warning, error, and empty states are visually distinct.
- Controls have labels or tooltips.
- Reduced-motion preference is respected.

---

## 30. Quality Expectations for AI-Agent Implementation

An AI coding agent implementing this specification must:

1. Avoid hardcoding the map only for the Botanical Garden dataset.
2. Use TypeScript types for dataset, feature, validation, and layer state.
3. Separate parsing, normalization, validation, map rendering, and UI concerns.
4. Include defensive handling for malformed user files.
5. Sanitize all uploaded property values before UI rendering.
6. Preserve original attributes.
7. Use reusable components rather than one oversized page component.
8. Provide clear README instructions for local execution.
9. Include sample Group 6 data only as demo data.
10. Include automated tests for parsers, coordinate validation, CSV mapping, and key UI state where practical.
11. Avoid fake backend APIs when all parsing is local.
12. Avoid placeholder buttons that appear functional but do nothing.
13. Mark optional or unfinished features explicitly rather than silently omitting behaviour.

---

## 31. Definition of the First Complete Version

The first complete version includes:

- Responsive application shell.
- Interactive map.
- GeoJSON upload.
- Zipped Shapefile upload.
- Coordinate CSV upload with column mapping.
- Internal GeoJSON normalization.
- Validation panel.
- Point, line, and polygon rendering.
- Feature inspector.
- Labels.
- Category styling and interactive legend.
- Search.
- Category filter.
- Attribute table.
- Distance measurement.
- Area measurement.
- Cursor coordinates.
- Basemap switcher.
- Layer visibility and opacity.
- Smooth import and selection animation.
- Normalized GeoJSON export.
- Point CSV export.
- Light and dark interface themes.
- Group 6 demo dataset.

The following may remain optional after the first complete version:

- Ubuntu desktop packaging.
- Map image export.
- Multiple Shapefiles in one ZIP.
- Time animation.
- Editable feature geometry.
- Project-state import and export.
- Offline basemap packaging.

---

## 32. Demonstration Script

A polished demonstration can follow this sequence:

1. Open the empty application.
2. Show the accepted file formats and local-processing notice.
3. Upload the Group 6 zipped Shapefile.
4. Show successful parsing, CRS information, 14 features, and attributes.
5. Allow the map to animate to the Botanical Garden extent.
6. Turn point labels on.
7. Click `Botanical Garden Main Gate` and show its details.
8. Search for another feature.
9. Hide and restore a category from the legend.
10. Open the attribute table and select a row.
11. Measure a distance between two locations.
12. Measure an area using a temporary polygon.
13. Change the basemap and theme.
14. Download normalized GeoJSON.
15. Clear the map.
16. Upload the GeoJSON version and show the equivalent result.
17. Optionally upload the CSV and confirm the longitude/latitude mapping.

---

## 33. Final Product Principle

The product should feel like a focused, reliable GIS viewer rather than a collection of disconnected demo buttons.

Every major feature should support one of four user needs:

1. **Import** spatial data safely.
2. **Understand** geometry and attributes.
3. **Explore** the data interactively.
4. **Measure or export** useful results.

If a feature does not support one of these goals, it should not distract from the primary workflow.
