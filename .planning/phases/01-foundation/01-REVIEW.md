---
phase: 01-foundation
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - lib/rulesets/types.ts
  - lib/rulesets/naver.ts
  - lib/rulesets/gmail.ts
  - lib/rulesets/daum.ts
  - lib/rulesets/index.ts
  - vitest.config.mts
  - __tests__/rulesets/schema.test.ts
  - package.json
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-04-23
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

The Phase 1 foundation introduces a `ClientRuleset` type system and three email client rulesets (Naver, Gmail, Daum) with provenance tracking. The code is clean, well-typed, and follows consistent conventions. No critical or security issues were found. One warning regarding ambiguous null semantics and two informational items are noted below.

## Warnings

### WR-01: Ambiguous null vs empty-array semantics for allowedInlineProperties

**File:** `lib/rulesets/types.ts:18`
**Issue:** The `allowedInlineProperties` field is typed as `string[] | null`. All three rulesets set this to `null`. The semantic distinction between `null` (presumably "no restriction / all allowed") and `[]` (presumably "none allowed") is implicit and undocumented. Any consumer code that branches on this value could easily invert the intended behavior -- treating `null` as "block all" instead of "allow all", or vice versa.
**Fix:** Add a JSDoc comment to the field clarifying the contract:
```typescript
export interface ClientRuleset {
  stripHeadStyles: boolean
  /**
   * Inline CSS properties the client permits.
   * - `null`  = client imposes no known restriction (all properties assumed allowed)
   * - `[]`    = client strips all inline properties
   * - `[...]` = only these properties survive
   */
  allowedInlineProperties: string[] | null
  strippedProperties: string[]
  strippedElements: string[]
  confidence: Confidence
  provenance: Provenance
}
```

## Info

### IN-01: Tests import directly from modules, not from barrel index

**File:** `__tests__/rulesets/schema.test.ts:2-5`
**Issue:** The test file imports each ruleset from its individual module (`@/lib/rulesets/naver`, etc.) rather than from the barrel export (`@/lib/rulesets`). This means the barrel `index.ts` re-exports are never exercised by tests. A typo or missing export in `index.ts` would not be caught.
**Fix:** Add at least one test (or change existing imports) to import via the barrel:
```typescript
import { naverRuleset, gmailRuleset, daumRuleset } from '@/lib/rulesets'
```

### IN-02: lastVerified is an unvalidated string

**File:** `lib/rulesets/types.ts:12`
**Issue:** `lastVerified` is typed as `string` with no format constraint. All current values use ISO date format (`2026-04-23`), but nothing prevents a future contributor from writing `"last week"` or `"TBD"`. For a provenance-tracking field this could reduce data quality over time.
**Fix:** Consider a branded type or a test assertion to enforce ISO 8601 date format:
```typescript
// In schema.test.ts, add:
it('lastVerified is a valid ISO date', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/
  rulesets.forEach(({ ruleset }) => {
    expect(ruleset.provenance.lastVerified).toMatch(iso)
  })
})
```

---

_Reviewed: 2026-04-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
