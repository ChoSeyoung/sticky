---
phase: 23-accessibility-check
plan: "01"
subsystem: lib/engine
tags: [accessibility, wcag, tdd, pure-function]
dependency_graph:
  requires: [cheerio]
  provides: [analyzeAccessibility, AccessibilityWarning, AccessibilitySummary]
  affects: []
tech_stack:
  added: []
  patterns: [tdd, pure-function, cheerio-html-parsing]
key_files:
  created:
    - lib/engine/analyzeAccessibility.ts
    - lib/engine/analyzeAccessibility.test.ts
  modified: []
decisions:
  - "Simplified to 4.5:1 threshold for all text (no large-text distinction per Research open Q1)"
  - "passCount = totalChecked - failCount where totalChecked = imgs + heading-pairs + color-pairs"
  - "parseColor silently returns null for named colors, hsl, rgba (no false positives)"
  - "First heading level never warned — only consecutive diff>1 triggers heading-skip"
metrics:
  duration: "98s"
  completed: "2026-04-26"
  tasks_completed: 2
  files_changed: 2
---

# Phase 23 Plan 01: analyzeAccessibility Pure Function Summary

Pure WCAG AA accessibility analysis engine (TDD) — missing-alt, low-contrast, and heading-skip detection using cheerio with WCAG 2.1 luminance formula.

## What Was Built

`lib/engine/analyzeAccessibility.ts` — pure function following the Phase 22 `analyzeLinkProblems` pattern. Takes an HTML string, returns `AccessibilitySummary { warnings, passCount, failCount }`.

Three checks implemented:
1. **missing-alt**: `img[alt=undefined]` → error (not `alt=""` which is decorative per D-01)
2. **low-contrast**: inline style `color`+`background-color` pairs failing WCAG AA 4.5:1 → warning
3. **heading-skip**: consecutive headings with level diff > 1 → warning (first heading level never warned)

## TDD Gate Compliance

- RED commit: `291622d` — `test(23-01): add failing tests for analyzeAccessibility` (25 tests, all failing — module not found)
- GREEN commit: `33d280a` — `feat(23-01): implement analyzeAccessibility pure function` (25 tests, all passing)
- REFACTOR: not required — implementation was clean

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 291622d | test | RED: 25 failing unit tests |
| 33d280a | feat | GREEN: implementation passing all 25 tests |

## Test Coverage

| Check | Cases Covered |
|-------|--------------|
| missing-alt | no-alt (error), alt="" (pass), alt="text" (pass), multiple imgs, lineNumber |
| low-contrast | black/white pass, #777/#888 fail, color-only skip, named-color skip, #RGB, rgb() |
| heading-skip | h1→h3 fail, h1→h2 pass, h2→h4 fail, h3→h2 pass, first-h2 pass, lineNumber |
| WCAG formula | 21:1 white/black, similar dark grays |
| Summary | passCount+failCount types, failCount=warnings.length, passCount calc, mixed scenario |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — read-only HTML analysis, no new network surface.

## Self-Check

- [x] `lib/engine/analyzeAccessibility.ts` exists
- [x] `lib/engine/analyzeAccessibility.test.ts` exists
- [x] 25/25 tests pass (`npx vitest run lib/engine/analyzeAccessibility.test.ts`)
- [x] 148/148 full suite passes (no regressions)
- [x] RED commit `291622d` exists
- [x] GREEN commit `33d280a` exists

## Self-Check: PASSED
