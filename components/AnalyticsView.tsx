'use client';

import Link from 'next/link';

interface Click {
  clicked_at: string;
  ip_address: string;
  user_agent: string;
  referer: string;
  country: string;
}

interface URLData {
  id: string;
  short_code: string;
  original_url: string;
  created_at: string;
}

interface AnalyticsData {
  url: URLData;
  clicks: Click[];
  totalClicks: number;
}

interface AnalyticsViewProps {
  data: AnalyticsData;
}

function parseBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('OPR') || userAgent.includes('Opera')) return 'Opera';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'IE';
  return 'Other';
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const groups: Record<string, number> = {};
  items.forEach((item) => {
    const key = keyFn(item) || 'Unknown';
    groups[key] = (groups[key] || 0) + 1;
  });
  return groups;
}

function BarChart({ data, label }: { data: Record<string, number>; label: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-4 text-center">No {label.toLowerCase()} data yet</div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, count]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-28 truncate flex-shrink-0" title={key}>
            {key}
          </span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700 w-10 text-right flex-shrink-0">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsView({ data }: AnalyticsViewProps) {
  const { url, clicks, totalClicks } = data;

  const referrerBreakdown = groupBy(clicks, (c) => {
    if (!c.referer) return 'Direct';
    try {
      return new URL(c.referer).hostname;
    } catch {
      return c.referer;
    }
  });

  const browserBreakdown = groupBy(clicks, (c) => parseBrowser(c.user_agent));

  const clicksByDate = groupBy(clicks, (c) => {
    return new Date(c.clicked_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  });

  const shortUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${url.short_code}`
    : `/${url.short_code}`;

  return (
    <div className="space-y-8">
      {/* URL Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">URL Details</h2>
            <p className="text-sm text-gray-500 truncate" title={url.original_url}>
              {url.original_url}
            </p>
            <p className="text-sm text-indigo-600 font-medium mt-1">{shortUrl}</p>
          </div>
          <div className="flex-shrink-0 text-center bg-indigo-50 rounded-xl px-6 py-4">
            <div className="text-3xl font-bold text-indigo-600">{totalClicks}</div>
            <div className="text-sm text-indigo-500">Total Clicks</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Click Activity Over Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Click Activity</h3>
          <BarChart data={clicksByDate} label="Activity" />
        </div>

        {/* Referrer Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Referrers</h3>
          <BarChart data={referrerBreakdown} label="Referrer" />
        </div>

        {/* Browser Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Browsers</h3>
          <BarChart data={browserBreakdown} label="Browser" />
        </div>
      </div>

      {/* Recent Clicks Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Clicks</h3>
        {clicks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No clicks recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Browser</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Referrer</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Country</th>
                </tr>
              </thead>
              <tbody>
                {clicks.slice(0, 50).map((click, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {new Date(click.clicked_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {parseBrowser(click.user_agent)}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600 max-w-[200px] truncate">
                      {click.referer || 'Direct'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {click.country || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
