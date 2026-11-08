'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  MapPin,
} from 'lucide-react';
import {
  Q2_OPTIONS,
  MODULES,
  type TabDestination,
  type ModuleData,
  type Q3Addressee,
} from '@/data/triageData';
import { matchTrack, matchModuleIds, matchAddressee } from '@/data/triageMatching';
import { SHOP_URL } from '@/lib/kajabi';

// Plain-language display names for the matched Q3 addressee
const ADDRESSEE_LABELS: Record<string, string> = {
  Administrator: 'Care Home Administrator',
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
  addresseeText: string;
  expanded: boolean;
  onToggle: () => void;
}

function ModuleCard({ mod, addressee, addresseeText, expanded, onToggle }: ModuleCardProps) {
  const script = mod.scripts[addressee];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Module header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`module-${mod.id}`}
        className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-bold text-gray-600 tracking-widest">{mod.id}</span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${URGENCY_STYLES[mod.urgency]}`}
            >
              <span aria-hidden="true">{URGENCY_LABELS[mod.urgency].split(' ')[0]} </span>
              {URGENCY_LABELS[mod.urgency].replace(/^\S+\s/, '')}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
          <p className="text-xs text-gray-600 mt-0.5 leading-snug line-clamp-2">
            {mod.description}
          </p>
        </div>
        <div className="flex-shrink-0 mt-1 text-gray-600" aria-hidden="true">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          id={`module-${mod.id}`}
          className="border-t border-gray-100 px-3.5 pb-4 flex flex-col gap-3 bg-gray-50"
        >
          {/* Document preview — addressee set globally above */}
          <div className="bg-white border border-blue-100 rounded-xl p-3.5 mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={12} className="text-blue-600" aria-hidden="true" />
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                Script for {addresseeText.trim() || (ADDRESSEE_LABELS[addressee] ?? addressee)}
              </p>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{script}</p>
          </div>

          {/* Shop CTA */}
          <a
            href={SHOP_URL}
            target="_top"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get the Full {mod.name} Module
            <ArrowRight size={11} aria-hidden="true" />
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
      <MapPin size={15} className="text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold text-amber-800 mb-1">Select a care home on the map</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Click any care home pin to open its compliance profile.{' '}
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
  /** State picked on the map (e.g. "TN") — kept and shown through every step. */
  selectedState?: string;
}

// Shows which state the results apply to, so the map selection carries through the form.
function StateChip({ state }: { state?: string }) {
  if (!state) return null;
  return (
    <span className="inline-flex items-center gap-1 self-start bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-2.5 py-1 text-[10px] font-semibold">
      <MapPin size={10} aria-hidden="true" />
      State: {state}
    </span>
  );
}

const TEXTAREA_CLASS =
  'w-full px-3 py-2.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-xl resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

