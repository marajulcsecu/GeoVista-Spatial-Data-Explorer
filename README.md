# GeoVista: Spatial Data Explorer

> **Upload, validate, explore, measure, and export spatial data directly in your browser.**

**GeoVista** is a modern, high-performance, client-side geospatial web application designed for students, researchers, instructors, and GIS professionals. It allows you to drag-and-drop common GIS datasets—including **GeoJSON**, **Zipped Shapefiles**, and **Coordinate CSVs**—and instantly visualize and inspect them on an interactive vector map with zero server dependencies and 100% data privacy.

---

## 🌟 Key Features

- **🌐 Multi-Format Ingestion**:
  - **GeoJSON** (`.geojson`, `.json`): Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon.
  - **Zipped Shapefiles** (`.zip`): Complete in-browser parsing of `.shp`, `.dbf`, `.shx`, `.prj`, and `.cpg` files with automatic coordinate reprojection.
  - **Coordinate CSVs** (`.csv`): Intelligent coordinate header heuristic with interactive column mapping fallback.
- **🔒 100% Client-Side Privacy**: All parsing and validation execute locally in your browser memory. No data is transmitted to external servers.
- **🗺️ High-Performance Map Engine**:
  - Powered by **MapLibre GL JS** vector GPU rendering.
  - Multiple basemaps: **Carto Dark Matter**, **Carto Positron**, **OpenStreetMap**, and **Satellite Imagery**.
  - Dynamic categorical symbology and interactive legend with live feature counters.
  - Automatic bounding box computation with smooth fly-to animations.
  - Smart collision-aware labeling with halo outlines.
- **📊 Interactive Data Tools**:
  - **Feature Inspector**: Slide-out panel detailing all original attributes, geometry info, and one-click coordinate copy.
  - **Linked Attribute Table**: Expandable, sortable, searchable data grid with bidirectional map selection synchronization.
  - **Fuzzy Search**: Search across all attribute fields in real time with auto-zoom.
  - **Geodesic Measurement**: Multi-segment distance tool and polygon area & perimeter calculation.
  - **Coordinate Jump & DMS Converter**: Navigate directly to any latitude/longitude coordinate pair.
- **🛡️ Three-Tier Validation Diagnostics**:
  - Comprehensive report highlighting **Errors**, **Warnings**, and **Info** notices with exact row numbers and helpful remediation hints.
- **💾 Multi-Format Exports**:
  - Download cleaned, normalized GeoJSON.
  - Export point feature records to CSV.
  - High-resolution map screenshot capture.
- **🌓 Modern Aesthetic**: Sleek Dark and Light themes, glassmorphic UI panels, micro-animations, and responsive layout.
- **⚡ Group 6 Botanical Garden Demo**: Instant one-click demo loading the 14-point survey dataset from the University of Chittagong Botanical Garden.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### Installation
```bash
# Clone or navigate to the repository directory
cd Web_App_V1

# Install dependencies
npm install

# Start development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Running Tests
```bash
# Run unit & integration tests with Vitest
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📁 Repository Structure

```text
Web_App_V1/
├── docs/                                          # Comprehensive Documentation
│   ├── ARCHITECTURE.md                           # System architecture & component hierarchy
│   ├── DATA_MODEL_AND_STANDARDS.md              # Normalized schemas, CRS, and validation rules
│   ├── API_AND_MODULE_SPEC.md                   # Parser, validation, and export module contracts
│   ├── USER_GUIDE.md                            # Feature walkthrough & Group 6 demonstration script
│   └── IMPLEMENTATION_PLAN.md                   # Step-by-step implementation plan
├── src/
│   ├── app/                                     # App shell, Zustand state store, themes
│   ├── components/
│   │   ├── layout/                              # Header, Sidebar, StatusBar
│   │   ├── upload/                              # FileDropzone, CsvColumnModal
│   │   ├── panels/                              # LayerPanel, Legend, FeatureInspector, AttributeTable, Validation
│   │   └── tools/                               # MeasureToolbar, BasemapSwitcher, CoordinateFlyTo, ExportMenu
│   ├── importers/                               # Ingestion parsers (detectFormat, GeoJSON, Shapefile, CSV)
│   ├── validation/                              # Validation rules & diagnostic reports
│   ├── map/                                     # MapLibre GL engine, layers, styles, labels, measurements
│   ├── export/                                  # GeoJSON, CSV, Screenshot exporters
│   ├── types/                                   # TypeScript spatial definitions
│   └── utils/                                   # Coordinates, sanitization, palette helpers
└── tests/                                       # Unit and integration test suites
```

---

## 📖 Detailed Documentation

- 📐 [System Architecture & Design](file:///home/marajul/Desktop/GiS_Project/Web_App_V1/docs/ARCHITECTURE.md)
- 📋 [Data Models, CRS & Validation Rules](file:///home/marajul/Desktop/GiS_Project/Web_App_V1/docs/DATA_MODEL_AND_STANDARDS.md)
- 🔌 [API & Module Technical Specification](file:///home/marajul/Desktop/GiS_Project/Web_App_V1/docs/API_AND_MODULE_SPEC.md)
- 🎓 [User Guide & Group 6 Demo Script](file:///home/marajul/Desktop/GiS_Project/Web_App_V1/docs/USER_GUIDE.md)
- 📝 [Implementation Plan](file:///home/marajul/Desktop/GiS_Project/Web_App_V1/docs/IMPLEMENTATION_PLAN.md)
- 📜 [Full Project Specification](file:///home/marajul/Desktop/GiS_Project/Web_App_V1/GIS_Spatial_Data_Explorer_Project_Specification.md)

---

## 🌿 Group 6 Botanical Garden Reference Dataset

GeoVista includes built-in support for the reference GPS survey dataset conducted at the **University of Chittagong Botanical Garden**:
- **14 Survey Points** covering Administration, Entrance, Facilities, Open Space, Recreation, Roads, Terrain Features, Vegetation, Viewpoints, and Water Features.
- Equivalent map rendering and attribute preservation across **GeoJSON**, **Zipped Shapefile**, and **CSV** formats.
- Preloaded one-click demonstration accessible via the **⚡ Load Demo Dataset** button in the header.

---

## 📄 License
MIT License. Built for open GIS exploration, education, and research.
