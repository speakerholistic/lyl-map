'use client';

import { ArrowRight, Wifi, AlertCircle } from 'lucide-react';
import { KAJABI_URLS } from '@/lib/kajabi';

const rankColors = {
  high: { bg: 'bg-green-50', dot: 'bg-green-500', label: 'text-green-700', text: 'Cooperative' },
  medium: { bg: 'bg-yellow-50', dot: 'bg-yellow-500', label: 'text-yellow-700', text: 'Partial' },
  low: { bg: 'bg-red-50', dot: 'bg-red-500', label: 'text-red-700', text: 'Resistant' },
};

const metrics = [
  { label: 'Digital charting transparency', value: 'Weekly summary access', score: 72 },
  { label: 'Remote update frequency', value: 'Bi-weekly family portal sync', score: 68 },
  { label: 'Camera cooperation history', value: 'Case-by-case review required', score: 54 },
  { label: 'Independent monitor access', value: 'Written request required', score: 41 },
];

export default function RemoteMonitorTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Remote Sentinel Overview</h3>
        <p className="text-sm text-gray-500 mt-1">
          Properties ranked by digital transparency and willingness to cooperate with independent
          monitoring.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Object.entries(rankColors).map(([rank, style]) => (
          <div
            key={rank}
            className={`${style.bg} border border-gray-200 rounded-xl p-3 text-center`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${style.dot} mx-auto mb-1.5`} />
            <span className={`text-xs font-semibold ${style.label} capitalize`}>{rank}</span>
            <p className="text-xs text-gray-500 mt-0.5">{style.text}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <Wifi size={13} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Oversight Metrics
          </span>
        </div>
        {metrics.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-3 flex items-center justify-between ${i < metrics.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div>
              <p className="text-xs font-medium text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.value}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${m.score}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-700 w-7 text-right">{m.score}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2">
        <AlertCircle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-yellow-800 leading-relaxed">
          Facilities marked "Remote-Friendly" have documented histories of cooperating with
          independent monitoring directives.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={KAJABI_URLS.module18}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Module 18: Independent Camera Placement Directive
          <ArrowRight size={12} />
        </a>
        <a
          href={KAJABI_URLS.module21}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-blue-600 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
        >
          Module 21: Remote Care Oversight Mandates
          <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}