export default function TriageWizard({ onTabActivate, selectedState }: TriageWizardProps) {
  const [step, setStep] = useState<Step>('q1');
  const [q1Text, setQ1Text] = useState('');
  const [q2Text, setQ2Text] = useState('');
  const [addresseeText, setAddresseeText] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Move keyboard focus to the new step's field/heading when the step changes (WCAG 2.4.3)
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = step === 'q1' ? 'triage-q1' : step === 'q2' ? 'triage-q2' : 'triage-result-heading';
    document.getElementById(id)?.focus();
  }, [step]);

  const track = q1Text.trim() ? matchTrack(q1Text) : undefined;
  const q2Examples = track ? (Q2_OPTIONS[track.id] ?? []) : [];

  const matchedModuleIds = track ? matchModuleIds(q2Text, q1Text, track.id) : [];
  const matchedModules = matchedModuleIds.map((id) => MODULES[id]).filter(Boolean);
  const selectedAddressee = matchAddressee(addresseeText);

  const reset = () => {
    setStep('q1');
    setQ1Text('');
    setQ2Text('');
    setExpandedModule(null);
  };

  const handleQ1Continue = () => {
    if (!q1Text.trim()) return;
    setStep('q2');
  };

  const handleQ2Continue = () => {
    if (!q2Text.trim() || !track) return;
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
          <StateChip state={selectedState} />
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 mt-1">
            Step 1 of 3
          </p>
          <label htmlFor="triage-q1" className="block text-sm font-bold text-gray-900">
            What's happening right now?
          </label>
          <p id="triage-q1-hint" className="text-xs text-gray-600 mt-0.5">
            Describe the situation in your own words.
          </p>
        </div>

        <textarea
          id="triage-q1"
          aria-describedby="triage-q1-hint"
          value={q1Text}
          onChange={(e) => setQ1Text(e.target.value)}
          rows={4}
          placeholder="e.g. We just got a discharge notice and have 30 days to leave"
          className={TEXTAREA_CLASS}
        />

        <button
          type="button"
          onClick={handleQ1Continue}
          disabled={!q1Text.trim()}
          className="w-full bg-[#2563EB] text-white text-xs font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          Continue
          <ArrowRight size={13} aria-hidden="true" />
        </button>
      </div>
    );
  }

  // ── Q2 ──
  if (step === 'q2') {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start gap-2 mb-1">
          <button
            type="button"
            onClick={() => setStep('q1')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0 mt-0.5"
            aria-label="Back to step 1"
          >
            <ArrowLeft size={13} aria-hidden="true" />
          </button>
          <div>
            <StateChip state={selectedState} />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-0.5 mt-1">
              Step 2 of 3
            </p>
            <label htmlFor="triage-q2" className="block text-sm font-bold text-gray-900">
              Which of these apply?
            </label>
            <p id="triage-q2-hint" className="text-xs text-gray-600 mt-0.5">
              Tell us the specifics — include everything that fits your situation.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-700 font-medium whitespace-pre-wrap">{q1Text.trim()}</p>
        </div>

        <textarea
          id="triage-q2"
          aria-describedby="triage-q2-hint"
          value={q2Text}
          onChange={(e) => setQ2Text(e.target.value)}
          rows={4}
          placeholder={q2Examples[0] ? `e.g. ${q2Examples[0].label}` : 'Describe the details…'}
          className={TEXTAREA_CLASS}
        />

        <button
          type="button"
          onClick={handleQ2Continue}
          disabled={!q2Text.trim()}
          className="w-full bg-[#2563EB] text-white text-xs font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          Find My Module{matchedModuleIds.length > 1 ? 's' : ''}
          <ArrowRight size={13} aria-hidden="true" />
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
          type="button"
          onClick={() => setStep('q2')}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 flex-shrink-0"
          aria-label="Back to step 2"
        >
          <ArrowLeft size={13} aria-hidden="true" />
        </button>
        <div>
          <StateChip state={selectedState} />
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-0.5 mt-1">
            Step 3 of 3
          </p>
          <h3 id="triage-result-heading" tabIndex={-1} className="text-sm font-bold text-gray-900">
            {matchedModules.length > 1 ? `${matchedModules.length} Modules Matched` : 'Your Module'}
          </h3>
        </div>
      </div>

      {/* Addressee (global Q3 — applies to all modules) */}
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <label
          htmlFor="triage-q3"
          className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1.5"
        >
          Who are you addressing this to?
        </label>
        <textarea
          id="triage-q3"
          value={addresseeText}
          onChange={(e) => setAddresseeText(e.target.value)}
          rows={2}
          placeholder="e.g. The care home administrator, the head nurse, or the state inspector"
          className="w-full px-3 py-2 text-xs text-gray-900 bg-gray-50 border border-gray-200 rounded-lg resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        />
      </div>

      {/* Property profile instruction */}
      {isPropertyProfile && <PropertyProfileInstruction moduleCount={matchedModules.length} />}

      {/* Module cards */}
      {matchedModules.map((mod) => (
        <ModuleCard
          key={mod.id}
          mod={mod}
          addressee={selectedAddressee}
          addresseeText={addresseeText}
          expanded={expandedModule === mod.id}
          onToggle={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
        />
      ))}

      {matchedModules.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle size={14} className="text-yellow-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-yellow-800">
            No modules matched. Please go back and describe your situation in a bit more detail.
          </p>
        </div>
      )}

      {/* Shop all link */}
      <a
        href={SHOP_URL}
        target="_top"
        className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors py-1"
      >
        Browse all modules in the shop
        <ArrowRight size={10} aria-hidden="true" />
      </a>

      {/* Start over */}
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors mx-auto"
      >
        <RotateCcw size={11} aria-hidden="true" />
        Start Over
      </button>
    </div>
  );
}
