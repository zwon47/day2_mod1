from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.schemas.topology import (
    TopologyGraph,
    PathAnalysisRequest,
    PathAnalysisResponse,
    RuleImpactRequest,
    RuleImpactResponse
)
from app.services.topology_service import build_topology_graph
from app.services.path_analyzer import find_path, analyze_rule_impact
from app.models.network_segment import NetworkSegment
from app.models.firewall_rule import FirewallRule

router = APIRouter(prefix="/api/topology", tags=["topology"])


@router.get("/graph", response_model=TopologyGraph)
def get_topology_graph(
    zone_types: Optional[List[str]] = Query(None, description="Filter by zone types (e.g., DMZ, Internal)"),
    protocols: Optional[List[str]] = Query(None, description="Filter by protocols (e.g., TCP, UDP)"),
    action: Optional[str] = Query(None, description="Filter by action (ALLOW or DENY)"),
    db: Session = Depends(get_db)
):
    """
    Get network topology graph based on firewall rules

    Returns a graph structure with:
    - nodes: Network segments
    - edges: Firewall rules connecting segments

    Filters can be applied to show only specific zone types, protocols, or actions.
    """
    graph_data = build_topology_graph(
        db=db,
        zone_types=zone_types,
        protocols=protocols,
        action=action
    )

    return TopologyGraph(**graph_data)


@router.post("/path-analysis", response_model=PathAnalysisResponse)
def analyze_path(
    request: PathAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze network path between two segments

    Finds if there's a reachable path from source to destination
    based on firewall rules, and returns the path and rules applied.
    """
    result = find_path(
        db=db,
        source_segment_id=request.source_segment_id,
        destination_segment_id=request.destination_segment_id,
        protocol=request.protocol,
        port=request.port
    )

    return PathAnalysisResponse(**result)


@router.post("/rule-impact", response_model=RuleImpactResponse)
def analyze_rule_impact_endpoint(
    request: RuleImpactRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze impact of deleting a firewall rule

    Returns which connections would be affected and any dependent paths.
    """
    result = analyze_rule_impact(
        db=db,
        rule_id=request.rule_id
    )

    return RuleImpactResponse(**result)


@router.get("/search")
def search_topology(
    q: str = Query(..., description="Search query"),
    type: str | None = Query(None, description="Search type: segment or rule"),
    db: Session = Depends(get_db)
):
    """
    Search network segments and firewall rules
    """
    results = {
        "segments": [],
        "rules": []
    }

    if not type or type == "segment":
        # 세그먼트 검색 (이름 또는 IP)
        segments = db.query(NetworkSegment).filter(
            (NetworkSegment.name.ilike(f"%{q}%")) |
            (NetworkSegment.ip_range.ilike(f"%{q}%"))
        ).all()

        results["segments"] = [
            {
                "id": seg.id,
                "name": seg.name,
                "ip_range": seg.ip_range,
                "zone_type": seg.zone_type
            }
            for seg in segments
        ]

    if not type or type == "rule":
        # 규칙 검색 (이름 또는 설명)
        rules = db.query(FirewallRule).filter(
            (FirewallRule.rule_name.ilike(f"%{q}%")) |
            (FirewallRule.description.ilike(f"%{q}%"))
        ).all()

        results["rules"] = [
            {
                "id": rule.id,
                "rule_name": rule.rule_name,
                "protocol": rule.protocol,
                "action": rule.action
            }
            for rule in rules
        ]

    return results
