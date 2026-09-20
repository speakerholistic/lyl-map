/**
 * Properties API — Hybrid data strategy
 *
 * CMS Provider Information dataset (4pq5-n9py) includes latitude/longitude
 * natively — zero geocoding required. Confirmed field names from CMS data dictionary.
 *
 * Strategy:
 *   State selected  → live CMS API (real-time, full state)
 *   No state filter → DB national snapshot (fast)
 *   Any failure     → mock data fallback
 */

import sql from '@/app/api/utils/sql';
import type { Property } from '@/data/mockProperties';
import mockProperties from '@/data/mockProperties';

const CMS_API = 'https://data.cms.gov/provider-data/api/1/datastore/query';
const NH_DATASET = '4pq5-n9py'; // Nursing Home Provider Information

// GET endpoint returns all columns — no need to pass a properties list.
// Field names confirmed at data.cms.gov/provider-data/dataset/4pq5-n9py

function toStatus(rating: number | null, penalties: number): 'clean' | 'warning' | 'critical' {
  if (penalties > 10 || rating === 1) return 'critical';
  if (penalties > 3 || rating === 2 || rating === 3) return 'warning';
  return 'clean';
}

function hoursToRatio(hrs: number | null): string {
  if (!hrs || hrs <= 0) return 'Not reported';
  const r = Math.round(24 / hrs);
  return `1:${Math.min(Math.max(r, 2), 15)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(r: Record<string, any>): Property | null {
  const lat = parseFloat(r.latitude ?? '');
  const lng = parseFloat(r.longitude ?? '');
  // All US states + territories: lat 17–72, lng always negative (-180 to -60)
  if (!isFinite(lat) || !isFinite(lng) || lat < 17 || lat > 72 || lng < -180 || lng > -60) {
    return null;
  }

  const stars = r.overall_rating ? parseInt(r.overall_rating, 10) : null;
  const penalties = r.total_number_of_penalties ? parseInt(r.total_number_of_penalties, 10) : 0;
  const fines = r.number_of_fines ? parseInt(r.number_of_fines, 10) : 0;
  const fineAmt = r.total_amount_of_fines_in_dollars
    ? parseFloat(r.total_amount_of_fines_in_dollars)
    : 0;
  const staffRat = r.staffing_rating ? parseInt(r.staffing_rating, 10) : null;
  const qmRat = r.qm_rating ? parseInt(r.qm_rating, 10) : null;
  const totalHrs = r.reported_total_nurse_staffing_hours_per_resident_per_day
    ? parseFloat(r.reported_total_nurse_staffing_hours_per_resident_per_day)
    : null;
  const _rnHrs = r.reported_rn_staffing_hours_per_resident_per_day
    ? parseFloat(r.reported_rn_staffing_hours_per_resident_per_day)
    : null;
  const chainSize = r.number_of_facilities_in_chain
    ? parseInt(r.number_of_facilities_in_chain, 10)
    : 1;
  const defCount = r.rating_cycle_1_total_number_of_health_deficiencies
    ? parseInt(r.rating_cycle_1_total_number_of_health_deficiencies, 10)
    : 0;

  const status = toStatus(stars, penalties);

  const defTypes: string[] = [];
  if (r.abuse_icon === 'Y') defTypes.push('Abuse Flag');
  if (r.special_focus_status === 'SFF') defTypes.push('Special Focus Facility');
  if (r.special_focus_status === 'SFF Candidate') defTypes.push('SFF Candidate');
  if (penalties > 0) defTypes.push(`${penalties} CMS Penalties`);
  if (fines > 0 && fineAmt > 0) defTypes.push(`$${fineAmt.toLocaleString()} in Fines`);
  if (defTypes.length === 0 && status !== 'clean') defTypes.push('CMS Health Deficiencies');

  const ownerChain = r.chain_name
    ? `${r.chain_name} — ${chainSize} facilities in chain`
    : (r.ownership_type ?? 'Independent Operator');

  const weekendMap: Record<number, string> = {
    1: 'Critical shortage (<50%)',
    2: 'Severely reduced (55–65%)',
    3: 'Reduced (70–80%)',
    4: 'Adequate (85–92%)',
    5: 'Full (95%+)',
  };

  // Revenue estimate from CMS national average ~$7,900/month adjusted by star rating
  const mult = stars ? 0.65 + stars * 0.1 : 0.9;
  const revenuePerBed = Math.round(7900 * mult);
  const monthlyFee = Math.round(revenuePerBed * 1.08);

  const valueScore = Math.round(
    ((stars ?? 1) / 5) * 60 + (1 - Math.min(monthlyFee / 14000, 1)) * 40
  );
  const qualityScore = qmRat ? Math.round((qmRat / 5) * 100) : 50;

  const surveyDate = r.rating_cycle_1_standard_survey_health_date ?? '';

  return {
    id: r.cms_certification_number_ccn ?? `cms-${Math.random()}`,
    name: r.provider_name ?? 'Unknown Facility',
    address: r.provider_address ?? '',
    city: r.citytown ?? '',
    state: r.state ?? '',
    zip: r.zip_code ?? '',
    lat,
    lng,
    status,
    citationCount: defCount,
    deficiencyTypes: defTypes,
    staffingRatio: hoursToRatio(totalHrs),
    cnaPattern: totalHrs ? `${totalHrs.toFixed(2)} total nurse hrs/resident/day` : 'Not reported',
    weekendCoverage: weekendMap[staffRat ?? 3] ?? 'Not reported',
    fallRate: 0,
    rehospitalizationRate: 0,
    pressureInjuryRate: 0,
    monthlyFee,
    operator: r.ownership_type ?? 'Unknown',
    ownershipChain: ownerChain,
    revenuePerBed,
    remoteMonitorRank: staffRat && staffRat >= 4 ? 'high' : staffRat === 3 ? 'medium' : 'low',
    inspectionHistory: surveyDate
      ? [
          {
            date: surveyDate,
            type: 'CMS Annual Health Inspection',
            findings:
              status === 'critical'
                ? `${defCount} health deficiencies — ${penalties} total penalties on record`
                : status === 'warning'
                  ? `${defCount} health deficiencies cited in last survey cycle`
                  : 'Survey completed — no critical findings. See CMS Care Compare for full detail.',
            severity: status === 'critical' ? 'G' : status === 'warning' ? 'D' : 'B',
          },
        ]
      : [],
    valueScore,
    qualityScore,
  } as Property;
}

async function fetchLiveCMS(state: string): Promise<Property[]> {
  // Use GET with literal brackets — same approach confirmed in sync route
  const url =
    `${CMS_API}/${NH_DATASET}/0` +
    `?offset=0&limit=1500` +
    `&conditions[0][property]=state` +
    `&conditions[0][value]=${encodeURIComponent(state.toUpperCase())}` +
    `&conditions[0][operator]==`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`CMS ${res.status}`);
  const json = (await res.json()) as { results?: Record<string, unknown>[] };
  return (json.results ?? []).map(normalize).filter(Boolean) as Property[];
}

async function fetchFromDB(state?: string, city?: string): Promise<Property[]> {
  let rows;
  if (state) {
    rows =
      await sql`SELECT * FROM properties WHERE state = ${state.toUpperCase()} ORDER BY citation_count DESC LIMIT 1000`;
  } else if (city) {
    const cityPattern = `%${city}%`;
    rows = await sql(
      'SELECT * FROM properties WHERE LOWER(city) LIKE LOWER($1) ORDER BY citation_count DESC LIMIT 500',
      [cityPattern]
    );
  } else {
    rows = await sql`SELECT * FROM properties ORDER BY last_updated DESC LIMIT 2000`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip ?? '',
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lng),
    status: r.status,
    citationCount: r.citation_count,
    deficiencyTypes: r.deficiency_types ?? [],
    staffingRatio: r.staffing_ratio ?? 'Unknown',
    cnaPattern: r.cna_pattern ?? '',
    weekendCoverage: r.weekend_coverage ?? '',
    fallRate: parseFloat(r.fall_rate ?? '0'),
    rehospitalizationRate: r.rehospitalization_rate ?? 0,
    pressureInjuryRate: r.pressure_injury_rate ?? 0,
    monthlyFee: r.monthly_fee ?? 0,
    operator: r.operator ?? '',
    ownershipChain: r.ownership_chain ?? '',
    revenuePerBed: r.revenue_per_bed ?? 0,
    remoteMonitorRank: r.remote_monitor_rank ?? 'medium',
    inspectionHistory: [],
    valueScore: r.value_score ?? 50,
    qualityScore: r.quality_score ?? 50,
  }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? undefined;
  const city = url.searchParams.get('city') ?? undefined;
  if (url.searchParams.get('mock') === 'true')
    return Response.json({ source: 'mock', properties: mockProperties });

  try {
    if (state) {
      try {
        const props = await fetchLiveCMS(state);
        if (props.length > 0)
          return Response.json({ source: 'cms', properties: props, count: props.length });
      } catch (e) {
        console.warn('[CMS fallback]', e);
      }

      const dbProps = await fetchFromDB(state);
      if (dbProps.length > 0)
        return Response.json({
          source: 'db',
          properties: dbProps,
          count: dbProps.length,
          note: 'CMS unavailable — cached data',
        });
    } else if (city) {
      const dbProps = await fetchFromDB(undefined, city);
      if (dbProps.length > 0)
        return Response.json({ source: 'db', properties: dbProps, count: dbProps.length });
    } else {
      const dbProps = await fetchFromDB();
      if (dbProps.length > 0)
        return Response.json({ source: 'db', properties: dbProps, count: dbProps.length });
    }
    return Response.json({
      source: 'mock',
      properties: mockProperties,
      note: 'DB empty — visit /admin/sync to load real data',
    });
  } catch (err) {
    console.error('[Properties]', err);
    return Response.json({ source: 'mock', properties: mockProperties });
  }
}
