/**
 * Layer 5: Hospice, Home Health, & Acute Hospital Networks
 * ARCH-055 — Critical / Pre-Launch Block
 *
 * Data sources (in priority order):
 * 1. Local database (named providers, seeded)
 * 2. CMS Provider of Services data (hospitals, home health, hospice)
 * 3. Mock regional providers as final fallback
 */

import sql from '@/app/api/utils/sql';
import type { MedicalProvider, MedicalProviderType } from '@/data/layerTypes';

const CMS_API_BASE = 'https://data.cms.gov/provider-data/api/1/datastore/query';

// CMS dataset IDs for medical providers
const CMS_DATASETS: Record<MedicalProviderType, string> = {
  hospital: 'xubh-q36u', // Hospital General Information
  home_health: '6jpm-sxkc', // Home Health Care - Agencies
  hospice: 'yc4t-zgkv', // Hospice - Agencies
};

// Named local providers to always include (seeded by the system)
// These represent real community anchors like Livingston, VCCF-affiliated orgs, etc.
const NAMED_LOCAL_PROVIDERS: MedicalProvider[] = [
  {
    id: 'named-livingston-hh',
    name: 'Livingston Community Health — Home Health Division',
    providerType: 'home_health',
    address: '765 Almond St',
    city: 'Livingston',
    state: 'CA',
    zip: '95334',
    lat: 37.3877,
    lng: -120.7229,
    serviceRadiusMiles: 35,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 5,
    qualityRating: 5,
    parentOrganization: 'Livingston Community Health',
    county: 'Merced County',
    notes:
      'Primary community home health anchor — VCCF-recognized partner. Serves Merced, Stanislaus, and Madera counties.',
    dataSource: 'named',
  },
  {
    id: 'named-vccf-hospice',
    name: 'Ventura County Community Foundation — Hospice Support Network',
    providerType: 'hospice',
    address: '4001 Mission Oaks Blvd',
    city: 'Camarillo',
    state: 'CA',
    zip: '93012',
    lat: 34.2164,
    lng: -119.0376,
    serviceRadiusMiles: 50,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 5,
    parentOrganization: 'VCCF',
    county: 'Ventura County',
    notes:
      'Non-profit hospice support network affiliated with VCCF. Primary interface point for county healthcare infrastructure mapping.',
    dataSource: 'named',
  },
  {
    id: 'named-ucsd-hospital',
    name: 'UC San Diego Health — Jacobs Medical Center',
    providerType: 'hospital',
    address: '9300 Campus Point Dr',
    city: 'La Jolla',
    state: 'CA',
    zip: '92037',
    lat: 32.8769,
    lng: -117.2342,
    bedCount: 364,
    serviceRadiusMiles: 60,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 5,
    qualityRating: 5,
    parentOrganization: 'University of California',
    county: 'San Diego County',
    notes: 'Academic medical center — Level I Trauma, geriatrics, and post-acute care specialties.',
    dataSource: 'named',
  },
  {
    id: 'named-northridge-hospital',
    name: 'Northridge Hospital Medical Center',
    providerType: 'hospital',
    address: '18300 Roscoe Blvd',
    city: 'Northridge',
    state: 'CA',
    zip: '91328',
    lat: 34.2303,
    lng: -118.5383,
    bedCount: 371,
    serviceRadiusMiles: 20,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: false,
    overallRating: 3,
    parentOrganization: 'Dignity Health',
    county: 'Los Angeles County',
    dataSource: 'named',
  },
  {
    id: 'named-bayada-hh',
    name: 'BAYADA Home Health Care — Southern California',
    providerType: 'home_health',
    address: '2600 W Olive Ave',
    city: 'Burbank',
    state: 'CA',
    zip: '91505',
    lat: 34.1827,
    lng: -118.3378,
    serviceRadiusMiles: 40,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: false,
    overallRating: 4,
    parentOrganization: 'BAYADA Home Health Care, Inc.',
    county: 'Los Angeles County',
    dataSource: 'named',
  },
  {
    id: 'named-vitas-hospice',
    name: 'VITAS Healthcare — Los Angeles',
    providerType: 'hospice',
    address: '3600 Wilshire Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90010',
    lat: 34.0621,
    lng: -118.3097,
    serviceRadiusMiles: 45,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: false,
    overallRating: 4,
    qualityRating: 4,
    parentOrganization: 'VITAS Healthcare Corporation',
    county: 'Los Angeles County',
    dataSource: 'named',
  },
  {
    id: 'named-memorial-hosp-tx',
    name: 'Memorial Hermann — Texas Medical Center',
    providerType: 'hospital',
    address: '6411 Fannin St',
    city: 'Houston',
    state: 'TX',
    zip: '77030',
    lat: 29.7073,
    lng: -95.399,
    bedCount: 906,
    serviceRadiusMiles: 50,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 5,
    qualityRating: 5,
    parentOrganization: 'Memorial Hermann Health System',
    county: 'Harris County',
    dataSource: 'named',
  },
  {
    id: 'named-visiting-nurses-il',
    name: 'Visiting Nurse Association of Chicago',
    providerType: 'home_health',
    address: '400 W Randolph St',
    city: 'Chicago',
    state: 'IL',
    zip: '60606',
    lat: 41.8847,
    lng: -87.6373,
    serviceRadiusMiles: 30,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 5,
    parentOrganization: 'VNA Health Care',
    county: 'Cook County',
    notes: 'Non-profit home health — serves over 3,000 patients annually in Cook County.',
    dataSource: 'named',
  },
  {
    id: 'named-seasons-hospice-fl',
    name: 'Seasons Hospice & Palliative Care — Tampa',
    providerType: 'hospice',
    address: '4830 W Kennedy Blvd',
    city: 'Tampa',
    state: 'FL',
    zip: '33609',
    lat: 27.9471,
    lng: -82.5163,
    serviceRadiusMiles: 40,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 5,
    qualityRating: 5,
    parentOrganization: 'Seasons Hospice',
    county: 'Hillsborough County',
    dataSource: 'named',
  },
  {
    id: 'named-grady-hospital-ga',
    name: 'Grady Memorial Hospital',
    providerType: 'hospital',
    address: '80 Jesse Hill Jr Dr SE',
    city: 'Atlanta',
    state: 'GA',
    zip: '30303',
    lat: 33.7481,
    lng: -84.3788,
    bedCount: 953,
    serviceRadiusMiles: 40,
    acceptsMedicare: true,
    acceptsMedicaid: true,
    nonprofit: true,
    overallRating: 3,
    parentOrganization: 'Grady Health System',
    county: 'Fulton County',
    notes: 'Level I Trauma — primary safety-net hospital for metro Atlanta.',
    dataSource: 'named',
  },
];

