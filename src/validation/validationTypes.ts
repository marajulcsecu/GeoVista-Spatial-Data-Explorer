export * from '../types/spatial';

export function createEmptyValidationReport(): import('../types/spatial').ValidationReport {
  return {
    isValid: true,
    errors: [],
    warnings: [],
    info: [],
    totalFeatures: 0,
    validFeaturesCount: 0,
    invalidFeaturesCount: 0,
    geometryTypeCounts: {},
    duplicateCoordinatesCount: 0,
  };
}
