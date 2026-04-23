---
phase: 03-gmail-simulation-engine
plan: 01
subsystem: engine
tags: [cheerio, css-filtering, gmail, conditional-stripping, tdd]

requires:
  - phase: 02-naver-simulation-engine
    provides: applyClientRules engine function and filterInlineStyle helper
provides:
  - "StyleBlockBehavior type for conditional <style> block processing"
  - "Gmail conditional block stripping — disallowed patterns trigger full block removal"
  - "14 Gmail-specific unit tests covering block-kill, block-retain, multiple blocks, case sensitivity"
affects: [04-daum-kakao-simulation-engine, 06-realtime-preview-pipeline]

tech-stack:
  added: []
  patterns: [conditional style block processing, collect-then-remove DOM pattern, regex pattern matching]

key-files:
  created: []
  modified:
    - lib/rulesets/types.ts
    - lib/rulesets/gmail.ts
    - lib/engine/applyClientRules.ts
    - __tests__/engine/applyClientRules.test.ts

key-decisions:
  - "StyleBlockBehavior as optional field — backward compat with Naver (no styleBlockBehavior = use stripHeadStyles)"
  - "else-if pattern: styleBlockBehavior checked before stripHeadStyles to prevent blanket stripping"
  - "Collect-then-remove: avoid cheerio index-shift by gathering elements before removing"

patterns-established:
  - "Conditional style block pattern: styleBlockBehavior.disallowedPatterns drives per-block evaluation"
  - "Type extension pattern: optional fields on ClientRuleset for client-specific behavior"

requirements-completed: [SIM-03]

duration: 3min
completed: 2026-04-24
---

# Phase 3 Plan 01: Gmail Simulation Engine Summary

**Extended applyClientRules with conditional `<style>` block stripping — blocks with disallowed CSS patterns (background-image url, @import, position fixed/absolute, expression, @font-face) are stripped entirely while safe blocks are retained**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-24T00:31:00Z
- **Completed:** 2026-04-24T00:32:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended ClientRuleset type with optional StyleBlockBehavior interface
- Updated gmailRuleset with 6 disallowed pattern regexes and stripHeadStyles: false
- Added conditional branch to applyClientRules with collect-then-remove pattern
- 14 Gmail-specific tests covering all SIM-03 behaviors — all 56 tests pass

## Task Commits

1. **Task 1: Extend types, update ruleset, write failing tests** - `ce53181` (test) — RED phase
2. **Task 2: Implement conditional style block processing** - `44d16ae` (feat) — GREEN phase

## Files Created/Modified
- `lib/rulesets/types.ts` - Added StyleBlockBehavior interface, optional field on ClientRuleset
- `lib/rulesets/gmail.ts` - Updated with stripHeadStyles: false and styleBlockBehavior config
- `lib/engine/applyClientRules.ts` - Added conditional branch with pattern matching
- `__tests__/engine/applyClientRules.test.ts` - Added 14 Gmail test cases

## Decisions Made
- Used regex pattern matching on raw CSS text (no CSS parser needed for block-level inspection)
- Patterns compiled with 'i' flag for case-insensitive matching

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## Self-Check: PASSED

## Next Phase Readiness
- Engine supports both Naver (blanket strip) and Gmail (conditional strip) via same interface
- Phase 4 (Daum/Kakao) can use same applyClientRules with daumRuleset

---
*Phase: 03-gmail-simulation-engine*
*Completed: 2026-04-24*
