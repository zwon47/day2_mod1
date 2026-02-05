---
name: FE-design
description: 고품질 디자인의 독창적인 프론트엔드 인터페이스를 제작합니다. 웹 컴포넌트, 페이지, 아티팩트, 포스터, 애플리케이션을 만들 때 사용하세요 (예시: 웹사이트, 랜딩 페이지, 대시보드, React 컴포넌트, HTML/CSS 레이아웃, 웹 UI 스타일링 및 디자인). 일반적인 AI 디자인 스타일을 피하고 창의적이고 세련된 코드와 UI 디자인을 생성합니다.
license: Complete terms in LICENSE.txt
---

# Frontend Design Skill

이 스킬은 일반적인 "AI 슬롭(AI slop)" 스타일을 피하고, 독창적이고 프로덕션급 프론트엔드 인터페이스 제작을 안내합니다. 미학적 디테일과 창의적 선택에 세심한 주의를 기울여 실제 작동하는 코드를 구현합니다.

## 개요

사용자는 프론트엔드 요구사항을 제공합니다: 컴포넌트, 페이지, 애플리케이션 또는 인터페이스를 제작합니다. 목적, 타겟 사용자 또는 기술적 제약사항에 대한 컨텍스트를 포함할 수 있습니다.

## 디자인 사고 (Design Thinking)

코딩하기 전에, 컨텍스트를 이해하고 대담한 미학적 방향성을 설정하세요:

- **목적 (Purpose)**: 이 인터페이스가 해결하는 문제는 무엇인가? 누가 사용하는가?
- **톤앤매너 (Tone)**: 극단적인 미학적 방향을 선택하세요
  - 극도로 미니멀한 (Brutally minimal)
  - 맥시멀리즘 혼돈 (Maximalist chaos)
  - 레트로 퓨처리즘 (Retro-futuristic)
  - 유기적/자연스러운 (Organic/natural)
  - 럭셔리/세련된 (Luxury/refined)
  - 재미있는/장난감 같은 (Playful/toy-like)
  - 편집/잡지풍 (Editorial/magazine)
  - 브루탈리즘/날것 (Brutalist/raw)
  - 아르데코/기하학적 (Art deco/geometric)
- **제약사항 (Constraints)**: 기술 요구사항 (프레임워크, 성능, 접근성)
- **차별화 (Differentiation)**: 무엇이 이것을 잊을 수 없게 만드는가?

**중요**: 명확한 개념적 방향을 선택하고 정밀하게 실행하세요. 대담한 맥시멀리즘과 세련된 미니멀리즘 모두 효과적입니다 - 핵심은 의도성이지 강도가 아닙니다.

## 구현 가이드라인

다음과 같은 작동하는 코드를 구현하세요 (HTML/CSS/JS, React, Vue 등):

1. 프로덕션급이고 기능적이어야 함
2. 시각적으로 인상적이고 기억에 남아야 함
3. 명확한 미학적 관점으로 일관성 있어야 함
4. 모든 디테일이 세심하게 다듬어져야 함

## 프론트엔드 미학 가이드라인

### 타이포그래피 (Typography)

아름답고, 독특하며, 흥미로운 폰트를 선택하세요.

**피해야 할 것:**
- Arial, Inter, Roboto 같은 일반적인 폰트
- 시스템 기본 폰트

**선호해야 할 것:**
- 독특한 디스플레이 폰트
- 세련된 본문 폰트
- 예상치 못한, 개성 있는 선택
```css
/* 예시 */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'Source Sans Pro', sans-serif;
}
```

### 색상 & 테마 (Color & Theme)

CSS 변수를 사용하여 일관된 미학을 구현하세요:
```css
:root {
  --color-primary: #2D3748;
  --color-accent: #E53E3E;
  --color-bg: #F7FAFC;
  --color-text: #1A202C;
}
```

**핵심 원칙:**
- 날카로운 액센트가 있는 주요 색상
- 소극적이고 균등하게 분산된 팔레트 피하기
- 일관성을 위해 CSS 변수 사용

### 모션 & 애니메이션 (Motion & Animation)

효과와 마이크로 인터랙션을 위한 애니메이션 사용:

**CSS 전용 솔루션** (HTML용):
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero {
  animation: fadeInUp 0.6s ease-out;
}
```

**Motion 라이브러리를 사용한 React**:
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

**집중할 부분:**
- 강렬한 순간들
- 단계적 표시 효과 (animation-delay)
- 스크롤 트리거
- 놀라움을 주는 호버 상태

### 공간 구성 (Spatial Composition)

예상치 못한 레이아웃 만들기:

- 비대칭성
- 겹침 효과
- 대각선 흐름
- 그리드를 벗어나는 요소들
- 여유로운 네거티브 스페이스 또는 통제된 밀도

### 배경 & 시각적 디테일 (Backgrounds & Visual Details)

분위기와 깊이를 만드세요:
```css
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('data:image/svg+xml,...'); /* 노이즈 텍스처 */
  opacity: 0.05;
}
```

**고려할 효과들:**
- 그라디언트 메시
- 노이즈 텍스처
- 기하학적 패턴
- 레이어드 투명도
- 강렬한 그림자
- 장식적 테두리
- 커스텀 커서
- 그레인 오버레이

## 피해야 할 것

**절대로 일반적인 AI 생성 스타일을 사용하지 마세요:**

❌ 남용된 폰트 패밀리:
- Inter
- Roboto
- Arial
- 시스템 폰트

❌ 진부한 색상 조합:
- 흰색 배경에 보라색 그라디언트
- 일반적인 파랑/흰색 조합

❌ 예측 가능한 레이아웃:
- 모든 것을 중앙 정렬
- 획일적인 그리드 시스템
- 쿠키커터식 컴포넌트 패턴

## 모범 사례 (Best Practices)

1. **창의적으로 해석** - 컨텍스트에 맞는 예상치 못한 선택하기
2. **수렴 금지** - 모든 디자인은 고유해야 함
3. **테마 변화** - 라이트/다크 모드, 다양한 폰트, 다양한 미학 교대
4. **복잡도 매칭** - 맥시멀리즘은 정교한 코드 필요; 미니멀리즘은 정밀함 필요
5. **비전 실행** - 우아함은 잘 실행하는 것에서 나옴

## 예시

### 미니멀 디자인
```css
body {
  font-family: 'Helvetica Neue', sans-serif;
  background: #FFFFFF;
  color: #000000;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
```

### 맥시멀 디자인
```css
body {
  font-family: 'Fraunces', serif;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255,0,100,0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0,100,255,0.3) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #FFFFFF;
}

.hero {
  position: relative;
  padding: 8rem 2rem;
  border: 3px solid rgba(255,255,255,0.2);
  box-shadow: 
    0 0 60px rgba(255,0,100,0.4),
    inset 0 0 60px rgba(0,100,255,0.2);
}

h1 {
  font-size: 5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #ff0066, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s ease-in-out infinite;
}
```

## 결론

기억하세요: Claude는 놀라운 창의적 작업이 가능합니다. 주저하지 말고, 틀을 벗어나 생각하고 독창적인 비전에 완전히 몰입할 때 진정으로 무엇을 만들 수 있는지 보여주세요.