'use client';

import { useState } from 'react';
import { ArrowRight, CheckSquare, Square } from 'lucide-react';

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? '#';

const signs = [
  {
    id: 'furniture',
    label: 'Senior touches walls or furniture while walking ("Furniture Cruising")',
  },
  { id: 'mail', label: 'Unopened mail or bills are beginning to accumulate' },
  { id: 'home', label: 'Noticeable changes in home maintenance, pantry, or meal consistency' },
  {
    id: 'steps',
    label: 'Hesitation or misjudged steps near thresholds, rugs, or flooring changes',
  },
];

export default function EarlySignsTab() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleSign = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Proactive Risk Gauge</h3>
        <p className="text-sm text-gray-500 mt-1">
          Waiting for a crisis to force your hand means surrendering your legal and financial
          options. Scan early environmental markers today.
        </p>
      </div>

      <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
          Why This Matters Now
        </p>
        <p className="text-xs text-gray-700 leading-relaxed">
          Ignoring these micro-shifts allows risks to multiply unmonitored. Do not wait for a crisis
          to force a rushed, high-stress placement.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Check any that apply to your loved one:
        </p>
        {signs.map((sign) => {
          const isChecked = !!checked[sign.id];
          return (
            <button
              key={sign.id}
              onClick={() => toggleSign(sign.id)}
              className={`flex items-start gap-3 w-full text-left p-3 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                isChecked
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              role="checkbox"
              aria-checked={isChecked}
            >
              {isChecked ? (
                <CheckSquare size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Square size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-700 leading-snug">{sign.label}</span>
            </button>
          );
        })}
      </div>

      {checkedCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">
            {checkedCount} Early Indicator{checkedCount > 1 ? 's' : ''} Detected
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Your family is currently navigating the early stages of care transition. Ignoring these
            micro-shifts allows risks to multiply unmonitored. Do not wait for a crisis to force a
            rushed, high-stress placement.
          </p>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Pre-Crisis Planning Support Now — Instant Download
            <ArrowRight size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
