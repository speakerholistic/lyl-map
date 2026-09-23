'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ExternalLink,
  Search,
  X,
  Loader2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Map,
  Filter,
  MousePointerClick,
  Layers,
  BarChart3,
  Bell,
  ArrowLeft,
  ArrowDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import type { Property, ComplianceStatus } from '@/data/mockProperties';
import mockProperties from '@/data/mockProperties';
import type { LayerId, LayerData } from '@/data/layerTypes';
import UrgencyBanner from '@/components/compliance/UrgencyBanner';
import PropertyProfilePanel from '@/components/compliance/PropertyProfilePanel';
import ComparisonGrid from '@/components/compliance/ComparisonGrid';
import EmailOptIn from '@/components/compliance/EmailOptIn';
import MapLayerControls from '@/components/compliance/MapLayerControls';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import TriageWizard from '@/components/compliance/TriageWizard';

const ComplianceMapCanvas = dynamic(() => import('@/components/compliance/ComplianceMapCanvas'), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

function MapLoadingState() {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
      <Loader2 className="text-blue-400 animate-spin" size={28} />
      <p className="text-sm text-gray-400">Loading compliance data...</p>
    </div>
  );
}

// ─── State geographic centers + zoom levels ────────────────────────────────────
const STATE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  AL: { lat: 32.8, lng: -86.8, zoom: 7 },
  AK: { lat: 64.2, lng: -153.4, zoom: 4 },
  AZ: { lat: 34.3, lng: -111.1, zoom: 7 },
  AR: { lat: 34.9, lng: -92.4, zoom: 7 },
  CA: { lat: 36.8, lng: -119.4, zoom: 6 },
  CO: { lat: 39.0, lng: -105.5, zoom: 7 },
  CT: { lat: 41.6, lng: -72.7, zoom: 9 },
  DE: { lat: 39.0, lng: -75.5, zoom: 9 },
  FL: { lat: 27.8, lng: -81.6, zoom: 7 },
  GA: { lat: 32.7, lng: -83.4, zoom: 7 },
  HI: { lat: 20.3, lng: -156.4, zoom: 7 },
  ID: { lat: 44.3, lng: -114.5, zoom: 6 },
  IL: { lat: 40.0, lng: -89.2, zoom: 7 },
  IN: { lat: 39.9, lng: -86.3, zoom: 7 },
  IA: { lat: 42.0, lng: -93.2, zoom: 7 },
  KS: { lat: 38.5, lng: -98.4, zoom: 7 },
  KY: { lat: 37.5, lng: -85.3, zoom: 7 },
  LA: { lat: 31.1, lng: -91.9, zoom: 7 },
  ME: { lat: 45.4, lng: -69.0, zoom: 7 },
  MD: { lat: 39.0, lng: -76.8, zoom: 8 },
  MA: { lat: 42.3, lng: -71.8, zoom: 8 },
  MI: { lat: 44.3, lng: -85.4, zoom: 7 },
  MN: { lat: 46.4, lng: -93.1, zoom: 6 },
  MS: { lat: 32.7, lng: -89.7, zoom: 7 },
  MO: { lat: 38.5, lng: -92.5, zoom: 7 },
  MT: { lat: 47.0, lng: -110.0, zoom: 6 },
  NE: { lat: 41.5, lng: -99.9, zoom: 7 },
  NV: { lat: 38.5, lng: -117.1, zoom: 7 },
  NH: { lat: 43.7, lng: -71.6, zoom: 8 },
  NJ: { lat: 40.1, lng: -74.5, zoom: 8 },
  NM: { lat: 34.4, lng: -106.1, zoom: 7 },
  NY: { lat: 42.9, lng: -75.5, zoom: 7 },
  NC: { lat: 35.6, lng: -79.4, zoom: 7 },
  ND: { lat: 47.5, lng: -100.5, zoom: 7 },
  OH: { lat: 40.4, lng: -82.8, zoom: 7 },
  OK: { lat: 35.6, lng: -97.5, zoom: 7 },
  OR: { lat: 44.1, lng: -120.5, zoom: 7 },
  PA: { lat: 40.9, lng: -77.8, zoom: 7 },
  RI: { lat: 41.7, lng: -71.5, zoom: 10 },
  SC: { lat: 33.9, lng: -80.9, zoom: 8 },
  SD: { lat: 44.4, lng: -100.2, zoom: 7 },
  TN: { lat: 35.9, lng: -86.4, zoom: 7 },
  TX: { lat: 31.5, lng: -99.3, zoom: 6 },
  UT: { lat: 39.3, lng: -111.1, zoom: 7 },
  VT: { lat: 44.1, lng: -72.7, zoom: 8 },
  VA: { lat: 37.8, lng: -79.5, zoom: 7 },
  WA: { lat: 47.4, lng: -120.5, zoom: 7 },
  WV: { lat: 38.7, lng: -80.6, zoom: 7 },
  WI: { lat: 44.5, lng: -89.8, zoom: 7 },
  WY: { lat: 43.0, lng: -107.6, zoom: 7 },
};

