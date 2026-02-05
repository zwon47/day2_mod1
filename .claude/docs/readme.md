# 방화벽 IP 대역 기반 토폴로지 맵 대시보드 - 기능 요구사항 문서

## 1. 프로젝트 정의

### 1.1 목적
방화벽 정책과 네트워크 세그먼트 간의 연결 관계를 시각화하여 관리자가 복잡한 방화벽 정책을 이해하고 분석할 수 있는 대시보드를 제공합니다.

### 1.2 핵심 가치
- **가시성**: 복잡한 방화벽 규칙을 직관적인 네트워크 토폴로지로 시각화
- **분석력**: 네트워크 경로 추적, 보안 감사, 규칙 영향 분석 기능 제공
- **관리성**: 세그먼트 및 규칙 CRUD 통합 관리
- **보안성**: 잘못된 방화벽 규칙 사전 탐지 및 검증

---

## 2. 핵심 개념

### 2.1 용어 정의
- **방화벽 IP 대역**: 동일한 보안 정책이 적용되는 IP 주소 범위 (예: 10.0.1.0/24)
- **토폴로지 노드**: 각 네트워크 세그먼트를 나타내는 그래프 노드
- **토폴로지 엣지**: 방화벽 규칙에 의해 허용된 트래픽 경로 (출발지 → 목적지)

### 2.2 주요 사용 시나리오
1. **네트워크 경로 확인**: "개발망에서 프로덕션 DB에 접근 가능한가?"
2. **보안 감사**: "외부 인터넷에서 직접 접근 가능한 내부 네트워크는?"
3. **규칙 영향 분석**: "이 규칙을 삭제하면 어떤 연결이 끊기나?"
4. **정책 검증**: "DMZ에서 내부망으로의 불필요한 개방 포트는 없는가?"

---

## 3. 데이터 모델

### 3.1 주요 엔티티

#### NetworkSegment (네트워크 세그먼트)
```python
class NetworkSegment:
    id: int                      # Primary Key
    name: str                    # 세그먼트 이름 (예: "DMZ Zone")
    ip_range: str                # CIDR 표기 (예: "10.0.1.0/24")
    zone_type: str               # DMZ / Internal / External / Management
    color: str                   # 시각화 색상 (HEX)
    description: str | None      # 설명
    created_at: datetime
    updated_at: datetime
```

**예시 데이터**:
- name: "DMZ Zone"
- ip_range: "10.0.1.0/24"
- zone_type: "DMZ"
- description: "Public-facing services"

#### Firewall (방화벽 장치)
```python
class Firewall:
    id: int                      # Primary Key
    name: str                    # 방화벽 이름
    vendor: str | None           # 제조사 (예: "Palo Alto")
    model: str | None            # 모델명 (예: "PA-5220")
    management_ip: str | None    # 관리 IP
    created_at: datetime
    updated_at: datetime
```

#### FirewallRule (방화벽 규칙)
```python
class FirewallRule:
    id: int                           # Primary Key
    firewall_id: int                  # FK -> Firewall
    rule_name: str                    # 규칙 이름
    source_segment_id: int            # FK -> NetworkSegment
    destination_segment_id: int       # FK -> NetworkSegment
    protocol: str                     # TCP / UDP / ICMP / ANY
    port_range: str | None            # 포트 범위 (예: "80,443" 또는 "8000-9000")
    action: str                       # ALLOW / DENY
    description: str | None
    created_at: datetime
    updated_at: datetime
```

**예시 데이터**:
- rule_name: "Web to DB"
- source_segment_id: 2 (Web Servers)
- destination_segment_id: 4 (DB Servers)
- protocol: "TCP"
- port_range: "3306"
- action: "ALLOW"

#### TopologyConnection (토폴로지 캐시 - 선택적)
```python
class TopologyConnection:
    id: int
    source_segment_id: int
    destination_segment_id: int
    rule_ids: str                # JSON array: "[1, 5, 12]"
    protocols: str               # JSON array: '["TCP", "UDP"]'
    ports: str                   # JSON array: '["80", "443"]'
    updated_at: datetime
```

**용도**: 대규모 규칙 세트에서 토폴로지 그래프 생성 성능 최적화용 (미리 계산된 연결 정보 저장)

---

## 4. API 설계

### 4.1 Backend (FastAPI) 엔드포인트

#### 네트워크 세그먼트 API
```
GET    /api/network-segments          # 세그먼트 목록 조회
POST   /api/network-segments          # 세그먼트 생성
GET    /api/network-segments/{id}     # 세그먼트 상세 조회
PUT    /api/network-segments/{id}     # 세그먼트 수정
DELETE /api/network-segments/{id}     # 세그먼트 삭제
```

#### 방화벽 API
```
GET    /api/firewalls                 # 방화벽 목록 조회
POST   /api/firewalls                 # 방화벽 생성
GET    /api/firewalls/{id}            # 방화벽 상세 조회
PUT    /api/firewalls/{id}            # 방화벽 수정
DELETE /api/firewalls/{id}            # 방화벽 삭제
```

