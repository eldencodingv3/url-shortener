'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AnalyticsView from '../../../components/AnalyticsView';

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

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/urls/${id}/analytics`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('URL not found');
          }
          throw new Error('Failed to fetch analytics');
        }
        const analyticsData: AnalyticsData = await res.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Analytics</h1>
        </div>
        <AnalyticsView data={data} />
      </div>
    </div>
  );
}
