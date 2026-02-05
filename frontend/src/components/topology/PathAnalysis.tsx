'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchNetworkSegments, analyzePathBetweenSegments } from '@/lib/api';
import { PathAnalysisResult } from '@/types/topology';

export default function PathAnalysis() {
  const [sourceId, setSourceId] = useState<number | null>(null);
  const [destId, setDestId] = useState<number | null>(null);
  const [protocol, setProtocol] = useState<string>('');
  const [port, setPort] = useState<string>('');
  const [result, setResult] = useState<PathAnalysisResult | null>(null);

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: fetchNetworkSegments
  });

  const analyzeMutation = useMutation({
    mutationFn: () => analyzePathBetweenSegments(
      sourceId!,
      destId!,
      protocol || undefined,
      port ? parseInt(port) : undefined
    ),
    onSuccess: (data) => setResult(data)
  });

  const handleAnalyze = () => {
    if (sourceId && destId) {
      analyzeMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 space-y-4 border border-gray-700">
        <h3 className="font-semibold text-sm text-gray-200 mb-2">Path Analysis</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Source Segment
            </label>
            <select
              value={sourceId || ''}
              onChange={(e) => setSourceId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            >
              <option value="">Select source...</option>
              {segments?.map(seg => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} ({seg.ip_range})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Destination Segment
            </label>
            <select
              value={destId || ''}
              onChange={(e) => setDestId(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            >
              <option value="">Select destination...</option>
              {segments?.map(seg => (
                <option key={seg.id} value={seg.id}>
                  {seg.name} ({seg.ip_range})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Protocol (optional)
            </label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            >
              <option value="">Any</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="ICMP">ICMP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Port (optional)
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="e.g., 443"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!sourceId || !destId || analyzeMutation.isPending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors text-sm"
        >
          {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Path'}
        </button>

        {analyzeMutation.isError && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-xs">
            Error: {(analyzeMutation.error as Error).message}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            {result.reachable ? (
              <>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-green-400">Path Found</h3>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-red-400">No Path Available</h3>
              </>
            )}
          </div>

          {result.reachable && (
            <>
              {/* Path Visualization */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-gray-300 text-xs">Path:</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {result.path.map((segment, idx) => (
                    <div key={segment.segment_id} className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded-lg font-medium text-xs">
                        {segment.segment_name}
                      </div>
                      {idx < result.path.length - 1 && (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules Applied */}
              <div>
                <h4 className="font-semibold mb-2 text-gray-300 text-xs">Rules Applied:</h4>
                {result.rules_applied.length > 0 ? (
                  <div className="space-y-2">
                    {result.rules_applied.map(rule => (
                      <div
                        key={rule.rule_id}
                        className="bg-gray-900 border border-gray-600 rounded-lg p-2"
                      >
                        <p className="font-medium text-gray-200 text-xs">{rule.rule_name}</p>
                        <p className="text-xs text-gray-400">
                          {rule.protocol}
                          {rule.port_range && ` : ${rule.port_range}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No specific rules applied</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
