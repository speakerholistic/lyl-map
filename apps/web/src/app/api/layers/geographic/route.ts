/**
 * Layer 1: Geographic — Regional Density Plots
 * Computes care home concentration clusters from the properties table.
 * Buckets facilities into ~50mi grid cells and returns cluster centroids.
 */

import sql from '@/app/api/utils/sql';
import type { DensityCluster } from '@/data/layerTypes';
import mockProperties from '@/data/mockProperties';

// Grid bucket size in decimal degrees (~55 miles lat, ~45 miles lng at 40°N)
const BUCKET_LAT = 0.8;
const BUCKET_LNG = 1.0;

function bucketKey(lat: number, lng: number): string {
  const bLat = Math.floor(lat / BUCKET_LAT) * BUCKET_LAT;
  const bLng = Math.floor(lng / BUCKET_LNG) * BUCKET_LNG;
  return `${bLat.toFixed(1)},${bLng.toFixed(1)}`;
}

function buildClusters(
  properties: Array<{ lat: number; lng: number; status: string }>
): DensityCluster[] {
  const buckets = new Map<
    string,
    { lats: number[]; lngs: number[]; count: number; criticalCount: number }
  >();

  for (const p of properties) {
    const key = bucketKey(p.lat, p.lng);
    if (!buckets.has(key)) {
      buckets.set(key, { lats: [], lngs: [], count: 0, criticalCount: 0 });
    }
    const b = buckets.get(key)!;
    b.lats.push(p.lat);
    b.lngs.push(p.lng);
    b.count++;
    if (p.status === 'critical') b.criticalCount++;
  }

  return Array.from(buckets.values()).map((b) => ({
    lat: b.lats.reduce((s, v) => s + v, 0) / b.lats.length,
    lng: b.lngs.reduce((s, v) => s + v, 0) / b.lngs.length,
    count: b.count,
    criticalCount: b.criticalCount,
    radius: Math.min(8 + b.count * 3, 40), // SVG radius scales with count
  }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? undefined;

  try {
    const rows = state
      ? await sql`SELECT lat, lng, status FROM properties WHERE state = ${state.toUpperCase()}`
      : await sql`SELECT lat, lng, status FROM properties LIMIT 500`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = rows.map((r: any) => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      status: r.status,
    }));

    // If DB is empty, fall back to mock
    const source =
      props.length > 0
        ? props
        : mockProperties.map((p) => ({ lat: p.lat, lng: p.lng, status: p.status }));
    const clusters = buildClusters(source);

    return Response.json({ clusters });
  } catch {
    const clusters = buildClusters(
      mockProperties.map((p) => ({ lat: p.lat, lng: p.lng, status: p.status }))
    );
    return Response.json({ clusters });
  }
}