#### 방화벽 규칙 API
```
GET    /api/firewall-rules            # 규칙 목록 조회 (필터: firewall_id, protocol, action)
POST   /api/firewall-rules            # 규칙 생성
GET    /api/firewall-rules/{id}       # 규칙 상세 조회
PUT    /api/firewall-rules/{id}       # 규칙 수정
DELETE /api/firewall-rules/{id}       # 규칙 삭제
```

#### 토폴로지 API ⭐ (핵심)
```
GET    /api/topology/graph            # 토폴로지 그래프 데이터 (노드/엣지)
POST   /api/topology/path-analysis    # 두 세그먼트 간 경로 분석
POST   /api/topology/rule-impact      # 규칙 삭제 시 영향 분석
GET    /api/topology/search           # 세그먼트/규칙 검색
```

### 4.2 토폴로지 API 상세 사양

#### `GET /api/topology/graph`
**쿼리 파라미터**:
- `zone_types` (optional): 필터링할 존 타입 (예: `DMZ,Internal`)
- `protocols` (optional): 필터링할 프로토콜 (예: `TCP,UDP`)
- `action` (optional): 필터링할 액션 (예: `ALLOW`)

**응답 구조**:
```json
{
  "nodes": [
    {
      "id": "segment-1",
      "label": "DMZ Zone",
      "ip_range": "10.0.1.0/24",
      "zone_type": "DMZ",
      "color": "#FF6B6B",
      "description": "Public-facing services"
    },
    {
      "id": "segment-2",
      "label": "Web Servers",
      "ip_range": "10.0.2.0/24",
      "zone_type": "Internal",
      "color": "#4ECDC4"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "from": "segment-1",
      "to": "segment-2",
      "label": "TCP: 80,443",
      "metadata": {
        "rule_ids": [1, 2],
        "protocols": ["TCP"],
        "ports": ["80", "443"],
        "action": "ALLOW"
      }
    }
  ]
}
```

#### `POST /api/topology/path-analysis`
**요청 바디**:
```json
{
  "source_segment_id": 5,
  "destination_segment_id": 4,
  "protocol": "TCP",      // optional
  "port": 3306           // optional
}
```

**응답**:
```json
{
  "reachable": true,
  "path": [
    {
      "segment_id": 5,
      "segment_name": "Dev Network"
    },
    {
      "segment_id": 3,
      "segment_name": "App Servers"
    },
    {
      "segment_id": 4,
      "segment_name": "DB Servers"
    }
  ],
  "rules_applied": [
    {
      "rule_id": 10,
      "rule_name": "Dev to App",
      "protocol": "TCP",
      "port_range": "8000-9000"
    },
    {
      "rule_id": 4,
      "rule_name": "App to DB",
      "protocol": "TCP",
      "port_range": "3306"
    }
  ]
}
```

#### `POST /api/topology/rule-impact`
**요청 바디**:
```json
{
  "rule_id": 4
}
```

**응답**:
```json
{
  "affected_connections": [
    {
      "source_segment": "App Servers",
      "destination_segment": "DB Servers",
      "protocol": "TCP",
      "port": "3306"
    }
  ],
  "dependent_paths": [
    {
      "source": "Web Servers",
      "destination": "DB Servers",
      "via": ["App Servers"]
    }
  ],
  "warning": "This rule is critical for 3 active connections"
}
```

---

## 5. 프론트엔드 기능

### 5.1 페이지 구조 (Next.js App Router)

```
/dashboard           # 메인 토폴로지 맵 (핵심 페이지)
/segments            # 네트워크 세그먼트 관리 (CRUD)
/rules               # 방화벽 규칙 관리 (CRUD)
/firewalls           # 방화벽 장치 관리 (CRUD)
/analysis            # 경로 분석 도구
```

### 5.2 핵심 컴포넌트

#### 1. TopologyMap (메인 시각화)
**위치**: `frontend/src/components/topology/TopologyMap.tsx`

**기능**:
- 네트워크 세그먼트를 노드로 시각화
- 방화벽 규칙을 엣지(화살표)로 시각화
- 드래그, 줌, 패닝 인터랙션
- 노드 클릭 시 상세 정보 패널 표시
- 엣지 클릭 시 규칙 정보 표시
- 레이아웃 전환 (dagre, cose, circle)

**Props**:
```typescript
interface TopologyMapProps {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  layout?: 'dagre' | 'cose' | 'circle';
}
```

#### 2. FilterPanel (필터 컨트롤)
**위치**: `frontend/src/components/topology/FilterPanel.tsx`

**기능**:
- Zone Type 필터 (DMZ / Internal / External)
- Protocol 필터 (TCP / UDP / ICMP / ANY)
- Action 필터 (ALLOW / DENY)
- 검색 (세그먼트 이름 / IP 범위)
- 레이아웃 선택
- 필터 초기화 버튼

