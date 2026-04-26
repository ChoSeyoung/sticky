---
phase: 24-spam-trigger-analysis
fixed_at: 2026-04-26T22:36:00Z
review_path: .planning/phases/24-spam-trigger-analysis/24-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 24: Code Review Fix Report

**Fixed at:** 2026-04-26T22:36:00Z
**Source review:** .planning/phases/24-spam-trigger-analysis/24-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: English keyword substring matching causes false positives

**Files modified:** `lib/engine/analyzeSpamTriggers.ts`
**Commit:** 155a656
**Applied fix:** Added `containsKeyword(text, keyword)` helper that applies a word-boundary regex (`\bKEYWORD\b`) for single-word keywords and falls back to substring match for multi-word keywords (which contain spaces). Replaced the `bodyTextUpper.includes(keyword)` call in the EN keyword loop with `containsKeyword(bodyTextUpper, keyword)`. This prevents keywords like `WIN`, `EARN`, `CASH`, `CREDIT` from matching inside legitimate words such as "window", "learning", "cashier", "accredited".

---

### WR-02: Line number for case-insensitive EN keyword match is silently `0` for mixed-case text

**Files modified:** `lib/engine/analyzeSpamTriggers.ts`
**Commit:** 155a656
**Applied fix:** Added `lineOfCI(html, needle)` helper that folds both haystack and needle to lowercase before `indexOf`, so mixed-case occurrences like `Free` or `fREE` are located correctly. Replaced the `lineOf(html, keyword) || lineOf(html, keyword.toLowerCase())` fallback in the EN keyword loop with `lineOfCI(html, keyword)`.

---

### WR-03: Vacuous conditional assertions in riskLevel tests do not protect logic

**Files modified:** `lib/engine/analyzeSpamTriggers.test.ts`
**Commit:** 4dfe55b
**Applied fix:** Replaced all three `if (count === N) { expect(...) }` patterns with unconditional assertions:
- "1 warning only" test: now asserts `toHaveLength(1)` warnings and `toHaveLength(0)` errors before asserting riskLevel, using `<p>Sale!!!</p>` which deterministically produces exactly one repeated-punctuation warning.
- "Medium" test: updated to use `<p>FREE INCOME offer today</p>` (FREE keyword + INCOME excessive-caps + INCOME keyword = 3 warnings) with unconditional error-count and warn-range assertions.
- "5+ warnings High" test: now asserts error count is 0 and warning count is >= 5 unconditionally before asserting riskLevel.
All 44 tests pass after the change.

---

### WR-04: Color-emphasis check silently skips non-`px` font sizes

**Files modified:** `lib/engine/analyzeSpamTriggers.ts`
**Commit:** 155a656
**Applied fix:** Added `parseFontSizePx(value)` helper that normalises `pt` (1pt = 4/3px) and `em`/`rem` (assumes 16px base) in addition to `px`. Replaced the inline `fontSizeValue.match(/^(\d+(?:\.\d+)?)px$/i)` regex in the color-emphasis section with a call to `parseFontSizePx(fontSizeValue)`. Red text with `font-size: 24pt`, `font-size: 1.5em`, or `font-size: 2rem` now correctly triggers the warning.

---

_Fixed: 2026-04-26T22:36:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
