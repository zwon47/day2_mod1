'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TopologyMap from '@/components/topology/TopologyMap';
import FilterPanel, { TopologyFilters } from '@/components/topology/FilterPanel';
import PathAnalysis from '@/components/topology/PathAnalysis';
import DetailPanel from '@/components/topology/DetailPanel';
import Sidebar from '@/components/layout/Sidebar';
import { fetchTopologyGraph, fetchFirewallRules, deleteFirewallRule } from '@/lib/api';
import { Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layout, setLayout] = useState<'dagre' | 'cose' | 'circle'>('dagre');
  const [filters, setFilters] = useState<TopologyFilters>({
    zoneTypes: [],
    protocols: []
  });
  const [selectedRules, setSelectedRules] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const { data: graph, isLoading } = useQuery({
    queryKey: ['topology', filters],
    queryFn: () => fetchTopologyGraph()
  });

  const { data: allRules } = useQuery({
    queryKey: ['rules'],
    queryFn: fetchFirewallRules
  });

  const selectedNode = graph?.nodes.find(n => n.id === selectedNodeId);

  // Filter rules for selected node
  const inboundRules = allRules?.filter(
    rule => selectedNode && rule.destination_segment_id === parseInt(selectedNode.id.replace('segment-', ''))
  );
  const outboundRules = allRules?.filter(
    rule => selectedNode && rule.source_segment_id === parseInt(selectedNode.id.replace('segment-', ''))
  );

  // Apply filters to graph data
  const filteredGraph = graph ? {
    nodes: graph.nodes.filter(node =>
      filters.zoneTypes.length === 0 || filters.zoneTypes.includes(node.zone_type)
    ),
    edges: graph.edges.filter(edge =>
      filters.protocols.length === 0 ||
      edge.metadata.protocols.some(p => filters.protocols.includes(p))
    ).filter(edge =>
      !filters.action || edge.metadata.actions.includes(filters.action)
    )
  } : undefined;

  const handleRuleDelete = async (id: number) => {
    if (!confirm('Delete this rule?')) return;

    try {
      await deleteFirewallRule(id);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['topology'] });
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRules.length === 0) return;

    if (!confirm(`Delete ${selectedRules.length} rules?`)) return;

    try {
      await Promise.all(selectedRules.map(id => deleteFirewallRule(id)));
      setSelectedRules([]);
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['topology'] });
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
    if (selectedRules.length === allRules?.length) {
      setSelectedRules([]);
    } else {
      setSelectedRules(allRules?.map(r => r.id) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gray-950">
          <div className="text-xl text-gray-400">Loading topology...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Left Sidebar Menu */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topology Map Area - 70% */}
        <div className="flex overflow-hidden" style={{ height: '70%' }}>
          {/* Filter Panel + Path Analysis */}
          <aside className="w-80 border-r border-gray-700 bg-gray-900 p-4 overflow-y-auto space-y-4">
            <FilterPanel
              onFilterChange={setFilters}
              onLayoutChange={setLayout}
            />
            <PathAnalysis />
          </aside>

          {/* Topology Map */}
          <main className="flex-1 p-6 overflow-hidden">
            {filteredGraph && (
              <TopologyMap
                nodes={filteredGraph.nodes}
                edges={filteredGraph.edges}
                layout={layout}
                onNodeClick={setSelectedNodeId}
              />
            )}
          </main>

          {/* Detail Panel (right side when node selected) */}
          {selectedNode && (
            <DetailPanel
              node={selectedNode}
              inboundRules={inboundRules}
              outboundRules={outboundRules}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </div>

        {/* Bottom Rules Table - 30% */}
        <div className="border-t border-gray-700 bg-gray-900 overflow-y-auto flex-shrink-0" style={{ height: '30%' }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100">Firewall Rules</h2>
              {selectedRules.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedRules.length})
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRules.length === allRules?.length && allRules?.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-gray-300">Rule Name</th>
                    <th className="px-4 py-2 text-left text-gray-300">Source</th>
                    <th className="px-4 py-2 text-left text-gray-300">Destination</th>
                    <th className="px-4 py-2 text-left text-gray-300">Protocol</th>
                    <th className="px-4 py-2 text-left text-gray-300">Port</th>
                    <th className="px-4 py-2 text-left text-gray-300">Action</th>
                    <th className="px-4 py-2 text-left text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {allRules?.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-800">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRules.includes(rule.id)}
                          onChange={() => toggleRuleSelection(rule.id)}
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-200">{rule.rule_name}</td>
                      <td className="px-4 py-2 text-gray-400">Segment {rule.source_segment_id}</td>
                      <td className="px-4 py-2 text-gray-400">Segment {rule.destination_segment_id}</td>
                      <td className="px-4 py-2 text-gray-400">{rule.protocol}</td>
                      <td className="px-4 py-2 text-gray-400">{rule.port_range || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          rule.action === 'ALLOW'
                            ? 'bg-green-900/50 text-green-300 border border-green-700'
                            : 'bg-red-900/50 text-red-300 border border-red-700'
                        }`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleRuleDelete(rule.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!allRules || allRules.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No firewall rules found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
