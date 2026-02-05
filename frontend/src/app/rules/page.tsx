'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFirewallRules, fetchNetworkSegments } from '@/lib/api';
import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import Sidebar from '@/components/layout/Sidebar';

export default function RulesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRules, setSelectedRules] = useState<number[]>([]);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ['rules-count'],
    queryFn: async () => {
      const res = await fetch('/api/firewall-rules/count');
      return res.json();
    }
  });

  const { data: rules, isLoading: rulesLoading, error: rulesError } = useQuery({
    queryKey: ['rules', currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`/api/firewall-rules?skip=${skip}&limit=${itemsPerPage}`);
      return res.json();
    }
  });

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: fetchNetworkSegments
  });

  const totalPages = Math.ceil((countData?.total || 0) / itemsPerPage);

  const getSegmentName = (segmentId: number) => {
    const segment = segments?.find(s => s.id === segmentId);
    return segment?.name || `Segment ${segmentId}`;
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/firewall-rules/export/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'firewall_rules.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRules.length === 0) return;

    if (!confirm(`Delete ${selectedRules.length} rules?`)) return;

    try {
      const res = await fetch('/api/firewall-rules/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRules })
      });

      if (res.ok) {
        setSelectedRules([]);
        queryClient.invalidateQueries({ queryKey: ['rules'] });
        queryClient.invalidateQueries({ queryKey: ['rules-count'] });
      }
    } catch (error) {
      console.error('Failed to delete rules:', error);
    }
  };

  const toggleRuleSelection = (id: number) => {
    setSelectedRules(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRules.length === rules?.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(rules?.map((r: any) => r.id) || []);
    }
  };

  if (rulesLoading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (rulesError) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">Error loading rules: {(rulesError as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-100">Firewall Rules</h1>
          <div className="flex gap-2">
            {selectedRules.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedRules.length})
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Total: {countData?.total || 0} rules
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRules.length === rules?.length && rules?.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rule Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Protocol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Port
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {rules?.map((rule: any) => (
                <tr key={rule.id} className="hover:bg-gray-800">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRules.includes(rule.id)}
                      onChange={() => toggleRuleSelection(rule.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {rule.rule_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {rule}
                    {getSegmentName(rule.source_segment_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {getSegmentName(rule.destination_segment_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {rule.protocol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {rule.port_range || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.action === 'ALLOW'
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-red-900/50 text-red-300 border border-red-700'
                      }`}
                    >
                      {rule.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                    {rule.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rules && rules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No firewall rules found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      </div>
    </div>
  );
}
