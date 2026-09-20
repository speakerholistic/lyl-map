'use client';

import { useState } from 'react';
import {
  Map,
  FileWarning,
  Landmark,
  Activity,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import type { LayerId } from '@/data/layerTypes';

interface LayerControlProps {
  activeLayers: Set<LayerId>;
  onToggle: (id: LayerId) => void;
  counts?: Partial<Record<LayerId, number>>;
  loading?: Partial<Record<LayerId, boolean>>;
}

const LAYER_CONFIG: Array<{
  id: LayerId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  dot: string;
  ring: string;
  bg: string;
  description: string;
}> = [
  {
    id: 'geographic',
    label: 'Geographic',
    sublabel: 'How Many Nearby',
    icon: Map,
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-200',
    bg: 'bg-cyan-50',
    description: 'Shows how many care homes are clustered in each region of the map',
  },
  {
    id: 'regulatory',
    label: 'Regulatory',
    sublabel: 'State Inspection History',
    icon: FileWarning,
    dot: 'bg-orange-500',
    ring: 'ring-orange-200',
    bg: 'bg-orange-50',
    description: 'Shows state-level safety inspection results overlaid on each facility',
  },
  {
    id: 'ownership',
    label: 'Ownership',
    sublabel: 'Who Owns Which',
    icon: Landmark,
    dot: 'bg-violet-500',
    ring: 'ring-violet-200',
    bg: 'bg-violet-50',
    description:
      'Groups facilities by their parent company so you can see which ones share an owner',
  },
  {
    id: 'mobility',
    label: 'Mobility',
    sublabel: 'Fall & Mobility Risk',
    icon: Activity,
    dot: 'bg-amber-500',
    ring: 'ring-amber-200',
    bg: 'bg-amber-50',
    description: 'Shows areas with the highest risk of falls and loss of mobility, by county',
  },
  {
    id: 'medical',
    label: 'Medical',
    sublabel: 'Hospitals · Home Care · Hospice',
    icon: Stethoscope,
    dot: 'bg-rose-500',
    ring: 'ring-rose-200',
    bg: 'bg-rose-50',
    description: 'Shows nearby hospitals, home health agencies, and hospice providers',
  },
];

export default function MapLayerControls({
  activeLayers,
  onToggle,
  counts = {},
  loading = {},
}: LayerControlProps) {
  // Start collapsed — user can open it. Prevents the panel from blocking the map on mobile.
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="absolute top-3 right-3 z-20 bg-white/97 border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      style={{ width: 'min(224px, calc(100vw - 80px))' }}
      role="region"
      aria-label="Map layer controls"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
        aria-expanded={expanded}
        aria-controls="layer-panel"
      >
        <div className="flex items-center gap-1.5">
          <Layers size={13} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Map Layers
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400">{activeLayers.size} active</span>
          {expanded ? (
            <ChevronUp size={12} className="text-gray-400" />
          ) : (
            <ChevronDown size={12} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Layer rows */}
      {expanded && (
        <div id="layer-panel" className="divide-y divide-gray-100">
          {LAYER_CONFIG.map((layer, i) => {
            const Icon = layer.icon;
            const isActive = activeLayers.has(layer.id);
            const count = counts[layer.id];
            const isLoading = loading[layer.id];

            return (
              <button
                key={layer.id}
                onClick={() => onToggle(layer.id)}
                aria-pressed={isActive}
                aria-label={`${isActive ? 'Disable' : 'Enable'} ${layer.label} layer: ${layer.description}`}
                title={layer.description}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset text-left ${
                  isActive ? layer.bg : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Layer number badge */}
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold ${
                    isActive ? `${layer.bg} ring-1 ${layer.ring}` : 'bg-gray-100'
                  } text-gray-500`}
                >
                  {i + 1}
                </span>

                {/* Icon */}
                <span
                  className={`flex-shrink-0 ${isActive ? layer.dot.replace('bg-', 'text-') : 'text-gray-300'} transition-colors`}
                >
                  <Icon size={14} />
                </span>

                {/* Labels */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-semibold leading-tight ${isActive ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {layer.label}
                  </p>
                  <p
                    className={`text-[10px] leading-tight truncate ${isActive ? 'text-gray-500' : 'text-gray-300'}`}
                  >
                    {layer.sublabel}
                  </p>
                </div>

                {/* Count / loading badge */}
                <div className="flex-shrink-0">
                  {isLoading ? (
                    <div
                      className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full"
                      style={{ animation: 'spin 0.8s linear infinite' }}
                    />
                  ) : count !== undefined && count > 0 ? (
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-4 rounded-full text-[9px] font-semibold px-1 ${
                        isActive ? `${layer.dot} text-white` : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {count > 99 ? '99+' : count}
                    </span>
                  ) : (
                    <div
                      className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                        isActive ? layer.dot : 'border-gray-300 bg-white'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Legend footer when layers active */}
      {expanded && activeLayers.has('medical') && (
        <div className="px-3 py-2 bg-rose-50 border-t border-rose-100">
          <p className="text-[10px] font-semibold text-rose-700 mb-1.5">Medical Layer Legend</p>
          <div className="flex flex-col gap-1">
            {[
              { shape: '✛', label: 'Acute Hospital', color: 'text-red-700' },
              { shape: '⌂', label: 'Home Health Agency', color: 'text-blue-700' },
              { shape: '♥', label: 'Hospice Provider', color: 'text-purple-700' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`text-sm leading-none font-bold ${item.color}`}>{item.shape}</span>
                <span className="text-[10px] text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
