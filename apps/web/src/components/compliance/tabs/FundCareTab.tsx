'use client';

import { useState } from 'react';
import { DollarSign, AlertTriangle, ArrowRight } from 'lucide-react';

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? '#';

export default function FundCareTab() {
  const [liquidSavings, setLiquidSavings] = useState('');
  const [homeEquity, setHomeEquity] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [result, setResult] = useState<{ months: number; message: string } | null>(null);

  const calculate = () => {
    const savings = parseFloat(liquidSavings.replace(/,/g, '')) || 0;
    const _equity = parseFloat(homeEquity.replace(/,/g, '')) || 0;
    const fee = parseFloat(monthlyFee.replace(/,/g, '')) || 0;

    if (fee <= 0) return;
    const months = Math.floor(savings / fee);
    setResult({
      months,
      message: `At this monthly rate, your savings would run out in approximately ${months} months (${Math.floor(months / 12)} years). Once your money is gone, the facility may push you toward Medicaid, a lower level of care, or — in some cases — pressure you to leave. Knowing this timeline now gives you time to plan and protect what you have.`,
    });
  };

  const formatInput = (val: string) => val.replace(/[^0-9.]/g, '');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-gray-900">Asset & Equity Calculator</h3>
        <p className="text-sm text-gray-500 mt-1">
          Understand how long your assets will last before care home billing depletes them.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            How much money do you have saved? (total)
          </label>
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={liquidSavings}
              onChange={(e) => setLiquidSavings(formatInput(e.target.value))}
              placeholder="e.g. 150000"
              className="w-full pl-8 pr-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            What is your home or property worth? (if you own one)
          </label>
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={homeEquity}
              onChange={(e) => setHomeEquity(formatInput(e.target.value))}
              placeholder="e.g. 300000 — or leave blank"
              className="w-full pl-8 pr-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            What is the monthly cost of the care home?
          </label>
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(formatInput(e.target.value))}
              placeholder="e.g. 7500"
              className="w-full pl-8 pr-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full bg-[#2563EB] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Show Me How Long My Money Will Last
        </button>
      </div>

      {result && (
        <div className="bg-[#FFF7ED] border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
              ⚠ Money Timeline Warning
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.message}</p>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Asset Insulation Shield Now — Instant Download
            <ArrowRight size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