#### 3. DetailPanel (상세 정보)
**위치**: `frontend/src/components/topology/DetailPanel.tsx`

**기능**:
- 선택된 세그먼트 정보 표시
  - 이름, IP 범위, Zone Type, 설명
  - Inbound Rules 탭 (들어오는 트래픽)
  - Outbound Rules 탭 (나가는 트래픽)
- 선택된 엣지(규칙) 정보 표시
  - 규칙 이름, 프로토콜, 포트, 액션
  - 출발지/목적지 세그먼트
  - 수정/삭제 버튼

#### 4. SegmentList & SegmentForm
**위치**: `frontend/src/components/segments/`

**기능**:
- 세그먼트 목록 테이블 (이름, IP, Zone Type, 액션)
- 페이지네이션
- 생성/수정 폼
  - 이름 입력
  - IP 범위 (CIDR 검증)
  - Zone Type 선택
  - 색상 선택 (Color Picker)
  - 설명

#### 5. RuleList & RuleForm
**위치**: `frontend/src/components/rules/`

**기능**:
- 규칙 목록 테이블 (이름, 출발지, 목적지, 프로토콜, 포트, 액션)
- 필터링 (방화벽, 프로토콜, 액션)
- 생성/수정 폼
  - 규칙 이름
  - 방화벽 선택 (드롭다운)
  - 출발지 세그먼트 선택 (드롭다운)
  - 목적지 세그먼트 선택 (드롭다운)
  - 프로토콜 선택 (TCP/UDP/ICMP/ANY)
  - 포트 범위 (예: "80,443" 또는 "8000-9000")
  - 액션 (ALLOW/DENY)
  - 유효성 검증
    - IP 형식 검증
    - 충돌 규칙 경고 (동일 출발지/목적지에 상충되는 규칙)

#### 6. PathAnalysisTool
**위치**: `frontend/src/components/analysis/PathAnalysisTool.tsx`

**기능**:
- 출발지 세그먼트 선택
- 목적지 세그먼트 선택
- 프로토콜/포트 지정 (선택적)
- 경로 분석 실행
- 결과 표시:
  - 도달 가능 여부
  - 경로 시각화 (노드 체인)
  - 적용된 규칙 목록

---

## 6. 시각화 라이브러리 비교 및 추천

### 6.1 후보 라이브러리 비교

| 라이브러리 | React 통합 | 성능 (1000+ 노드) | 학습 곡선 | 레이아웃 알고리즘 | 추천도 |
|----------|----------|------------------|----------|----------------|--------|
| **Cytoscape.js** | ⭐⭐⭐ | 매우 우수 | 중간 | Dagre, Cose, Circle 등 | ⭐⭐⭐⭐⭐ |
| React Flow | ⭐⭐⭐⭐⭐ | 중간 | 쉬움 | 수동 배치 위주 | ⭐⭐⭐⭐ |
| vis-network | ⭐⭐⭐ | 보통 | 쉬움 | Physics, Hierarchical | ⭐⭐⭐ |
| D3.js | ⭐⭐ | 우수 | 어려움 | Force, Tree 등 (수동 구현) | ⭐⭐ |

### 6.2 최종 추천: Cytoscape.js ⭐

**선정 이유**:
1. **대규모 그래프 성능**: 수백~수천 개 노드를 효율적으로 처리
2. **내장 그래프 알고리즘**: BFS, DFS, Dijkstra로 경로 분석 가능
3. **다양한 레이아웃**: dagre (계층형), cose (힘 기반), circle (원형)
4. **검증된 안정성**: 생물정보학, 엔터프라이즈에서 10년+ 사용
5. **강력한 커스터마이징**: 노드/엣지 스타일, 애니메이션, 이벤트 핸들링
6. **확장 생태계**: 다양한 플러그인 (dagre, cola, cxtmenu 등)

**단점**:
- React 통합이 React Flow보다는 덜 직관적 (직접 DOM ref 사용)
- 선언적 API가 아닌 명령형 API

### 6.3 React 통합 예시

```typescript
// frontend/src/components/topology/TopologyMap.tsx
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { useEffect, useRef } from 'react';

cytoscape.use(dagre);

interface TopologyMapProps {
  nodes: Array<{
    id: string;
    label: string;
    ip_range: string;
    zone_type: string;
    color: string;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    label: string;
  }>;
  onNodeClick?: (nodeId: string) => void;
}

export default function TopologyMap({ nodes, edges, onNodeClick }: TopologyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: nodes.map(n => ({
          data: { id: n.id, label: n.label, ...n }
        })),
        edges: edges.map(e => ({
          data: { id: e.id, source: e.from, target: e.to, label: e.label }
        }))
      },
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 50,
        rankSep: 100
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 80,
            'height': 80,
            'font-size': '12px',
            'color': '#fff'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#9CA3AF',
            'target-arrow-color': '#9CA3AF',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate'
          }
        }
      ]
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      onNodeClick?.(node.id());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, onNodeClick]);

  return <div ref={containerRef} className="w-full h-full" />;
}
```

