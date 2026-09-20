'use client';

import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  Square,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  MapPin,
} from 'lucide-react';
import {
  Q1_TRACKS,
  Q2_OPTIONS,
  MODULES,
  Q3_ADDRESSEES,
  type TabDestination,
  type ModuleData,
  type Q3Addressee,
} from '@/data/triageData';

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? '#';

// Plain-language display names for the Q3 addressee dropdown
const ADDRESSEE_LABELS: Record<string, string> = {
  Administrator: 'Facility Administrator',
  'Business Office / Billing': 'Billing Department',
  'Social Services Director': 'Social Worker',
  'Medical Director': 'Medical Director',
  'Director of Nursing': 'Head Nurse',
  'State Licensing Agency / Ombudsman': 'State Inspector or Patient Advocate',
  'Medicare Advantage Plan / QIO': 'Medicare or Insurance Plan',
};

const URGENCY_STYLES = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  low: 'bg-green-50 border-green-200 text-green-700',
};

const URGENCY_LABELS = {
  high: '🔴 High Urgency',
  medium: '🟡 Time-Sensitive',
  low: '🟢 Proactive',
};

interface ModuleCardProps {
  mod: ModuleData;
  addressee: Q3Addressee;
  expanded: boolean;
  onToggle: () => void;
}

function ModuleCard({ mod, addressee, expanded, onToggle }: ModuleCardProps) {
  const script = mod.scripts[addressee];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Module header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">{mod.id}</span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${URGENCY_STYLES[mod.urgency]}`}
            >
              {URGENCY_LABELS[mod.urgency]}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
            {mod.description}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1 text-gray-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-3.5 pb-4 flex flex-col gap-3 bg-gray-50">
          {/* Document preview — addressee set globally above */}
          <div className="bg-white border border-blue-100 rounded-xl p-3.5 mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={12} className="text-blue-500" />
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                Script for {ADDRESSEE_LABELS[addressee] ?? addressee}
              </p>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{script}</p>
          </div>

          {/* Shop CTA */}
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get the Full {mod.name} Module
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Map-target instruction card for property-profile destinations ──
function PropertyProfileInstruction({ moduleCount }: { moduleCount: number }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
      <MapPin size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-amber-800 mb-1">Select a facility on the map</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Click any facility pin to open its compliance profile.{' '}
          {moduleCount > 1 ? `Your ${moduleCount} matched modules` : 'Your matched module'} will
          appear with full scripts and download links.
        </p>
      </div>
    </div>
  );
}

type Step = 'q1' | 'q2' | 'result';

interface TriageWizardProps {
  onTabActivate: (tab: TabDestination) => void;
}

export default function TriageWizard({ onTabActivate }: TriageWizardProps) {
  const [step, setStep] = useState<Step>('q1');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [selectedAddressee, setSelectedAddressee] = useState<Q3Addressee>(Q3_ADDRESSEES[0]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const track = Q1_TRACKS.find((t) => t.id === selectedTrackId);
  const q2Options = selectedTrackId ? (Q2_OPTIONS[selectedTrackId] ?? []) : [];

  const matchedModuleIds = Array.from(selectedOptions)
    .map((optId) => q2Options.find((o) => o.id === optId)?.moduleId)
    .filter((id): id is string => !!id);

  const matchedModules = matchedModuleIds.map((id) => MODULES[id]).filter(Boolean);

  const reset = () => {
    setStep('q1');
    setSelectedTrackId(null);
    setSelectedOptions(new Set());
    setExpandedModule(null);
  };

  const handleQ1Select = (trackId: string) => {
    setSelectedTrackId(trackId);
    setSelectedOptions(new Set());
    setStep('q2');
  };

  const handleQ2Toggle = (optId: string) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(optId)) next.delete(optId);
      else next.add(optId);
      return next;
    });
  };

  const handleQ2Continue = () => {
    if (selectedOptions.size === 0 || !track) return;
    onTabActivate(track.opensTab);
    // Auto-expand the first module
    if (matchedModuleIds[0]) setExpandedModule(matchedModuleIds[0]);
    setStep('result');
  };

  // ── Q1 ──
  if (step === 'q1') {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="mb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Step 1 of 3
          </p>
          <h3 className="text-sm font-bold text-gray-900">What's happening right now?</h3>
          <p className="text-xs text-gray-500 mt-0.5">Choose the situation that fits best.</p>
        </div>

        {Q1_TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleQ1Select(t.id)}
            className="flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {t.id}
            </span>
            <span className="text-xs text-gray-700 leading-snug flex-1">{t.situation}</span>
            <ArrowRight size={13} className="text-gray-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  // ── Q2 ──
  if (step === 'q2') {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-2 mb-1">
          <button
            onClick={reset}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0 mt-0.5"
            aria-label="Back to step 1"
          >
            <ArrowLeft size={13} />
          </button>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Step 2 of 3
            </p>
            <h3 className="text-sm font-bold text-gray-900">Which of these apply?</h3>
            <p className="text-xs text-gray-500 mt-0.5">Select all that fit your situation.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-700 font-medium">
            Track {selectedTrackId}: {track?.situation}
          </p>
        </div>

        {q2Options.map((opt) => {
          const isChecked = selectedOptions.has(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => handleQ2Toggle(opt.id)}
              role="checkbox"
              aria-checked={isChecked}
              className={`flex items-start gap-2.5 w-full text-left p-3 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isChecked
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isChecked ? (
                <CheckSquare size={15} className="text-blue-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Square size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 leading-snug">{opt.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{opt.moduleId}</p>
              </div>
            </button>
          );
        })}

        <button
          onClick={handleQ2Continue}
          disabled={selectedOptions.size === 0}
          className="w-full bg-[#2563EB] text-white text-xs font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          Find My Module{selectedOptions.size > 1 ? 's' : ''}
          <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  // ── Result ──
  const isPropertyProfile = track?.opensTab === 'property-profile';

  return (
    <div className="flex flex-col gap-3">
      {/* Result header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStep('q2')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
          aria-label="Back to step 2"
        >
          <ArrowLeft size={13} />
        </button>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
            Step 3 of 3
          </p>
          <h3 className="text-sm font-bold text-gray-900">
            {matchedModules.length > 1 ? `${matchedModules.length} Modules Matched` : 'Your Module'}
          </h3>
        </div>
      </div>

      {/* Addressee selector (global Q3 — applies to all modules) */}
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
          Who are you addressing this to?
        </label>
        <select
          value={selectedAddressee}
          onChange={(e) => setSelectedAddressee(e.target.value as Q3Addressee)}
          className="w-full px-3 py-2 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {Q3_ADDRESSEES.map((a) => (
            <option key={a} value={a}>
              {ADDRESSEE_LABELS[a] ?? a}
            </option>
          ))}
        </select>
      </div>

      {/* Property profile instruction */}
      {isPropertyProfile && <PropertyProfileInstruction moduleCount={matchedModules.length} />}

      {/* Module cards */}
      {matchedModules.map((mod) => (
        <ModuleCard
          key={mod.id}
          mod={mod}
          addressee={selectedAddressee}
          expanded={expandedModule === mod.id}
          onToggle={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
        />
      ))}

      {matchedModules.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            No modules matched. Please go back and select at least one option.
          </p>
        </div>
      )}

      {/* Shop all link */}
      <a
        href={SHOP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors py-1"
      >
        Browse all modules in the shop
        <ExternalLink size={10} />
      </a>

      {/* Start over */}
      <button
        onClick={reset}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto"
      >
        <RotateCcw size={11} />
        Start Over
      </button>
    </div>
  );
}
