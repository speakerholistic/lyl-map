/**
 * Approximate geographic bounding boxes for the 50 US states plus DC.
 * Used to fit the map to a state when it is selected in the state dropdown.
 */
export interface StateBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

export const STATE_BOUNDS: Record<string, StateBounds> = {
  AL: { south: 30.14, west: -88.47, north: 35.01, east: -84.89 },
  AK: { south: 51.2, west: -179.15, north: 71.39, east: -129.98 },
  AZ: { south: 31.33, west: -114.82, north: 37.0, east: -109.05 },
  AR: { south: 33.0, west: -94.62, north: 36.5, east: -89.64 },
  CA: { south: 32.53, west: -124.41, north: 42.01, east: -114.13 },
  CO: { south: 36.99, west: -109.06, north: 41.0, east: -102.04 },
  CT: { south: 40.98, west: -73.73, north: 42.05, east: -71.79 },
  DE: { south: 38.45, west: -75.79, north: 39.84, east: -75.05 },
  DC: { south: 38.79, west: -77.12, north: 38.99, east: -76.91 },
  FL: { south: 24.52, west: -87.63, north: 31.0, east: -80.03 },
  GA: { south: 30.36, west: -85.61, north: 35.0, east: -80.84 },
  HI: { south: 18.91, west: -160.25, north: 22.24, east: -154.81 },
  ID: { south: 41.99, west: -117.24, north: 49.0, east: -111.04 },
  IL: { south: 36.97, west: -91.51, north: 42.51, east: -87.5 },
  IN: { south: 37.77, west: -88.1, north: 41.76, east: -84.78 },
  IA: { south: 40.38, west: -96.64, north: 43.5, east: -90.14 },
  KS: { south: 36.99, west: -102.05, north: 40.0, east: -94.59 },
  KY: { south: 36.5, west: -89.57, north: 39.15, east: -81.96 },
  LA: { south: 28.93, west: -94.04, north: 33.02, east: -88.82 },
  ME: { south: 43.06, west: -71.08, north: 47.46, east: -66.95 },
  MD: { south: 37.91, west: -79.49, north: 39.72, east: -75.05 },
  MA: { south: 41.24, west: -73.51, north: 42.89, east: -69.93 },
  MI: { south: 41.7, west: -90.42, north: 48.31, east: -82.41 },
  MN: { south: 43.5, west: -97.24, north: 49.38, east: -89.49 },
  MS: { south: 30.17, west: -91.66, north: 35.0, east: -88.1 },
  MO: { south: 35.99, west: -95.77, north: 40.61, east: -89.1 },
  MT: { south: 44.36, west: -116.05, north: 49.0, east: -104.04 },
  NE: { south: 40.0, west: -104.05, north: 43.0, east: -95.31 },
  NV: { south: 35.0, west: -120.0, north: 42.0, east: -114.04 },
  NH: { south: 42.7, west: -72.56, north: 45.31, east: -70.6 },
  NJ: { south: 38.93, west: -75.56, north: 41.36, east: -73.89 },
  NM: { south: 31.33, west: -109.05, north: 37.0, east: -103.0 },
  NY: { south: 40.5, west: -79.76, north: 45.02, east: -71.86 },
  NC: { south: 33.84, west: -84.32, north: 36.59, east: -75.46 },
  ND: { south: 45.94, west: -104.05, north: 49.0, east: -96.55 },
  OH: { south: 38.4, west: -84.82, north: 41.98, east: -80.52 },
  OK: { south: 33.62, west: -103.0, north: 37.0, east: -94.43 },
  OR: { south: 41.99, west: -124.57, north: 46.29, east: -116.46 },
  PA: { south: 39.72, west: -80.52, north: 42.27, east: -74.69 },
  RI: { south: 41.15, west: -71.86, north: 42.02, east: -71.12 },
  SC: { south: 32.03, west: -83.35, north: 35.22, east: -78.54 },
  SD: { south: 42.48, west: -104.06, north: 45.95, east: -96.44 },
  TN: { south: 34.98, west: -90.31, north: 36.68, east: -81.65 },
  TX: { south: 25.84, west: -106.65, north: 36.5, east: -93.51 },
  UT: { south: 37.0, west: -114.05, north: 42.0, east: -109.04 },
  VT: { south: 42.73, west: -73.44, north: 45.02, east: -71.46 },
  VA: { south: 36.54, west: -83.68, north: 39.47, east: -75.24 },
  WA: { south: 45.54, west: -124.85, north: 49.0, east: -116.92 },
  WV: { south: 37.2, west: -82.64, north: 40.64, east: -77.72 },
  WI: { south: 42.49, west: -92.89, north: 47.31, east: -86.25 },
  WY: { south: 40.99, west: -111.06, north: 45.0, east: -104.05 },
};

/** Two-letter codes for every entry above (50 states + DC), alphabetical. */
export const STATE_CODES = Object.keys(STATE_BOUNDS).sort();

export function isStateCode(value: string | null | undefined): value is string {
  return !!value && Object.prototype.hasOwnProperty.call(STATE_BOUNDS, value.toUpperCase());
}