---

## 7. 구현 우선순위

### Phase 1: MVP (2주) ⭐
**목표**: 기본 CRUD + 토폴로지 시각화

**Backend (be-agent)**:
- `NetworkSegment`, `Firewall`, `FirewallRule` 모델 생성
- CRUD API 구현 (3개 리소스)
- `/api/topology/graph` 구현 (핵심)
  - 규칙 기반 노드/엣지 생성 로직
  - 기본 필터링 (zone_type, protocol, action)

**Frontend (fe-agent)**:
- `/dashboard` 페이지 + TopologyMap 컴포넌트
- `/segments` 페이지 + SegmentList/Form
- `/rules` 페이지 + RuleList/Form
- `/firewalls` 페이지 + FirewallList/Form
- 기본 API 연동 (React Query)

**완료 조건**:
- ✅ 세그먼트/규칙/방화벽 생성 가능
- ✅ 토폴로지 맵에 노드/엣지 시각화
- ✅ 노드 클릭 시 상세 정보 표시
- ✅ 기본 필터링 동작

### Phase 2: 고급 기능 (2주)
**목표**: 경로 분석 + 영향 분석 + 고급 필터

**Backend (be-agent)**:
- `/api/topology/path-analysis` 구현
  - BFS/DFS 알고리즘으로 경로 탐색
  - 프로토콜/포트 매칭 로직
- `/api/topology/rule-impact` 구현
- `/api/topology/search` 구현
- 쿼리 최적화 (인덱스 추가)

**Frontend (fe-agent)**:
- FilterPanel 고도화 (다중 선택, 검색)
- DetailPanel 고도화 (Inbound/Outbound 탭)
- `/analysis` 페이지 + PathAnalysisTool
- 규칙 충돌 경고 UI
- 레이아웃 전환 기능

**완료 조건**:
- ✅ 두 세그먼트 간 도달 가능 여부 확인
- ✅ 경로 시각화 (하이라이트)
- ✅ 규칙 삭제 시 영향 분석 결과 표시
- ✅ 고급 필터링 (다중 조건)

### Phase 3: 최적화 및 편의 기능 (1주)
**목표**: 성능 최적화 + 사용성 개선

**Backend (be-agent)**:
- TopologyConnection 캐싱 테이블 구현
- 페이지네이션 추가

**Frontend (fe-agent)**:
- 대규모 그래프 최적화
  - Cytoscape `textureOnViewport`, `hideEdgesOnViewport`
  - 가상 스크롤 (테이블)
- 드래그 앤 드롭 (노드 위치 저장)
- 컨텍스트 메뉴 (우클릭)
- 애니메이션 (레이아웃 전환)

**완료 조건**:
- ✅ 500+ 노드 그래프 부드러운 렌더링
- ✅ 우클릭 메뉴로 빠른 작업 수행

---

## 8. 기술적 고려사항

### 8.1 대용량 데이터 처리

**Database 인덱스**:
```sql
CREATE INDEX idx_firewall_rule_source ON firewall_rule(source_segment_id);
CREATE INDEX idx_firewall_rule_destination ON firewall_rule(destination_segment_id);
CREATE INDEX idx_firewall_rule_action ON firewall_rule(action);
CREATE INDEX idx_network_segment_zone_type ON network_segment(zone_type);
```

**API 페이지네이션**:
```python
# backend/app/routers/firewall_rules.py
@router.get("/firewall-rules")
def get_rules(
    skip: int = 0,
    limit: int = 100,
    firewall_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(FirewallRule)
    if firewall_id:
        query = query.filter(FirewallRule.firewall_id == firewall_id)
    return query.offset(skip).limit(limit).all()
```

**프론트엔드 가상화**:
```typescript
// Cytoscape 성능 튜닝
const cy = cytoscape({
  // ...
  textureOnViewport: true,      // 뷰포트 외부 노드는 텍스처로 렌더링
  hideEdgesOnViewport: true,    // 줌 아웃 시 엣지 숨김
  wheelSensitivity: 0.2         // 부드러운 줌
});
```

### 8.2 보안

**인증 및 권한**:
- JWT 기반 인증 (FastAPI Depends)
- 역할 기반 접근 제어 (RBAC)
  - `viewer`: 읽기 전용
  - `editor`: CRUD 가능
  - `admin`: 전체 권한 + 감사 로그 조회

**감사 로그**:
```python
class AuditLog:
    id: int
    user_id: int
    action: str           # CREATE / UPDATE / DELETE
    resource_type: str    # NetworkSegment / FirewallRule
    resource_id: int
    changes: str          # JSON
    timestamp: datetime
```

