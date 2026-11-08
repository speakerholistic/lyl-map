/**
 * Kajabi / shop URLs — set these in your Netlify environment variables.
 *
 * Every purchase link is resolved through `pickUrl`, which ignores values that
 * are empty, "#", relative (would resolve back into this app), or point at the
 * map itself. That prevents the "sent back to the map" loop when an env var is
 * missing or blank. If nothing usable is set, links fall back to the main
 * Love Your Longevity site rather than to this app.
 */

/** Final fallback for purchase links — never this map app. */
export const LYL_SITE_URL = 'https://www.loveyourlongevity.org';

/** True when `value` is an absolute http(s) URL that does not lead back into this map app. */
export function isExternalUrl(value: string | undefined | null): value is string {
  const v = value?.trim();
  if (!v || !/^https?:\/\//i.test(v)) return false;
  try {
    const url = new URL(v);
    if (/(^|\/)map\/?$/i.test(url.pathname)) return false;
    if (url.hostname.toLowerCase().includes('lylmap')) return false;
    if (typeof window !== 'undefined' && url.host === window.location.host) return false;
    return true;
  } catch {
    return false;
  }
}

/** First usable external URL among the candidates, else the LYL site. */
export function pickUrl(...candidates: Array<string | undefined>): string {
  return candidates.find(isExternalUrl)?.trim() ?? LYL_SITE_URL;
}

const SHOP = process.env.NEXT_PUBLIC_SHOP_URL;
const LIBRARY = process.env.NEXT_PUBLIC_KAJABI_LIBRARY_URL;

/** General shop link (triage results, tabs). Falls back to the Kajabi library. */
export const SHOP_URL = pickUrl(SHOP, LIBRARY);

/** "Back to my dashboard" link — only shown when NEXT_PUBLIC_KAJABI_LIBRARY_URL is a usable URL. */
export const DASHBOARD_URL: string | null = isExternalUrl(LIBRARY) ? LIBRARY.trim() : null;

export const KAJABI_URLS = {
  /** Module 1: Pre-Crisis Autonomy & Planning Blueprint */
  module1: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_1_URL, LIBRARY, SHOP),
  /** Module 8: Asset Insulation & Legal Autonomy Scripts */
  module8: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_8_URL, LIBRARY, SHOP),
  /** Module 15: Private Caregiver Employment Shield */
  module15: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_15_URL, LIBRARY, SHOP),
  /** Module 16: Shift-Change Compliance Trackers */
  module16: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_16_URL, LIBRARY, SHOP),
  /** Module 18: Independent Camera Placement Directive */
  module18: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_18_URL, LIBRARY, SHOP),
  /** Module 21: Remote Care Oversight Mandates */
  module21: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_21_URL, LIBRARY, SHOP),
  /** Module 24: Post-Fall & Emergency Vestibular Audit Mandate + Care Home Negotiation Blueprint */
  module24: pickUrl(process.env.NEXT_PUBLIC_KAJABI_MODULE_24_URL, LIBRARY, SHOP),
  /** Free compliance alerts — Kajabi landing page */
  alerts: pickUrl(process.env.NEXT_PUBLIC_KAJABI_ALERTS_URL, LIBRARY),
  /** Full toolkit library */
  library: pickUrl(LIBRARY, SHOP),
} as const;

export type ModuleKey = keyof typeof KAJABI_URLS;
