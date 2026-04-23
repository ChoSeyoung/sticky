# Phase 12: CSS 호환성 경고 패널 - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

사용자가 작성한 HTML에서 각 이메일 클라이언트별로 호환되지 않는 CSS 속성을 분석하고 경고 패널에 표시. HTML 수정 시 실시간 갱신. 경고 패널은 접기/펼치기 가능.

</domain>

<decisions>
## Implementation Decisions

### CSS 분석 엔진
- **D-01:** 각 ClientRuleset의 strippedProperties, stripHeadStyles, styleBlockBehavior 정보를 기반으로 HTML을 분석하여 비호환 속성을 탐지.
- **D-02:** cheerio로 HTML을 파싱하고, 각 요소의 inline style + `<style>` 블록을 검사하여 경고 목록 생성.
- **D-03:** 경고 데이터 구조: `{ client: string, property: string, element: string, line?: number, severity: 'error' | 'warning' }[]`

### UI 패널
- **D-04:** 에디터 하단 또는 프리뷰 영역 상단에 경고 패널 배치. 접기/펼치기 토글.
- **D-05:** 경고 수 배지를 헤더에 표시하여 현재 경고 개수를 한눈에 파악 가능.

### Claude's Discretion
- 분석 함수 설계 및 파일 위치
- 경고 패널 UI 디자인
- 디바운스 타이밍 (프리뷰와 동일한 300ms 활용 가능)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/rulesets/naver.ts`, `gmail.ts`, `daum.ts` — 각 클라이언트의 제한사항 데이터
- `lib/rulesets/types.ts` — ClientRuleset 인터페이스
- `app/components/useDebounce.ts` — 디바운스 훅
- cheerio — HTML 파싱 (이미 설치됨)

### Integration Points
- `app/page.tsx` — 경고 패널 추가 위치
- Phase 13 (Inline CSS 자동 변환)에서 경고 → 자동 수정 흐름 연결

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