**입력 검증**:
```python
# backend/app/schemas/network_segment.py
from pydantic import BaseModel, field_validator
import ipaddress

class NetworkSegmentCreate(BaseModel):
    name: str
    ip_range: str
    zone_type: str

    @field_validator('ip_range')
    def validate_ip_range(cls, v):
        try:
            ipaddress.ip_network(v, strict=False)
        except ValueError:
            raise ValueError('Invalid CIDR format')
        return v
```

**HTTPS 필수**: 프로덕션 환경에서 HTTPS 강제

### 8.3 IP 주소 처리

**Python `ipaddress` 모듈 활용**:
```python
# backend/app/services/ip_utils.py
import ipaddress

def ip_in_segment(ip: str, segment_cidr: str) -> bool:
    """특정 IP가 세그먼트에 속하는지 확인"""
    ip_obj = ipaddress.ip_address(ip)
    network = ipaddress.ip_network(segment_cidr, strict=False)
    return ip_obj in network

def segments_overlap(cidr1: str, cidr2: str) -> bool:
    """두 세그먼트가 겹치는지 확인"""
    net1 = ipaddress.ip_network(cidr1, strict=False)
    net2 = ipaddress.ip_network(cidr2, strict=False)
    return net1.overlaps(net2)

def validate_cidr(cidr: str) -> bool:
    """CIDR 형식 검증"""
    try:
        ipaddress.ip_network(cidr, strict=False)
        return True
    except ValueError:
        return False
```

**지원 형식**:
- CIDR: `10.0.1.0/24`
- IP 범위: `10.0.1.1-10.0.1.254` (내부 변환 필요)
- 단일 IP: `10.0.1.100` → `10.0.1.100/32`

### 8.4 그래프 레이아웃 전략

**레이아웃 선택 가이드**:
| 레이아웃 | 적합한 경우 | 특징 |
|---------|------------|------|
| **dagre** | 계층적 네트워크 (Internet → DMZ → Internal) | 방향성, 깔끔한 정렬 |
| **cose** | 일반적인 네트워크 | 자연스러운 클러스터링, 물리 시뮬레이션 |
| **circle** | 소규모 네트워크 (< 20 노드) | 대칭적, 모든 노드 가시성 |
| **grid** | 규칙적인 배치 필요 시 | 정렬, 예측 가능 |

**레이아웃 전환 예시**:
```typescript
function changeLayout(layoutName: 'dagre' | 'cose' | 'circle') {
  cy.layout({
    name: layoutName,
    animate: true,
    animationDuration: 500
  }).run();
}
```

---

## 9. 샘플 데이터

### 9.1 네트워크 세그먼트 예시

| ID | Name | IP Range | Zone Type | Color | Description |
|----|------|----------|-----------|-------|-------------|
| 1 | Internet | 0.0.0.0/0 | External | #E74C3C | Public Internet |
| 2 | DMZ Zone | 10.0.1.0/24 | DMZ | #FF6B6B | Public-facing services |
| 3 | Web Servers | 10.0.2.0/24 | Internal | #4ECDC4 | Frontend web servers |
| 4 | App Servers | 10.0.3.0/24 | Internal | #95E1D3 | Backend application servers |
| 5 | DB Servers | 10.0.4.0/24 | Internal | #F38181 | Database servers |
| 6 | Dev Network | 172.16.0.0/16 | Internal | #AA96DA | Development environment |
| 7 | Management | 192.168.100.0/24 | Management | #FCBAD3 | Admin/management network |

### 9.2 방화벽 규칙 예시

| ID | Rule Name | Source | Destination | Protocol | Port | Action | Description |
|----|-----------|--------|-------------|----------|------|--------|-------------|
| 1 | Internet to DMZ | Internet | DMZ Zone | TCP | 80,443 | ALLOW | Public web access |
| 2 | DMZ to Web | DMZ Zone | Web Servers | TCP | 80,443,8080 | ALLOW | Internal proxy |
| 3 | Web to App | Web Servers | App Servers | TCP | 8000-9000 | ALLOW | API communication |
| 4 | App to DB | App Servers | DB Servers | TCP | 3306 | ALLOW | MySQL access |
| 5 | Dev to Prod DB | Dev Network | DB Servers | ANY | ANY | DENY | Security policy |
| 6 | Management SSH | Management | All Segments | TCP | 22 | ALLOW | Admin access |
| 7 | Web to DB Direct | Web Servers | DB Servers | ANY | ANY | DENY | Prevent direct access |

### 9.3 예상 토폴로지 구조

```
Internet (External)
    ↓ (TCP: 80, 443)
DMZ Zone (DMZ)
    ↓ (TCP: 80, 443, 8080)
Web Servers (Internal)
    ↓ (TCP: 8000-9000)
    ↓ (DENY: DB Direct)
App Servers (Internal)
    ↓ (TCP: 3306)
DB Servers (Internal)
    ↑ (DENY)
Dev Network (Internal)

Management (Management)
    ↓ (SSH: 22)
[All Segments]
```

