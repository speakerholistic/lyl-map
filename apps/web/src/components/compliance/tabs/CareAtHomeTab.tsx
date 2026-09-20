'use client';

import { ArrowRight, TrendingDown } from 'lucide-react';
import { KAJABI_URLS } from '@/lib/kajabi';

const regionData = [
  {
    region: 'Northeast',
    directRate: '$18–$24/hr',
    agencyRate: '$32–$48/hr',
    markup: '78%',
    careHomeAvg: '$6,800/mo',
  },
  {
    region: 'Southeast',
    directRate: '$14–$19/hr',
    agencyRate: '$26–$38/hr',
    markup: '72%',
    careHomeAvg: '$4,900/mo',
  },
  {
    region: 'Midwest',
    directRate: '$15–$21/hr',
    agencyRate: '$27–$40/hr',
    markup: '74%',
    careHomeAvg: '$5,100/mo',
  },
  {
    region: 'Southwest',
    directRate: '$16–$22/hr',
    agencyRate: '$29–$42/hr',
    markup: '76%',
    careHomeAvg: '$5,400/mo',
  },
  {
    region: 'West Coast',
    directRate: '$22–$30/hr',
    agencyRate: '$38–$56/hr',
    markup: '80%',
    careHomeAvg: '$7,200/mo',
  },
];

export default function CareAtHomeTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Private Caregiver Wage Benchmark</h3>
        <p className="text-sm text-gray-500 mt-1">
          Direct-hire rates vs. agency markups — and how they compare to care home monthly fees.
        </p>
      </div>

      <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown size={14} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            You're Saving the System
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          You are saving the healthcare system thousands per month by managing care at home. Secure
          that investment with forensic on-site logs.
        </p>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 px-3 py-2">
          <span className="text-xs font-semibold text-gray-500">Region</span>
          <span className="text-xs font-semibold text-gray-500">Direct Hire</span>
          <span className="text-xs font-semibold text-gray-500">Agency Rate</span>
          <span className="text-xs font-semibold text-gray-500">Markup</span>
        </div>
        {regionData.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 px-3 py-2.5 ${i < regionData.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <span className="text-xs font-semibold text-gray-900">{row.region}</span>
            <span className="text-xs text-gray-600">{row.directRate}</span>
            <span className="text-xs text-gray-600">{row.agencyRate}</span>
            <span className="text-xs font-semibold text-orange-600">{row.markup}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={KAJABI_URLS.module15}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Module 15: Private Caregiver Employment Shield
          <ArrowRight size={12} />
        </a>
        <a
          href={KAJABI_URLS.module16}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-blue-600 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
        >
          Module 16: Shift-Change Compliance Trackers
          <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}
