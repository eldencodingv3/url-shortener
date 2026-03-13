'use client';

import { useState, useEffect, useCallback } from 'react';
import URLForm from '../components/URLForm';
import URLList from '../components/URLList';

interface URLItem {
  id: string;
  short_code: string;
  original_url: string;
  created_at: string;
  click_count: number;
}

export default function Home() {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUrls = useCallback(async () => {
    try {
      setError('');
      const res = await fetch('/api/urls');
      if (!res.ok) throw new Error('Failed to fetch URLs');
      const data: URLItem[] = await res.json();
      setUrls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Shorten Your URLs
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
            Create short, memorable links and track every click with detailed analytics.
          </p>
          <URLForm onURLCreated={fetchUrls} />
        </div>
      </section>

      {/* URL List Section */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Links</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <URLList urls={urls} loading={loading} error={error} />
        </div>
      </section>
    </div>
  );
}
