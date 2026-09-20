'use client';

import { Shield, CheckCircle, AlertTriangle, ExternalLink, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  color: string;
}

const sections: Section[] = [
  { id: 'sync', title: 'Data Sync', color: 'bg-blue-600' },
  { id: 'kajabi', title: 'Kajabi CTAs', color: 'bg-violet-600' },
  { id: 'checklist', title: 'Pre-Launch', color: 'bg-green-600' },
  { id: 'gaps', title: 'Known Gaps', color: 'bg-orange-500' },
];

export default function AdminGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              CareGuard Admin Operations Guide
            </h1>
            <p className="text-xs text-gray-500">
              Last updated: July 2026 — keep this tab bookmarked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/sync"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Go to Sync Panel <ChevronRight size={12} />
          </a>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-700">
            ← Back to Map
          </a>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${s.color}`} />
            {s.title}
          </a>
        ))}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* ── SECTION 1: SYNC ── */}
        <section id="sync" className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-blue-600 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">1 · Data Sync — How &amp; When</h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              All facility data comes from the official CMS Provider Data Catalog at{' '}
              <code className="bg-gray-100 rounded px-1 text-xs">
                data.cms.gov/provider-data/dataset/4pq5-n9py
              </code>
              . The map reads from your database — not live from CMS — so you must sync first.
            </p>

            <div className="flex flex-col gap-3">
              {/* Option A */}
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Option A — Demo / Dev
                  </span>
                  <span className="bg-amber-200 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Recommended first run
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  Click <strong>"Load Demo Data (5 States)"</strong> on the Sync Panel. Pulls real
                  CMS data for TX, CA, FL, NY, OH (~600–900 facilities). Each state is synced as its
                  own request, so no serverless timeout. Takes ~25 seconds total. Perfect for
                  confirming the map and CTAs work.
                </p>
                <p className="text-xs text-gray-500">
                  →{' '}
                  <a href="/admin/sync" className="text-blue-600 hover:underline">
                    admin/sync
                  </a>
                </p>
              </div>

              {/* Option B */}
              <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    Option B — Single State
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  Use the state dropdown on the Sync Panel and pick any individual state. Each
                  single-state call takes 3–8 seconds and always stays within serverless limits.
                  Best approach for topping up specific states between full syncs.
                </p>
              </div>

              {/* Option C */}
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Option C — Full National
                  </span>
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    Post-deploy only
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed mb-2">
                  Pulls all ~14,695 facilities across 50 states. Works on production (Netlify/Vercel
                  functions have a 60s timeout or use background functions). May fail in the
                  Anything dev preview (30s cap). Run once after deploy, then monthly to stay
                  current — CMS updates data every 4–6 weeks.
                </p>
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <p className="text-xs text-gray-500 font-medium">CMS Update Schedule:</p>
                  <ul className="text-xs text-gray-500 mt-1 space-y-0.5 ml-3 list-disc">
                    <li>Provider Information data: updated monthly (around the 1st)</li>
                    <li>Health Deficiency citations: updated monthly</li>
                    <li>
                      Check{' '}
                      <a
                        href="https://data.cms.gov/provider-data/topics/nursing-homes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        CMS announcements <ExternalLink size={9} />
                      </a>{' '}
                      for exact dates
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Admin Sync Panel URL</p>
              <code className="text-xs text-blue-700 bg-white border border-gray-200 rounded px-2 py-1 block">
                https://your-domain.com/admin/sync
              </code>
              <p className="text-xs text-gray-400 mt-1">
                Bookmark this. It is not linked from the public map.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: KAJABI ── */}
        <section id="kajabi" className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-violet-600 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">
              2 · Kajabi CTAs — Environment Variables
            </h2>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Every buy/download button in the app reads from environment variables. Until these are
              set, buttons fall back to <code className="bg-gray-100 rounded px-1 text-xs">#</code>{' '}
              (dead links). Set these in your Netlify / Vercel dashboard under{' '}
              <strong>Environment Variables</strong> before going live.
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-4 py-2">
                <span className="text-xs font-semibold text-gray-500">Variable</span>
                <span className="text-xs font-semibold text-gray-500">Module</span>
                <span className="text-xs font-semibold text-gray-500">Used In</span>
              </div>
              {[
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_1_URL',
                  module: 'Module 1 · Pre-Crisis Autonomy Blueprint',
                  loc: 'Early Signs Tab (when items checked)',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_8_URL',
                  module: 'Module 8 · Asset Insulation Shield',
                  loc: 'Fund Care Tab + Property Panel (warning)',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_15_URL',
                  module: 'Module 15 · Private Caregiver Employment Shield',
                  loc: 'Care at Home Tab',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_16_URL',
                  module: 'Module 16 · Shift-Change Compliance Trackers',
                  loc: 'Care at Home Tab',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_18_URL',
                  module: 'Module 18 · Camera Placement Directive',
                  loc: 'Remote Monitor Tab',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_21_URL',
                  module: 'Module 21 · Remote Care Oversight Mandates',
                  loc: 'Remote Monitor Tab',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_MODULE_24_URL',
                  module: 'Module 24 · Post-Fall Emergency Audit',
                  loc: 'Emergency Exit Tab + Property Panel (critical)',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_ALERTS_URL',
                  module: 'Free Alerts Landing Page',
                  loc: 'Email Opt-in section + nav header',
                },
                {
                  env: 'NEXT_PUBLIC_KAJABI_LIBRARY_URL',
                  module: 'Full Toolkit Library',
                  loc: 'Property Panel (clean properties)',
                },
              ].map((row, i) => (
                <div
                  key={row.env}
                  className={`grid grid-cols-3 gap-2 px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <code className="text-xs text-violet-700 font-mono break-all">{row.env}</code>
                  <span className="text-xs text-gray-700">{row.module}</span>
                  <span className="text-xs text-gray-500">{row.loc}</span>
                </div>
              ))}
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
              <p className="text-xs text-violet-800 leading-relaxed">
                <strong>All variables must be prefixed with NEXT_PUBLIC_</strong> — this is required
                for Next.js to expose them to the browser. Server-only variables (no prefix) will be
                undefined in the client and buttons will be dead.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: PRE-LAUNCH CHECKLIST ── */}
        <section
          id="checklist"
          className="bg-white border border-gray-200 rounded-xl overflow-hidden"
        >
          <div className="bg-green-600 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">3 · Pre-Launch Checklist</h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-2">
              {[
                {
                  label: 'Run Demo Sync or Full National Sync',
                  detail: 'Map shows "● Demo" badge until real data is loaded',
                  critical: true,
                },
                {
                  label: 'Set all 9 NEXT_PUBLIC_KAJABI_* env vars',
                  detail: 'Every CTA button goes to a real Kajabi URL',
                  critical: true,
                },
                {
                  label: 'Verify policy link resolves',
                  detail: 'https://loveyourlongevity.org/privacy appears in nav + footer',
                  critical: true,
                },
                {
                  label: 'Test one property panel CTA click',
                  detail: 'Click a red facility → verify Module 24 Kajabi link opens',
                  critical: true,
                },
                {
                  label: 'Test Early Signs tab',
                  detail: 'Check 1+ indicators → Module 1 button appears and links correctly',
                  critical: false,
                },
                {
                  label: 'Test Fund Care calculator',
                  detail: 'Enter savings + fee → Module 8 CTA appears',
                  critical: false,
                },
                {
                  label: 'Test Emergency Exit tab',
                  detail: 'Enter zip → result appears (note: search uses local DB data)',
                  critical: false,
                },
                {
                  label: 'Confirm map loads on mobile',
                  detail: 'Google Maps renders at all screen sizes',
                  critical: false,
                },
                {
                  label: 'Check 5-layer overlay toggles',
                  detail:
                    'Geographic / Regulatory / Ownership / Mobility / Medical layers all activate',
                  critical: false,
                },
                {
                  label: 'Schedule monthly sync reminder',
                  detail: 'CMS updates data ~monthly; re-run full sync after each CMS release',
                  critical: false,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <CheckCircle
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${item.critical ? 'text-green-500' : 'text-gray-300'}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                      {item.critical && (
                        <span className="bg-red-50 text-red-600 border border-red-100 text-xs font-medium px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: KNOWN GAPS ── */}
        <section id="gaps" className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-orange-500 px-5 py-3">
            <h2 className="text-sm font-semibold text-white">4 · Known Gaps &amp; Open Items</h2>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {[
              {
                title: 'Emergency Exit zip search (/api/cms/search)',
                detail:
                  "The Emergency Exit tab POSTs to /api/cms/search which queries your local DB for critical properties near a zip. This is now wired to your properties table. If zip returns no results it's because that zip range has no critical facilities in the synced data yet — run more state syncs.",
                status: 'fixed',
              },
              {
                title: 'Email capture is Kajabi redirect only',
                detail:
                  'The "Send Me Alerts" button redirects to your Kajabi landing page. There is no in-app email capture or Mailchimp/ConvertKit integration. Kajabi handles the email list. If you want in-app capture (capture email without leaving the site), that\'s a separate feature to build.',
                status: 'info',
              },
              {
                title: 'Full national sync may timeout in dev preview',
                detail:
                  'The Anything dev preview has a ~30s serverless timeout. Use Demo Sync or single-state sync in dev. Full national sync works correctly on Netlify/Vercel (up to 60s background functions).',
                status: 'info',
              },
              {
                title: 'Kajabi URLs default to # (dead links) until env vars set',
                detail:
                  'If you click any module button and nothing happens or you stay on the same page, the env var for that module is not set. Check Section 2 above for the full variable list.',
                status: 'action',
              },
            ].map((gap, i) => {
              const colors = {
                fixed: 'border-green-200 bg-green-50',
                info: 'border-blue-100 bg-blue-50',
                action: 'border-orange-200 bg-orange-50',
              };
              const labels = {
                fixed: { text: 'Fixed', cls: 'bg-green-100 text-green-700' },
                info: { text: 'Info', cls: 'bg-blue-100 text-blue-700' },
                action: { text: 'Action Required', cls: 'bg-orange-100 text-orange-700' },
              };
              return (
                <div
                  key={i}
                  className={`border rounded-lg p-4 ${colors[gap.status as keyof typeof colors]}`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <AlertTriangle size={13} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-800">{gap.title}</p>
                        <span
                          className={`text-xs font-medium px-1.5 py-0.5 rounded ${labels[gap.status as keyof typeof labels].cls}`}
                        >
                          {labels[gap.status as keyof typeof labels].text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{gap.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            CareGuard Admin Guide · Policy:{' '}
            <a
              href="https://loveyourlongevity.org/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-0.5"
            >
              loveyourlongevity.org/privacy <ExternalLink size={9} />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
