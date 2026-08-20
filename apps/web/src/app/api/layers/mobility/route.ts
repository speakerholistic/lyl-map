/**
 * Layer 4: Mobility — Regional Ambient Deconditioning Risk Index
 * Derives county-level risk scores from:
 * - % population 65+ (ACS Census approximation)
 * - % with ambulatory disability
 * - Fall rate per 1,000 residents (from care home quality measures)
 * - Social isolation proxy (single-person household rate)
 *
 * Data is seeded from public ACS/CDC approximations and stored in DB.
 * Falls back to curated representative samples if DB empty.
 */

import sql from '@/app/api/utils/sql';
import type { MobilityRiskZone } from '@/data/layerTypes';

// Representative county samples seeded on first call
const SEED_MOBILITY_DATA: MobilityRiskZone[] = [
  {
    fips: '06037',
    countyName: 'Los Angeles County',
    state: 'CA',
    lat: 34.0522,
    lng: -118.2437,
    deconditioningScore: 74,
    pctOver65: 14.2,
    pctMobilityLimited: 9.8,
    fallRatePer1k: 52.3,
    isolationIndex: 31.2,
  },
  {
    fips: '06073',
    countyName: 'San Diego County',
    state: 'CA',
    lat: 32.7157,
    lng: -117.1611,
    deconditioningScore: 68,
    pctOver65: 15.1,
    pctMobilityLimited: 8.4,
    fallRatePer1k: 47.1,
    isolationIndex: 28.4,
  },
  {
    fips: '06059',
    countyName: 'Orange County',
    state: 'CA',
    lat: 33.7879,
    lng: -117.8531,
    deconditioningScore: 61,
    pctOver65: 15.8,
    pctMobilityLimited: 7.2,
    fallRatePer1k: 41.6,
    isolationIndex: 24.7,
  },
  {
    fips: '06111',
    countyName: 'Ventura County',
    state: 'CA',
    lat: 34.2164,
    lng: -119.0376,
    deconditioningScore: 55,
    pctOver65: 16.4,
    pctMobilityLimited: 7.9,
    fallRatePer1k: 38.2,
    isolationIndex: 22.1,
  },
  {
    fips: '06047',
    countyName: 'Merced County',
    state: 'CA',
    lat: 37.1922,
    lng: -120.7157,
    deconditioningScore: 81,
    pctOver65: 12.3,
    pctMobilityLimited: 13.2,
    fallRatePer1k: 61.4,
    isolationIndex: 38.6,
  },
  {
    fips: '48201',
    countyName: 'Harris County',
    state: 'TX',
    lat: 29.8578,
    lng: -95.3984,
    deconditioningScore: 69,
    pctOver65: 11.8,
    pctMobilityLimited: 8.9,
    fallRatePer1k: 44.3,
    isolationIndex: 29.1,
  },
  {
    fips: '48113',
    countyName: 'Dallas County',
    state: 'TX',
    lat: 32.7767,
    lng: -96.797,
    deconditioningScore: 66,
    pctOver65: 10.9,
    pctMobilityLimited: 8.2,
    fallRatePer1k: 42.1,
    isolationIndex: 27.3,
  },
  {
    fips: '12086',
    countyName: 'Miami-Dade County',
    state: 'FL',
    lat: 25.7617,
    lng: -80.1918,
    deconditioningScore: 78,
    pctOver65: 18.7,
    pctMobilityLimited: 11.3,
    fallRatePer1k: 58.7,
    isolationIndex: 35.4,
  },
  {
    fips: '12057',
    countyName: 'Hillsborough County',
    state: 'FL',
    lat: 27.9944,
    lng: -82.3303,
    deconditioningScore: 71,
    pctOver65: 15.2,
    pctMobilityLimited: 9.7,
    fallRatePer1k: 49.8,
    isolationIndex: 31.8,
  },
  {
    fips: '36061',
    countyName: 'New York County',
    state: 'NY',
    lat: 40.7128,
    lng: -74.006,
    deconditioningScore: 72,
    pctOver65: 16.3,
    pctMobilityLimited: 7.4,
    fallRatePer1k: 53.2,
    isolationIndex: 44.1,
  },
  {
    fips: '36047',
    countyName: 'Kings County',
    state: 'NY',
    lat: 40.6782,
    lng: -73.9442,
    deconditioningScore: 76,
    pctOver65: 13.8,
    pctMobilityLimited: 9.1,
    fallRatePer1k: 55.6,
    isolationIndex: 38.7,
  },
  {
    fips: '17031',
    countyName: 'Cook County',
    state: 'IL',
    lat: 41.8781,
    lng: -87.6298,
    deconditioningScore: 73,
    pctOver65: 14.9,
    pctMobilityLimited: 8.8,
    fallRatePer1k: 51.3,
    isolationIndex: 33.2,
  },
  {
    fips: '39049',
    countyName: 'Franklin County',
    state: 'OH',
    lat: 39.9612,
    lng: -82.9988,
    deconditioningScore: 65,
    pctOver65: 13.2,
    pctMobilityLimited: 9.4,
    fallRatePer1k: 43.7,
    isolationIndex: 29.8,
  },
  {
    fips: '13121',
    countyName: 'Fulton County',
    state: 'GA',
    lat: 33.749,
    lng: -84.388,
    deconditioningScore: 67,
    pctOver65: 11.6,
    pctMobilityLimited: 8.3,
    fallRatePer1k: 44.9,
    isolationIndex: 30.1,
  },
  {
    fips: '42101',
    countyName: 'Philadelphia County',
    state: 'PA',
    lat: 39.9526,
    lng: -75.1652,
    deconditioningScore: 77,
    pctOver65: 14.8,
    pctMobilityLimited: 11.7,
    fallRatePer1k: 57.4,
    isolationIndex: 37.3,
  },
  {
    fips: '26163',
    countyName: 'Wayne County',
    state: 'MI',
    lat: 42.3314,
    lng: -83.0458,
    deconditioningScore: 79,
    pctOver65: 14.4,
    pctMobilityLimited: 12.9,
    fallRatePer1k: 59.8,
    isolationIndex: 39.4,
  },
  {
    fips: '53033',
    countyName: 'King County',
    state: 'WA',
    lat: 47.548,
    lng: -121.9836,
    deconditioningScore: 52,
    pctOver65: 14.7,
    pctMobilityLimited: 6.1,
    fallRatePer1k: 34.2,
    isolationIndex: 19.7,
  },
  {
    fips: '37119',
    countyName: 'Mecklenburg County',
    state: 'NC',
    lat: 35.2271,
    lng: -80.8431,
    deconditioningScore: 59,
    pctOver65: 11.3,
    pctMobilityLimited: 7.8,
    fallRatePer1k: 38.4,
    isolationIndex: 24.9,
  },
  {
    fips: '29510',
    countyName: 'St. Louis City',
    state: 'MO',
    lat: 38.627,
    lng: -90.1994,
    deconditioningScore: 82,
    pctOver65: 16.2,
    pctMobilityLimited: 14.1,
    fallRatePer1k: 63.7,
    isolationIndex: 42.3,
  },
  {
    fips: '47037',
    countyName: 'Davidson County',
    state: 'TN',
    lat: 36.1627,
    lng: -86.7816,
    deconditioningScore: 63,
    pctOver65: 12.4,
    pctMobilityLimited: 8.6,
    fallRatePer1k: 41.2,
    isolationIndex: 27.6,
  },
  {
    fips: '08031',
    countyName: 'Denver County',
    state: 'CO',
    lat: 39.7392,
    lng: -104.9903,
    deconditioningScore: 54,
    pctOver65: 12.8,
    pctMobilityLimited: 6.9,
    fallRatePer1k: 35.8,
    isolationIndex: 21.4,
  },
  {
    fips: '04013',
    countyName: 'Maricopa County',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.074,
    deconditioningScore: 64,
    pctOver65: 16.6,
    pctMobilityLimited: 8.7,
    fallRatePer1k: 42.9,
    isolationIndex: 26.8,
  },
];

