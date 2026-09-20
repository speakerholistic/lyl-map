'use client';

import { X, ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { Property } from '@/data/mockProperties';
import { KAJABI_URLS } from '@/lib/kajabi';

interface Props {
  property: Property;
  onClose: () => void;
}

function CircularRing({ value, color }: { value: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#F3F4F6" strokeWidth="4" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="32" textAnchor="middle" fontSize="10" fontWeight="600" fill="#111827">
        {value}
      </text>
    </svg>
  );
}

const statusConfig = {
  clean: {
    label: 'Clean Record',
    dot: 'bg-green-500',
    pill: 'bg-green-50 border-green-200 text-green-700',
  },
  warning: {
    label: 'Safety Issues Found',
    dot: 'bg-yellow-500',
    pill: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  critical: {
    label: 'Serious Violations',
    dot: 'bg-red-500',
    pill: 'bg-red-50 border-red-200 text-red-700',
  },
};

export default function PropertyProfilePanel({ property, onClose }: Props) {
  const sc = statusConfig[property.status];

  const cta =
    property.status === 'critical'
      ? {
          text: `Download the ${property.state} Care Home Advocacy Toolkit`,
          sub: 'Module 24 — Forensic Audit Tool',
          color: 'bg-red-600 hover:bg-red-700',
          href: KAJABI_URLS.module24,
        }
      : property.status === 'warning'
        ? {
            text: `This care home has ${property.citationCount} active citations. Document before you sign anything.`,
            sub: 'Module 8 — Legal Documentation',
            color: 'bg-[#2563EB] hover:bg-blue-700',
            href: KAJABI_URLS.module8,
          }
        : {
            text: 'Browse the full compliance toolkit library',
            sub: 'All Modules — Free Access',
            color: 'bg-gray-900 hover:bg-gray-800',
            href: KAJABI_URLS.library,
          };

  return (
    <div
      className="absolute top-0 right-0 h-full w-[380px] bg-white border-l border-gray-200 flex flex-col z-30 overflow-hidden"
      role="dialog"
      aria-label={`Property profile for ${property.name}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-gray-200">
        <div className="flex-1 min-w-0 pr-3">
          <h2 className="text-base font-semibold text-gray-900 leading-tight">{property.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {property.address}, {property.city}, {property.state}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs ${sc.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Close property profile"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Score rings */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-around">
        <div className="text-center">
          <CircularRing value={property.valueScore} color="#EA580C" />
          <p
            className="text-xs text-gray-500 mt-1"
            title="How much care quality you get for the price (0–100, higher is better)"
          >
            Value Score
          </p>
        </div>
        <div className="text-center">
          <CircularRing value={property.qualityScore} color="#2563EB" />
          <p
            className="text-xs text-gray-500 mt-1"
            title="Overall care quality based on federal inspection data (0–100, higher is better)"
          >
            Quality Score
          </p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{property.staffingRatio}</div>
          <p
            className="text-xs text-gray-500 mt-1"
            title="Ratio of staff to residents — e.g. 1:8 means one staff member for every 8 residents"
          >
            Staff Ratio
          </p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            ${(property.monthlyFee / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-gray-500 mt-1">Monthly Cost</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section 1: Compliance History */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Compliance History</h3>
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex items-center justify-between">
              <span
                className="text-xs text-gray-500"
                title="Total number of safety violations found by federal inspectors"
              >
                Safety Violations Found
              </span>
              <span
                className={`text-xs font-semibold ${property.citationCount > 10 ? 'text-red-600' : property.citationCount > 3 ? 'text-yellow-600' : 'text-green-600'}`}
              >
                {property.citationCount} citations
              </span>
            </div>
          </div>
          {property.deficiencyTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {property.deficiencyTypes.map((d) => (
                <span
                  key={d}
                  className="bg-white border border-gray-200 rounded-full px-2.5 py-1 text-xs text-gray-700"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {property.inspectionHistory.map((rec, i) => (
              <div key={i} className="bg-gray-50 rounded-lg px-3 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{rec.type}</span>
                  <span className="text-xs text-gray-400">{rec.date}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{rec.findings}</p>
                <span className="mt-1.5 inline-flex items-center bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs text-gray-600">
                  Severity Level {rec.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Staffing */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Staffing Record</h3>
          <div className="flex flex-col gap-2">
            {[
              {
                label: 'Staff-to-Resident Ratio',
                value: property.staffingRatio,
                tip: 'How many residents each staff member is responsible for',
              },
              {
                label: 'Care Aide Hours per Day',
                value: property.cnaPattern,
                tip: 'Average nursing and aide hours provided per resident each day',
              },
              {
                label: 'Weekend Staffing',
                value: property.weekendCoverage,
                tip: 'Whether staffing levels drop on weekends',
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3">
                <span className="text-xs text-gray-500 flex-shrink-0" title={row.tip}>
                  {row.label}
                </span>
                <span className="text-xs font-medium text-gray-900 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Quality Measures */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quality Measures</h3>
          <div className="flex flex-col gap-2">
            {[
              {
                label: 'Fall Rate',
                value: property.fallRate,
                unit: '',
                warn: 3,
                tip: 'How often residents fall — per 1,000 days of care. Lower is better.',
              },
              {
                label: 'Sent Back to Hospital',
                value: property.rehospitalizationRate,
                unit: '%',
                warn: 20,
                tip: 'Percentage of residents who are re-admitted to a hospital within 30 days.',
              },
              {
                label: 'Bedsore Rate',
                value: property.pressureInjuryRate,
                unit: '%',
                warn: 5,
                tip: "Percentage of residents who develop pressure injuries (bedsores) under this facility's care.",
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500" title={row.tip}>
                  {row.label}
                </span>
                <div className="flex items-center gap-1">
                  {row.value > row.warn ? (
                    <TrendingUp size={11} className="text-red-500" />
                  ) : row.value > row.warn * 0.6 ? (
                    <Minus size={11} className="text-yellow-500" />
                  ) : (
                    <TrendingDown size={11} className="text-green-500" />
                  )}
                  <span
                    className={`text-xs font-semibold ${row.value > row.warn ? 'text-red-600' : row.value > row.warn * 0.6 ? 'text-yellow-600' : 'text-green-600'}`}
                  >
                    {row.value}
                    {row.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Financial & Ownership */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial & Ownership</h3>
          <div className="flex flex-col gap-2">
            {[
              {
                label: 'Monthly Cost',
                value: `$${property.monthlyFee.toLocaleString()}`,
                tip: 'Estimated monthly fee based on CMS regional data',
              },
              {
                label: 'Est. Revenue per Bed',
                value: `$${property.revenuePerBed.toLocaleString()}`,
                tip: 'How much this facility earns per occupied bed — indicates financial incentives',
              },
              {
                label: 'Who Runs This Facility',
                value: property.operator,
                tip: 'The legal operating entity responsible for this care home',
              },
              {
                label: 'Parent Company',
                value: property.ownershipChain,
                tip: 'The corporate ownership chain — may include private equity or national chains',
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3">
                <span className="text-xs text-gray-500 flex-shrink-0" title={row.tip}>
                  {row.label}
                </span>
                <span className="text-xs font-medium text-gray-900 text-right break-words max-w-[180px]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic CTA */}
        <div className="px-5 py-4">
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between w-full ${cta.color} text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors`}
          >
            <span className="leading-snug">{cta.text}</span>
            <ArrowRight size={14} className="flex-shrink-0 ml-2" />
          </a>
          <p className="text-xs text-gray-400 mt-1.5 text-center">{cta.sub}</p>
        </div>
      </div>
    </div>
  );
}
