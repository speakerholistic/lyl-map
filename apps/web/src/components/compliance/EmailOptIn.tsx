'use client';

import { Bell, ArrowRight } from 'lucide-react';

export default function EmailOptIn() {
  // Replace this URL with your actual Kajabi landing page URL
  const kajabiUrl =
    process.env.NEXT_PUBLIC_KAJABI_ALERTS_URL || 'https://your-kajabi-site.com/compliance-alerts';

  return (
    <section
      className="bg-[#F9FAFB] border-t border-gray-200 py-12 px-6"
      aria-label="Free compliance alert signup"
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-600 font-medium mb-5">
            <Bell size={13} className="text-gray-400" />
            Free Compliance Alerts
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-3">
            New violations get filed every week.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Get automatic alerts when a care home in your area receives a new citation, staffing
            deficiency, or restraint-related complaint. Free. No paywall.
          </p>

          <div className="flex justify-center">
            <a
              href={kajabiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Send Me Alerts — It's Free
              <ArrowRight size={14} />
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            No spam. Unsubscribe anytime. Alerts are specific to your region.
          </p>
        </div>
      </div>
    </section>
  );
}