// ─── Tour steps ────────────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    icon: <Map size={28} className="text-blue-600" />,
    title: 'Welcome to LYL Map',
    body: "This tool shows you the real safety record of every nursing home and care facility in the US — pulled directly from the federal government's database. Let's walk through how to use it in 5 easy steps.",
    highlight: null,
  },
  {
    icon: <Filter size={28} className="text-blue-600" />,
    title: 'Step 1 — Pick a State',
    body: 'To load facilities, you MUST first select a state from the dropdown menu. Look for the "State" dropdown in the far upper-right corner of the search bar — tap it and choose your state. You can also type a city name in the search box on the left.',
    highlight: 'filter-bar',
    showArrow: true,
  },
  {
    icon: <MousePointerClick size={28} className="text-blue-600" />,
    title: 'Step 2 — Click a Pin',
    body: 'Each pin on the map is a care facility. Green circles = No problems found. Yellow triangles = Some violations. Red hexagons = Serious, ongoing violations. Click any pin to see the full safety report.',
    highlight: 'map',
  },
  {
    icon: <Layers size={28} className="text-purple-600" />,
    title: 'Step 3 — Turn On Layers',
    body: 'Click the Layers button in the top-right of the map to add extra information: nearby hospitals, fall risk by area, who owns each facility, and how many care homes are clustered together.',
    highlight: 'layers',
  },
  {
    icon: <BarChart3 size={28} className="text-orange-600" />,
    title: 'Step 4 — Compare Facilities',
    body: 'Scroll down below the map to compare facilities side by side — cost, safety score, staff levels, and how often residents are sent back to the hospital.',
    highlight: 'compare',
  },
  {
    icon: <Bell size={28} className="text-green-600" />,
    title: 'Step 5 — Set Up Alerts',
    body: 'Scroll to the bottom and enter your email to get free notifications when a care home near you receives a new safety violation or inspection result.',
    highlight: 'alerts',
  },
  {
    icon: <Search size={28} className="text-blue-600" />,
    title: "You're Ready!",
    body: 'Start by picking a state from the dropdown in the upper-right corner of the search bar — then click any pin on the map. Click the ? button any time to see this guide again.',
    highlight: null,
  },
];

