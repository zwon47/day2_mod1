from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from collections import defaultdict

from app.models.network_segment import NetworkSegment
from app.models.firewall_rule import FirewallRule


def build_topology_graph(
    db: Session,
    zone_types: Optional[List[str]] = None,
    protocols: Optional[List[str]] = None,
    action: Optional[str] = None
) -> Dict[str, Any]:
    """
    Build topology graph from firewall rules and network segments

    Args:
        db: Database session
        zone_types: Filter segments by zone types (e.g., ["DMZ", "Internal"])
        protocols: Filter rules by protocols (e.g., ["TCP", "UDP"])
        action: Filter rules by action ("ALLOW" or "DENY")

    Returns:
        Dictionary with 'nodes' and 'edges' lists representing the topology graph
    """

    # 1. Query segments with optional filtering
    segments_query = db.query(NetworkSegment)
    if zone_types:
        segments_query = segments_query.filter(NetworkSegment.zone_type.in_(zone_types))
    segments = segments_query.all()

    # 2. Query firewall rules with optional filtering
    rules_query = db.query(FirewallRule)
    if protocols:
        rules_query = rules_query.filter(FirewallRule.protocol.in_([p.upper() for p in protocols]))
    if action:
        rules_query = rules_query.filter(FirewallRule.action == action.upper())
    rules = rules_query.all()

    # 3. Build nodes from segments
    nodes = []
    segment_ids = set()

    for segment in segments:
        segment_ids.add(segment.id)
        nodes.append({
            "id": f"segment-{segment.id}",
            "label": segment.name,
            "ip_range": segment.ip_range,
            "zone_type": segment.zone_type,
            "color": segment.color,
            "description": segment.description
        })

    # 4. Build edges from rules
    # Group rules by (source, destination) pair to merge them into single edges
    edge_map = defaultdict(lambda: {
        "rule_ids": [],
        "protocols": set(),
        "ports": set(),
        "actions": set(),
        "descriptions": []
    })

    for rule in rules:
        # Only include rules where both source and destination are in filtered segments
        if rule.source_segment_id not in segment_ids or rule.destination_segment_id not in segment_ids:
            continue

        edge_key = (rule.source_segment_id, rule.destination_segment_id)
        edge_data = edge_map[edge_key]

        edge_data["rule_ids"].append(rule.id)
        edge_data["protocols"].add(rule.protocol)
        edge_data["actions"].add(rule.action)

        if rule.port_range:
            edge_data["ports"].add(rule.port_range)

        if rule.description:
            edge_data["descriptions"].append(rule.description)

    # 5. Create edge objects
    edges = []
    for (source_id, dest_id), data in edge_map.items():
        edge_id = f"edge-{source_id}-{dest_id}"

        # Create label from protocols and actions
        protocols_str = ", ".join(sorted(data["protocols"]))
        actions_str = ", ".join(sorted(data["actions"]))
        label = f"{protocols_str} ({actions_str})"

        edges.append({
            "id": edge_id,
            "from": f"segment-{source_id}",
            "to": f"segment-{dest_id}",
            "label": label,
            "metadata": {
                "rule_ids": data["rule_ids"],
                "protocols": list(data["protocols"]),
                "ports": list(data["ports"]),
                "actions": list(data["actions"]),
                "descriptions": data["descriptions"]
            }
        })

    return {
        "nodes": nodes,
        "edges": edges
    }
