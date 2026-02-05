# Skills 검토 보고서

날짜: 2026-02-05

## 1. 현재 Skills 목록

### 백엔드 스킬 (be-agent)

- **BE-CRUD**: CRUD API 생성
- **BE-DEBUG**: 에러 분석 및 해결
- **BE-refactor**: 코드 리팩토링
- **BE-TEST**: 테스트 작성

### 프론트엔드 스킬 (fe-agent)

- **FE-CRUD**: CRUD 화면 작성
- **FE-api**: API 호출 코드
- **FE-page**: 페이지/컴포넌트 생성
- **FE-design**: 고품질 디자인 인터페이스

### 기타

- **git_commit**: Git 커밋 워크플로우

---

## 2. 스킬 검토 결과

### ✅ 잘 작성된 부분

- **명확한 역할 분리**
  - BE/FE가 깔끔하게 분리되어 있음
  - 각 스킬의 목적이 명확함

- **에이전트 연동**
  - 모든 스킬에 `context: fork`와 `agent` 지정이 잘 되어 있음
  - be-agent, fe-agent와의 연동이 명확함

- **참조 문서**
  - 각 스킬별로 references 폴더에 상세 가이드 보유
  - 실제 사용 시 참고할 수 있는 템플릿과 예제 제공

- **실용적 구성**
  - 실제 개발에 필요한 핵심 작업들을 잘 커버함
  - CRUD, 디버깅, 테스트, 리팩토링 등 개발 라이프사이클 전반을 지원

### ⚠️ 개선이 필요한 부분

#### 1. FE-design 중복 이슈

- **문제점**:
  - 폴더명: `FE-design`
  - SKILL.md 내부 name: `frontend-design`
  - 시스템에 `FE-design`과 `frontend-design` 둘 다 표시됨

- **권장 조치**:
  - 스킬명을 `FE-design`으로 통일
  - SKILL.md 파일의 `name` 필드를 `FE-design`으로 수정

#### 2. git_commit 스킬 이름 불일치

- **문제점**:
  - SKILL.md 내부: `name: git-commit-workflow`
  - 폴더명/시스템: `git_commit`

- **권장 조치**:
  - `git_commit`으로 통일
  - SKILL.md 파일의 `name` 필드를 `git_commit`으로 수정

#### 3. 설명(description) 일관성

- **문제점**:
  - 대부분의 BE/FE 스킬은 한글 설명
  - `frontend-design`만 영문 설명 사용

- **권장 조치**:
  - 전체 한글 또는 영문으로 통일
  - 현재 BE/FE가 모두 한글이므로 FE-design도 한글로 통일 권장

---

## 3. 추가 추천 스킬

### 우선순위 높음 🔴

#### BE-middleware
- **목적**: CORS, 인증, 로깅 등 미들웨어 설정
- **필요 이유**: 프로덕션 배포 시 필수적인 기능
- **담당 에이전트**: be-agent
- **예상 사용 케이스**:
  - 인증 미들웨어 추가
  - 로깅 설정
  - 요청/응답 전처리

#### FE-form
- **목적**: 복잡한 폼 검증, 다단계 폼 처리
- **필요 이유**: FE-CRUD와 분리하여 폼 전문 처리
- **담당 에이전트**: fe-agent
- **예상 사용 케이스**:
  - 복잡한 폼 검증 로직
  - 다단계 폼 (마법사 스타일)
  - 동적 폼 필드 추가/삭제

#### BE-validation
- **목적**: Pydantic 스키마 복잡한 검증 로직
- **필요 이유**: 비즈니스 로직 검증이 복잡해질 때 필요
- **담당 에이전트**: be-agent
- **예상 사용 케이스**:
  - 커스텀 검증 규칙
  - 교차 필드 검증
  - 조건부 검증

### 우선순위 중간 🟡

#### DB-migration
- **목적**: Alembic을 이용한 DB 마이그레이션
- **필요 이유**: 현재는 Alembic 사용 금지지만, 프로덕션에서는 필수
- **담당 에이전트**: be-agent
- **예상 사용 케이스**:
  - 스키마 변경 관리
  - 마이그레이션 히스토리 추적
  - 롤백 기능