// ─── Tour modal ───────────────────────────────────────────────────────────────
function TourModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const showArrow = (current as typeof current & { showArrow?: boolean }).showArrow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#2563EB] transition-all duration-300"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {current.icon}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">
                  Step {step + 1} of {TOUR_STEPS.length}
                </p>
                <h2 className="text-base font-bold text-gray-900">{current.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Close guide"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">{current.body}</p>

          {/* Arrow callout for Step 1 */}
          {showArrow && (
            <div className="mb-5 rounded-xl border-2 border-blue-400 bg-blue-50 px-4 py-3 flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                {/* Arrow pointing upper-right */}
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 30 L30 6" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <path
                    d="M14 6 L30 6 L30 22"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800 mb-0.5">
                  👆 Look to the upper-right corner!
                </p>
                <p className="text-xs text-blue-700 leading-snug">
                  Find the{' '}
                  <span className="font-bold bg-white border border-blue-300 rounded px-1.5 py-0.5 text-blue-800">
                    State ▾
                  </span>{' '}
                  dropdown in the search bar — it's on the right side. Tap it to choose your state
                  and load facilities.
                </p>
              </div>
            </div>
          )}

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step ? 'w-5 h-2 bg-[#2563EB]' : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl transition-colors"
              >
                Start Exploring <Map size={14} />
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const legendItems = [
  { shape: '●', color: 'text-green-600', label: 'Clean' },
  { shape: '▲', color: 'text-yellow-500', label: 'Citations' },
  { shape: '⬡', color: 'text-red-600', label: 'Violations' },
];

const STATUS_FILTERS: { value: '' | ComplianceStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'clean', label: '● Clean' },
  { value: 'warning', label: '▲ Citations' },
  { value: 'critical', label: '⬡ Violations' },
];

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

interface FetchResult {
  source: 'cms' | 'db' | 'mock';
  properties: Property[];
  note?: string;
}

async function fetchProperties(state: string, city?: string): Promise<FetchResult> {
  try {
    const params = new URLSearchParams();
    if (state) params.set('state', state);
    // Pass city to API for server-side filtering when no state is specified
    if (city && !state) params.set('city', city);
    const res = await fetch(`/api/properties?${params.toString()}`);
    if (!res.ok) return { source: 'mock', properties: mockProperties };
    return await res.json();
  } catch {
    return { source: 'mock', properties: mockProperties };
  }
}

async function fetchLayer<T>(endpoint: string, state: string): Promise<T> {
  const params = state ? `?state=${state}` : '';
  const res = await fetch(`/api/layers/${endpoint}${params}`);
  if (!res.ok) throw new Error(`Layer fetch failed: ${endpoint}`);
  return res.json();
}

