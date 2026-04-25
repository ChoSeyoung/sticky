# Phase 20: HTML 소스 복사 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

검수 완료된 HTML 소스코드를 클립보드에 복사하여 프로젝트에 바로 가져갈 수 있다. 헤더에 "소스 복사" 버튼을 추가하고, 복사 완료 시 시각적 피드백을 제공하며, 클립보드 API 미지원 브라우저에서도 fallback이 동작한다.

</domain>

<decisions>
## Implementation Decisions

### 버튼 위치 및 스타일
- **D-01:** 헤더의 기존 버튼 그룹에 "소스 복사" 버튼을 추가한다. "Inline CSS" 버튼 앞 또는 뒤에 배치하여 기존 흐름과 자연스럽게 연결한다.
- **D-02:** 버튼 스타일은 기존 헤더 버튼 패턴을 따른다: `bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-3 py-1 text-xs rounded`

### 복사 피드백
- **D-03:** 복사 완료 시 버튼 텍스트를 "소스 복사" → "복사됨!"으로 일시 변경하고, 2초 후 원래 텍스트로 복원한다. 별도 토스트 시스템은 추가하지 않는다.

### 클립보드 fallback
- **D-04:** `navigator.clipboard.writeText()` API를 우선 사용하고, 미지원 시 `document.execCommand('copy')` fallback을 사용한다.

### Claude's Discretion
- 복사 성공/실패 시 버튼 색상 변화 (성공: 녹색 계열 등)
- 정확한 버튼 배치 순서 (기존 버튼 사이 위치)
- fallback 구현 세부 사항 (textarea 생성 방식 등)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and ROADMAP.md success criteria.

### ROADMAP Success Criteria
- `.planning/ROADMAP.md` §Phase 20 — 3가지 성공 기준 (소스 복사 버튼, 시각적 피드백, 클립보드 fallback)

### Requirements
- `.planning/REQUIREMENTS.md` §UX-04 — HTML 소스 클립보드 복사 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/page.tsx` Home 컴포넌트: `html` state가 이미 존재하여 복사할 소스에 바로 접근 가능
- 기존 헤더 버튼들 (Inline CSS, 메일 발송, 파일 열기): 동일한 스타일 패턴 재사용

### Established Patterns
- `useCallback` 훅으로 이벤트 핸들러 정의
- `useState`로 일시적 UI 상태 관리 (예: `previousHtmlRef`로 Undo 상태)
- Tailwind CSS zinc/blue 컬러 팔레트

### Integration Points
- `app/page.tsx` header 영역의 `<div className="flex items-center gap-3">` 내부에 버튼 추가
- `html` state를 직접 참조하여 복사

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for clipboard copy with feedback.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-html-copy*
*Context gathered: 2026-04-25*
