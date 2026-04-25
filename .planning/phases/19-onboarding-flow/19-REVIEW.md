---
phase: 19-onboarding-flow
reviewed: 2026-04-25T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - __tests__/onboarding/useOnboarding.test.ts
  - app/components/OnboardingOverlay.tsx
  - app/page.tsx
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-04-25
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three files implement the onboarding flow: a reusable overlay component, localStorage helpers, and the page-level hook and wiring. The localStorage persistence helpers are sound and well-tested. The main issues are: (1) the `placement` prop on `OnboardingStep` is declared but never applied in rendering — all popovers are rendered below the target regardless of the configured placement; (2) the `restart` flow does not clear the localStorage key, so a page reload after restart will suppress the overlay; (3) the `useOnboarding` hook exposes `step`/`setStep` that are never consumed by the caller; and (4) `onSkip` is wired to `onboardingComplete`, permanently marking onboarding as done on any dismissal, which conflicts with the expected semantics of skipping.

---

## Warnings

### WR-01: `placement` prop is declared but never used — all popovers render below target

**File:** `app/components/OnboardingOverlay.tsx:107`
**Issue:** `OnboardingStep.placement` accepts `'bottom' | 'right' | 'top'` and all three steps in `app/page.tsx` pass `placement: 'bottom' as const`, but the popover position is always computed as `rect.bottom + 12` regardless. If any future step uses `'right'` or `'top'`, it will still appear below the target. The feature is half-implemented.
**Fix:**
```tsx
const POPOVER_OFFSET = 12

function computePopoverStyle(rect: DOMRect, placement: OnboardingStep['placement'], popoverLeft: number) {
  if (placement === 'top') {
    return { bottom: window.innerHeight - rect.top + POPOVER_OFFSET, left: popoverLeft }
  }
  if (placement === 'right') {
    return { top: rect.top, left: rect.right + POPOVER_OFFSET }
  }
  // default 'bottom'
  return { top: rect.bottom + POPOVER_OFFSET, left: popoverLeft }
}

// In the render:
const popoverStyle = computePopoverStyle(rect, steps[stepIndex].placement, popoverLeft)
// <div ... style={popoverStyle}>
```

---

### WR-02: `onboardingRestart` does not clear the persistence key — overlay will not reappear on page reload

**File:** `app/page.tsx:224-228`
**Issue:** `restart()` sets `visible: true` in memory but does not call `localStorage.removeItem(ONBOARDING_KEY)`. If the user clicks the `?` restart button and then reloads the page, `getInitialVisibility()` reads the still-set key and returns `false`, so the overlay never shows. The restart only works for the current session.
**Fix:**
```ts
// In useOnboarding (app/page.tsx)
import { markOnboardingComplete, ONBOARDING_KEY } from '@/app/components/OnboardingOverlay'

// Add a clearOnboarding helper to OnboardingOverlay.tsx:
export function clearOnboardingComplete(): void {
  try { localStorage.removeItem(ONBOARDING_KEY) } catch { /* ignore */ }
}

// Then in useOnboarding:
const restart = useCallback(() => {
  clearOnboardingComplete()   // <-- add this
  setStep(0)
  setVisible(true)
}, [])
```

---

### WR-03: `onSkip` is wired to `onboardingComplete`, permanently suppressing future visits

**File:** `app/page.tsx:459`
**Issue:** `onSkip={onboardingComplete}` means pressing "건너뛰기" (skip) persists `sticky:onboardingCompleted = "true"` to localStorage, making it identical to finishing the tour. A user who accidentally dismisses the overlay on first visit can never see it again automatically — they must discover the hidden `?` button. The semantic intent of "skip" is typically "dismiss for now" rather than "never show again".
**Fix:** Decide on the intended behaviour and apply consistently:
- If skip should be permanent (current intent): rename the prop/handler to make it explicit, e.g. `onDismiss={onboardingComplete}`.
- If skip should be session-only (temporary dismiss without persisting):
```ts
// Add to useOnboarding
const skip = useCallback(() => {
  setVisible(false)  // hides for this session only; does not write localStorage
}, [])

// In page.tsx:
const { visible, complete, skip, restart } = useOnboarding()
// ...
<OnboardingOverlay ... onSkip={skip} onComplete={complete} />
```

