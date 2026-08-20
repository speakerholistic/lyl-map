// ─────────────────────────────────────────────────────────────────────────────
// 5-Layer Mapping Stack — Shared Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── Layer IDs ────────────────────────────────────────────────────────────────
export type LayerId = 'geographic' | 'regulatory' | 'ownership' | 'mobility' | 'medical';

export interface LayerMeta {
  id: LayerId;
  label: string;
  sublabel: string;
  color: string; // tailwind color class
  accentHex: string; // raw hex for SVG use
  icon: string; // lucide icon name
  description: string;
}

export const LAYER_META: LayerMeta[] = [
  {
    id: 'geographic',
    label: 'Geographic',
    sublabel: 'Regional Density',
    color: 'text-cyan-600',
    accentHex: '#0891B2',
    icon: 'Map',
    description: 'Regional facility concentration and population density plots',
  },
  {
    id: 'regulatory',
    label: 'Regulatory',
    sublabel: 'Title 22 Compliance',
    color: 'text-orange-600',
    accentHex: '#EA580C',
    icon: 'FileWarning',
    description:
      'Title 22 state enforcement actions and compliance status overlaid on existing pins',
  },
  {
    id: 'ownership',
    label: 'Ownership',
    sublabel: 'Corporate Entity Trails',
    color: 'text-violet-600',
    accentHex: '#7C3AED',
    icon: 'Landmark',
    description:
      'Corporate parent entity trails connecting facilities under the same ownership chain',
  },
  {
    id: 'mobility',
    label: 'Mobility',
    sublabel: 'Deconditioning Risk',
    color: 'text-amber-600',
    accentHex: '#D97706',
    icon: 'Activity',
    description:
      'Regional ambient deconditioning risk index — age 65+, mobility limitation, fall rate, isolation score',
  },
  {
    id: 'medical',
    label: 'Medical',
    sublabel: 'Hospice · Home Health · Hospitals',
    color: 'text-rose-600',
    accentHex: '#E11D48',
    icon: 'Stethoscope',
    description:
      'Acute hospital networks, non-profit hospice entities, and home health registries — clinical proximity mapping',
  },
];

// ── Layer 1: Geographic density ──────────────────────────────────────────────
export interface DensityCluster {
  lat: number;
  lng: number;
  count: number; // number of facilities in this cluster
  criticalCount: number; // how many are critical
  radius: number; // visual radius in SVG units
}

// ── Layer 2: Regulatory / Title 22 ───────────────────────────────────────────
export type Title22Status =
  | 'active_enforcement' // active enforcement action
  | 'pending_review' // under state review
  | 'corrective_plan' // corrective action plan filed
  | 'compliant'; // no Title 22 issues

export interface Title22Record {
  propertyId: string;
  status: Title22Status;
  violationCount: number;
  lastActionDate: string;
  category: string; // e.g. "Resident Rights", "Staffing", "Physical Plant"
}

// ── Layer 3: Ownership chains ────────────────────────────────────────────────
export interface OwnershipChain {
  chainName: string;
  portfolioSize: number;
  entityType: string;
  propertyIds: string[]; // all facility IDs under this chain
  accentColor: string; // hex for SVG line color
}

// ── Layer 4: Mobility / deconditioning risk ───────────────────────────────────
export interface MobilityRiskZone {
  fips: string;
  countyName: string;
  state: string;
  lat: number;
  lng: number;
  deconditioningScore: number; // 0–100
  pctOver65: number;
  pctMobilityLimited: number;
  fallRatePer1k: number;
  isolationIndex: number;
}

// ── Layer 5: Medical providers ───────────────────────────────────────────────
export type MedicalProviderType = 'hospital' | 'home_health' | 'hospice';

export interface MedicalProvider {
  id: string;
  name: string;
  providerType: MedicalProviderType;
  address: string;
  city: string;
  state: string;
  zip?: string;
  lat: number;
  lng: number;
  bedCount?: number;
  serviceRadiusMiles?: number;
  acceptsMedicare: boolean;
  acceptsMedicaid: boolean;
  nonprofit: boolean;
  overallRating?: number;
  qualityRating?: number;
  phone?: string;
  website?: string;
  parentOrganization?: string;
  county?: string;
  notes?: string;
  dataSource: string;
}

// ── Combined layer data payload ───────────────────────────────────────────────
export interface LayerData {
  geographic?: DensityCluster[];
  regulatory?: Title22Record[];
  ownership?: OwnershipChain[];
  mobility?: MobilityRiskZone[];
  medical?: MedicalProvider[];
}