### 9.4 SQL 샘플 데이터 (초기 시드)

```sql
-- backend/app/seed_data.py
INSERT INTO network_segment (name, ip_range, zone_type, color, description) VALUES
('Internet', '0.0.0.0/0', 'External', '#E74C3C', 'Public Internet'),
('DMZ Zone', '10.0.1.0/24', 'DMZ', '#FF6B6B', 'Public-facing services'),
('Web Servers', '10.0.2.0/24', 'Internal', '#4ECDC4', 'Frontend web servers'),
('App Servers', '10.0.3.0/24', 'Internal', '#95E1D3', 'Backend application servers'),
('DB Servers', '10.0.4.0/24', 'Internal', '#F38181', 'Database servers'),
('Dev Network', '172.16.0.0/16', 'Internal', '#AA96DA', 'Development environment'),
('Management', '192.168.100.0/24', 'Management', '#FCBAD3', 'Admin/management network');

INSERT INTO firewall (name, vendor, model, management_ip) VALUES
('Main Gateway FW', 'Palo Alto', 'PA-5220', '192.168.100.1');

INSERT INTO firewall_rule (firewall_id, rule_name, source_segment_id, destination_segment_id, protocol, port_range, action, description) VALUES
(1, 'Internet to DMZ', 1, 2, 'TCP', '80,443', 'ALLOW', 'Public web access'),
(1, 'DMZ to Web', 2, 3, 'TCP', '80,443,8080', 'ALLOW', 'Internal proxy'),
(1, 'Web to App', 3, 4, 'TCP', '8000-9000', 'ALLOW', 'API communication'),
(1, 'App to DB', 4, 5, 'TCP', '3306', 'ALLOW', 'MySQL access'),
(1, 'Dev to Prod DB', 6, 5, 'ANY', NULL, 'DENY', 'Security policy'),
(1, 'Management SSH to Web', 7, 3, 'TCP', '22', 'ALLOW', 'Admin access'),
(1, 'Management SSH to App', 7, 4, 'TCP', '22', 'ALLOW', 'Admin access'),
(1, 'Management SSH to DB', 7, 5, 'TCP', '22', 'ALLOW', 'Admin access');
```

---

## 10. 프로젝트 구조

### 10.1 Backend (`backend/app/`)

```
backend/app/
├── main.py                          # FastAPI 앱 진입점 (라우터 등록)
├── database.py                      # SQLAlchemy 엔진, 세션, Base
├── models/
│   ├── __init__.py
│   ├── network_segment.py           # 신규 ⭐
│   ├── firewall.py                  # 신규 ⭐
│   ├── firewall_rule.py             # 신규 ⭐
│   └── topology_connection.py       # 신규 (캐싱용, Phase 3)
├── schemas/
│   ├── __init__.py
│   ├── network_segment.py           # 신규 ⭐
│   ├── firewall.py                  # 신규 ⭐
│   ├── firewall_rule.py             # 신규 ⭐
│   └── topology.py                  # 신규 ⭐ (그래프 응답 스키마)
├── routers/
│   ├── __init__.py
│   ├── network_segments.py          # 신규 ⭐ (CRUD API)
│   ├── firewalls.py                 # 신규 ⭐ (CRUD API)
│   ├── firewall_rules.py            # 신규 ⭐ (CRUD API)
│   └── topology.py                  # 신규 ⭐⭐⭐ (핵심: 그래프 생성)
├── services/
│   ├── __init__.py
│   ├── topology_service.py          # 신규 ⭐⭐ (그래프 생성 로직)
│   ├── path_analyzer.py             # 신규 ⭐ (경로 분석, Phase 2)
│   └── ip_utils.py                  # 신규 (IP 유틸리티)
└── seed_data.py                     # 신규 (초기 샘플 데이터)
```

### 10.2 Frontend (`frontend/src/`)

