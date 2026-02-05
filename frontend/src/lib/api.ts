import {
  TopologyGraph,
  NetworkSegment,
  Firewall,
  FirewallRule,
  PathAnalysisResult,
  RuleImpactResult,
  SearchResult
} from '@/types/topology';

const API_BASE = '/api';

export async function fetchTopologyGraph(): Promise<TopologyGraph> {
  const res = await fetch(`${API_BASE}/topology/graph`);
  if (!res.ok) throw new Error('Failed to fetch topology graph');
  return res.json();
}

export async function fetchNetworkSegments(): Promise<NetworkSegment[]> {
  const res = await fetch(`${API_BASE}/network-segments`);
  if (!res.ok) throw new Error('Failed to fetch segments');
  return res.json();
}

export async function fetchFirewalls(): Promise<Firewall[]> {
  const res = await fetch(`${API_BASE}/firewalls`);
  if (!res.ok) throw new Error('Failed to fetch firewalls');
  return res.json();
}

export async function fetchFirewallRules(): Promise<FirewallRule[]> {
  const res = await fetch(`${API_BASE}/firewall-rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
}

export async function createNetworkSegment(data: Omit<NetworkSegment, 'id' | 'created_at' | 'updated_at'>): Promise<NetworkSegment> {
  const res = await fetch(`${API_BASE}/network-segments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create segment');
  return res.json();
}

export async function updateNetworkSegment(id: number, data: Partial<NetworkSegment>): Promise<NetworkSegment> {
  const res = await fetch(`${API_BASE}/network-segments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update segment');
  return res.json();
}

export async function deleteNetworkSegment(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/network-segments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete segment');
}

export async function createFirewallRule(data: Omit<FirewallRule, 'id' | 'created_at' | 'updated_at'>): Promise<FirewallRule> {
  const res = await fetch(`${API_BASE}/firewall-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create rule');
  return res.json();
}

export async function updateFirewallRule(id: number, data: Partial<FirewallRule>): Promise<FirewallRule> {
  const res = await fetch(`${API_BASE}/firewall-rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update rule');
  return res.json();
}

export async function deleteFirewallRule(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/firewall-rules/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete rule');
}

export async function analyzePathBetweenSegments(
  sourceId: number,
  destinationId: number,
  protocol?: string,
  port?: number
): Promise<PathAnalysisResult> {
  const res = await fetch(`${API_BASE}/topology/path-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_segment_id: sourceId,
      destination_segment_id: destinationId,
      protocol,
      port
    })
  });
  if (!res.ok) throw new Error('Failed to analyze path');
  return res.json();
}

export async function analyzeRuleImpact(ruleId: number): Promise<RuleImpactResult> {
  const res = await fetch(`${API_BASE}/topology/rule-impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rule_id: ruleId })
  });
  if (!res.ok) throw new Error('Failed to analyze rule impact');
  return res.json();
}

export async function searchTopology(query: string, type?: 'segment' | 'rule'): Promise<SearchResult> {
  const params = new URLSearchParams({ q: query });
  if (type) params.append('type', type);

  const res = await fetch(`${API_BASE}/topology/search?${params}`);
  if (!res.ok) throw new Error('Failed to search');
  return res.json();
}
