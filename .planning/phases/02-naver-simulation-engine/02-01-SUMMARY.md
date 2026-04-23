---
phase: 02-naver-simulation-engine
plan: 01
subsystem: engine
tags: [cheerio, html-parsing, css-filtering, simulation, tdd]

requires:
  - phase: 01-foundation
    provides: ClientRuleset type interface and naverRuleset constant
provides:
  - "applyClientRules(html, ruleset) pure function engine"
  - "filterInlineStyle helper for CSS property filtering"
  - "14 unit tests covering all SIM-01 behaviors"
affects: [03-gmail-simulation-engine, 04-daum-kakao-simulation-engine, 06-realtime-preview-pipeline]

tech-stack:
  added: [cheerio@1.2.0]
  patterns: [DOM-based HTML transformation, data-driven ruleset filtering, TDD RED-GREEN]

key-files:
  created:
    - lib/engine/applyClientRules.ts
    - __tests__/engine/applyClientRules.test.ts
  modified:
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "cheerio selected as DOM parser — jQuery-like API, TypeScript native, handles malformed HTML"
  - "filterInlineStyle uses split(';') parsing — full CSS parser overkill for inline style attributes"
  - "Bare <td> wrapped in <table> for tests — cheerio strips invalid table-child elements outside table context"

patterns-established:
  - "Engine function pattern: applyClientRules(html, ruleset) → string — reusable for Gmail and Daum/Kakao"
  - "Inline style filtering: split-on-semicolon with case-insensitive property matching"
  - "Test pattern: describe per SIM-01 behavior category, data-driven custom ruleset tests for D-04"

requirements-completed: [SIM-01]

duration: 4min
completed: 2026-04-23
---

# Phase 2 Plan 01: Naver Simulation Engine Summary

**Pure function CSS simulation engine using cheerio — strips `<style>` blocks and filters blocked inline properties (margin, padding, font-family) driven by ClientRuleset data**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-23T15:09:00Z
- **Completed:** 2026-04-23T15:10:42Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Implemented `applyClientRules` pure function with cheerio DOM parsing
- 14 unit tests covering style stripping, inline property filtering, passthrough, entity preservation, purity, and data-driven ruleset behavior
- Engine is fully data-driven — changing `naverRuleset` data changes behavior without code changes
- All 43 tests pass (14 engine + 29 schema)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install cheerio and write failing tests** - `05e9d28` (test) — RED phase
2. **Task 2: Implement applyClientRules** - `b282da9` (feat) — GREEN phase

## Files Created/Modified
- `lib/engine/applyClientRules.ts` - Pure function engine: strips `<style>`, filters blocked inline CSS properties
- `__tests__/engine/applyClientRules.test.ts` - 14 test cases covering all SIM-01 behaviors
- `package.json` - Added cheerio@1.2.0 dependency
- `pnpm-lock.yaml` - Lock file updated

## Decisions Made
- Used cheerio over linkedom/parse5 for jQuery-like API convenience and TypeScript support
- `decodeEntities: false` prevents HTML entity corruption (`&nbsp;` preservation)
- `filterInlineStyle` uses `indexOf(':')` instead of `split(':')[0]` to handle CSS values containing colons

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bare `<td>` element stripped by cheerio**
- **Found during:** Task 2 (GREEN phase test run)
- **Issue:** Test input `<td style="...">cell</td>` — cheerio strips `<td>` outside `<table>` context, losing the element and its style attribute entirely
- **Fix:** Wrapped `<td>` in `<table><tr>...</tr></table>` in the test
- **Files modified:** `__tests__/engine/applyClientRules.test.ts`
- **Verification:** Test passes with proper table markup
- **Committed in:** `b282da9` (part of GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test fix only — engine implementation unchanged. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Self-Check: PASSED

All verification criteria confirmed:
- `pnpm test` exits 0 — all 43 tests pass
- Test file has 14 test cases covering all SIM-01 behaviors
- `applyClientRules` exported as named export from `lib/engine/applyClientRules.ts`
- No `juice` dependency in package.json
- `cheerio` present in package.json dependencies

## Next Phase Readiness
- `applyClientRules` interface ready for Phase 3 (Gmail) and Phase 4 (Daum/Kakao) — same function signature with different rulesets
- Phase 6 can call `applyClientRules(html, naverRuleset)` from server component or API route

---
*Phase: 02-naver-simulation-engine*
*Completed: 2026-04-23*
