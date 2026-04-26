---
phase: 22-link-validation
plan: "01"
subsystem: engine
tags: [tdd, link-validation, analysis, cheerio]
dependency_graph:
  requires: []
  provides: [analyzeLinkProblems, LinkWarning]
  affects: []
tech_stack:
  added: []
  patterns: [cheerio-load, pure-function-analysis, tdd-red-green]
key_files:
  created:
    - lib/engine/analyzeLinkProblems.ts
    - lib/engine/analyzeLinkProblems.test.ts
  modified: []
decisions:
  - "Anchor-only tags (<a name=...> without href) excluded from empty-href detection"
  - "isMissingProtocol helper uses regex to detect www. prefix and bare domain patterns"
  - "Line number uses html.indexOf(hrefNeedle) + split newlines, falls back to 0"
metrics:
  duration: "~2 minutes"
  completed: "2026-04-26"
  tasks_completed: 1
  tasks_total: 1
requirements:
  - QA-01
---

# Phase 22 Plan 01: analyzeLinkProblems TDD Summary

One-liner: Pure function `analyzeLinkProblems(html) => LinkWarning[]` detects 4 link problem types using cheerio, with full TDD coverage (14 tests, RED → GREEN cycle).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | TDD analyzeLinkProblems — failing tests | 72c5a11 | lib/engine/analyzeLinkProblems.test.ts, lib/engine/analyzeLinkProblems.ts (stub) |
| 1 (GREEN) | TDD analyzeLinkProblems — implementation | a11b7be | lib/engine/analyzeLinkProblems.ts |

## What Was Built

`lib/engine/analyzeLinkProblems.ts` exports:

- `LinkWarning` interface with fields: `href`, `text`, `lineNumber`, `problem`, `severity`, `message`
- `analyzeLinkProblems(html: string): LinkWarning[]` — pure function using cheerio to traverse `<a>` elements

### 4 Problem Types Detected

| Problem | Condition | Severity |
|---------|-----------|----------|
| `empty-href` | `href=""` or no href attribute (excluding anchor-only `<a name=...>`) | error |
| `hash-placeholder` | `href="#"` | warning |
| `example-domain` | href matches `/example\.com/i` | warning |
| `missing-protocol` | href starts with `www.` or bare domain pattern, no known scheme | error |

### False Positives Excluded

- `mailto:` — not flagged as missing-protocol
- `tel:` — not flagged as missing-protocol
- `/relative/path` — not flagged as missing-protocol
- `<a name="anchor">` — not flagged as empty-href
- `https://` / `http://` — not flagged

### Korean Messages

Consistent with existing WarningPanel pattern:
- `href가 비어 있습니다`
- `# placeholder 링크입니다`
- `example.com 테스트 도메인이 포함되어 있습니다`
- `프로토콜이 없습니다 (https:// 추가 필요)`

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED | 72c5a11 | 14 tests failing, 109 existing passing |
| GREEN | a11b7be | 123/123 tests passing |
| REFACTOR | — | No changes needed (code already clean) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — threat model reviewed. `analyzeLinkProblems` reads href values as strings only (no eval/execution). cheerio parses HTML as data. Both T-22-01 and T-22-02 dispositions are `accept` per plan threat model.

## Self-Check

- `lib/engine/analyzeLinkProblems.ts` — exists, exports `LinkWarning` and `analyzeLinkProblems`
- `lib/engine/analyzeLinkProblems.test.ts` — exists, 173 lines (> 40 min_lines requirement)
- RED commit `72c5a11` — exists
- GREEN commit `a11b7be` — exists
- All 123 tests pass, 0 failures, no regressions

## Self-Check: PASSED
