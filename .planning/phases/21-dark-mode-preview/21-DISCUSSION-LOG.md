# Phase 21: 다크모드 프리뷰 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 21-dark-mode-preview
**Areas discussed:** 다크모드 시뮬레이션 방식, 자동 색상 반전 로직, 토글 UI, 클라이언트별 차이
**Mode:** --auto (all decisions auto-selected with recommended defaults)

---

## 다크모드 시뮬레이션 방식

| Option | Description | Selected |
|--------|-------------|----------|
| CSS 래핑으로 미디어쿼리 강제 적용 | iframe srcdoc에 CSS 주입 | ✓ |
| iframe color-scheme 속성 변경 | 브라우저 네이티브 다크모드 | |
| JavaScript 기반 스타일 변환 | DOM 조작으로 색상 변경 | |

**User's choice:** [auto] CSS 래핑 (recommended — iframe 내부 미디어쿼리 시뮬레이션에 가장 적합)

---

## 자동 색상 반전 로직

| Option | Description | Selected |
|--------|-------------|----------|
| 클라이언트별 반전 | Gmail/Outlook 실제 동작 시뮬레이션 | ✓ |
| 단순 filter: invert(1) | CSS 필터로 전체 반전 | |
| 반전 없음 | 미대응 시 원본 그대로 | |

**User's choice:** [auto] 클라이언트별 반전 (recommended — 실제 동작에 근접)

---

## 토글 UI

| Option | Description | Selected |
|--------|-------------|----------|
| 뷰포트 토글 옆 라이트/다크 버튼 | 패널별 독립 토글 | ✓ |
| 전역 다크모드 토글 (헤더) | 모든 패널 동시 전환 | |
| 탭 방식 (라이트/다크 탭) | 패널 상단에 탭 | |

**User's choice:** [auto] 뷰포트 토글 옆 (recommended — SC에 명시, 패널별 독립)

---

## 클라이언트별 차이

| Option | Description | Selected |
|--------|-------------|----------|
| Claude's Discretion | researcher가 조사하여 결정 | ✓ |
| 모든 클라이언트 동일 반전 | 단순화 | |

**User's choice:** [auto] Claude's Discretion (recommended — 정확한 동작 차이는 리서치 필요)

---

## Deferred Ideas

None
