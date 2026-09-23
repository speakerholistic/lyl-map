'use client';

import Link from 'next/link';
import {
  Shield,
  Map,
  Search,
  Filter,
  MousePointerClick,
  Layers,
  BarChart3,
  Bell,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Stethoscope,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    num: 1,
    icon: <Map size={22} className="text-blue-600" />,
    title: 'Choose a State',
    desc: "Use the state dropdown in the top filter bar to zoom into a specific state. The map will load live data from the federal government's nursing home database for that state — thousands of real care facilities.",
    tip: 'Tip: Start with your own state or the state where a loved one lives.',
  },
  {
    num: 2,
    icon: <Search size={22} className="text-blue-600" />,
    title: 'Search by Facility Name or City',
    desc: 'Type any facility name, city, or state in the search bar — spelling suggestions will appear as you type to help you find the right place quickly.',
    tip: 'Tip: Partial names work — try typing just the first few letters.',
  },
  {
    num: 3,
    icon: <Filter size={22} className="text-blue-600" />,
    title: 'Filter by Compliance Status',
    desc: 'Use the status filter buttons (All / Clean / Citations / Violations) to narrow results. Each status corresponds to a pin shape on the map — circles (clean), triangles (citations), and hexagons (violations).',
    tip: 'Tip: Start with "Violations" to identify the highest-risk facilities first.',
  },
  {
    num: 4,
    icon: <MousePointerClick size={22} className="text-blue-600" />,
    title: 'Click a Pin to Open the Profile',
    desc: 'Click any pin on the map to open the full Facility Profile Panel on the right side. This panel shows the compliance history, staffing ratios, quality measures, financial data, and corporate ownership chain.',
    tip: 'Tip: Hover over any pin first to see a quick summary before clicking.',
  },
  {
    num: 5,
    icon: <Layers size={22} className="text-blue-600" />,
    title: 'Turn On Data Layers',
    desc: 'Use the layer controls in the top-right corner of the map to overlay additional intelligence: Medical Providers (hospitals, hospices, home health), Mobility Risk Zones, Geographic Density Clusters, Ownership Chains, and Regulatory Records.',
    tip: 'Tip: Enable the Ownership layer to see which facilities share a corporate parent.',
  },
  {
    num: 6,
    icon: <BarChart3 size={22} className="text-blue-600" />,
    title: 'Compare Facilities Side-by-Side',
    desc: 'Scroll down past the map to the Comparison Grid. This table lets you compare multiple facilities across key metrics — citation count, staffing ratio, monthly fee, value score, and quality score — all in one view.',
    tip: 'Tip: Sort by Citation Count to rank facilities from worst to best.',
  },
  {
    num: 7,
    icon: <Bell size={22} className="text-blue-600" />,
    title: 'Set Up Free Safety Alerts',
    desc: 'Scroll to the Alerts section and enter your email to receive free notifications when facilities you care about receive new safety violations or inspection results.',
    tip: "Tip: Sign up before you finish your research so you're notified of changes.",
  },
];

const features = [
  {
    icon: <Shield size={20} className="text-blue-600" />,
    label: 'Federal Safety Data',
    desc: "Live data pulled directly from the government's nursing home database — the same source regulators use to track violations.",
  },
  {
    icon: <Layers size={20} className="text-purple-600" />,
    label: '5 Data Layers in One Map',
    desc: 'See facility density, state inspection records, corporate ownership, fall risk zones, and nearby medical providers — all on one map.',
  },
  {
    icon: <Building2 size={20} className="text-orange-600" />,
    label: 'Ownership Transparency',
    desc: 'See exactly who owns and operates each facility, including parent corporations and multi-facility chains.',
  },
  {
    icon: <Stethoscope size={20} className="text-red-600" />,
    label: 'Nearby Medical Providers',
    desc: 'See nearby hospitals, hospices, and home health agencies so you understand what medical support is available.',
  },
  {
    icon: <TrendingUp size={20} className="text-green-600" />,
    label: 'Quality & Value Scores',
    desc: 'Easy-to-read scores built from federal star ratings, staffing levels, safety data, and monthly fees.',
  },
  {
    icon: <Bell size={20} className="text-yellow-600" />,
    label: 'Free Safety Alerts',
    desc: "Get notified when a facility receives new violations or inspection findings — so you're never caught off guard.",
  },
];