```
frontend/src/
├── app/
│   ├── layout.tsx                   # 루트 레이아웃
│   ├── dashboard/
│   │   └── page.tsx                 # 신규 ⭐⭐⭐ (토폴로지 맵 메인)
│   ├── segments/
│   │   └── page.tsx                 # 신규 ⭐ (세그먼트 관리)
│   ├── rules/
│   │   └── page.tsx                 # 신규 ⭐ (규칙 관리)
│   ├── firewalls/
│   │   └── page.tsx                 # 신규 ⭐ (방화벽 관리)
│   └── analysis/
│       └── page.tsx                 # 신규 ⭐ (경로 분석)
├── components/
│   ├── topology/
│   │   ├── TopologyMap.tsx          # 신규 ⭐⭐⭐ (Cytoscape 시각화)
│   │   ├── FilterPanel.tsx          # 신규 ⭐ (필터 컨트롤)
│   │   ├── DetailPanel.tsx          # 신규 ⭐ (상세 정보)
│   │   └── LayoutSelector.tsx       # 신규 (레이아웃 전환)
│   ├── segments/
│   │   ├── SegmentList.tsx          # 신규 ⭐ (테이블)
│   │   └── SegmentForm.tsx          # 신규 ⭐ (생성/수정 폼)
│   ├── rules/
│   │   ├── RuleList.tsx             # 신규 ⭐ (테이블)
│   │   └── RuleForm.tsx             # 신규 ⭐ (생성/수정 폼)
│   ├── firewalls/
│   │   ├── FirewallList.tsx         # 신규 (테이블)
│   │   └── FirewallForm.tsx         # 신규 (생성/수정 폼)
│   └── analysis/
│       └── PathAnalysisTool.tsx     # 신규 ⭐ (경로 분석)
├── lib/
│   ├── api.ts                       # API 클라이언트 (fetch 래퍼)
│   └── queryClient.ts               # React Query 설정
└── types/
    └── topology.ts                  # 신규 ⭐ (타입 정의)
```

---

## 11. 의존성

### 11.1 Backend 추가 패키지
```bash
# IP 주소 처리 (Python 표준 라이브러리, 설치 불필요)
# import ipaddress
```

### 11.2 Frontend 추가 패키지
```bash
npm install cytoscape @types/cytoscape
npm install cytoscape-dagre          # 계층형 레이아웃
npm install cytoscape-cose-bilkent   # 향상된 힘 기반 레이아웃
npm install @tanstack/react-query    # 데이터 페칭
npm install react-hook-form zod @hookform/resolvers  # 폼 처리
npm install lucide-react             # 아이콘
```

---

## 12. 구현 작업 분배

### 12.1 Backend (be-agent)
**담당 파일**:
- `backend/app/models/` - SQLAlchemy ORM 모델
- `backend/app/schemas/` - Pydantic 요청/응답 스키마
- `backend/app/routers/` - API 엔드포인트
- `backend/app/services/` - 비즈니스 로직 (그래프 생성, 경로 분석)
- `backend/app/main.py` - 라우터 등록

**Skills**: BE-CRUD (CRUD API), BE-refactor (서비스 로직), BE-TEST (API 테스트)

### 12.2 Frontend (fe-agent)
**담당 파일**:
- `frontend/src/app/` - Next.js 페이지 (dashboard, segments, rules, firewalls, analysis)
- `frontend/src/components/` - React 컴포넌트 (TopologyMap, FilterPanel, DetailPanel, List, Form)
- `frontend/src/types/topology.ts` - TypeScript 타입
- `frontend/src/lib/api.ts` - API 클라이언트
- `frontend/package.json` - 의존성 추가

**Skills**: FE-CRUD (CRUD 화면), FE-page (대시보드 페이지), FE-api (API 연동), FE-design (UI/UX)

### 12.3 권장 작업 순서
```
1. Backend (be-agent)
   - Phase 1: 데이터 모델 + CRUD API + 토폴로지 그래프 API

2. Frontend (fe-agent)
   - Phase 1: 페이지 구조 + Cytoscape 통합 + CRUD 화면

3. Backend (be-agent)
   - Phase 2: 경로 분석 API + 영향 분석 API

4. Frontend (fe-agent)
   - Phase 2: 경로 분석 도구 + 고급 필터

5. Backend + Frontend
   - Phase 3: 성능 최적화 + CSV 가져오기
```

---

## 13. 검증 방법 (Verification)

### 13.1 Phase 1 완료 검증

