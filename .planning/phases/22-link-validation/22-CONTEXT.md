# Phase 22: 링크 검증 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

템플릿 내 링크의 문제점을 자동으로 탐지하여 발송 전 실수를 방지한다. 빈 href, placeholder 링크, example.com 링크, 프로토콜 누락 링크를 경고로 표시하며 기존 CSS 호환성 경고 패널과 통합하여 표시한다.

</domain>

<decisions>
## Implementation Decisions

### 검증 규칙
- **D-01:** 다음 4가지 링크 문제를 탐지한다:
  1. 빈 href (`href=""` 또는 href 속성 없음)
  2. `#` placeholder 링크 (`href="#"`)
  3. `example.com` 포함 링크 (테스트 URL)
  4. 프로토콜 누락 링크 (`www.example.com` 등 http(s):// 없는 URL)

### WarningPanel 통합
- **D-02:** 기존 `WarningPanel` 컴포넌트를 확장하여 CSS 호환성 경고와 링크 검증 경고를 함께 표시한다. 별도 패널을 추가하지 않는다.
- **D-03:** 링크 경고와 CSS 경고를 구분할 수 있도록 카테고리 또는 아이콘으로 구분한다.

### 경고 표시 형식
- **D-04:** 각 링크 경고에 링크 텍스트(또는 href 값), 문제 유형, 줄 번호를 표시한다. CSS 경고와 동일한 형식을 따른다.
- **D-05:** HTML 수정 시 링크 검증 결과가 실시간으로 갱신된다 (기존 CSS 경고와 동일한 debounce 파이프라인 사용).

### Claude's Discretion
- 링크 검증 함수의 정확한 구현 (cheerio 사용 여부, regex 패턴)
- WarningPanel 내부 CSS/링크 경고 구분 UI (탭, 섹션, 아이콘 등)
- 경고 클릭 시 에디터 줄 이동 기능의 구현 방식

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above and ROADMAP.md success criteria.

### ROADMAP Success Criteria
- `.planning/ROADMAP.md` §Phase 22 — 4가지 성공 기준

### Requirements
- `.planning/REQUIREMENTS.md` §QA-01 — 링크 검증 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/WarningPanel.tsx`: 기존 CSS 호환성 경고 패널 — 확장 대상
- `lib/engine/`: 기존 시뮬레이션 엔진 패턴 — 링크 검증 함수도 순수 함수로 구현
- `cheerio`: 이미 설치됨 — HTML 파싱에 사용 가능

### Established Patterns
- WarningPanel은 `html`과 `clients` 프롭을 받아 CSS 호환성 분석 수행
- 경고 항목에 클라이언트명, 속성명, 줄 번호 표시
- 접거나 펼 수 있는 패널 UI

### Integration Points
- `app/page.tsx`: WarningPanel에 링크 검증 결과 전달 (또는 WarningPanel 내부에서 처리)
- `app/components/WarningPanel.tsx`: 링크 검증 경고 표시 영역 추가

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for link validation in email templates.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-link-validation*
*Context gathered: 2026-04-25*
