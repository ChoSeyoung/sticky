# Phase 11: 레이아웃 개선 - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

에디터가 뷰포트 높이를 꽉 채우고, 프리뷰 패널들이 수직이 아닌 수평으로 배치. 에디터는 왼쪽 고정, 프리뷰 영역만 수평 스크롤. 현재: `w-1/2` + vertical stack → 변경: 에디터 고정폭 + `overflow-x-auto` 수평 프리뷰.

</domain>

<decisions>
## Implementation Decisions

### 레이아웃 구조
- **D-01:** 에디터는 왼쪽에 고정 너비 (예: 40-50% 또는 고정 px). 프리뷰 영역은 나머지 공간에서 수평 스크롤.
- **D-02:** 프리뷰 패널들은 `flex-row` + `overflow-x-auto`로 수평 배치. 각 패널은 `min-w-[400px]` 정도의 최소 너비.
- **D-03:** 에디터는 뷰포트 높이 100% (header 제외) — 현재 구조는 이미 `h-full` + `min-h-0`으로 되어 있으므로 유지.

### Claude's Discretion
- 에디터 고정 너비 값
- 프리뷰 패널 최소 너비 값
- 스크롤바 스타일링

</decisions>

<code_context>
## Existing Code Insights

### 수정 대상
- `app/page.tsx` — main 레이아웃의 `w-1/2` + `flex-col` → 에디터 고정 + 프리뷰 `flex-row overflow-x-auto`
- `app/components/PreviewPane.tsx` — `flex-1 min-h-0` → `min-w-[400px] h-full flex-shrink-0`

</code_context>

<specifics>
## Specific Ideas

사용자 요구: 에디터는 고정, 프리뷰 영역만 수평 스크롤.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
