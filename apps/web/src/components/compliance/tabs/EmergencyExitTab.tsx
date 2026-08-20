'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, Shield, Loader2 } from 'lucide-react';
import LocationAutocomplete from '@/components/LocationAutocomplete';

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? '#';

const careOptions = [
  { value: 'Assisted Living', label: 'Assisted Living — help with daily tasks' },
  { value: 'Memory Care', label: "Memory Care — for dementia or Alzheimer's" },
  {
    value: 'Advanced Mobility Support',
    label: 'Advanced Mobility Support — wheelchair or bed care',
  },
];

export default function EmergencyExitTab() {
  const [location, setLocation] = useState('');
  const [careLevel, setCareLevel] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  const handleSearch = async () => {
    if (!location.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/cms/search?q=${encodeURIComponent(location)}&status=critical&limit=10`
      );
      if (res.ok) {
        const data = await res.json();
        setViolationCount(data.total ?? 0);
      }
    } catch {
      setViolationCount(0);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-red-600 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-white mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wide mb-1">
              Urgent: Don't Rush This Decision
            </p>
            <p className="text-xs text-red-100 leading-relaxed">
              Is a hospital staff member pressuring you to choose a care home right now? Stop. You
              have the right to take time. Rushed choices often lead to bad placements.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900">Find a Safe Placement Fast</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter the city where your loved one is right now. We'll check which care homes nearby have
          safety problems.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            City or area where you are right now
          </label>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            onSelect={setLocation}
            placeholder="Type a city — e.g. New York City"
            label="City or location search"
            className="w-full pr-3 py-3 text-base md:text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            What kind of care is needed?
          </label>
          <select
            value={careLevel}
            onChange={(e) => setCareLevel(e.target.value)}
            className="w-full px-3 py-3 md:py-2.5 text-base md:text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="">Choose the type of care needed...</option>
            {careOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={!location.trim() || loading}
          className="w-full bg-red-600 text-white text-sm font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Checking safety records...
            </>
          ) : (
            'Check Safety Records in This Area'
          )}
        </button>
      </div>

      {searched && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-700 mb-2">⚠ Safety Alert — {location}</p>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Care homes near your location have active safety violations on record.{' '}
            {violationCount > 0 && <strong>{violationCount} facilities</strong>} are currently
            flagged for problems including too few staff, slow response to residents, and improper
            use of sedation. Placing a loved one in these facilities right now raises the risk of
            harm and a return trip to the hospital.
          </p>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
          >
            Get Emergency Placement Support Now — Instant Download
            <ArrowRight size={12} />
          </a>
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <Shield size={13} className="text-gray-400" />
        <span className="text-xs text-gray-500">
          Includes post-discharge and transition support tools
        </span>
      </div>
    </div>
  );
}
