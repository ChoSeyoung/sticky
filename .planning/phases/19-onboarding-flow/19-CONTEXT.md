# Phase 19: 온보딩 플로우 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

처음 방문한 사용자가 Sticky의 목적을 이해하고 자기 템플릿으로 검수를 시작하기까지 자연스럽게 안내한다. 샘플 템플릿의 역할과 각 클라이언트별 프리뷰 차이를 설명하며, 온보딩을 건너뛰거나 다시 볼 수 있고 완료 여부가 저장되어 재방문 시 다시 표시되지 않는다.

</domain>

<decisions>
## Implementation Decisions

### 온보딩 형태
- **D-01:** 오버레이 스텝 가이드 (tooltip/popover) 방식으로 구현한다. 실제 UI 요소를 가리키며 설명하는 방식으로, 에디터 → 프리뷰 패널 → 클라이언트 선택 등 실제 인터페이스 위에 하이라이트+설명 팝오버를 순차적으로 보여준다.

### 안내 콘텐츠
- **D-02:** 핵심 3단계로 구성한다:
  1. 도구의 목적 소개 ("HTML 이메일을 한국 주요 이메일 클라이언트에서 어떻게 보이는지 미리 확인하는 도구")
  2. 샘플 템플릿 역할 설명 ("기본으로 로드된 예시 HTML로 각 클라이언트의 차이를 바로 확인")
  3. 클라이언트별 프리뷰 차이 안내 ("네이버는 style 블록 제거, Gmail은 조건부 제거 등 각 클라이언트의 CSS 제한사항이 다르게 적용됨")

### 건너뛰기 및 재진입
- **D-03:** 온보딩 진행 중 "건너뛰기" 버튼을 항상 표시한다. 온보딩 완료/건너뛰기 후 헤더 영역에 "가이드" 또는 "?" 버튼을 추가하여 언제든 다시 볼 수 있게 한다.

### 완료 상태 저장
- **D-04:** localStorage에 온보딩 완료 여부를 저장한다. 키는 기존 enabledClients 패턴과 일관되게 `sticky:onboardingCompleted` 형태로 사용한다. 서버가 필요 없고 기존 코드와 일관성을 유지한다.

### Claude's Discretion
- 정확한 tooltip/popover 라이브러리 선택 또는 자체 구현 여부
- 각 스텝의 정확한 위치 지정 (어떤 요소를 하이라이트할지 세부 사항)
- 온보딩 애니메이션 및 트랜지션 효과
- 재진입 버튼의 정확한 아이콘 및 위치 (헤더 우측 등)
- 온보딩 언어 (한국어/영어 또는 혼용)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above and ROADMAP.md success criteria.

### ROADMAP Success Criteria
- `.planning/ROADMAP.md` §Phase 19 — 4가지 성공 기준 (온보딩 가이드 표시, 샘플 역할 안내, 건너뛰기/재진입, 완료 상태 저장)

### Requirements
- `.planning/REQUIREMENTS.md` §UX-03 — 첫 방문 사용자 온보딩 가이드 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/page.tsx` DEFAULT_HTML 상수: 이미 샘플 템플릿이 기본 로드됨 — 온보딩에서 이 샘플을 활용하여 설명 가능
- `app/page.tsx` useEnabledClients hook: localStorage 패턴 (`sticky:` prefix) 이미 확립됨 — 온보딩 상태 저장에 동일 패턴 사용

### Established Patterns
- 모든 컴포넌트 dynamic import + ssr: false 패턴 — 온보딩 컴포넌트도 동일하게 처리
- 'use client' 컴포넌트에서 useState/useCallback으로 상태 관리
- Tailwind CSS로 스타일링, zinc/blue 컬러 팔레트 사용

### Integration Points
- `app/page.tsx` Home 컴포넌트: 온보딩 컴포넌트를 Home 내부 또는 오버레이로 마운트
- header 영역 (h-12, bg-zinc-900): 재진입 "가이드" 버튼 배치 위치
- `app/page.tsx` return JSX의 최상위 div: 오버레이 포지셔닝 기준점

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for step-by-step onboarding overlay.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-onboarding-flow*
*Context gathered: 2026-04-25*
