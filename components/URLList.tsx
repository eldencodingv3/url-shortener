'use client';

import Link from 'next/link';
import { useState } from 'react';

interface URLItem {
  id: string;
  short_code: string;
  original_url: string;
  created_at: string;
  click_count: number;
}

interface URLListProps {
  urls: URLItem[];
  loading: boolean;
  error: string;
}

export default function URLList({ urls, loading, error }: URLListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getShortUrl = (shortCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${shortCode}`;
    }
    return `/${shortCode}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Loading URLs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">🔗</div>
        <p className="text-gray-500 text-lg">No URLs shortened yet</p>
        <p className="text-gray-400 text-sm mt-1">Paste a URL above to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Original URL</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Short URL</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Clicks</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Created</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Analytics</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <a
                  href={item.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-indigo-600 transition-colors"
                  title={item.original_url}
                >
                  {truncateUrl(item.original_url)}
                </a>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-indigo-600 font-medium">
                    /{item.short_code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(getShortUrl(item.short_code), item.id)}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copiedId === item.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {item.click_count}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {formatDate(item.created_at)}
              </td>
              <td className="py-3 px-4 text-center">
                <Link
                  href={`/analytics/${item.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
