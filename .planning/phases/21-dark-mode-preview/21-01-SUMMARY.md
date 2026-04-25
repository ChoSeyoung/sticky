---
phase: 21-dark-mode-preview
plan: "01"
subsystem: engine
tags: [dark-mode, color-inversion, rulesets, engine, tdd]
dependency_graph:
  requires: []
  provides: [lib/engine/darkMode.ts, DarkModeStrategy type, darkModeStrategy on ClientRuleset]
  affects: [lib/rulesets/types.ts, lib/rulesets/gmail.ts, lib/rulesets/naver.ts, lib/rulesets/daum.ts, lib/rulesets/outlook-classic.ts, lib/rulesets/outlook-new.ts]
tech_stack:
  added: []
  patterns: [HSL color math for lightness-based inversion, cheerio DOM traversal, regex media query rewriting]
key_files:
  created:
    - lib/engine/darkMode.ts
    - lib/engine/darkMode.test.ts
  modified:
    - lib/rulesets/types.ts
    - lib/rulesets/index.ts
    - lib/rulesets/gmail.ts
    - lib/rulesets/naver.ts
    - lib/rulesets/daum.ts
    - lib/rulesets/outlook-classic.ts
    - lib/rulesets/outlook-new.ts
    - __tests__/engine/applyClientRules.test.ts
decisions:
  - "DarkModeStrategy union type ('none'|'partial'|'full') added as required field on ClientRuleset — not optional — so Plan 02 can rely on it always being present"
  - "Removed 'as const' from all ruleset exports to avoid type narrowing conflicts with DarkModeStrategy union"
  - "hasDarkMediaQuery uses /\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)/i to handle whitespace around parens"
  - "Partial inversion threshold: L>85 (near-white) and L<15 (near-black) — matches Gmail/Outlook observed behavior"
  - "applyDarkMode injects dark background #1a1a1a regardless of path (activateDarkMediaQueries or applyAutoInversion) to simulate email client chrome"
metrics:
  duration: "~52 min"
  completed: "2026-04-25T15:58:29Z"
  tasks_completed: 2
  files_changed: 8
---

# Phase 21 Plan 01: Dark Mode Engine Summary

Dark mode simulation engine with HSL-based color inversion, media query rewriting, and client-specific strategy map across all 5 email client rulesets.

## What Was Built

### Task 1: DarkModeStrategy type and ruleset extension

- Added `export type DarkModeStrategy = 'none' | 'partial' | 'full'` to `lib/rulesets/types.ts`
- Added `darkModeStrategy: DarkModeStrategy` as a required field on `ClientRuleset` interface
- Exported `DarkModeStrategy` from `lib/rulesets/index.ts`
- Updated all 5 rulesets with correct strategy values per D-04:
  - Gmail: `'partial'` — partial inversion per Android/web behavior
  - Outlook Classic: `'partial'` — partial inversion per litmus.com / learn.microsoft.com
  - Outlook New: `'partial'` — partial inversion, more aggressive than Classic
  - Naver: `'none'` — no published dark mode email spec
  - Daum: `'none'` — no published dark mode email spec

### Task 2: Dark mode engine functions

`lib/engine/darkMode.ts` exports 4 public functions:

1. **`hasDarkMediaQuery(html)`** — detects `@media (prefers-color-scheme: dark)` via regex, case-insensitive, handles whitespace
2. **`activateDarkMediaQueries(html)`** — rewrites dark queries to `@media all {`, suppresses light queries to `@media not all {`
3. **`applyAutoInversion(html, strategy)`** — applies color inversion per strategy:
   - `'none'`: no-op, returns HTML unchanged
   - `'partial'`: inverts colors with HSL lightness >85 (near-white) or <15 (near-black)
   - `'full'`: inverts all colors (L → 100-L)
   - Handles hex (`#fff`, `#ffffff`), `rgb()`, `rgba()` — skips named colors and CSS variables
   - Transforms inline `style` attributes, `bgcolor` HTML attrs, `color` HTML attrs, `<style>` blocks
   - Injects `body { background-color: #1a1a1a !important; }` to simulate dark chrome
4. **`applyDarkMode(html, strategy, originalHasDarkCss)`** — main orchestrator:
   - `originalHasDarkCss=true`: activates existing dark media queries + injects dark background
   - `originalHasDarkCss=false`: delegates to `applyAutoInversion` per client strategy

## Test Coverage

30 unit tests in `lib/engine/darkMode.test.ts` across 4 `describe` blocks. All pass. Full suite: 176 tests passing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Existing applyClientRules tests missing darkModeStrategy field**
- **Found during:** Task 1 — adding `darkModeStrategy` as required field broke existing test fixtures
- **Issue:** 3 mock `ClientRuleset` objects in `__tests__/engine/applyClientRules.test.ts` lacked `darkModeStrategy`
- **Fix:** Added `darkModeStrategy: 'none'` to each mock object
- **Files modified:** `__tests__/engine/applyClientRules.test.ts`
- **Commit:** c64d38a

**2. [Rule 1 - Bug] Test assertion too broad for applyDarkMode routing test**
- **Found during:** Task 2 GREEN phase — `not.toContain('color: #000000')` matched `background-color: #000000` in output
- **Issue:** After partial inversion of `background-color: #ffffff`, the result `background-color: #000000` contains the substring `color: #000000`
- **Fix:** Changed assertion to `not.toContain('; color: #000000')` (semicolon prefix prevents false match)
- **Files modified:** `lib/engine/darkMode.test.ts`
- **Commit:** b815c05

**3. [Rule 1 - Bug] hasDarkMediaQuery regex too strict for extra whitespace**
- **Found during:** Task 2 GREEN phase — test with `( prefers-color-scheme : dark )` (spaces inside parens) failed
- **Fix:** Changed regex from `\(prefers-color-scheme\s*:\s*dark\)` to `\(\s*prefers-color-scheme\s*:\s*dark\s*\)` to allow whitespace inside parens
- **Files modified:** `lib/engine/darkMode.ts`
- **Commit:** b815c05

## Known Stubs

None. All functions are fully implemented and connected.

## Threat Flags

None. Engine functions operate client-side only on user-authored HTML. Threat model T-21-01 and T-21-02 accepted per plan.

## Self-Check: PASSED

- lib/engine/darkMode.ts: FOUND
- lib/engine/darkMode.test.ts: FOUND
- lib/rulesets/types.ts (DarkModeStrategy): FOUND
- Commit c64d38a: FOUND
- Commit 1c697b0: FOUND
- Commit b815c05: FOUND
- All 176 tests passing
- TypeScript noEmit: clean
