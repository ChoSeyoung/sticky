# Phase 23: 접근성 검사 - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

이메일 템플릿의 접근성 문제를 자동으로 검사하여 WCAG 기준을 충족하도록 안내한다. img alt 누락, 색상 대비 미달, 시맨틱 구조 문제를 탐지하고 WarningPanel에 통합 표시한다.

</domain>

<decisions>
## Implementation Decisions

### 검사 규칙
- **D-01:** 다음 3가지 접근성 문제를 탐지한다:
  1. img 태그의 alt 텍스트 누락 (alt="" 빈 문자열은 장식 이미지로 허용)
  2. 텍스트/배경 색상 대비가 WCAG AA 기준(일반 텍스트 4.5:1, 큰 텍스트 3:1) 미달
  3. 시맨틱 구조 문제 — 헤딩 레벨 건너뛰기 (h1→h3 등)

### WarningPanel 통합
- **D-02:** 기존 WarningPanel에 ♿ 접근성 섹션을 추가한다. Phase 22에서 확립된 🔗 링크 섹션 패턴과 동일하게 구현한다.
- **D-03:** CSS(🎨) / 링크(🔗) / 접근성(♿) 3개 섹션이 하나의 패널에 통합 표시된다.

### 점수/요약
- **D-04:** 패널 헤더에 전체 이슈 수(CSS + 링크 + 접근성 합산)를 표시한다.
- **D-05:** 접근성 섹션 내부에 "통과 X / 경고 Y" 형태의 간단한 요약을 표시한다.

### Claude's Discretion
- 색상 대비 계산 알고리즘 구현 (WCAG 상대 휘도 공식)
- inline style vs CSS class의 색상 추출 방식
- 각 접근성 경고의 한국어 레이블
- 접근성 점수 계산 방식 (단순 통과/실패 비율 또는 가중치 적용)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ROADMAP Success Criteria
- `.planning/ROADMAP.md` §Phase 23 — 4가지 성공 기준

### Requirements
- `.planning/REQUIREMENTS.md` §QA-02 — 접근성 검사 요구사항

### Prior Phase Pattern
- `.planning/phases/22-link-validation/22-CONTEXT.md` — WarningPanel 확장 패턴 (동일 패턴 재사용)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/WarningPanel.tsx`: Phase 22에서 확장된 CSS + 링크 통합 패널 — 접근성 섹션 추가 대상
- `lib/engine/analyzeLinkProblems.ts`: 링크 검증 순수 함수 — 동일 패턴으로 접근성 검사 함수 구현
- `cheerio`: HTML 파싱 (img alt, heading 구조 분석)

### Established Patterns
- `analyzeLinkProblems(html)` 순수 함수 → `analyzeAccessibility(html)` 동일 패턴
- WarningPanel 내부 `useMemo`로 분석 실행, 아이콘으로 섹션 구분
- 줄 번호 계산: `html.indexOf()` + `split('\n').length` 패턴

### Integration Points
- `app/components/WarningPanel.tsx`: 접근성 분석 결과 표시 섹션 추가
- `lib/engine/`: `analyzeAccessibility.ts` 신규 파일

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard WCAG AA accessibility analysis approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-accessibility-check*
*Context gathered: 2026-04-26*