#### FE-state
- **목적**: 전역 상태관리 (Context API, Zustand 등)
- **필요 이유**: 앱이 복잡해지면 필요
- **담당 에이전트**: fe-agent
- **예상 사용 케이스**:
  - 전역 사용자 정보 관리
  - 테마/언어 설정
  - 여러 컴포넌트 간 상태 공유

#### API-integration
- **목적**: 외부 API 통합 (결제, 메일, SMS 등)
- **필요 이유**: 실제 서비스에서 자주 필요한 기능
- **담당 에이전트**: be-agent
- **예상 사용 케이스**:
  - 결제 시스템 연동
  - 이메일 발송
  - SMS 전송
  - 소셜 로그인

### 우선순위 낮음 🟢 (선택적)

#### E2E-test
- **목적**: Playwright/Cypress 엔드투엔드 테스트
- **필요 이유**: 품질 보증, 사용자 시나리오 테스트
- **담당**: 별도 에이전트 또는 통합

#### BE-deploy
- **목적**: Docker, 환경변수, 배포 설정
- **필요 이유**: 프로덕션 배포 자동화
- **담당 에이전트**: be-agent

#### FE-performance
- **목적**: 이미지 최적화, lazy loading, 코드 스플리팅
- **필요 이유**: 성능 최적화
- **담당 에이전트**: fe-agent

#### docs-api
- **목적**: OpenAPI/Swagger 문서 자동화
- **필요 이유**: API 문서화 자동화 및 최신화
- **담당 에이전트**: be-agent

---

## 4. 권장 조치 사항

### 즉시 수정 (Priority 1)

- [ ] FE-design 스킬 이름을 `FE-design`으로 통일
- [ ] git_commit 스킬 이름을 `git_commit`으로 통일
- [ ] 모든 스킬의 description을 한글로 통일

### 단기 추가 (Priority 2)

- [ ] BE-middleware 스킬 추가
- [ ] FE-form 스킬 추가
- [ ] BE-validation 스킬 추가

### 중기 추가 (Priority 3)

- [ ] DB-migration 스킬 추가 (프로젝트 성장 시)
- [ ] FE-state 스킬 추가 (상태관리 복잡도 증가 시)
- [ ] API-integration 스킬 추가 (외부 서비스 연동 시)

### 장기 검토 (Priority 4)

- [ ] E2E-test 스킬 검토
- [ ] BE-deploy 스킬 검토
- [ ] FE-performance 스킬 검토
- [ ] docs-api 스킬 검토

---

## 5. 스킬 구조 개선 제안

### 현재 구조
```
.claude/skills/
├── BE-CRUD/
├── BE-DEBUG/
├── BE-refactor/
├── BE-TEST/
├── FE-CRUD/
├── FE-api/
├── FE-page/
├── FE-design/
├── git_commit/
└── common/          # 현재 비어있음
```

### 개선 제안

#### common 폴더 활용
- **공통 참조 문서**: 양쪽에서 사용하는 문서
  - API 명세 스키마
  - 공통 타입 정의
  - 네이밍 컨벤션

#### 카테고리별 그룹화 (선택사항)
```
.claude/skills/
├── backend/
│   ├── BE-CRUD/
│   ├── BE-DEBUG/
│   ├── BE-refactor/
│   └── BE-TEST/
├── frontend/
│   ├── FE-CRUD/
│   ├── FE-api/
│   ├── FE-page/
│   └── FE-design/
└── workflow/
    └── git_commit/
```

**장점**: 스킬이 많아질 때 관리 용이
**단점**: 현재 구조 변경 필요
**결론**: 스킬이 15개 이상 되면 고려

---

## 6. 결론

### 현재 상태 평가: **양호 (Good)** ⭐⭐⭐⭐☆

- 핵심 기능을 잘 커버하는 스킬 구성
- 명확한 역할 분리와 에이전트 연동
- 일부 네이밍 통일 및 추가 스킬 필요

### 다음 스텝

1. **이름 통일 작업** (소요 시간: 5분)
2. **BE-middleware, FE-form 추가** (소요 시간: 1-2시간)
3. **프로젝트 성장에 따라 점진적 확장**

---

*이 문서는 2026-02-05에 작성되었으며, 프로젝트 상황에 따라 주기적으로 업데이트가 필요합니다.*