---

### WR-04: `OnboardingOverlay` silently disappears when a target ref is not yet attached

**File:** `app/components/OnboardingOverlay.tsx:79`
**Issue:** `if (!rect) return null` causes the entire overlay — including the backdrop — to be invisible when `steps[stepIndex].targetRef.current` is `null`. If the target element is hidden (e.g., `editorWrapperRef` when `layoutMode === 'preview'`), the overlay disappears silently. The user has no feedback that the onboarding is still active, and no way to advance or skip. The refs `editorWrapperRef` and `previewAreaRef` in `app/page.tsx` are conditionally rendered (lines 400-451), so the first step may have a null ref if the user is in `preview` mode when onboarding starts.
**Fix:** Render at minimum the skip/next controls even when rect is null, or ensure onboarding only starts when the required layout elements are mounted:
```tsx
// Option A: guard onboarding start against null refs
const { visible, complete, restart } = useOnboarding()

useEffect(() => {
  // Only start onboarding in split mode where all refs are mounted
  if (visible && layoutMode !== 'split') setLayoutMode('split')
}, [visible])

// Option B: in OnboardingOverlay, render a fallback popover at center-screen when rect is null
if (!rect) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-zinc-900 ...">
        {/* step content + skip/next buttons */}
      </div>
    </div>
  )
}
```

---

## Info

### IN-01: `step` and `setStep` returned from `useOnboarding` are unused

**File:** `app/page.tsx:217, 229, 245`
**Issue:** `useOnboarding` maintains its own `step` / `setStep` state (line 217) and returns both (line 229). The caller destructures neither `step` nor `setStep` (line 245). `OnboardingOverlay` manages its own internal `stepIndex`. The external state is dead code.
**Fix:** Remove `step` and `setStep` from `useOnboarding` entirely unless there is a future need to control the step externally:
```ts
function useOnboarding() {
  const [visible, setVisible] = useState<boolean>(...)
  const complete = useCallback(() => { markOnboardingComplete(); setVisible(false) }, [])
  const restart  = useCallback(() => { setVisible(true) }, [])
  return { visible, complete, restart }
}
```

---

### IN-02: Magic number `296` in popover left-clamping calculation lacks a comment

**File:** `app/components/OnboardingOverlay.tsx:82`
**Issue:** `window.innerWidth - 296` uses `296` as an opaque constant. It appears to be the card width (`w-72` = 288px) plus 8px margin, but this is not documented and will silently break if the card width changes.
**Fix:**
```tsx
const POPOVER_WIDTH = 288  // matches Tailwind w-72
const POPOVER_EDGE_MARGIN = 8
const popoverLeft = typeof window !== 'undefined'
  ? Math.min(Math.max(POPOVER_EDGE_MARGIN, rect.left), window.innerWidth - POPOVER_WIDTH - POPOVER_EDGE_MARGIN)
  : rect.left
```

---

### IN-03: Test stubs entire `window` object with a minimal shape

**File:** `__tests__/onboarding/useOnboarding.test.ts:12`
**Issue:** `vi.stubGlobal('window', { localStorage: localStorageMock })` replaces the global `window` with a plain object exposing only `localStorage`. This is broader than necessary and could break if the module under test (or a future version of it) accesses any other `window` property at import time. The functions currently tested access only `localStorage`, so there is no active bug, but it is a fragile pattern.
**Fix:** Stub only `localStorage` rather than the whole `window`:
```ts
// Remove: vi.stubGlobal('window', { localStorage: localStorageMock })
vi.stubGlobal('localStorage', localStorageMock)
// Keep the typeof window check by ensuring window itself is not replaced
```

---

_Reviewed: 2026-04-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
