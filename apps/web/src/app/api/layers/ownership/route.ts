/**
 * Layer 3: Ownership — Corporate Parent Entity Trails
 * Groups facilities by corporate chain and returns connection data
 * for drawing ownership trails on the map.
 */

import sql from '@/app/api/utils/sql';
import type { OwnershipChain } from '@/data/layerTypes';
import mockProperties from '@/data/mockProperties';

// Assign consistent accent colors to ownership chains
const CHAIN_COLORS = [
  '#7C3AED',
  '#DB2777',
  '#059669',
  '#D97706',
  '#2563EB',
  '#DC2626',
  '#0891B2',
  '#65A30D',
];

function buildOwnershipChains(
  properties: Array<{ id: string; operator: string; ownershipChain?: string }>
): OwnershipChain[] {
  const chainMap = new Map<string, { propertyIds: string[]; operator: string }>();

  for (const p of properties) {
    // Extract top-level chain name (first entity in chain)
    const chainName = (p.ownershipChain ?? p.operator ?? 'Independent Operator')
      .split('→')[0]
      .trim();

    if (!chainMap.has(chainName)) {
      chainMap.set(chainName, { propertyIds: [], operator: p.operator });
    }
    chainMap.get(chainName)!.propertyIds.push(p.id);
  }

  let colorIndex = 0;
  return Array.from(chainMap.entries())
    .filter(([, v]) => v.propertyIds.length >= 1)
    .sort((a, b) => b[1].propertyIds.length - a[1].propertyIds.length)
    .map(([chainName, v]) => ({
      chainName,
      portfolioSize: v.propertyIds.length,
      entityType: chainName.includes('LLC')
        ? 'LLC'
        : chainName.includes('REIT')
          ? 'REIT'
          : chainName.includes('non-profit') ||
              chainName.includes('Foundation') ||
              chainName.includes('Cooperative')
            ? 'Non-Profit'
            : chainName.includes('Corp')
              ? 'Corporation'
              : 'Unknown',
      propertyIds: v.propertyIds,
      accentColor: CHAIN_COLORS[colorIndex++ % CHAIN_COLORS.length],
    }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? undefined;

  try {
    const rows = state
      ? await sql`SELECT id, operator, ownership_chain FROM properties WHERE state = ${state.toUpperCase()} LIMIT 200`
      : await sql`SELECT id, operator, ownership_chain FROM properties LIMIT 500`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (rows as any[]).map((r) => ({
      id: r.id,
      operator: r.operator ?? 'Unknown',
      ownershipChain: r.ownership_chain,
    }));

    const source =
      props.length > 0
        ? props
        : mockProperties.map((p) => ({
            id: p.id,
            operator: p.operator,
            ownershipChain: p.ownershipChain,
          }));

    const chains = buildOwnershipChains(source);
    return Response.json({ chains });
  } catch {
    const chains = buildOwnershipChains(
      mockProperties.map((p) => ({
        id: p.id,
        operator: p.operator,
        ownershipChain: p.ownershipChain,
      }))
    );
    return Response.json({ chains });
  }
}
