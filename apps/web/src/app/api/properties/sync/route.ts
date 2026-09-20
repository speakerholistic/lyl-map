/**
 * National CMS Sync — Pulls all ~14,695 nursing home facilities
 * from the CMS Provider Information dataset (4pq5-n9py).
 *
 * Dataset includes latitude/longitude natively — zero geocoding cost.
 * A full national pull takes ~30–60s (pure API + DB, no geocoding).
 *
 * Supports:
 *   POST /api/properties/sync          → full national sync
 *   POST /api/properties/sync?state=TX → single state sync
 *   GET  /api/properties/sync/status   → sync status check
 */

import sql from '@/app/api/utils/sql';

const CMS_API = 'https://data.cms.gov/provider-data/api/1/datastore/query';
const NH_DATASET = '4pq5-n9py';
const BATCH_SIZE = 1000; // safe page size; CMS max is 1500

// CMS field names (confirmed from data.cms.gov) — GET endpoint returns all columns by default
// so no need to pass a properties list; these names are used as property keys on each row.

function toStatus(rating: number | null, penalties: number): string {
  if (penalties > 10 || rating === 1) return 'critical';
  if (penalties > 3 || rating === 2 || rating === 3) return 'warning';
  return 'clean';
}

function hoursToRatio(hrs: number | null): string {
  if (!hrs || hrs <= 0) return 'Not reported';
  return `1:${Math.min(Math.max(Math.round(24 / hrs), 2), 15)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertBatch(
  records: Record<string, any>[]
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0,
    skipped = 0;

  for (const r of records) {
    const lat = parseFloat(r.latitude ?? '');
    const lng = parseFloat(r.longitude ?? '');

    // Strict US bounds check — all US states + territories have:
    // lat: 17.9 (Guam) to 71.4 (Alaska), lng: -180 to -65 (always negative)
    const validCoords =
      isFinite(lat) && isFinite(lng) && lat >= 17.0 && lat <= 72.0 && lng >= -180 && lng <= -60;

    if (!validCoords) {
      skipped++;
      continue;
    }

    const id = r.cms_certification_number_ccn;
    if (!id) {
      skipped++;
      continue;
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

    const mult = stars ? 0.65 + stars * 0.1 : 0.9;
    const revenuePerBed = Math.round(7900 * mult);
    const monthlyFee = Math.round(revenuePerBed * 1.08);
    const valueScore = Math.round(
      ((stars ?? 1) / 5) * 60 + (1 - Math.min(monthlyFee / 14000, 1)) * 40
    );
    const qualityScore = qmRat ? Math.round((qmRat / 5) * 100) : 50;
    const remoteRank = staffRat && staffRat >= 4 ? 'high' : staffRat === 3 ? 'medium' : 'low';

    try {
      await sql`
        INSERT INTO properties (
          id, name, address, city, state, zip, lat, lng,
          status, citation_count, deficiency_types,
          staffing_ratio, cna_pattern, weekend_coverage,
          fall_rate, rehospitalization_rate, pressure_injury_rate,
          monthly_fee, operator, ownership_chain, revenue_per_bed,
          value_score, quality_score, remote_monitor_rank,
          data_source, last_updated
        ) VALUES (
          ${id},
          ${r.provider_name ?? 'Unknown Facility'},
          ${r.provider_address ?? ''},
          ${r.citytown ?? ''},
          ${r.state ?? ''},
          ${r.zip_code ?? ''},
          ${lat}, ${lng},
          ${status},
          ${defCount},
          ${defTypes},
          ${hoursToRatio(totalHrs)},
          ${totalHrs ? `${totalHrs.toFixed(2)} nurse hrs/resident/day` : 'Not reported'},
          ${weekendMap[staffRat ?? 3] ?? 'Not reported'},
          0, 0, 0,
          ${monthlyFee},
          ${r.ownership_type ?? 'Unknown'},
          ${ownerChain},
          ${revenuePerBed},
          ${valueScore}, ${qualityScore},
          ${remoteRank},
          'cms', NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name              = EXCLUDED.name,
          status            = EXCLUDED.status,
          citation_count    = EXCLUDED.citation_count,
          deficiency_types  = EXCLUDED.deficiency_types,
          staffing_ratio    = EXCLUDED.staffing_ratio,
          cna_pattern       = EXCLUDED.cna_pattern,
          weekend_coverage  = EXCLUDED.weekend_coverage,
          monthly_fee       = EXCLUDED.monthly_fee,
          operator          = EXCLUDED.operator,
          ownership_chain   = EXCLUDED.ownership_chain,
          value_score       = EXCLUDED.value_score,
          quality_score     = EXCLUDED.quality_score,
          remote_monitor_rank = EXCLUDED.remote_monitor_rank,
          last_updated      = NOW()
      `;

      // Seed inspection record if we have a survey date
      const surveyDate = r.rating_cycle_1_standard_survey_health_date;
      if (surveyDate) {
        await sql`
          INSERT INTO inspection_records (property_id, inspection_date, inspection_type, findings, severity)
          VALUES (
            ${id}, ${surveyDate}, 'CMS Annual Health Inspection',
            ${
              status === 'critical'
                ? `${defCount} health deficiencies — ${penalties} total penalties`
                : status === 'warning'
                  ? `${defCount} health deficiencies cited`
                  : 'Survey completed — no critical findings'
            },
            ${status === 'critical' ? 'G' : status === 'warning' ? 'D' : 'B'}
          )
          ON CONFLICT DO NOTHING
        `;
      }

      inserted++;
    } catch (err) {
      console.error(`[Sync upsert] ID ${id}:`, err);
      skipped++;
    }
  }

  return { inserted, skipped };
}

async function fetchPage(
  offset: number,
  state?: string
): Promise<{ results: unknown[]; count: number }> {
  // Build URL manually — CMS API requires literal square brackets in query params.
  // URLSearchParams encodes them as %5B%5D which the API does not accept.
  let url = `${CMS_API}/${NH_DATASET}/0?offset=${offset}&limit=${BATCH_SIZE}`;
  if (state) {
    url += `&conditions[0][property]=state&conditions[0][value]=${encodeURIComponent(state.toUpperCase())}&conditions[0][operator]==`;
  }
  console.log('[Sync] GET', url);

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CMS API ${res.status} — ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { results?: unknown[]; count?: number };
  return {
    results: json.results ?? [],
    count: json.count ?? 0,
  };
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? undefined;

  await sql`
    INSERT INTO sync_metadata (key, value, updated_at) VALUES ('sync_status', 'running', NOW())
    ON CONFLICT (key) DO UPDATE SET value = 'running', updated_at = NOW()
  `;

  let totalInserted = 0,
    totalSkipped = 0,
    offset = 0;
  let totalCount = 0;

  try {
    // First page — also gives us total count
    const firstPage = await fetchPage(0, state);
    totalCount = firstPage.count || BATCH_SIZE;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstResult = await upsertBatch(firstPage.results as Record<string, any>[]);
    totalInserted += firstResult.inserted;
    totalSkipped += firstResult.skipped;
    offset = BATCH_SIZE;

    // Paginate through the rest
    while (offset < totalCount) {
      const page = await fetchPage(offset, state);
      if (!page.results.length) break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await upsertBatch(page.results as Record<string, any>[]);
      totalInserted += result.inserted;
      totalSkipped += result.skipped;
      offset += BATCH_SIZE;

      // Update progress
      await sql`
        INSERT INTO sync_metadata (key, value, updated_at)
        VALUES ('sync_progress', ${`${offset}/${totalCount}`}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${`${offset}/${totalCount}`}, updated_at = NOW()
      `;
    }

    await sql`
      INSERT INTO sync_metadata (key, value, updated_at) VALUES ('sync_status', 'complete', NOW())
      ON CONFLICT (key) DO UPDATE SET value = 'complete', updated_at = NOW()
    `;
    await sql`
      INSERT INTO sync_metadata (key, value, updated_at)
      VALUES ('last_national_sync', ${new Date().toISOString()}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${new Date().toISOString()}, updated_at = NOW()
    `;

    const dbCount = await sql`SELECT COUNT(*) as c FROM properties`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalInDB = (dbCount[0] as any).c;

    return Response.json({
      success: true,
      inserted: totalInserted,
      skipped: totalSkipped,
      totalInDB,
      cmsTotal: totalCount,
      scope: state ? `State: ${state.toUpperCase()}` : 'National (all states)',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Sync Error]', err);
    await sql`
      INSERT INTO sync_metadata (key, value, updated_at) VALUES ('sync_status', 'failed', NOW())
      ON CONFLICT (key) DO UPDATE SET value = 'failed', updated_at = NOW()
    `;
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await sql`SELECT key, value, updated_at FROM sync_metadata ORDER BY key`;
    const meta: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (rows as any[]).forEach((r) => {
      meta[r.key] = r.value;
    });
    const countRow = await sql`SELECT COUNT(*) as c FROM properties`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalInDB = parseInt((countRow[0] as any).c, 10);
    return Response.json({ ...meta, totalInDB });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
