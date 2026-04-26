---
phase: 24-spam-trigger-analysis
reviewed: 2026-04-26T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - app/components/WarningPanel.tsx
  - lib/engine/analyzeSpamTriggers.test.ts
  - lib/engine/analyzeSpamTriggers.ts
  - lib/engine/spamKeywords.ts
findings:
  critical: 0
  warning: 4
  info: 6
  total: 10
status: issues_found
---

# Phase 24: Code Review Report

**Reviewed:** 2026-04-26T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Four files implement spam trigger analysis for an HTML email editor: the core engine (`analyzeSpamTriggers.ts`), a keyword dictionary (`spamKeywords.ts`), a test suite (`analyzeSpamTriggers.test.ts`), and a UI panel (`WarningPanel.tsx`).

The implementation is well-structured overall. The most impactful issues are: false-positive-prone substring matching for English spam keywords, unreliable line-number lookup for case-insensitive keyword matches, vacuous conditional assertions in the test suite, and the restriction of color-emphasis detection to `px` units only. No critical security or crash-level bugs were found.

## Warnings

### WR-01: English keyword substring matching causes false positives

**File:** `lib/engine/spamKeywords.ts:3` / `lib/engine/analyzeSpamTriggers.ts:162`
**Issue:** `bodyTextUpper.includes(keyword)` performs a simple substring match with no word-boundary check. Keywords `'WIN'`, `'EARN'`, `'CASH'`, `'CREDIT'` will match inside legitimate words: "window", "learning", "cashier", "accredited". The keyword `'100%'` will match in product copy like "100% cotton" or "100% wool", generating spurious warnings in legitimate transactional emails.
**Fix:** Apply word-boundary regex matching for single-word keywords, or at minimum document the intentional substring behavior with a comment. For a quick guard:
```ts
// Replace includes() with a word-boundary regex for single-word tokens
function containsKeyword(text: string, keyword: string): boolean {
  if (keyword.includes(' ')) {
    // Multi-word: substring match is intentional
    return text.includes(keyword)
  }
  // Single-word: require word boundary to reduce false positives
  return new RegExp(`\\b${keyword}\\b`).test(text)
}
```
Then replace `bodyTextUpper.includes(keyword)` on line 162 with `containsKeyword(bodyTextUpper, keyword)`.

---

### WR-02: Line number for case-insensitive EN keyword match is silently `0` for mixed-case text

**File:** `lib/engine/analyzeSpamTriggers.ts:167`
**Issue:** The fallback `lineOf(html, keyword) || lineOf(html, keyword.toLowerCase())` only covers the all-uppercase and all-lowercase variants. If the source HTML contains `Free`, `fREE`, or any other mixed-case form, both calls return `0` (the "not found" sentinel). The warning is emitted with `lineNumber: 0`, and the UI renders it as "줄 0" — a visible indicator of failure.
**Fix:** Case-fold the needle and haystack together when searching for line position:
```ts
function lineOfCI(html: string, needle: string): number {
  const idx = html.toLowerCase().indexOf(needle.toLowerCase())
  if (idx === -1) return 0
  return html.slice(0, idx).split('\n').length
}

// In the EN keyword loop:
lineNumber: lineOfCI(html, keyword),
```

---

### WR-03: Vacuous conditional assertions in riskLevel tests do not protect logic

**File:** `lib/engine/analyzeSpamTriggers.test.ts:301-304`, `311-313`, `331-333`
**Issue:** Three riskLevel test cases wrap their `expect()` calls inside `if` blocks that depend on the actual warning count matching an assumed value. If the HTML unexpectedly triggers more or fewer warnings (e.g., due to keyword list changes), the `if` branch is skipped and the test passes vacuously — providing zero protection.
```ts
// Current — will silently pass even if riskLevel logic is broken:
if (warnCount === 1 && errCount === 0) {
  expect(result.riskLevel).toBe('Low')
}
```
**Fix:** Use HTML inputs whose warning count is fully deterministic, or assert the count unconditionally first:
```ts
it('1 warning only: riskLevel === "Low"', () => {
  // "Sale!!!" triggers exactly 1 repeated-punctuation warning and nothing else
  const result = analyzeSpamTriggers('<p>Sale!!!</p>')
  expect(result.warnings.filter(w => w.severity === 'warning')).toHaveLength(1)
  expect(result.warnings.filter(w => w.severity === 'error')).toHaveLength(0)
  expect(result.riskLevel).toBe('Low')
})
```

---

### WR-04: Color-emphasis check silently skips non-`px` font sizes

