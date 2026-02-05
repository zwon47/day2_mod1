'use client';

import { useState } from 'react';
import { TopologyNode, FirewallRule } from '@/types/topology';

interface DetailPanelProps {
  node?: TopologyNode;
  inboundRules?: FirewallRule[];
  outboundRules?: FirewallRule[];
  onClose: () => void;
}

export default function DetailPanel({ node, inboundRules, outboundRules, onClose }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'inbound' | 'outbound'>('inbound');

  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-700 shadow-xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Node Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Node Info */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-2 border border-gray-700">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            <h3 className="font-semibold text-lg text-gray-100">{node.label}</h3>
          </div>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong>IP Range:</strong> {node.ip_range}</p>
            <p><strong>Zone Type:</strong> {node.zone_type}</p>
            {node.description && (
              <p><strong>Description:</strong> {node.description}</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('inbound')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'inbound'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Inbound ({inboundRules?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('outbound')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'outbound'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Outbound ({outboundRules?.length || 0})
            </button>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-2">
          {activeTab === 'inbound' && (
            inboundRules?.length ? (
              inboundRules.map(rule => <RuleCard key={rule.id} rule={rule} />)
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No inbound rules</p>
            )
          )}
          {activeTab === 'outbound' && (
            outboundRules?.length ? (
              outboundRules.map(rule => <RuleCard key={rule.id} rule={rule} />)
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No outbound rules</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function RuleCard({ rule }: { rule: FirewallRule }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:shadow-lg hover:shadow-gray-950/50 transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-200">{rule.rule_name}</h4>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            rule.action === 'ALLOW'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}
        >
          {rule.action}
        </span>
      </div>
      <div className="text-xs text-gray-400 space-y-1">
        <p><strong className="text-gray-300">Protocol:</strong> {rule.protocol}</p>
        {rule.port_range && <p><strong className="text-gray-300">Ports:</strong> {rule.port_range}</p>}
        {rule.description && <p className="text-gray-500">{rule.description}</p>}
      </div>
    </div>
  );
}