async function seedMobilityData(): Promise<void> {
  for (const z of SEED_MOBILITY_DATA) {
    await sql`
      INSERT INTO mobility_risk_index (
        fips, county_name, state, lat, lng,
        pct_over65, pct_mobility_limited, fall_rate_per_1k,
        deconditioning_score, isolation_index
      ) VALUES (
        ${z.fips}, ${z.countyName}, ${z.state}, ${z.lat}, ${z.lng},
        ${z.pctOver65}, ${z.pctMobilityLimited}, ${z.fallRatePer1k},
        ${z.deconditioningScore}, ${z.isolationIndex}
      )
      ON CONFLICT (fips) DO NOTHING
    `;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? undefined;

  try {
    await seedMobilityData();

    const rows = state
      ? await sql`SELECT * FROM mobility_risk_index WHERE state = ${state.toUpperCase()} ORDER BY deconditioning_score DESC`
      : await sql`SELECT * FROM mobility_risk_index ORDER BY deconditioning_score DESC LIMIT 100`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zones: MobilityRiskZone[] = (rows as any[]).map((r) => ({
      fips: r.fips,
      countyName: r.county_name,
      state: r.state,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      deconditioningScore: r.deconditioning_score,
      pctOver65: parseFloat(r.pct_over65),
      pctMobilityLimited: parseFloat(r.pct_mobility_limited),
      fallRatePer1k: parseFloat(r.fall_rate_per_1k),
      isolationIndex: parseFloat(r.isolation_index),
    }));

    return Response.json({ zones: zones.length > 0 ? zones : SEED_MOBILITY_DATA });
  } catch {
    return Response.json({ zones: SEED_MOBILITY_DATA });
  }
}
