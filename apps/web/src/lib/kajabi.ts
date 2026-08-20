/**
 * Kajabi module URLs — set these in your Netlify environment variables.
 * Each corresponds to a specific downloadable toolkit module.
 */
export const KAJABI_URLS = {
  /** Module 1: Pre-Crisis Autonomy & Planning Blueprint */
  module1: process.env.NEXT_PUBLIC_KAJABI_MODULE_1_URL ?? '#',
  /** Module 8: Asset Insulation & Legal Autonomy Scripts */
  module8: process.env.NEXT_PUBLIC_KAJABI_MODULE_8_URL ?? '#',
  /** Module 15: Private Caregiver Employment Shield */
  module15: process.env.NEXT_PUBLIC_KAJABI_MODULE_15_URL ?? '#',
  /** Module 16: Shift-Change Compliance Trackers */
  module16: process.env.NEXT_PUBLIC_KAJABI_MODULE_16_URL ?? '#',
  /** Module 18: Independent Camera Placement Directive */
  module18: process.env.NEXT_PUBLIC_KAJABI_MODULE_18_URL ?? '#',
  /** Module 21: Remote Care Oversight Mandates */
  module21: process.env.NEXT_PUBLIC_KAJABI_MODULE_21_URL ?? '#',
  /** Module 24: Post-Fall & Emergency Vestibular Audit Mandate + Care Home Negotiation Blueprint */
  module24: process.env.NEXT_PUBLIC_KAJABI_MODULE_24_URL ?? '#',
  /** Free compliance alerts — Kajabi landing page */
  alerts: process.env.NEXT_PUBLIC_KAJABI_ALERTS_URL ?? '#',
  /** Full toolkit library */
  library: process.env.NEXT_PUBLIC_KAJABI_LIBRARY_URL ?? '#',
} as const;

export type ModuleKey = keyof typeof KAJABI_URLS;
