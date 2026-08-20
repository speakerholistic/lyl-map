'use client';

import { useState, useEffect } from 'react';
import { Plus, X, TrendingDown, TrendingUp, Minus, Wifi, WifiOff, MapPin } from 'lucide-react';
import type { Property } from '@/data/mockProperties';

interface Props {
  allProperties: Property[];
  selectedState?: string;
  selectedCity?: string;
}

function ScoreBadge({ value, invert = false }: { value: number; invert?: boolean }) {
  const isGood = invert ? value < 3 : value > 70;
  const isMid = invert ? value < 6 : value > 40;
  const color = isGood ? 'text-green-600' : isMid ? 'text-yellow-600' : 'text-red-600';
  const Icon = isGood ? TrendingDown : isMid ? Minus : TrendingUp;
  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon size={12} />
      <span className="text-xs font-semibold">{value}</span>
    </div>
  );
}

const statusConfig = {
  clean: {
    label: 'Clean',
    dot: 'bg-green-500',
    pill: 'bg-green-50 border-green-100 text-green-700',
  },
  warning: {
    label: 'Citations',
    dot: 'bg-yellow-500',
    pill: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  },
  critical: {
    label: 'Violations',
    dot: 'bg-red-500',
    pill: 'bg-red-50 border-red-100 text-red-700',
  },
};

export default function ComparisonGrid({ allProperties, selectedState, selectedCity }: Props) {
  const [selected, setSelected] = useState<Property[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Reset whenever the location context changes so the tool auto-fills from the new pool
  useEffect(() => {
    setInitialized(false);
    setSelected([]);
  }, [selectedState, selectedCity]);

  // Pre-fill comparison slots once properties load for the current location
  useEffect(() => {
    if (!initialized && allProperties.length > 0) {
      const initial: Property[] = [];
      if (allProperties[0]) initial.push(allProperties[0]);
      if (allProperties[2]) initial.push(allProperties[2]);
      else if (allProperties[1]) initial.push(allProperties[1]);
      setSelected(initial);
      setInitialized(true);
    }
  }, [allProperties, initialized]);

  const addProperty = (prop: Property) => {
    if (selected.length < 4 && !selected.find((p) => p.id === prop.id)) {
      setSelected((prev) => [...prev, prop]);
    }
    setShowPicker(false);
  };

  const removeProperty = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const available = allProperties.filter((p) => !selected.find((s) => s.id === p.id));

  const locationLabel = selectedState
    ? `Facilities in ${selectedState}`
    : selectedCity
      ? `Facilities near ${selectedCity}`
      : null;

  const rows = [
    {
      label: 'Monthly Cost',
      render: (p: Property) => (
        <span className="text-xs font-semibold text-gray-900">
          ${p.monthlyFee.toLocaleString()}
        </span>
      ),
    },
    { label: 'Value Score', render: (p: Property) => <ScoreBadge value={p.valueScore} /> },
    { label: 'Quality Score', render: (p: Property) => <ScoreBadge value={p.qualityScore} /> },
    {
      label: 'Staff per Resident',
      render: (p: Property) => <span className="text-xs text-gray-700">{p.staffingRatio}</span>,
    },
    {
      label: 'Safety Violations',
      render: (p: Property) => (
        <span
          className={`text-xs font-semibold ${p.citationCount > 10 ? 'text-red-600' : p.citationCount > 3 ? 'text-yellow-600' : 'text-green-600'}`}
        >
          {p.citationCount}
        </span>
      ),
    },
    { label: 'Fall Rate', render: (p: Property) => <ScoreBadge value={p.fallRate} invert /> },
    {
      label: 'Back to Hospital Rate',
      render: (p: Property) => (
        <span
          className={`text-xs font-semibold ${p.rehospitalizationRate > 25 ? 'text-red-600' : p.rehospitalizationRate > 15 ? 'text-yellow-600' : 'text-green-600'}`}
        >
          {p.rehospitalizationRate}%
        </span>
      ),
    },
    {
      label: 'Monitoring Ready',
      render: (p: Property) =>
        p.remoteMonitorRank === 'high' ? (
          <span className="inline-flex items-center gap-1 bg-green-50 border border-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
            <Wifi size={10} />
            Yes
          </span>
        ) : p.remoteMonitorRank === 'medium' ? (
          <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-full px-2 py-0.5 text-xs font-medium">
            <Wifi size={10} />
            Partial
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-red-50 border border-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-medium">
            <WifiOff size={10} />
            No
          </span>
        ),
    },
  ];

  return (
    <section className="bg-white border-t border-gray-200" aria-label="Direct comparison tool">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-10 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 rounded-full px-3 py-1.5 text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Direct Comparison Tool
            </div>
            {locationLabel && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-3 py-1.5 text-xs font-medium">
                <MapPin size={11} />
                {locationLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
            Are you paying too much for too little?
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">
            Some facilities charge top dollar while having serious safety violations on record.
            Compare up to 4 care homes side by side to see what you&apos;re actually getting.
          </p>
          {!selectedState && !selectedCity && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3 inline-block">
              💡 Select a state or city above to auto-load local facilities here
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
          {/* Column Headers */}
          <div
            className="grid bg-gray-50 border-b border-gray-200"
            style={{
              gridTemplateColumns: `160px repeat(${Math.max(selected.length, 1)}, minmax(140px, 1fr))`,
            }}
          >
            <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Metric
            </div>
            {selected.map((prop) => {
              const sc = statusConfig[prop.status];
              return (
                <div key={prop.id} className="px-4 py-3 border-l border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-tight">
                        {prop.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {prop.city}, {prop.state}
                      </p>
                      <span
                        className={`mt-1.5 inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs ${sc.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeProperty(prop.id)}
                      className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
                      aria-label={`Remove ${prop.name} from comparison`}
                    >
                      <X size={12} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {selected.length < 4 && (
              <div className="px-4 py-3 border-l border-gray-200 flex items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <Plus size={12} />
                    Add Property
                  </button>
                  {showPicker && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
                      {available.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-gray-400 italic">
                          No more facilities available. Select a state to load more.
                        </p>
                      ) : (
                        available.map((prop) => (
                          <button
                            key={prop.id}
                            onClick={() => addProperty(prop)}
                            className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <span
                              className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${prop.status === 'clean' ? 'bg-green-500' : prop.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
                            />
                            <div>
                              <p className="text-xs font-medium text-gray-900">{prop.name}</p>
                              <p className="text-xs text-gray-400">
                                {prop.city}, {prop.state}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Data rows */}
          {rows.map((row, ri) => (
            <div
              key={row.label}
              className={`grid ${ri % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
              style={{
                gridTemplateColumns: `160px repeat(${Math.max(selected.length, 1)}, minmax(140px, 1fr))`,
              }}
            >
              <div className="px-4 py-3 flex items-center">
                <span className="text-gray-400 mr-2 text-xs select-none">-</span>
                <span className="text-xs text-gray-600">{row.label}</span>
              </div>
              {selected.map((prop) => (
                <div key={prop.id} className="px-4 py-3 border-l border-gray-100 flex items-center">
                  {row.render(prop)}
                </div>
              ))}
              {selected.length < 4 && <div className="px-4 py-3 border-l border-gray-100" />}
            </div>
          ))}

          {selected.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-400">
                {allProperties.length === 0
                  ? 'Select a state or city above to load facilities you can compare.'
                  : 'Use "Add Property" to start comparing facilities.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
