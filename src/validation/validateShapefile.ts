import type { ValidationMessage, ValidationReport } from '../types/spatial';

export function validateShapefileZip(fileNames: string[], prjContent?: string): ValidationReport {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const info: ValidationMessage[] = [];

  const shpFiles = fileNames.filter(f => f.toLowerCase().endsWith('.shp'));
  const dbfFiles = fileNames.filter(f => f.toLowerCase().endsWith('.dbf'));
  const prjFiles = fileNames.filter(f => f.toLowerCase().endsWith('.prj'));
  const shxFiles = fileNames.filter(f => f.toLowerCase().endsWith('.shx'));

  if (shpFiles.length === 0) {
    errors.push({
      id: 'err_no_shp',
      severity: 'error',
      title: 'Missing .shp Geometry File',
      message: 'The uploaded ZIP archive does not contain any ESRI .shp geometry file.'
    });
  }

  if (shpFiles.length > 1) {
    info.push({
      id: 'info_multi_shp',
      severity: 'info',
      title: 'Multiple Shapefiles in Archive',
      message: `Found ${shpFiles.length} shapefiles in the ZIP. The primary layer will be loaded.`
    });
  }

  if (shpFiles.length > 0 && dbfFiles.length === 0) {
    warnings.push({
      id: 'warn_missing_dbf',
      severity: 'warning',
      title: 'Missing .dbf Attribute Table',
      message: 'No .dbf file found in the archive. Spatial geometries will render, but feature attribute properties will be empty.'
    });
  }

  if (shpFiles.length > 0 && shxFiles.length === 0) {
    warnings.push({
      id: 'warn_missing_shx',
      severity: 'warning',
      title: 'Missing .shx Index File',
      message: 'No .shx spatial index file found. Processing may take slightly longer for large datasets.'
    });
  }

  if (prjFiles.length === 0 && !prjContent) {
    warnings.push({
      id: 'warn_missing_prj',
      severity: 'warning',
      title: 'Missing .prj Projection File',
      message: 'No .prj coordinate reference system file found in ZIP. Coordinates are assumed to be WGS 84 decimal degrees.'
    });
  } else if (prjContent) {
    info.push({
      id: 'info_detected_prj',
      severity: 'info',
      title: 'Coordinate Reference System Found',
      message: `Projection metadata detected: ${prjContent.slice(0, 80)}...`
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    totalFeatures: 0,
    validFeaturesCount: 0,
    invalidFeaturesCount: 0,
    geometryTypeCounts: {},
    duplicateCoordinatesCount: 0
  };
}
