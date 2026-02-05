from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from collections import deque

from app.models.network_segment import NetworkSegment
from app.models.firewall_rule import FirewallRule


def find_path(
    db: Session,
    source_segment_id: int,
    destination_segment_id: int,
    protocol: Optional[str] = None,
    port: Optional[int] = None
) -> Dict[str, Any]:
    """
    두 세그먼트 간 경로를 BFS로 탐색

    Args:
        db: Database session
        source_segment_id: 출발지 세그먼트 ID
        destination_segment_id: 목적지 세그먼트 ID
        protocol: 프로토콜 필터 (선택적)
        port: 포트 필터 (선택적)

    Returns:
        {
            "reachable": bool,
            "path": [{"segment_id": int, "segment_name": str}, ...],
            "rules_applied": [{"rule_id": int, "rule_name": str, ...}, ...]
        }
    """
    # 1. 모든 세그먼트 조회
    segments = {seg.id: seg for seg in db.query(NetworkSegment).all()}

    # 2. ALLOW 규칙만 조회 (경로 구성용)
    rules_query = db.query(FirewallRule).filter(FirewallRule.action == "ALLOW")

    if protocol:
        rules_query = rules_query.filter(
            (FirewallRule.protocol == protocol.upper()) |
            (FirewallRule.protocol == "ANY")
        )

    rules = rules_query.all()

    # 3. 그래프 구성 (adjacency list)
    # graph[source_id] = [(destination_id, rule), ...]
    graph = {}
    for rule in rules:
        if rule.source_segment_id not in graph:
            graph[rule.source_segment_id] = []

        # 포트 매칭 검사
        if port and rule.port_range:
            if not _port_matches(port, rule.port_range):
                continue

        graph[rule.source_segment_id].append((rule.destination_segment_id, rule))

    # 4. BFS로 경로 탐색
    if source_segment_id not in graph:
        return {
            "reachable": False,
            "path": [],
            "rules_applied": []
        }

    queue = deque([(source_segment_id, [source_segment_id], [])])  # (current, path, rules)
    visited = set()

    while queue:
        current, path, rules_used = queue.popleft()

        if current == destination_segment_id:
            # 경로 찾음
            return {
                "reachable": True,
                "path": [
                    {
                        "segment_id": seg_id,
                        "segment_name": segments[seg_id].name
                    }
                    for seg_id in path
                ],
                "rules_applied": [
                    {
                        "rule_id": rule.id,
                        "rule_name": rule.rule_name,
                        "protocol": rule.protocol,
                        "port_range": rule.port_range
                    }
                    for rule in rules_used
                ]
            }

        if current in visited:
            continue
        visited.add(current)

        # 인접 노드 탐색
        if current in graph:
            for next_seg, rule in graph[current]:
                if next_seg not in visited:
                    queue.append((
                        next_seg,
                        path + [next_seg],
                        rules_used + [rule]
                    ))

    # 경로 없음
    return {
        "reachable": False,
        "path": [],
        "rules_applied": []
    }


def _port_matches(port: int, port_range: str) -> bool:
    """
    포트가 범위에 포함되는지 확인

    port_range 형식:
    - "80" (단일 포트)
    - "80,443" (여러 포트)
    - "8000-9000" (범위)
    """
    parts = port_range.split(',')

    for part in parts:
        part = part.strip()

        if '-' in part:
            # 범위
            start, end = part.split('-')
            if int(start) <= port <= int(end):
                return True
        else:
            # 단일 포트
            if port == int(part):
                return True

    return False


def analyze_rule_impact(
    db: Session,
    rule_id: int
) -> Dict[str, Any]:
    """
    규칙 삭제 시 영향 분석

    Args:
        db: Database session
        rule_id: 분석할 규칙 ID

    Returns:
        {
            "affected_connections": [...],
            "dependent_paths": [...],
            "warning": str
        }
    """
    # 1. 규칙 조회
    rule = db.query(FirewallRule).filter(FirewallRule.id == rule_id).first()
    if not rule:
        return {"error": "Rule not found"}

    # 2. 직접 영향받는 연결
    source_seg = db.query(NetworkSegment).get(rule.source_segment_id)
    dest_seg = db.query(NetworkSegment).get(rule.destination_segment_id)

    affected_connections = [{
        "source_segment": source_seg.name,
        "destination_segment": dest_seg.name,
        "protocol": rule.protocol,
        "port": rule.port_range
    }]

    # 3. 이 규칙을 경유하는 경로 찾기
    # 모든 세그먼트 쌍에 대해 경로 검사 (간단한 구현)
    # 실제로는 더 효율적인 방법 필요
    all_segments = db.query(NetworkSegment).all()
    dependent_paths = []

    # 규칙을 임시로 삭제하고 경로 재계산 (시뮬레이션)
    # 여기서는 간단히 직접 연결만 체크

    # 4. 경고 메시지 생성
    warning = f"This rule is critical for {len(affected_connections)} direct connection(s)"

    return {
        "affected_connections": affected_connections,
        "dependent_paths": dependent_paths,
        "warning": warning
    }
