'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Globe,
  Zap,
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  inserted?: number;
  skipped?: number;
  totalInDB?: number;
  cmsTotal?: number;
  scope?: string;
  error?: string;
  timestamp?: string;
}

interface SyncStatus {
  sync_status?: string;
  last_national_sync?: string;
  totalInDB?: number;
}

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];

// 5 states = ~600–900 facilities, fast enough to demo within serverless limits
const DEMO_STATES = ['TX', 'CA', 'FL', 'NY', 'OH'];

export default function AdminSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [demoSyncing, setDemoSyncing] = useState(false);
  const [demoProgress, setDemoProgress] = useState<string[]>([]);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [stateFilter, setStateFilter] = useState('');

  const refreshStatus = () =>
    fetch('/api/properties/sync')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => null);

  useEffect(() => {
    refreshStatus();
  }, []);

  const syncOneState = async (state: string): Promise<SyncResult> => {
    const res = await fetch(`/api/properties/sync?state=${state}`, { method: 'POST' });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return res.json();
  };

  const triggerDemoSync = async () => {
    setDemoSyncing(true);
    setResult(null);
    setDemoProgress([]);

    let totalInserted = 0;
    let totalSkipped = 0;
    let lastError: string | undefined;

    for (const state of DEMO_STATES) {
      setDemoProgress((prev) => [...prev, `Syncing ${state}...`]);
      try {
        const r = await syncOneState(state);
        if (r.success) {
          totalInserted += r.inserted ?? 0;
          totalSkipped += r.skipped ?? 0;
          setDemoProgress((prev) => [
            ...prev.slice(0, -1),
            `✓ ${state} — ${r.inserted} facilities`,
          ]);
        } else {
          lastError = r.error;
          setDemoProgress((prev) => [
            ...prev.slice(0, -1),
            `✗ ${state} — ${r.error?.slice(0, 60)}`,
          ]);
        }
      } catch (err) {
        lastError = String(err);
        setDemoProgress((prev) => [...prev.slice(0, -1), `✗ ${state} — ${lastError}`]);
      }
    }

    await refreshStatus();
    const statusRes = await fetch('/api/properties/sync').then((r) => r.json());

    setResult({
      success: !lastError,
      inserted: totalInserted,
      skipped: totalSkipped,
      totalInDB: statusRes.totalInDB,
      scope: `Demo: ${DEMO_STATES.join(', ')}`,
      error: lastError,
    });
    setDemoSyncing(false);
  };

  const triggerSync = async () => {
    setSyncing(true);
    setResult(null);
    setDemoProgress([]);
    try {
      const url = stateFilter
        ? `/api/properties/sync?state=${stateFilter}`
        : '/api/properties/sync';
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) {
        const text = await res.text();
        setResult({
          success: false,
          error: `Server returned HTTP ${res.status}:\n${text.slice(0, 500)}`,
        });
        setSyncing(false);
        return;
      }
      const contentType = res.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        setResult({
          success: false,
          error: `Server returned HTTP ${res.status} (non-JSON):\n${text.slice(0, 500)}`,
        });
        setSyncing(false);
        return;
      }
      const data = await res.json();
      setResult(data);
      refreshStatus();
    } catch (err) {
      setResult({ success: false, error: String(err) });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">CareGuard Admin</h1>
            <p className="text-xs text-gray-500">CMS Real Data Sync — All 14,695 Nursing Homes</p>
          </div>
        </div>

        {/* Current DB status */}
        {status && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <Database size={14} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">In Database</p>
                <p className="text-sm font-semibold text-gray-900">
                  {status.totalInDB?.toLocaleString() ?? '—'} facilities
                </p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <Globe size={14} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">CMS National</p>
                <p className="text-sm font-semibold text-gray-900">~14,695 facilities</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Demo Sync */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
            <Zap size={12} /> Quick Demo Sync — Recommended for Dev
          </p>
          <p className="text-xs text-amber-700 leading-relaxed mb-3">
            Loads <strong>real CMS data</strong> for TX, CA, FL, NY, OH (~600–900 facilities) — fast
            enough to run in dev without hitting serverless timeouts. Perfect for showing the map
            works with live data. Full national sync is for post-deploy.
          </p>
          <button
            onClick={triggerDemoSync}
            disabled={demoSyncing || syncing}
            className="w-full bg-amber-600 text-white font-medium py-2.5 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {demoSyncing ? (
              <>
                <Loader2 size={14} className="spin-anim" />
                Syncing demo states...
              </>
            ) : (
              <>
                <Zap size={14} />
                Load Demo Data (5 States)
              </>
            )}
          </button>

          {demoProgress.length > 0 && (
            <div className="mt-3 space-y-1">
              {demoProgress.map((line, i) => (
                <p key={i} className="text-xs font-mono text-amber-900">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-gray-400">or sync a specific state</span>
          </div>
        </div>

        {/* Scope selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Sync scope</label>
          <div className="flex gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="flex-1 py-2.5 pl-3 pr-7 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <option value="">All 50 states — full national sync (~14,695 facilities)</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s} — single state sync (fastest)
                </option>
              ))}
            </select>
          </div>
          {!stateFilter && (
            <p className="text-xs text-gray-400 mt-1">
              ⚠ Full national sync may timeout in dev — use single state or Quick Demo instead.
            </p>
          )}
        </div>

        <button
          onClick={triggerSync}
          disabled={syncing || demoSyncing}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {syncing ? (
            <>
              <Loader2 size={16} className="spin-anim" />
              {stateFilter ? `Syncing ${stateFilter}...` : 'Syncing all 50 states...'}
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              {stateFilter ? `Sync ${stateFilter} from CMS` : 'Run Full National Sync'}
            </>
          )}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${result.success ? 'text-green-900' : 'text-red-900'}`}
                >
                  {result.success ? 'Sync Complete' : 'Sync Failed'}
                </p>
                {result.success && (
                  <div className="mt-2 flex flex-col gap-1">
                    {result.scope && <p className="text-xs text-gray-600">Scope: {result.scope}</p>}
                    <p className="text-xs text-green-700 font-medium">
                      {result.inserted?.toLocaleString()} facilities written to database
                    </p>
                    {result.skipped !== undefined && result.skipped > 0 && (
                      <p className="text-xs text-gray-500">
                        {result.skipped.toLocaleString()} skipped (missing coordinates)
                      </p>
                    )}
                    {result.totalInDB !== undefined && (
                      <p className="text-xs text-gray-700 font-medium mt-1">
                        DB total: {result.totalInDB.toLocaleString()} facilities
                      </p>
                    )}
                  </div>
                )}
                {result.error && (
                  <p className="text-xs text-red-700 mt-1 font-mono break-all">{result.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Map
            </a>
            <a
              href="/admin/guide"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Admin Guide →
            </a>
          </div>
          <span className="text-xs text-gray-400">
            data.cms.gov/provider-data/dataset/4pq5-n9py
          </span>
        </div>
      </div>
    </div>
  );
}