**File:** `lib/engine/analyzeSpamTriggers.ts:197-200`
**Issue:** The regex `/^(\d+(?:\.\d+)?)px$/i` only matches `px` units. A red element with `font-size: 24pt`, `font-size: 1.5em`, or `font-size: 2rem` produces `fontSize = 0` and never triggers the warning, even though these sizes correspond to visually large text that spam filters check.
**Fix:** Either extend parsing to cover common units, or document the limitation explicitly:
```ts
function parseFontSizePx(value: string): number {
  const px = value.match(/^(\d+(?:\.\d+)?)px$/i)
  if (px) return parseFloat(px[1])
  const pt = value.match(/^(\d+(?:\.\d+)?)pt$/i)
  if (pt) return parseFloat(pt[1]) * (4 / 3) // 1pt = 1.333px
  const em = value.match(/^(\d+(?:\.\d+)?)r?em$/i)
  if (em) return parseFloat(em[1]) * 16 // assumes 16px base
  return 0
}
```
If intentionally limiting to `px` only, add a comment on line 197 to make this explicit.

---

## Info

### IN-01: Dead code — `alphaChars` strip is redundant inside word regex match

**File:** `lib/engine/analyzeSpamTriggers.ts:128`
**Issue:** `word` is already guaranteed to contain only `[a-zA-Z]` characters because it was produced by `bodyText.match(/[a-zA-Z]{5,}/g)`. The `.replace(/[^a-zA-Z]/g, '')` on line 128 always returns the same value as `word`.
**Fix:** Remove the redundant replace:
```ts
const upperCount = (word.match(/[A-Z]/g) ?? []).length
const ratio = upperCount / word.length
```

---

### IN-02: Magic number `IMAGE_WEIGHT = 200` has no documentation

**File:** `lib/engine/analyzeSpamTriggers.ts:228`
**Issue:** The constant `IMAGE_WEIGHT = 200` is an undocumented heuristic used in the image/text ratio formula. There is no comment explaining why 200 characters is used as the weight per image or what empirical basis it has.
**Fix:** Add a brief inline comment:
```ts
// Each image is weighted as ~200 characters of text equivalent,
// a heuristic calibrated so a single hero image + 200 chars of body
// text produces a ~50% image ratio (neutral).
const IMAGE_WEIGHT = 200
```

---

### IN-03: `lineOf` returns `0` as "not found" sentinel — indistinguishable in UI

**File:** `lib/engine/analyzeSpamTriggers.ts:34-38`
**Issue:** When `indexOf` returns `-1` (needle not in HTML), `lineOf` returns `0`. The UI in `WarningPanel.tsx` renders this as "줄 0", which looks like an error to users. Line numbers are 1-based everywhere else in the codebase.
**Fix:** Return `1` as a safe fallback (first line) instead of `0`, or return a distinct sentinel that the UI can suppress:
```ts
function lineOf(html: string, needle: string): number {
  const idx = html.indexOf(needle)
  if (idx === -1) return 1 // fallback: attribute first line
  return html.slice(0, idx).split('\n').length
}
```

---

### IN-04: Test description says "4+ letters" but implementation uses 5+

**File:** `lib/engine/analyzeSpamTriggers.test.ts:8` / `lib/engine/analyzeSpamTriggers.ts:122-124`
**Issue:** The test description at line 8 reads `'flags a 4+ letter word'`, but the regex `/[a-zA-Z]{5,}/g` matches words with 5 or more letters. `AMAZING` (7 letters) passes because it exceeds 5, but the description implies 4 would also be flagged. The comment on line 123 also says "4+" in one place and "5+" in another ("HTML at 4 is borderline, use 5+ to be safe").
**Fix:** Align the test description with the implementation:
```ts
it('flags a 5+ letter word with 70%+ uppercase (AMAZING)', () => {
```

---

### IN-05: `totalIssues === 0` green badge does not reflect `spamSummary.riskLevel`

**File:** `app/components/WarningPanel.tsx:99-103`
**Issue:** The "모든 클라이언트 호환" badge appears when `totalIssues === 0` (sum of all warning array lengths). This is currently safe because an empty `warnings` array always produces `riskLevel: 'Low'`. However, the condition is not forward-proof: if `riskLevel` is ever computed independently of warnings, the badge could mislead.
**Fix:** No change needed now, but consider a comment tying the invariant to the implementation:
```tsx
{/* totalIssues === 0 implies riskLevel 'Low' given current SpamSummary contract */}
{totalIssues === 0 && (
  <span ...>모든 클라이언트 호환</span>
)}
```

---

### IN-06: `'SUBSCRIBE'` and `'SIGN UP FREE'` in SPAM_KEYWORDS_EN may be overly broad

**File:** `lib/engine/spamKeywords.ts:7`
**Issue:** `'SUBSCRIBE'` is a standard legitimate CTA in newsletters and subscription confirmation emails — it is the primary action for opted-in recipients. Flagging it as a spam trigger may produce persistent false positives in the most common email type this editor is likely used for.
**Fix:** Consider removing `'SUBSCRIBE'` from the list, or moving it to a lower-confidence tier if the keyword system gains severity levels in the future. At minimum, add a comment noting this trade-off.

---

_Reviewed: 2026-04-26T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
