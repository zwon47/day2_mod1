'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HealthStatus {
  status: string;
  message: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => {
        setHealth({ status: 'error', message: '백엔드 연결 실패' });
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Network Topology Manager
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Visualize and manage your network infrastructure
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link
            href="/dashboard"
            className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center group"
          >
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-semibold text-gray-800 mb-1">Dashboard</h3>
            <p className="text-sm text-gray-600">View topology map</p>
          </Link>

          <Link
            href="/analysis"
            className="p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center group"
          >
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-800 mb-1">Path Analysis</h3>
            <p className="text-sm text-gray-600">Analyze network paths</p>
          </Link>

          <Link
            href="/segments"
            className="p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center group"
          >
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-semibold text-gray-800 mb-1">Segments</h3>
            <p className="text-sm text-gray-600">Network segments</p>
          </Link>

          <Link
            href="/rules"
            className="p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center group"
          >
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-800 mb-1">Rules</h3>
            <p className="text-sm text-gray-600">Firewall rules</p>
          </Link>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Backend Status
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div
              className={`p-4 rounded-lg ${
                health?.status === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              <p className="font-medium">
                {health?.status === 'ok' ? '✓ Connected' : '✗ Connection Failed'}
              </p>
              <p className="text-sm mt-1">{health?.message}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
