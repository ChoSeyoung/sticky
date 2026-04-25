# Phase 21: 다크모드 프리뷰 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

이메일 클라이언트의 다크모드에서 템플릿이 어떻게 보이는지 시뮬레이션으로 확인할 수 있다. 각 프리뷰 패널에 다크모드 토글을 추가하고, prefers-color-scheme: dark 미디어쿼리를 적용하며, 다크모드 미대응 템플릿에는 클라이언트별 자동 색상 반전 로직을 시뮬레이션한다.

</domain>

<decisions>
## Implementation Decisions

### 다크모드 시뮬레이션 방식
- **D-01:** iframe srcdoc에 CSS를 주입하여 `prefers-color-scheme: dark` 미디어쿼리를 강제 적용하는 방식으로 시뮬레이션한다. 실제 브라우저의 prefers-color-scheme 설정을 변경하는 것이 아니라, CSS 래핑으로 다크모드 미디어쿼리 규칙을 활성화한다.

### 자동 색상 반전 로직
- **D-02:** 다크모드 미대응 템플릿(prefers-color-scheme: dark 미디어쿼리가 없는 경우)에 대해 클라이언트별 자동 색상 반전 로직을 적용한다. Gmail, Outlook 등의 실제 다크모드 동작을 시뮬레이션하여 배경색 반전 + 텍스트 색상 반전을 수행한다.

### 토글 UI
- **D-03:** 각 프리뷰 패널의 기존 뷰포트 토글(Desktop/Mobile) 옆에 라이트/다크 모드 토글 버튼을 추가한다. 토글 상태는 패널별로 독립적이다 (한 패널만 다크모드로 전환 가능).

### 클라이언트별 다크모드 차이
- **D-04:** 각 클라이언트(Naver, Gmail, Outlook Classic, Outlook New, Daum/Kakao)의 다크모드 동작이 서로 다를 수 있다. 정확한 클라이언트별 동작은 researcher가 조사하여 결정한다.

### Claude's Discretion
- 클라이언트별 자동 색상 반전의 세부 알고리즘 (어떤 색상을 어떻게 반전할지)
- prefers-color-scheme CSS 주입의 정확한 구현 방법
- 다크모드 토글 아이콘/텍스트 디자인
- 다크모드 토글 상태의 localStorage 저장 여부

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and ROADMAP.md success criteria.

### ROADMAP Success Criteria
- `.planning/ROADMAP.md` §Phase 21 — 4가지 성공 기준 (다크모드 토글, prefers-color-scheme 적용, 자동 색상 반전, 즉시 갱신)

### Requirements
- `.planning/REQUIREMENTS.md` §SIM-04 — 클라이언트별 다크모드 시뮬레이션 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/PreviewPane.tsx`: 기존 뷰포트 토글(Desktop/Mobile) 구현 — 다크모드 토글도 동일한 패턴으로 추가 가능
- `lib/engine/applyClientRules.ts`: 기존 클라이언트별 CSS 변환 엔진 — 다크모드 변환을 위한 확장 포인트
- 각 클라이언트 ruleset 파일: `lib/rulesets/naver.ts`, `gmail.ts`, `daum.ts`, `outlook-classic.ts`, `outlook-new.ts`

### Established Patterns
- `applyClientRules(html, ruleset)` 순수 함수 패턴 — 다크모드 변환도 동일하게 순수 함수로 구현
- iframe `srcdoc`에 변환된 HTML 주입하는 패턴 — 다크모드 CSS도 동일하게 주입
- PreviewPane 컴포넌트에 프롭으로 클라이언트 설정 전달

### Integration Points
- `app/components/PreviewPane.tsx`: 다크모드 토글 UI + 다크모드 상태를 CSS 변환에 전달
- `app/page.tsx`: PreviewPane에 다크모드 프롭 전달 (또는 PreviewPane 내부에서 관리)
- `lib/engine/`: 다크모드 CSS 변환 함수 추가

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for dark mode simulation in email previews.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-dark-mode-preview*
*Context gathered: 2026-04-25*