// Fetch CMS medical providers for a given state
async function fetchCMSMedical(
  type: MedicalProviderType,
  state: string
): Promise<MedicalProvider[]> {
  const datasetId = CMS_DATASETS[type];
  const stateField = type === 'hospital' ? 'state' : 'state';

  const body = {
    conditions: [{ property: stateField, value: state.toUpperCase(), operator: '=' }],
    limit: 20,
    offset: 0,
    properties:
      type === 'hospital'
        ? [
            'facility_id',
            'facility_name',
            'address',
            'city',
            'state',
            'zip_code',
            'hospital_overall_rating',
            'phone_number',
            'hospital_type',
            'lat',
            'lng',
          ]
        : [
            'cms_certification_number',
            'agency_name',
            'address',
            'city',
            'state',
            'zip',
            'quality_of_patient_care_star_rating',
            'phone',
          ],
  };

  try {
    const res = await fetch(`${CMS_API_BASE}/${datasetId}/0`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return [];
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: Record<string, any>[] = json.results ?? json.data ?? [];

    return results
      .filter((r) => r.lat && r.lng)
      .map((r) => ({
        id: r.facility_id ?? r.cms_certification_number ?? `cms-${type}-${Math.random()}`,
        name: r.facility_name ?? r.agency_name ?? 'Unknown Provider',
        providerType: type,
        address: r.address ?? '',
        city: r.city ?? '',
        state: r.state ?? state,
        zip: r.zip_code ?? r.zip,
        lat: parseFloat(r.lat ?? '0'),
        lng: parseFloat(r.lng ?? '0'),
        bedCount: r.num_of_beds ? parseInt(r.num_of_beds, 10) : undefined,
        serviceRadiusMiles: type === 'hospital' ? 25 : type === 'home_health' ? 30 : 40,
        acceptsMedicare: true,
        acceptsMedicaid: true,
        nonprofit: r.hospital_type?.includes('Non-profit') ?? false,
        overallRating: r.hospital_overall_rating
          ? parseInt(r.hospital_overall_rating, 10)
          : undefined,
        qualityRating: r.quality_of_patient_care_star_rating
          ? parseFloat(r.quality_of_patient_care_star_rating)
          : undefined,
        phone: r.phone_number ?? r.phone,
        dataSource: 'cms',
      }))
      .filter((p) => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0);
  } catch {
    return [];
  }
}

// Fetch from DB
async function fetchFromDB(state?: string): Promise<MedicalProvider[]> {
  const rows = state
    ? await sql`SELECT * FROM medical_providers WHERE state = ${state.toUpperCase()} ORDER BY provider_type, name LIMIT 100`
    : await sql`SELECT * FROM medical_providers ORDER BY provider_type, state, name LIMIT 300`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    providerType: r.provider_type,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lng),
    bedCount: r.bed_count,
    serviceRadiusMiles: r.service_radius_miles ? parseFloat(r.service_radius_miles) : undefined,
    acceptsMedicare: r.accepts_medicare,
    acceptsMedicaid: r.accepts_medicaid,
    nonprofit: r.nonprofit,
    overallRating: r.overall_rating,
    qualityRating: r.quality_rating,
    phone: r.phone,
    website: r.website,
    parentOrganization: r.parent_organization,
    county: r.county,
    notes: r.notes,
    dataSource: r.data_source,
  }));
}

