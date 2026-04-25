---
phase: 21-dark-mode-preview
verified: 2026-04-25T01:05:30Z
status: human_needed
score: 11/11 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Dark mode toggle visual check — each panel"
    expected: "Each preview panel shows Light and Dark buttons next to Desktop/Mobile. Clicking Dark turns the iframe background dark. Gmail/Outlook panels invert white backgrounds and black text. Naver/Daum panels show dark chrome only (no body inversion). Panels are independently controllable."
    why_human: "Visual rendering in iframe cannot be verified programmatically — requires a running browser to confirm iframe background, color inversion appearance, and panel independence."
  - test: "Templates with prefers-color-scheme: dark media queries"
    expected: "Pasting an HTML email containing @media (prefers-color-scheme: dark) rules and toggling Dark activates those rules in the preview."
    why_human: "End-to-end user interaction with live HTML input and rendered output requires browser observation."
  - test: "Light/Dark toggle instant update"
    expected: "Switching between Light and Dark updates the preview immediately without page reload."
    why_human: "React useMemo reactivity must be confirmed in a live browser — cannot be verified via static analysis."
---

# Phase 21: Dark Mode Preview Verification Report

**Phase Goal:** 이메일 클라이언트의 다크모드에서 템플릿이 어떻게 보이는지 시뮬레이션으로 확인할 수 있다
**Verified:** 2026-04-25T01:05:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 각 프리뷰 패널의 뷰포트 토글 옆에 다크모드 토글이 있다 (Light/Dark toggle in each panel header) | ✓ VERIFIED | PreviewPane.tsx:82-106 — vertical separator + Light/Dark buttons rendered after viewport toggle |
| 2 | 다크모드 활성화 시 prefers-color-scheme: dark 미디어쿼리가 적용된다 | ✓ VERIFIED | activateDarkMediaQueries() rewrites dark media queries to @media all { — 30 tests all pass |
| 3 | 다크모드 미대응 템플릿의 경우 클라이언트별 자동 색상 반전 로직이 시뮬레이션된다 | ✓ VERIFIED | applyAutoInversion() handles partial/full/none per ruleset.darkModeStrategy; Gmail/Outlook='partial', Naver/Daum='none' |
| 4 | 라이트/다크 모드 전환 시 프리뷰가 즉시 갱신된다| ✓ VERIFIED (code) | colorMode is in useMemo dependency array (PreviewPane.tsx:41); React will recompute synchronously — visual confirmation needed |
| 5 | hasDarkMediaQuery detects @media (prefers-color-scheme: dark) in HTML | ✓ VERIFIED | darkMode.ts:12-13 regex /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i; 8 passing tests |
| 6 | activateDarkMediaQueries rewrites dark media queries to unconditional @media all | ✓ VERIFIED | darkMode.ts:28-45; test suite confirms rewriting and light-query suppression |
| 7 | applyAutoInversion with 'partial' strategy inverts near-white/near-black colors | ✓ VERIFIED | darkMode.ts:96-108 invertColorPartial: L>85 or L<15 triggers inversion; 9 tests pass |
| 8 | applyAutoInversion with 'none' strategy returns HTML unchanged | ✓ VERIFIED | darkMode.ts:222 — early return if strategy === 'none' |
| 9 | applyAutoInversion with 'full' strategy inverts all color values | ✓ VERIFIED | darkMode.ts:109-115 invertColorFull: always inverts; confirmed by tests |
| 10 | applyDarkMode routes correctly based on originalHasDarkCss flag | ✓ VERIFIED | darkMode.ts:298-308 — activateDarkMediaQueries when true, applyAutoInversion when false |
| 11 | All 5 client rulesets have a darkModeStrategy field | ✓ VERIFIED | naver='none', gmail='partial', daum='none', outlook-classic='partial', outlook-new='partial' |

**Score:** 11/11 truths verified (automated checks)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/engine/darkMode.ts` | Dark mode engine functions | ✓ VERIFIED | 309 lines; exports hasDarkMediaQuery, activateDarkMediaQueries, applyAutoInversion, applyDarkMode |
| `lib/engine/darkMode.test.ts` | Unit tests (min 50 lines) | ✓ VERIFIED | 204 lines; 30 tests across 4 describe blocks; all pass |
| `lib/rulesets/types.ts` | DarkModeStrategy type + updated ClientRuleset | ✓ VERIFIED | DarkModeStrategy union at line 3; darkModeStrategy required field at line 30 |
| `app/components/PreviewPane.tsx` | Dark mode toggle UI + pipeline | ✓ VERIFIED | colorMode state, Light/Dark buttons, simulatedHtml pipeline integration |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| lib/engine/darkMode.ts | lib/rulesets/types.ts | import DarkModeStrategy type | ✓ WIRED | darkMode.ts:2 `import type { DarkModeStrategy } from '@/lib/rulesets/types'` |
| lib/rulesets/gmail.ts | lib/rulesets/types.ts | darkModeStrategy field | ✓ WIRED | gmail.ts uses darkModeStrategy: 'partial' in ClientRuleset object |
| app/components/PreviewPane.tsx | lib/engine/darkMode.ts | import applyDarkMode, hasDarkMediaQuery | ✓ WIRED | PreviewPane.tsx:7 `import { hasDarkMediaQuery, applyDarkMode } from '@/lib/engine/darkMode'` |
| app/components/PreviewPane.tsx | useMemo simulatedHtml | colorMode in dependency array | ✓ WIRED | PreviewPane.tsx:41 — colorMode in useMemo deps; both hasDarkMediaQuery and applyDarkMode called |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| PreviewPane.tsx | simulatedHtml | applyDarkMode(transformed, ruleset.darkModeStrategy, originalHasDarkCss) | Yes — real HTML transformation, not static | ✓ FLOWING |
| PreviewPane.tsx | originalHasDarkCss | hasDarkMediaQuery(debouncedHtml) — runs on original HTML | Yes — regex over actual input | ✓ FLOWING |
| darkMode.ts | inversion output | invertColorPartial/invertColorFull via HSL math | Yes — actual color computation | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All dark mode unit tests pass | npx vitest run lib/engine/darkMode.test.ts | 30 passed (30) in 179ms | ✓ PASS |
| TypeScript compiles cleanly | npx tsc --noEmit | No errors | ✓ PASS |
| DarkModeStrategy in types.ts | grep "DarkModeStrategy" lib/rulesets/types.ts | Lines 3 and 30 | ✓ PASS |
| All 5 rulesets have darkModeStrategy | grep "darkModeStrategy" in each ruleset file | All 5 found | ✓ PASS |
| darkMode.ts exports all 4 functions | grep "export function" lib/engine/darkMode.ts | 4 exports found | ✓ PASS |
| PreviewPane imports and uses dark mode | grep "applyDarkMode\|hasDarkMediaQuery\|colorMode" PreviewPane.tsx | All patterns found | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|------------|------------|-------------|--------|----------|
| SIM-04 | 21-01, 21-02 | Dark mode preview simulation | ✓ SATISFIED | Engine + UI fully implemented; 21-02-SUMMARY confirms requirements_completed: [SIM-04] |

### Anti-Patterns Found

No blockers or stubs found.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | — | — | — | — |

### Human Verification Required

#### 1. Dark mode toggle visual appearance

**Test:** Run `pnpm dev` and open http://localhost:3000. Verify each preview panel shows "Light" and "Dark" buttons next to "Desktop" and "Mobile".
**Expected:** Toggle buttons visible in every panel header. Active Dark button shows dark styling (bg-zinc-700 text-zinc-200). Active Light button shows light styling (bg-zinc-300 text-zinc-700).
**Why human:** Visual rendering of Tailwind class-conditional UI requires a real browser.

#### 2. Gmail/Outlook dark mode — partial color inversion

**Test:** Click "Dark" on the Gmail panel with the default template.
**Expected:** White backgrounds become dark, black text becomes light. Mid-range colors remain unchanged.
**Why human:** iframe rendered output requires visual inspection; cannot verify color inversion results programmatically without running the app.

#### 3. Naver/Daum dark mode — chrome-only, no body inversion

**Test:** Click "Dark" on the Naver panel.
**Expected:** The container background turns dark (bg-zinc-800) and the iframe background turns dark (bg-zinc-900), but the email body HTML is NOT color-inverted.
**Why human:** Requires browser to confirm the darkModeStrategy='none' path correctly leaves email body unchanged while showing dark chrome.

#### 4. Independent panel state

**Test:** Set Gmail panel to Dark and Naver panel to Light.
**Expected:** Each panel maintains its own color mode independently — setting one does not affect another.
**Why human:** Per-component useState independence is theoretically guaranteed but requires user confirmation that the rendered UI behaves as expected.

#### 5. Templates with dark media queries

**Test:** Paste an HTML email containing `@media (prefers-color-scheme: dark) { body { background: #111; color: #eee; } }` and toggle Dark on a panel.
**Expected:** The dark media query styles activate — email body shows dark background and light text as specified in the CSS.
**Why human:** End-to-end behavior with live HTML editing requires browser observation.

### Gaps Summary

No automated gaps found. All 11 must-have truths are verified by code inspection and test execution. Human verification is required to confirm the rendered visual output in a live browser environment.

---

_Verified: 2026-04-25T01:05:30Z_
_Verifier: Claude (gsd-verifier)_
