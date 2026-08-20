'use client';

import { useState } from 'react';
import { X as XIcon, Stethoscope, ChevronRight } from 'lucide-react';
import FundCareTab from './tabs/FundCareTab';
import EmergencyExitTab from './tabs/EmergencyExitTab';
import EarlySignsTab from './tabs/EarlySignsTab';
import TriageWizard from './TriageWizard';
import type { TabDestination } from '@/data/triageData';

// Tab content rendered after wizard routes here
const TAB_CONTENT: Partial<Record<TabDestination, React.ReactNode>> = {
  'fund-care': <FundCareTab />,
  'emergency-exit': <EmergencyExitTab />,
  'early-signs': <EarlySignsTab />,
};

const TAB_LABELS: Partial<Record<TabDestination, string>> = {
  'fund-care': 'Asset & Funding Tools',
  'emergency-exit': 'Emergency Placement Tools',
  'early-signs': 'Proactive Risk Gauge',
  'property-profile': 'Select a Facility on the Map',
};

const TAB_COLORS: Partial<Record<TabDestination, string>> = {
  'fund-care': 'text-blue-700 bg-blue-50 border-blue-200',
  'emergency-exit': 'text-red-700 bg-red-50 border-red-200',
  'early-signs': 'text-orange-700 bg-orange-50 border-orange-200',
  'property-profile': 'text-amber-700 bg-amber-50 border-amber-200',
};

interface TabSidebarProps {
  mobile?: boolean;
}

export default function TabSidebar({ mobile = false }: TabSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabDestination | null>(null);
  const [open, setOpen] = useState(false); // used by mobile layout

  const handleTabActivate = (tab: TabDestination) => {
    setActiveTab(tab);
  };

  const tabContent = activeTab ? TAB_CONTENT[activeTab] : null;
  const tabLabel = activeTab ? TAB_LABELS[activeTab] : null;
  const tabColorClass = activeTab ? TAB_COLORS[activeTab] : '';

  // ── Mobile layout ──
  if (mobile) {
    return (
      <div className="w-full flex flex-col-reverse">
        {/* Bottom bar — single entry point */}
        <div className="flex items-stretch border-t border-gray-100 bg-white" role="navigation">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              open ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Stethoscope size={18} />
            <span className="text-xs font-semibold">Get Help Navigating</span>
            <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
          </button>

          {open && activeTab && (
            <button
              onClick={() => {
                setOpen(false);
                setActiveTab(null);
              }}
              className="px-4 py-3.5 border-l border-gray-100 text-gray-400 hover:bg-gray-50"
              aria-label="Close"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* Expandable wizard + tab panel */}
        {open && (
          <div
            className="w-full bg-white border-t border-gray-200"
            style={{ maxHeight: '420px', overflowY: 'auto' }}
          >
            <div className="p-4 flex flex-col gap-4">
              <TriageWizard onTabActivate={handleTabActivate} />

              {/* Tab tool section */}
              {activeTab && tabLabel && (
                <div className="flex flex-col gap-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${tabColorClass}`}
                  >
                    {tabLabel}
                  </div>
                  {tabContent && <div>{tabContent}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Desktop layout ──
  return (
    <div
      className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden flex-shrink-0"
      role="complementary"
      aria-label="Compliance navigation"
    >
      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-gray-200 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
          <Stethoscope size={13} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Situational Guide</p>
          <p className="text-[10px] text-gray-400">Answer 3 questions to find your module</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Wizard */}
        <TriageWizard onTabActivate={handleTabActivate} />

        {/* Tab content section — shown after wizard routes here */}
        {activeTab && tabLabel && (
          <>
            <div className="border-t border-gray-100" />
            <div className="flex flex-col gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold ${tabColorClass}`}
              >
                {tabLabel}
              </div>
              {tabContent}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
