'use client';

import { useState } from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: TopologyFilters) => void;
  onLayoutChange: (layout: 'dagre' | 'cose' | 'circle') => void;
}

export interface TopologyFilters {
  zoneTypes: string[];
  protocols: string[];
  action?: 'ALLOW' | 'DENY';
  searchQuery?: string;
}

const ZONE_TYPES = ['DMZ', 'Internal', 'External', 'Management'];
const PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'ANY'];
const LAYOUTS = [
  { value: 'cose', label: 'Force-directed' },
  { value: 'dagre', label: 'Hierarchical' },
  { value: 'circle', label: 'Circular' }
];

export default function FilterPanel({ onFilterChange, onLayoutChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<TopologyFilters>({
    zoneTypes: [],
    protocols: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleZoneTypeToggle = (zoneType: string) => {
    const newZoneTypes = filters.zoneTypes.includes(zoneType)
      ? filters.zoneTypes.filter(z => z !== zoneType)
      : [...filters.zoneTypes, zoneType];

    const newFilters = { ...filters, zoneTypes: newZoneTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleProtocolToggle = (protocol: string) => {
    const newProtocols = filters.protocols.includes(protocol)
      ? filters.protocols.filter(p => p !== protocol)
      : [...filters.protocols, protocol];

    const newFilters = { ...filters, protocols: newProtocols };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleActionChange = (action: 'ALLOW' | 'DENY' | 'ALL') => {
    const newFilters = {
      ...filters,
      action: action === 'ALL' ? undefined : action
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: TopologyFilters = { zoneTypes: [], protocols: [] };
    setFilters(resetFilters);
    setSearchQuery('');
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 space-y-4 border border-gray-700">
      <div>
        <h3 className="font-semibold text-sm text-gray-200 mb-2">Search</h3>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search segments or rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-200 mb-2">Zone Type</h3>
        <div className="flex flex-wrap gap-2">
          {ZONE_TYPES.map(zone => (
            <button
              key={zone}
              onClick={() => handleZoneTypeToggle(zone)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.zoneTypes.includes(zone)
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-200 mb-2">Protocol</h3>
        <div className="flex flex-wrap gap-2">
          {PROTOCOLS.map(protocol => (
            <button
              key={protocol}
              onClick={() => handleProtocolToggle(protocol)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.protocols.includes(protocol)
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {protocol}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-200 mb-2">Action</h3>
        <div className="flex gap-2">
          {['ALL', 'ALLOW', 'DENY'].map(action => (
            <button
              key={action}
              onClick={() => handleActionChange(action as any)}
              className={`flex-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                (action === 'ALL' && !filters.action) || filters.action === action
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-200 mb-2">Layout</h3>
        <select
          onChange={(e) => onLayoutChange(e.target.value as any)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {LAYOUTS.map(layout => (
            <option key={layout.value} value={layout.value}>
              {layout.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleReset}
        className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}
