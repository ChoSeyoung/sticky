---
phase: 21-dark-mode-preview
plan: "02"
subsystem: ui
tags: [dark-mode, preview, react, toggle]
dependency_graph:
  requires: [21-01]
  provides: [dark-mode-toggle-ui, dark-mode-preview-pipeline]
  affects: [app/components/PreviewPane.tsx]
tech_stack:
  added: []
  patterns: [useMemo-pipeline, per-panel-state, conditional-classname]
key_files:
  created: []
  modified:
    - app/components/PreviewPane.tsx
decisions:
  - "hasDarkMediaQuery runs on debouncedHtml (original) before applyClientRules to preserve dark media queries that may be stripped by client rules (e.g. Naver)"
  - "colorMode defaults to 'light' on every mount — no localStorage persistence (per RESEARCH.md Pitfall 5)"
  - "Dark active button uses bg-zinc-700 text-zinc-200 vs Light's bg-zinc-300 text-zinc-700 for visual contrast"
metrics:
  duration: "~8 min"
  completed: "2026-04-25T16:02:13Z"
  tasks_completed: 1
  files_modified: 1
requirements_completed: [SIM-04]
---

# Phase 21 Plan 02: Dark Mode Toggle UI Summary

Wire the dark mode engine into the PreviewPane UI — Light/Dark toggle per panel with applyDarkMode integrated into the simulatedHtml pipeline.

## What Was Built

Dark mode preview toggle added to each email client `PreviewPane`. The feature delivers the complete user-facing dark mode preview (D-01 CSS injection, D-02 auto inversion, D-03 toggle UI per panel).

### Key changes in `app/components/PreviewPane.tsx`

- Added `import { hasDarkMediaQuery, applyDarkMode } from '@/lib/engine/darkMode'`
- Added `type ColorMode = 'light' | 'dark'` type alias alongside existing `Viewport`
- Added `const [colorMode, setColorMode] = useState<ColorMode>('light')` (independent state per panel, always defaults to light)
- Updated `simulatedHtml` useMemo pipeline:
  1. `hasDarkMediaQuery(debouncedHtml)` — check ORIGINAL html for dark CSS before transformation
  2. `applyClientRules(debouncedHtml, ruleset)` — apply client rules as before
  3. `applyDarkMode(transformed, ruleset.darkModeStrategy, originalHasDarkCss)` — apply dark when toggled
  4. `wrapWithSecurityHeaders(...)` — unchanged
- Added Light/Dark toggle buttons in header bar with vertical separator between viewport and color toggles
- Dynamic iframe container (`bg-zinc-800` when dark, `bg-zinc-50` when light) and iframe background (`bg-zinc-900` when dark, `bg-white` when light)

## Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Add dark mode toggle and pipeline integration to PreviewPane | d15a590 |

## Deviations from Plan

None — plan executed exactly as written.

## Auto-approved Checkpoints

- **checkpoint:human-verify** (Task 2): Auto-approved in --auto mode. TypeScript compilation passes with no new errors introduced. All grep acceptance criteria passed.

## Self-Check

- [x] `app/components/PreviewPane.tsx` exists and modified
- [x] Commit d15a590 exists
- [x] All 9 acceptance criteria grep checks pass
- [x] TypeScript errors confirmed pre-existing (SendEmailModal, not introduced by this plan)

## Self-Check: PASSED
