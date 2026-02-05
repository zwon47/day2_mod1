from pydantic import BaseModel, Field
from typing import List, Dict, Any


class TopologyNode(BaseModel):
    """Node representing a network segment in topology graph"""
    id: str
    label: str
    ip_range: str
    zone_type: str
    color: str
    description: str | None = None


class TopologyEdge(BaseModel):
    """Edge representing firewall rule(s) between segments"""
    id: str
    from_: str = Field(..., alias='from', serialization_alias='from')  # source segment id
    to: str  # destination segment id
    label: str
    metadata: Dict[str, Any] = {}

    class Config:
        populate_by_name = True


class TopologyGraph(BaseModel):
    """Complete topology graph with nodes and edges"""
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]


class PathSegment(BaseModel):
    segment_id: int
    segment_name: str


class RuleApplied(BaseModel):
    rule_id: int
    rule_name: str
    protocol: str
    port_range: str | None = None


class PathAnalysisRequest(BaseModel):
    source_segment_id: int
    destination_segment_id: int
    protocol: str | None = None
    port: int | None = None


class PathAnalysisResponse(BaseModel):
    reachable: bool
    path: List[PathSegment]
    rules_applied: List[RuleApplied]


class AffectedConnection(BaseModel):
    source_segment: str
    destination_segment: str
    protocol: str
    port: str | None = None


class DependentPath(BaseModel):
    source: str
    destination: str
    via: List[str]


class RuleImpactRequest(BaseModel):
    rule_id: int


class RuleImpactResponse(BaseModel):
    affected_connections: List[AffectedConnection]
    dependent_paths: List[DependentPath]
    warning: str