#### Backend 검증
1. **서버 실행**:
   ```bash
   cd backend
   .venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. **Swagger UI 접속**: http://localhost:8000/docs

3. **API 테스트**:
   - `POST /api/network-segments` - 세그먼트 생성
   - `POST /api/firewalls` - 방화벽 생성
   - `POST /api/firewall-rules` - 규칙 생성
   - `GET /api/topology/graph` - 노드/엣지 반환 확인

#### Frontend 검증
1. **서버 실행**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **페이지 접속**:
   - http://localhost:3000/dashboard - 토폴로지 맵 표시
   - http://localhost:3000/segments - 세그먼트 목록
   - http://localhost:3000/rules - 규칙 목록

3. **시각화 검증**:
   - ✅ 토폴로지 맵에 네트워크 세그먼트가 노드로 표시
   - ✅ 방화벽 규칙이 엣지(화살표)로 연결
   - ✅ 노드 클릭 시 상세 정보 패널 표시
   - ✅ 드래그, 줌 인터랙션 동작

4. **CRUD 검증**:
   - ✅ 세그먼트 생성 폼 동작
   - ✅ 규칙 생성 폼 동작
   - ✅ 생성된 데이터가 토폴로지 맵에 반영

### 13.2 Phase 2 완료 검증
1. **경로 분석**:
   - `/analysis` 페이지에서 출발지/목적지 선택
   - 경로 분석 실행 → 도달 가능 여부 + 경로 표시

2. **규칙 영향 분석**:
   - 규칙 목록에서 "영향 분석" 버튼 클릭
   - 삭제 시 끊길 연결 표시

3. **필터링**:
   - Zone Type, Protocol, Action 필터 적용
   - 토폴로지 맵 동적 업데이트

### 13.3 Phase 3 완료 검증
1. **성능**:
   - 500+ 노드 데이터 로드
   - 부드러운 줌/패닝 확인

2. **CSV 가져오기**:
   - CSV 파일 업로드
   - 일괄 생성 확인

---

## 14. 참고 자료

### 14.1 기술 문서
- **Cytoscape.js 공식 문서**: https://js.cytoscape.org/
- **Cytoscape.js 데모**: https://js.cytoscape.org/#demos
- **FastAPI 공식 문서**: https://fastapi.tiangolo.com/
- **SQLAlchemy ORM**: https://docs.sqlalchemy.org/
- **React Query**: https://tanstack.com/query/latest

### 14.2 유사 솔루션
- **Tufin**: 엔터프라이즈 방화벽 정책 관리
- **AlgoSec**: 네트워크 보안 정책 시각화
- **Network Perception**: 네트워크 토폴로지 매핑
- **Lucidchart**: 네트워크 다이어그램 도구

### 14.3 기존 프로젝트 참고
- **Backend 패턴**: `backend/app/routers/examples.py` - CRUD API 구조
- **Frontend 패턴**: `frontend/src/app/page.tsx` - React Hook 기반 API 호출
- **프록시 설정**: `frontend/next.config.js` - API 프록시 참고

---

## 15. 예상 소요 시간

| Phase | Backend (be-agent) | Frontend (fe-agent) | 합계 |
|-------|-------------------|---------------------|------|
| Phase 1 (MVP) | 1주 | 1주 | 2주 |
| Phase 2 (고급 기능) | 1주 | 1주 | 2주 |
| Phase 3 (최적화) | 0.5주 | 0.5주 | 1주 |
| **총계** | **2.5주** | **2.5주** | **5주** |

---

## 16. Critical Files (구현 시 핵심 파일)

### 16.1 Backend 핵심
- `backend/app/models/firewall_rule.py` - 방화벽 규칙 모델 (가장 중요)
- `backend/app/routers/topology.py` - 토폴로지 그래프 API ⭐⭐⭐
- `backend/app/services/topology_service.py` - 그래프 생성 로직
- `backend/app/schemas/topology.py` - 그래프 응답 스키마

### 16.2 Frontend 핵심
- `frontend/src/components/topology/TopologyMap.tsx` - Cytoscape.js 시각화 ⭐⭐⭐
- `frontend/src/app/dashboard/page.tsx` - 메인 대시보드
- `frontend/src/types/topology.ts` - TypeScript 타입 정의
- `frontend/package.json` - Cytoscape.js 의존성

---

## 17. Next Steps (구현 시작 가이드)

### 17.1 Phase 1 시작하기

**Step 1: Backend 데이터 모델 생성 (be-agent)**
```bash
# 작업 순서:
1. backend/app/models/network_segment.py 생성
2. backend/app/models/firewall.py 생성
3. backend/app/models/firewall_rule.py 생성
4. backend/app/database.py에서 모델 import
5. 서버 재시작 → DB 테이블 자동 생성
```

**Step 2: Backend CRUD API 생성 (be-agent)**
```bash
# 작업 순서:
1. backend/app/schemas/ 스키마 생성
2. backend/app/routers/ 라우터 생성
3. backend/app/main.py에 라우터 등록
4. Swagger UI에서 테스트
```

**Step 3: Backend 토폴로지 API 생성 (be-agent)**
```bash
# 작업 순서:
1. backend/app/services/topology_service.py 생성
   - build_topology_graph() 함수
2. backend/app/routers/topology.py 생성
   - GET /api/topology/graph 엔드포인트
3. Swagger UI에서 테스트
```

**Step 4: Frontend 페이지 구조 생성 (fe-agent)**
```bash
# 작업 순서:
1. npm install cytoscape @types/cytoscape cytoscape-dagre
2. frontend/src/types/topology.ts 생성
3. frontend/src/app/dashboard/page.tsx 생성
4. http://localhost:3000/dashboard 접속 확인
```

**Step 5: Frontend Cytoscape 통합 (fe-agent)**
```bash
# 작업 순서:
1. frontend/src/components/topology/TopologyMap.tsx 생성
2. dashboard/page.tsx에서 TopologyMap 사용
3. /api/topology/graph 호출 → 데이터 시각화
```

### 17.2 개발 환경 준비
```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
npm install cytoscape @types/cytoscape cytoscape-dagre
```

---

## 18. 문서 버전 관리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2026-02-05 | 초안 작성 | Claude |

---

**이 문서는 개발 과정에서 지속적으로 업데이트됩니다.**
