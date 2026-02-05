export interface TopologyNode {
  id: string;
  label: string;
  ip_range: string;
  zone_type: 'DMZ' | 'Internal' | 'External' | 'Management';
  color: string;
  description?: string;
}

export interface TopologyEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  metadata: {
    rule_ids: number[];
    protocols: string[];
    ports: string[];
    actions: string[];
    descriptions: string[];
  };
}

export interface TopologyGraph {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface NetworkSegment {
  id: number;
  name: string;
  ip_range: string;
  zone_type: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Firewall {
  id: number;
  name: string;
  vendor?: string;
  model?: string;
  management_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface FirewallRule {
  id: number;
  firewall_id: number;
  rule_name: string;
  source_segment_id: number;
  destination_segment_id: number;
  protocol: string;
  port_range?: string;
  action: 'ALLOW' | 'DENY';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PathSegment {
  segment_id: number;
  segment_name: string;
}

export interface RuleApplied {
  rule_id: number;
  rule_name: string;
  protocol: string;
  port_range?: string;
}

export interface PathAnalysisResult {
  reachable: boolean;
  path: PathSegment[];
  rules_applied: RuleApplied[];
}

export interface AffectedConnection {
  source_segment: string;
  destination_segment: string;
  protocol: string;
  port?: string;
}

export interface DependentPath {
  source: string;
  destination: string;
  via: string[];
}

export interface RuleImpactResult {
  affected_connections: AffectedConnection[];
  dependent_paths: DependentPath[];
  warning: string;
}

export interface SearchResult {
  segments: Array<{
    id: number;
    name: string;
    ip_range: string;
    zone_type: string;
  }>;
  rules: Array<{
    id: number;
    rule_name: string;
    protocol: string;
    action: string;
  }>;
}
