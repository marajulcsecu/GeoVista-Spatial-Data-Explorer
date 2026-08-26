# GeoVista User & Demonstration Guide

## 1. Quick Start

Welcome to **GeoVista: Spatial Data Explorer**, a modern, client-side geospatial web application designed for fast, beautiful, and secure GIS data inspection.

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open browser at http://localhost:5173
```

---

## 2. Ingesting Spatial Datasets

GeoVista supports three primary spatial file formats. All data is processed 100% locally in your browser session.

### 2.1 GeoJSON (`.geojson`, `.json`)
- **Structure**: Drag & drop standard GeoJSON `FeatureCollection` or `Feature` files.
- **Geometries**: Supports Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon.
- **Coordinate System**: WGS 84 (`[longitude, latitude]`).

### 2.2 Zipped Shapefile (`.zip`)
- **Required Files**: Ensure your `.zip` archive contains matching files with the same base name:
  - `filename.shp` (Geometries - required)
  - `filename.dbf` (Attributes - strongly recommended)
  - `filename.shx` (Spatial index)
  - `filename.prj` (Coordinate Reference System projection)
  - `filename.cpg` (Text encoding - optional)
- **Automatic Reprojection**: If projected in UTM or another planar CRS, GeoVista automatically reprojects coordinates to WGS 84 for seamless web mapping.

### 2.3 Coordinate CSV (`.csv`)
- **Structure**: Standard CSV with coordinate columns.
- **Smart Column Detection**: Automatically detects headers like `Longitude`/`Latitude`, `lng`/`lat`, `X`/`Y`.
- **Interactive Column Mapping**: If headers are ambiguous, a dialog appears allowing you to select your Longitude, Latitude, Label, and Category columns manually.

---

## 3. Interactive Interface Walkthrough

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  [Logo] GeoVista Explorer    [⚡ Load Demo]  [💾 Export]  [🌙 Theme]  [ℹ️ Help]│
├────────────────────┬──────────────────────────────────────────┬──────────────┤
│ 📂 Layers          │                                          │ 🔍 Inspector  │
│ 🎨 Legend          │                                          │              │
│ 🛡️ Validation      │            Interactive Map               │ Feature Name │
│ 📊 Dataset Stats   │         (MapLibre GL Vector)             │ Attributes   │
│ 🔎 Search          │                                          │ Coordinates  │
├────────────────────┴──────────────────────────────────────────┴──────────────┤
│ 🌐 Attribute Table (Expandable / Sortable / Filterable / Selection Sync)     │
├──────────────────────────────────────────────────────────────────────────────┤
│ CRS: WGS 84 | Lat: 22.4721° N, Lng: 91.7892° E | 14 Features | Mode: Ready   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Layer Management & Opacity
- Toggle layer visibility on and off with one click.
- Adjust layer opacity using the slider.
- Click **Zoom to Extent** to immediately re-center the map around the dataset.

### 3.2 Dynamic Legend & Categorical Filtering
- Displays all categories detected in the dataset with distinct color swatches.
- View exact feature counts for each category.
- Uncheck individual categories or use **Select All / Clear All** to filter map features dynamically.

### 3.3 Attribute Table
- Click the **Table** button in the bottom-left or status bar to slide up the attribute grid.
- Sort any column alphabetically or numerically.
- Search and filter records in real-time.
- Click any row to automatically select and fly to the corresponding feature on the map.

### 3.4 Feature Inspector
- Click any point, line, or polygon on the map to open the right-side inspector.
- View all original properties, geometry type, formatted coordinates, and computed centroids.
- Click **Copy Coordinates** to quickly copy `[lng, lat]` or decimal degrees to your clipboard.

### 3.5 Measurement Tools
- **Distance Mode**: Click multiple locations on the map to draw a polyline. See individual segment lengths and cumulative distance in meters or kilometers. Double-click or click "Finish" to complete.
- **Area Mode**: Click to draw a polygon. See real-time calculated area in square meters, hectares, or square kilometers, along with perimeter length.

### 3.6 Basemap Switching & Theme
- Switch between **Carto Dark**, **Carto Light**, **OpenStreetMap Standard**, and **Satellite Imagery**.
- Toggle between sleek **Dark Mode** and clean **Light Mode** UI themes.

---

## 4. Step-by-Step Group 6 Demonstration Script

Follow this script for a seamless classroom or academic presentation:

1. **Launch the Application**: Open GeoVista in your browser. Notice the clean empty state and the notice stating that all data remains local and private.
2. **One-Click Demo Loading**: Click the **⚡ Load Demo Dataset** button in the top navigation bar.
3. **Automatic Extent & Staggered Reveal**: The map smoothly pans and zooms to the University of Chittagong Botanical Garden survey area (coordinates ~`22.47°N, 91.78°E`), revealing 14 color-coded survey points.
4. **Inspect Labels & Categories**: Point labels are shown (e.g. `Botanical Garden Main Gate`, `Staff Quarter`, `Nursery 1`). The left **Legend** displays 11 distinct categories.
5. **Feature Inspection**: Click on `Botanical Garden Main Gate`. The right inspector slides out displaying `Point_ID: 1`, Category: `Entrance`, Description, and coordinates.
6. **Fuzzy Search**: Open the **Search** tab and type `"Nursery"`. Click the search result to fly directly to `Nursery 1`.
7. **Category Filtering**: In the Legend tab, uncheck `Vegetation`. Notice the vegetation points disappear from both the map and the active feature count. Re-enable it to bring them back.
8. **Linked Attribute Table**: Open the bottom Attribute Table. Click on `Orchid House`. Observe the map instantly centers and pulses a high-contrast selection halo on the Orchid House point.
9. **Distance Measurement**: Activate the **Distance Tool** from the map toolbar. Click on `Botanical Garden Main Gate` and then `Research Center`. Observe the geodesic distance badge in meters.
10. **Area Measurement**: Activate the **Area Tool** and draw a triangle around three points to measure enclosed area in hectares. Clear the measurement.
11. **Basemap & Theme Toggle**: Switch to **Satellite View** to observe real vegetation canopy beneath the survey markers, then switch between Dark and Light UI themes.
12. **Validation & Diagnostics**: Click the **Validation** tab to show the clean validation report with 14 valid points, zero fatal errors, and WGS 84 CRS verification.
13. **Export**: Click **Export** ➔ **GeoJSON** to download normalized spatial data, or **Export CSV** to download a spreadsheet.
14. **Shapefile & CSV Equivalence**: Clear the dataset and drag in `Group6_Botanical_Garden_Points.zip` or `Group6_Botanical_Garden_Final_14_Points.csv` to prove all three formats yield identical map results.
