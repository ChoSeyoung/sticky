---
phase: 19-onboarding-flow
fixed_at: 2026-04-25T00:00:00Z
review_path: .planning/phases/19-onboarding-flow/19-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 19: Code Review Fix Report

**Fixed at:** 2026-04-25
**Source review:** .planning/phases/19-onboarding-flow/19-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (WR-01, WR-02, WR-03, WR-04)
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: `placement` prop is declared but never used — all popovers render below target

**Files modified:** `app/components/OnboardingOverlay.tsx`
**Commit:** 61748ca
**Applied fix:** Added `computePopoverStyle(rect, placement, popoverLeft)` helper that returns the correct `React.CSSProperties` for `bottom`, `right`, and `top` placements using named constants (`POPOVER_OFFSET = 12`, `POPOVER_WIDTH = 288`, `POPOVER_EDGE_MARGIN = 8`). The popover card now uses `style={popoverStyle}` instead of the hardcoded `top: rect.bottom + 12`. The magic number `296` in the left-clamping calculation was also replaced with `POPOVER_WIDTH + POPOVER_EDGE_MARGIN` (covers IN-02 as well).

---

### WR-02: `onboardingRestart` does not clear the persistence key — overlay will not reappear on page reload

**Files modified:** `app/page.tsx`, `app/components/OnboardingOverlay.tsx`
**Commit:** d740f03
**Applied fix:** Exported `clearOnboardingComplete()` from `OnboardingOverlay.tsx`. Updated `restart` callback in `useOnboarding` to call `clearOnboardingComplete()` before setting `visible: true`, ensuring the localStorage key is removed so a subsequent page reload also shows the overlay.

---

### WR-03: `onSkip` is wired to `onboardingComplete`, permanently suppressing future visits

**Files modified:** `app/page.tsx`
**Commit:** d740f03
**Applied fix:** Added a session-only `skip` callback in `useOnboarding` that calls `setVisible(false)` without writing to localStorage. The destructuring at the call site now includes `skip: onboardingSkip`, and the overlay is rendered with `onSkip={onboardingSkip}` instead of `onboardingComplete`. Pressing 건너뛰기 now hides the overlay for the current session only; the tour will reappear on next page load. The dead `step` / `setStep` state was also removed from `useOnboarding` (covers IN-01).

---

### WR-04: `OnboardingOverlay` silently disappears when a target ref is not yet attached

**Files modified:** `app/page.tsx`
**Commit:** 8ae79de
**Applied fix:** Added a `useEffect` in the `Home` component that switches `layoutMode` to `'split'` whenever `onboardingVisible` is `true`. This guarantees `editorWrapperRef` and `previewAreaRef` are mounted before `OnboardingOverlay` measures their bounding rects, preventing the silent blank-overlay state when the user is in editor-only or preview-only layout mode.

---

_Fixed: 2026-04-25_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
