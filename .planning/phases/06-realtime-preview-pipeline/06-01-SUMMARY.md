---
phase: 06-realtime-preview-pipeline
plan: 01
subsystem: ui
tags: [debounce, iframe-srcdoc, preview, realtime, sandbox]

requires:
  - phase: 02-naver-simulation-engine
    provides: applyClientRules engine function
  - phase: 05-code-editor
    provides: Monaco editor with html useState
provides:
  - "useDebounce hook for throttling state updates"
  - "PreviewPane component with iframe srcdoc rendering"
  - "Editor + preview split layout"
affects: [07-multi-client-layout, 08-viewport-toggle, 09-security-hardening]

tech-stack:
  added: []
  patterns: [debounce-hook, iframe-srcdoc, useMemo-simulation, dynamic-import]

key-files:
  created:
    - app/components/useDebounce.ts
    - app/components/PreviewPane.tsx
  modified:
    - app/page.tsx

key-decisions:
  - "Client-side engine — cheerio browser bundle works with Next.js 16 turbopack"
  - "useDebounce custom hook — simpler than external library"
  - "useMemo keyed on debouncedHtml — engine only runs when debounce fires"

requirements-completed: [EDIT-03]

duration: 3min
completed: 2026-04-24
---

# Phase 6 Plan 01: Real-time Preview Pipeline Summary

**Debounced editor→engine→iframe pipeline — HTML changes flow through useDebounce(300ms) → applyClientRules(naverRuleset) → iframe srcdoc with sandbox attribute**

## Performance

- **Duration:** ~3 min
- **Tasks:** 2 (+ 1 checkpoint auto-approved)
- **Files modified:** 3 created/modified

## Accomplishments
- Created useDebounce generic hook (300ms delay)
- Created PreviewPane component with applyClientRules + useMemo + iframe srcdoc
- Wired editor + preview into split layout (50/50)
- iframe has sandbox="allow-same-origin" for basic security
- Build succeeds, 68 tests pass

## Task Commits

1. **Task 1: useDebounce + PreviewPane** - `362bc8a` (feat)
2. **Task 2: Wire into split layout** - `2fc5712` (feat)

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED

## Next Phase Readiness
- Phase 7 will replicate PreviewPane for Gmail and Daum/Kakao rulesets
- Phase 8 will add viewport toggle to each pane
- Phase 9 will harden iframe sandbox + CSP

---
*Phase: 06-realtime-preview-pipeline*
*Completed: 2026-04-24*