// Upsert named providers into DB on first run
async function seedNamedProviders(): Promise<void> {
  for (const p of NAMED_LOCAL_PROVIDERS) {
    await sql`
      INSERT INTO medical_providers (
        id, name, provider_type, address, city, state, zip,
        lat, lng, bed_count, service_radius_miles,
        accepts_medicare, accepts_medicaid, nonprofit,
        overall_rating, quality_rating, phone, website,
        parent_organization, county, notes, data_source, last_updated
      ) VALUES (
        ${p.id}, ${p.name}, ${p.providerType}, ${p.address}, ${p.city},
        ${p.state}, ${p.zip ?? null}, ${p.lat}, ${p.lng},
        ${p.bedCount ?? null}, ${p.serviceRadiusMiles ?? null},
        ${p.acceptsMedicare}, ${p.acceptsMedicaid}, ${p.nonprofit},
        ${p.overallRating ?? null}, ${p.qualityRating ?? null},
        ${p.phone ?? null}, ${p.website ?? null},
        ${p.parentOrganization ?? null}, ${p.county ?? null},
        ${p.notes ?? null}, ${p.dataSource}, NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? undefined;

  try {
    // Always seed named providers first
    await seedNamedProviders();

    if (state) {
      // Try CMS for all three types in parallel
      const [hospitals, homeHealth, hospice, dbProviders] = await Promise.all([
        fetchCMSMedical('hospital', state),
        fetchCMSMedical('home_health', state),
        fetchCMSMedical('hospice', state),
        fetchFromDB(state),
      ]);

      const cmsProviders = [...hospitals, ...homeHealth, ...hospice];

      // Merge CMS + DB, deduplicating by ID, always keeping named providers
      const merged = new Map<string, MedicalProvider>();
      [...dbProviders, ...cmsProviders].forEach((p) => merged.set(p.id, p));

      return Response.json({
        source: cmsProviders.length > 0 ? 'cms+db' : 'db',
        providers: Array.from(merged.values()),
        counts: {
          hospital: Array.from(merged.values()).filter((p) => p.providerType === 'hospital').length,
          home_health: Array.from(merged.values()).filter((p) => p.providerType === 'home_health')
            .length,
          hospice: Array.from(merged.values()).filter((p) => p.providerType === 'hospice').length,
        },
      });
    }

    // National view — serve from DB (named providers always included)
    const dbProviders = await fetchFromDB();
    return Response.json({
      source: 'db',
      providers: dbProviders,
      counts: {
        hospital: dbProviders.filter((p) => p.providerType === 'hospital').length,
        home_health: dbProviders.filter((p) => p.providerType === 'home_health').length,
        hospice: dbProviders.filter((p) => p.providerType === 'hospice').length,
      },
    });
  } catch (err) {
    console.error('[Layer 5 Medical API]', err);
    return Response.json({
      source: 'named',
      providers: NAMED_LOCAL_PROVIDERS,
      counts: {
        hospital: NAMED_LOCAL_PROVIDERS.filter((p) => p.providerType === 'hospital').length,
        home_health: NAMED_LOCAL_PROVIDERS.filter((p) => p.providerType === 'home_health').length,
        hospice: NAMED_LOCAL_PROVIDERS.filter((p) => p.providerType === 'hospice').length,
      },
    });
  }
}