// ─── Step transition banner ────────────────────────────────────────────────────
function StepTransition({
  stepLabel,
  title,
  subtitle,
  targetId,
  cta,
}: {
  stepLabel: string;
  title: string;
  subtitle: string;
  targetId: string;
  cta: string;
}) {
  return (
    <div
      style={{ background: 'linear-gradient(to right, #2563EB, #1D4ED8)' }}
      className="text-white px-4 md:px-8 py-6"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
            {stepLabel}
          </p>
          <h3 className="text-base md:text-lg font-bold">{title}</h3>
          <p className="text-sm text-blue-100 mt-1">{subtitle}</p>
        </div>
        <a
          href={`#${targetId}`}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          {cta}
          <ArrowDown size={14} />
        </a>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MapPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // committedCity only updates when the user *selects* from the Google dropdown,
  // not on every keystroke — used as the stable query key for data fetching
  const [committedCity, setCommittedCity] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ComplianceStatus>('');
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(new Set());
  const [showTour, setShowTour] = useState(false);
  // Tracks where the map should auto-fly (state center or city centroid)
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(
    null
  );

  // Fetch once the user has committed a city pick OR chosen a state
  const hasUserInput = !!(stateFilter || committedCity || searchQuery.trim());

  // Show tour on first visit
  useEffect(() => {
    try {
      const seen = localStorage.getItem('careguard-tour-seen');
      if (!seen) setShowTour(true);
    } catch {
      setShowTour(true);
    }
  }, []);

  // ── Fly to state center when the state dropdown changes ──────────────────
  useEffect(() => {
    if (!stateFilter) return;
    const center = STATE_CENTERS[stateFilter];
    if (center) setFocusTarget({ ...center });
  }, [stateFilter]);

  const closeTour = useCallback(() => {
    setShowTour(false);
    try {
      localStorage.setItem('careguard-tour-seen', '1');
    } catch {
      // ignore
    }
  }, []);

  const toggleLayer = useCallback((id: LayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { data: fetchResult, isLoading } = useQuery<FetchResult>({
    queryKey: ['properties', stateFilter, committedCity],
    queryFn: () => fetchProperties(stateFilter, committedCity),
    enabled: hasUserInput,
    staleTime: 5 * 60 * 1000,
    // no placeholderData — start truly empty
  });

  // ── Fly to city centroid once properties finish loading ───────────────────
  useEffect(() => {
    if (!searchQuery.trim() || !fetchResult?.properties?.length) return;
    const q = searchQuery.toLowerCase();
    const cityProps = fetchResult.properties.filter(
      (p) => p.city.toLowerCase().includes(q) || q.includes(p.city.toLowerCase())
    );
    if (cityProps.length === 0) return;
    const avgLat = cityProps.reduce((s, p) => s + p.lat, 0) / cityProps.length;
    const avgLng = cityProps.reduce((s, p) => s + p.lng, 0) / cityProps.length;
    setFocusTarget({ lat: avgLat, lng: avgLng, zoom: 11 });
  }, [fetchResult, searchQuery]);

  const { data: geoData, isFetching: geoLoading } = useQuery({
    queryKey: ['layer-geographic', stateFilter],
    queryFn: () => fetchLayer<{ clusters: LayerData['geographic'] }>('geographic', stateFilter),
    enabled: activeLayers.has('geographic'),
    staleTime: 10 * 60 * 1000,
  });

  const { data: regData, isFetching: regLoading } = useQuery({
    queryKey: ['layer-regulatory', stateFilter],
    queryFn: () => fetchLayer<{ records: LayerData['regulatory'] }>('regulatory', stateFilter),
    enabled: activeLayers.has('regulatory'),
    staleTime: 10 * 60 * 1000,
  });

  const { data: ownData, isFetching: ownLoading } = useQuery({
    queryKey: ['layer-ownership', stateFilter],
    queryFn: () => fetchLayer<{ chains: LayerData['ownership'] }>('ownership', stateFilter),
    enabled: activeLayers.has('ownership'),
    staleTime: 10 * 60 * 1000,
  });

  const { data: mobData, isFetching: mobLoading } = useQuery({
    queryKey: ['layer-mobility', stateFilter],
    queryFn: () => fetchLayer<{ zones: LayerData['mobility'] }>('mobility', stateFilter),
    enabled: activeLayers.has('mobility'),
    staleTime: 15 * 60 * 1000,
  });

  const { data: medData, isFetching: medLoading } = useQuery({
    queryKey: ['layer-medical', stateFilter],
    queryFn: () =>
      fetchLayer<{ providers: LayerData['medical']; counts: Record<string, number> }>(
        'medical',
        stateFilter
      ),
    enabled: activeLayers.has('medical'),
    staleTime: 10 * 60 * 1000,
  });

  const layerData: LayerData = {
    geographic: geoData?.clusters,
    regulatory: regData?.records,
    ownership: ownData?.chains,
    mobility: mobData?.zones,
    medical: medData?.providers,
  };

  const layerCounts: Partial<Record<LayerId, number>> = {
    geographic: geoData?.clusters?.length,
    regulatory: regData?.records?.filter((r) => r.status !== 'compliant').length,
    ownership: ownData?.chains?.filter((c) => c.portfolioSize >= 2).length,
    mobility: mobData?.zones?.length,
    medical: medData?.providers?.length,
  };

  const layerLoading: Partial<Record<LayerId, boolean>> = {
    geographic: geoLoading,
    regulatory: regLoading,
    ownership: ownLoading,
    mobility: mobLoading,
    medical: medLoading,
  };

  const allProperties = fetchResult?.properties ?? [];
  const dataSource = fetchResult?.source ?? 'mock';

  const filteredProperties = allProperties.filter((prop) => {
    const q = searchQuery.toLowerCase();
    const city = prop.city.toLowerCase();
    const matchesSearch =
      !q ||
      prop.name.toLowerCase().includes(q) ||
      city.includes(q) ||
      q.includes(city) || // handle "New York City" query matching "New York" record
      prop.state.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || prop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pins shown on map — empty until user triggers a search
  const visibleProperties = hasUserInput ? filteredProperties : [];

  const handlePinClick = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const hasFilters = searchQuery || stateFilter || statusFilter;
  const cleanCount = visibleProperties.filter((p) => p.status === 'clean').length;
  const warningCount = visibleProperties.filter((p) => p.status === 'warning').length;
  const criticalCount = visibleProperties.filter((p) => p.status === 'critical').length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Tour modal */}
      {showTour && <TourModal onClose={closeTour} />}

      {/* ── Top nav ── */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors mr-1"
            aria-label="Back to home"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-sm md:text-base font-semibold text-gray-900">LYL Map</span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2.5 py-0.5 text-xs font-medium">
            Free Public Access
          </span>
        </div>
        <nav className="flex items-center gap-3 md:gap-4">
          <a
            href="https://www.loveyourlongevity.org/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Privacy Policy <ExternalLink size={10} />
          </a>
          <a
            href="#compare"
            className="hidden sm:block text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Compare
          </a>
          <a
            href="#assess"
            className="hidden sm:block text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Assess
          </a>
          {/* Help button */}
          <button
            onClick={() => setShowTour(true)}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            aria-label="Open how-to guide"
            title="How to use this tool"
          >
            <HelpCircle size={13} /> Help
          </button>
          <a
            href="#alerts"
            className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-blue-600 border border-blue-100 rounded-full px-3 py-1.5 text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            Free Alerts
          </a>
        </nav>
      </header>

      <UrgencyBanner />

      {/* ── Search + Filter bar ── */}
      <div
        className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 flex flex-col gap-2 flex-shrink-0"
        id="filter-bar"
      >
        {/* Row 1: Search + State + Clear */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <LocationAutocomplete
              value={searchQuery}
              onChange={setSearchQuery}
              onSelect={(city) => {
                setCommittedCity(city);
                setSearchQuery(city);
              }}
              onStateDetected={(state) => {
                setStateFilter(state);
                setCommittedCity('');
              }}
              placeholder="City, facility or state..."
              label="Search facilities by city or name"
              className="w-full pr-3 py-2 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>

          {/* State dropdown — pulses until the user makes their first selection */}
          <div className="relative flex-shrink-0">
            {!hasUserInput && (
              <span
                className="state-pulse-ring"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: -3,
                  borderRadius: 10,
                  border: '2px solid #2563EB',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            )}
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCommittedCity('');
              }}
              aria-label="Filter by state"
              style={
                !hasUserInput
                  ? {
                      borderColor: '#2563EB',
                      backgroundColor: '#EFF6FF',
                      color: '#1d4ed8',
                      fontWeight: 600,
                    }
                  : {}
              }
              className="py-2 pl-2.5 pr-6 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              <option value="">State ▾</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStateFilter('');
                setStatusFilter('');
                setCommittedCity('');
              }}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 p-2 bg-gray-100 rounded-lg"
              aria-label="Clear filters"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Row 2: Status filters + data source badge */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <div
            className="flex items-center gap-1 flex-shrink-0"
            role="group"
            aria-label="Filter by compliance status"
          >
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                aria-pressed={statusFilter === f.value}
                className={`px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 whitespace-nowrap ${
                  statusFilter === f.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            {isLoading && <Loader2 size={12} className="text-blue-500 animate-spin" />}
            {hasUserInput && (
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {visibleProperties.length} found
              </span>
            )}
            {!hasUserInput && (
              <span className="text-xs text-gray-400 italic whitespace-nowrap hidden sm:block">
                Select a state or city
              </span>
            )}
            {hasUserInput && (
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium border whitespace-nowrap ${
                  dataSource === 'cms'
                    ? 'bg-green-50 border-green-100 text-green-700'
                    : dataSource === 'db'
                      ? 'bg-blue-50 border-blue-100 text-blue-700'
                      : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                }`}
                title={fetchResult?.note}
              >
                {dataSource === 'cms' ? '● Live' : dataSource === 'db' ? '● Saved' : '● Demo'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Legend bar ── */}
      <div className="hidden sm:flex bg-white border-b border-gray-200 px-4 md:px-6 py-2 items-center gap-3 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Legend</span>
        <span className="text-gray-200">|</span>
        {legendItems.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`text-base leading-none ${item.color}`} aria-hidden="true">
              {item.shape}
            </span>
            {item.label}
          </span>
        ))}
        {activeLayers.has('medical') && (
          <>
            <span className="text-gray-200">|</span>
            <span className="text-xs text-gray-500 font-medium">Medical:</span>
            {[
              { s: '✛', c: 'text-red-600', l: 'Hospital' },
              { s: '⌂', c: 'text-blue-600', l: 'Home Health' },
              { s: '♥', c: 'text-purple-600', l: 'Hospice' },
            ].map((item) => (
              <span key={item.l} className="inline-flex items-center gap-1 text-xs text-gray-600">
                <span className={`font-bold ${item.c}`}>{item.s}</span>
                {item.l}
              </span>
            ))}
          </>
        )}
        <span className="ml-auto text-xs text-gray-400 hidden md:block">
          {dataSource === 'cms'
            ? 'CMS Federal Database · State Regulatory · Quality Measures · 5-Layer Stack'
            : 'Preview — Sample Data · CMS Dataset Connecting Soon'}
        </span>
      </div>

      {dataSource !== 'cms' && dataSource !== 'db' && (
        <div className="bg-amber-50 border-y-2 border-amber-400 px-4 py-3">
          <p className="text-sm font-bold text-amber-900">
            Preview mode — sample data, not real facility records.
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Every facility name, rating and inspection finding shown here is fictional and
            included only to demonstrate how the tool works. Do not use this preview to
            evaluate a real care home. The live CMS dataset is being connected.
          </p>
        </div>
      )}

      {/* ══ STEP 1: MAP — full width, no sidebar ══ */}
      <div
        id="map-section"
        className="relative flex-shrink-0"
        style={{ height: 'clamp(360px, 55vw, 620px)', minHeight: 320 }}
      >
        {isLoading ? (
          <MapLoadingState />
        ) : (
          <ComplianceMapCanvas
            properties={visibleProperties}
            onPinClick={handlePinClick}
            selectedId={selectedProperty?.id ?? null}
            activeLayers={activeLayers}
            layerData={layerData}
            onReset={() => setSelectedProperty(null)}
            focusTarget={focusTarget}
          />
        )}

        {/* ── Journey steps — vertical overlay, left side of map ── */}
        <div className="hidden sm:flex absolute top-3 left-3 z-10 flex-col gap-2">
          {[
            { n: '1', label: 'Explore Map', href: '#filter-bar', dot: 'bg-blue-500' },
            { n: '2', label: 'Compare', href: '#compare', dot: 'bg-purple-500' },
            { n: '3', label: 'Assess Needs', href: '#assess', dot: 'bg-green-500' },
            { n: '4', label: 'Recommendations', href: '#assess', dot: 'bg-yellow-500' },
          ].map((s) => (
            <a
              key={s.n}
              href={s.href}
              className="flex items-center gap-2 bg-white/95 backdrop-blur border border-gray-200 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow"
            >
              <span
                className={`w-6 h-6 rounded-full ${s.dot} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}
              >
                {s.n}
              </span>
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{s.label}</span>
            </a>
          ))}
        </div>

        {/* Empty-state prompt */}
        {!hasUserInput && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-lg px-6 py-5 max-w-sm text-center mx-4 pointer-events-auto">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Map size={22} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Pick a state to get started</h3>
              {/* Arrow callout pointing upper-right */}
              <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mb-3">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path d="M6 30 L30 6" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <path
                    d="M14 6 L30 6 L30 22"
                    stroke="#2563EB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <p className="text-xs text-blue-800 font-semibold text-left leading-snug">
                  Use the{' '}
                  <span className="bg-white border border-blue-300 rounded px-1 font-bold">
                    State ▾
                  </span>{' '}
                  dropdown in the <span className="underline">upper-right corner</span> of the
                  search bar above
                </p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Or type a city name in the search box. Facility pins will appear once you select a
                location.
              </p>
            </div>
          </div>
        )}

        <MapLayerControls
          activeLayers={activeLayers}
          onToggle={toggleLayer}
          counts={layerCounts}
          loading={layerLoading}
        />

        {/* Stats badge */}
        {hasUserInput && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-3 z-10 shadow-sm">
            <div className="text-center">
              <span className="text-sm font-semibold text-green-600">{cleanCount}</span>
              <p className="text-[10px] text-gray-400">Clean</p>
            </div>
            <div className="w-px h-7 bg-gray-200" />
            <div className="text-center">
              <span className="text-sm font-semibold text-yellow-600">{warningCount}</span>
              <p className="text-[10px] text-gray-400">Citations</p>
            </div>
            <div className="w-px h-7 bg-gray-200" />
            <div className="text-center">
              <span className="text-sm font-semibold text-red-600">{criticalCount}</span>
              <p className="text-[10px] text-gray-400">Critical</p>
            </div>
            {activeLayers.has('medical') && medData && (
              <>
                <div className="w-px h-7 bg-gray-200" />
                <div className="text-center">
                  <span className="text-sm font-semibold text-rose-600">
                    {medData.providers?.length ?? 0}
                  </span>
                  <p className="text-[10px] text-gray-400">Medical</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Property profile panel */}
        {selectedProperty && (
          <div className="absolute top-0 right-0 h-full z-30 w-full md:w-[380px]">
            <PropertyProfilePanel
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          </div>
        )}
      </div>

      {/* ── Transition: Map → Compare ── */}
      <StepTransition
        stepLabel="Step 2 of 4"
        title="Compare facilities side by side"
        subtitle="Now that you have explored the map, see how costs and safety records stack up."
        targetId="compare"
        cta="Go to Comparison"
      />

      {/* ══ STEP 2: COMPARISON — synced to selected location ══ */}
      <div id="compare">
        <ComparisonGrid
          allProperties={allProperties}
          selectedState={stateFilter}
          selectedCity={committedCity}
        />
      </div>

      {/* ── Transition: Compare → Assess ── */}
      <StepTransition
        stepLabel="Step 3 of 4"
        title="Understand your specific situation"
        subtitle="Answer 3 quick questions so we can recommend the right support for your family."
        targetId="assess"
        cta="Assess My Needs"
      />

      {/* ══ STEP 3: NEEDS ASSESSMENT ══ */}
      <section
        id="assess"
        className="bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-10 md:py-12"
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Needs Assessment
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
              What is your situation right now?
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-xl">
              Answer three short questions and we will match you with the right resources, scripts,
              and care guidance for your family.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Wizard */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm">
                <TriageWizard onTabActivate={() => {}} />
              </div>
            </div>

            {/* Context sidebar */}
            <div className="flex flex-col gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Why this matters</h4>
                <ul className="flex flex-col gap-2.5">
                  {[
                    'Every situation is different — billing disputes, staffing concerns, and emergency exits all need different approaches.',
                    'We give you the exact words to use when talking to facility staff, billing offices, or state regulators.',
                    'All recommendations come with downloadable scripts and step-by-step guidance.',
                  ].map((txt, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                        {i + 1}
                      </span>
                      {txt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="text-xs font-semibold text-amber-800 mb-1">Not sure yet?</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Go back and explore more facilities. The assessment will still be here when you
                  are ready.
                </p>
                <a
                  href="#filter-bar"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-800 hover:underline"
                >
                  Back to map
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STEP 4: ALERTS ══ */}
      <div id="alerts">
        <EmailOptIn />
      </div>

      <footer className="bg-white border-t border-gray-200 px-4 md:px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2563EB] rounded-md flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">LYL Map</span>
          </div>
          <span className="text-xs text-gray-400">
            WCAG 2.1 AA · 5-Layer Compliance Stack
          </span>
          <a
            href="https://www.loveyourlongevity.org/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
          >
            Privacy Policy <ExternalLink size={10} />
          </a>
        </div>
      </footer>

      <style jsx global>{`
        .state-pulse-ring {
          animation: state-ring-pulse 1.4s ease-in-out infinite;
        }
        @keyframes state-ring-pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.06);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