const statusLegend = [
  {
    shape: '●',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    label: 'Clean Record',
    desc: 'No significant safety violations or penalties found on record.',
  },
  {
    shape: '▲',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 border-yellow-200',
    label: 'Safety Issues Found',
    desc: 'Has 1–10 safety violations or a 2–3 star federal quality rating.',
  },
  {
    shape: '⬡',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    label: 'Serious Violations',
    desc: 'Over 10 violations, 1-star rating, abuse flag, or placed on a federal watch list.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Nav ── */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">LYL Map</span>
          <span className="hidden sm:block text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2.5 py-0.5 font-medium">
            Free Public Access
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://loveyourlongevity.org/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            Privacy Policy <ExternalLink size={10} />
          </a>
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Map <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#EFF6FF] via-white to-white border-b border-gray-100 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-blue-600 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-6 shadow-sm">
            <Shield size={12} /> Preview — Sample Data · CMS Dataset Connecting Soon
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            The Nursing Home Compliance Map
            <br />
            <span className="text-[#2563EB]">Every Family Should See</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            LYL Map pulls live data from the federal CMS database to show you the real compliance
            record of every nursing home, care facility, and assisted living provider in the United
            States — before you or your loved one signs anything.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white text-base font-bold px-7 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              <Map size={18} /> Open the Compliance Map
            </Link>
            <a
              href="#how-to-use"
              className="inline-flex items-center gap-1.5 text-gray-600 font-medium text-sm hover:text-gray-900 transition-colors"
            >
              See how it works <ChevronRight size={14} />
            </a>
          </div>
          <p className="mt-5 text-xs text-gray-400">
            No account required · No payment · 100% free public access
          </p>
        </div>
      </section>

      {/* ── Status legend ── */}
      <section className="px-4 md:px-8 py-14 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
            What the Map Shows You
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-xl mx-auto">
            Every facility is color-coded and shaped by its compliance status, so you can see
            problems at a glance — no reading required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusLegend.map((s) => (
              <div key={s.label} className={`border rounded-xl p-5 ${s.bg}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-3xl leading-none font-bold ${s.color}`}>{s.shape}</span>
                  <span className="font-semibold text-gray-900">{s.label}</span>
                </div>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 md:px-8 py-14 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
            What&apos;s Inside the Tool
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-xl mx-auto">
            LYL Map layers multiple data sources into one interactive map so you have everything you
            need in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5">{f.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Step by step ── */}
      <section id="how-to-use" className="px-4 md:px-8 py-16 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              Step-by-Step Guide
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              How to Use the Compliance Map
            </h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Follow these steps to get the most out of LYL Map. You can also access this guide any
              time inside the tool by clicking the{' '}
              <span className="font-bold text-blue-600">?</span> help button.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.num}
                  </div>
                  {step.num < steps.length && (
                    <div className="w-px flex-1 bg-gray-200 mt-2 min-h-[20px]" />
                  )}
                </div>
                <div className="pb-6 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {step.icon}
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">{step.desc}</p>
                  <div className="inline-flex items-start gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                    <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" />
                    {step.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reading a profile ── */}
      <section className="px-4 md:px-8 py-14 bg-gray-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
            How to Read a Facility Profile
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-xl mx-auto">
            When you click a pin, a detailed panel opens on the right. Here&apos;s what each section
            means.
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                title: 'Status Badge',
                icon: <AlertTriangle size={15} className="text-yellow-500" />,
                desc: 'Shows whether the facility has a clean record, active citations, or systemic violations — pulled from CMS penalty and deficiency data.',
              },
              {
                title: 'Value Score & Quality Score',
                icon: <TrendingUp size={15} className="text-blue-500" />,
                desc: 'Two composite scores (0–100) built from CMS star ratings, staffing hours per resident, quality measures, and monthly fees. Higher is better.',
              },
              {
                title: 'Staffing Ratio',
                icon: <CheckCircle2 size={15} className="text-green-500" />,
                desc: 'The ratio of staff to residents. A lower number (e.g. 1:4) means more staff per resident. "Not reported" means the facility didn\'t submit staffing data to CMS.',
              },
              {
                title: 'Compliance History',
                icon: <Shield size={15} className="text-blue-500" />,
                desc: 'Lists the most recent CMS inspection findings including deficiency counts, severity levels, and any special focus or abuse flags.',
              },
              {
                title: 'Quality Measures',
                icon: <BarChart3 size={15} className="text-purple-500" />,
                desc: 'Shows fall rates, how often residents are sent back to a hospital, and bedsore rates. These outcomes are reported directly to the federal government.',
              },
              {
                title: 'Financial & Ownership',
                icon: <Building2 size={15} className="text-orange-500" />,
                desc: 'Estimated monthly cost, revenue per bed, the legal operator name, and the corporate ownership chain — including how many facilities they control nationwide.',
              },
              {
                title: 'Action Button',
                icon: <XCircle size={15} className="text-red-500" />,
                desc: "Based on the facility's status, this button links to the most relevant advocacy toolkit resource for your situation — documentation tools, forensic audit guides, and more.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex gap-3"
              >
                <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                <div>
                  <span className="font-semibold text-gray-900 text-sm">{item.title}: </span>
                  <span className="text-sm text-gray-600">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data layers explainer ── */}
      <section className="px-4 md:px-8 py-14 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
            Understanding the Data Layers
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8 max-w-xl mx-auto">
            Click the Layers button in the top-right of the map to toggle these overlays on and off.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: 'Geographic Density',
                color: 'text-cyan-600',
                desc: 'Shows clusters of facilities by region. Numbers inside the circles indicate how many facilities are in that area. Dashed red borders mean the cluster contains critical violations.',
              },
              {
                label: 'State Inspection History',
                color: 'text-indigo-600',
                desc: 'Overlays state safety inspection records beyond the federal database — includes state health department enforcement actions and findings.',
              },
              {
                label: 'Ownership Chains',
                color: 'text-orange-600',
                desc: 'Color-codes facilities by their parent company. Facilities sharing a color are owned by the same company — helping you spot risky patterns across an entire ownership group.',
              },
              {
                label: 'Fall & Mobility Risk Zones',
                color: 'text-red-600',
                desc: 'County-level risk map showing the percentage of residents over 65, mobility challenges, and fall rates in each area.',
              },
              {
                label: 'Medical Providers',
                color: 'text-rose-600',
                desc: 'Adds hospitals (red cross), home health agencies (blue house), and hospice providers (purple heart) to the map. Helps you see what medical support is nearby.',
              },
            ].map((layer) => (
              <div key={layer.label} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className={`font-semibold text-sm mb-1.5 ${layer.color}`}>{layer.label}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{layer.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-4 md:px-8 py-16 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Look Up a Facility?
          </h2>
          <p className="text-blue-100 text-sm md:text-base mb-8 leading-relaxed">
            The map is free, no login required. All data comes directly from the federal CMS
            database. Start by selecting your state — results load in seconds.
          </p>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 bg-white text-[#1D4ED8] font-bold text-base px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            <Map size={20} /> Open the Compliance Map
          </Link>
          <p className="mt-4 text-blue-200 text-xs">
            Step-by-step guidance is available inside the tool via the{' '}
            <span className="font-bold text-white">?</span> Help button
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-200 px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2563EB] rounded-md flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">LYL Map</span>
          </div>
          <span className="text-xs text-gray-400">
            WCAG 2.1 AA · 5-Layer Compliance Stack
          </span>
          <a
            href="https://loveyourlongevity.org/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
          >
            Privacy Policy <ExternalLink size={10} />
          </a>
        </div>
      </footer>
    </div>
  );
}
