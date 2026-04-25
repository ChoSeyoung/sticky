---
phase: 19-onboarding-flow
plan: "02"
subsystem: onboarding
tags: [onboarding, ux, localStorage, react-hooks, dynamic-import]
dependency_graph:
  requires: [19-01]
  provides: [UX-03]
  affects: [app/page.tsx]
tech_stack:
  added: []
  patterns: [dynamic-import-ssr-false, localStorage-ssr-guard, useCallback-hook, useRef-target-elements]
key_files:
  modified: [app/page.tsx]
decisions:
  - "useOnboarding hook wraps getInitialVisibility/markOnboardingComplete from OnboardingOverlay — avoids duplicating localStorage logic"
  - "previewAreaRef attached to outer flex-col wrapper, clientsBarRef to clients toggle bar — matches plan spec"
  - "onSkip and onComplete both call onboardingComplete — skip is treated as completion for localStorage persistence"
metrics:
  duration: "~2 minutes"
  completed_date: "2026-04-25"
  tasks_completed: 1
  files_modified: 1
---

# Phase 19 Plan 02: Integrate OnboardingOverlay into page.tsx Summary

**One-liner:** Wired OnboardingOverlay into page.tsx via useOnboarding hook, 3 target refs, dynamic import, header re-entry button, and conditional mount.

## What Was Built

`app/page.tsx` now integrates the full onboarding flow:

- `useOnboarding` hook manages `visible` state (initialized from `getInitialVisibility()`), `step` counter, `complete` callback (calls `markOnboardingComplete` + hides), and `restart` callback (resets step to 0, shows overlay)
- Three `useRef<HTMLDivElement>` refs attached to: editor wrapper, preview area outer div, clients toggle bar
- `onboardingSteps` array defines 3 steps with Korean copy and `placement: 'bottom'`
- Header `?` button rendered when `!onboardingVisible`, triggers `onboardingRestart`
- `OnboardingOverlay` dynamically imported (`ssr: false`), mounted conditionally at root div bottom

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Integrate OnboardingOverlay into page.tsx | 0fe7a79 | app/page.tsx |

## Deviations from Plan

None — plan executed exactly as written.

## Auto-approved Checkpoints

- **checkpoint:human-verify** (Task 2): Auto-approved in --auto mode. Visual verification of 3-step overlay, localStorage persistence, skip/re-entry behavior delegated to manual QA.

## Known Stubs

None — all data is wired; onboardingSteps array has real Korean copy and real DOM refs.

## Threat Flags

No new security surface introduced. localStorage stores boolean string only (as documented in threat model T-19-01).

## Self-Check: PASSED

- `app/page.tsx` exists and contains all required patterns
- Commit `0fe7a79` exists in git log
- `pnpm build` exits 0 (TypeScript clean, static generation successful)
