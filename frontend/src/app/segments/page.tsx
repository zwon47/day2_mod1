'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNetworkSegments } from '@/lib/api';
import Link from 'next/link';
import { Download } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import Sidebar from '@/components/layout/Sidebar';

export default function SegmentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: countData } = useQuery({
    queryKey: ['segments-count'],
    queryFn: async () => {
      const res = await fetch('/api/network-segments/count');
      return res.json();
    }
  });

  const { data: segments, isLoading, error } = useQuery({
    queryKey: ['segments', currentPage],
    queryFn: async () => {
      const skip = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`/api/network-segments?skip=${skip}&limit=${itemsPerPage}`);
      return res.json();
    }
  });

  const totalPages = Math.ceil((countData?.total || 0) / itemsPerPage);

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/network-segments/export/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'network_segments.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">Error loading segments: {(error as Error).message}</p>
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
          <h1 className="text-2xl font-bold text-gray-100">Network Segments</h1>
          <div className="flex gap-2">
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
          Total: {countData?.total || 0} segments
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                IP Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Zone Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {segments?.map((segment: any) => (
              <tr key={segment.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    {segment.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                  {segment.ip_range}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                    {segment.zone_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {segment.description || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {segments && segments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No network segments found</p>
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
