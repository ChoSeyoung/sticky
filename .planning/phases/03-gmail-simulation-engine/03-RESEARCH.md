# Phase 3: Gmail Simulation Engine - Research

**Researched:** 2026-04-24
**Domain:** CSS parsing, email client simulation, TypeScript type extension
**Confidence:** HIGH

## Summary

Phase 3 extends the existing `applyClientRules` engine to model Gmail's conditional `<style>` block behavior. Unlike Naver (which always strips all `<style>` blocks), Gmail inspects `<style>` block content and strips the entire block only if it contains disallowed CSS patterns. If the block contains only allowed CSS, it is retained intact.

The implementation requires three changes: (1) extend `ClientRuleset` type with an optional field describing conditional style-block behavior, (2) add a conditional branch in `applyClientRules` that inspects `<style>` content before deciding to strip, and (3) update `gmailRuleset` with the list of known block-kill patterns. No new dependencies are needed -- cheerio already exposes `<style>` element text content, and pattern matching on CSS text is sufficient (no CSS parser library required).

**Primary recommendation:** Add a `styleBlockBehavior` optional field to `ClientRuleset` containing `disallowedPatterns` (regex-compatible strings). When present and `stripHeadStyles` is `false`, the engine checks each `<style>` block against these patterns and strips only blocks with matches. When absent, existing behavior (controlled by `stripHeadStyles` boolean) remains unchanged.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Extend `ClientRuleset` with a field that models conditional `<style>` stripping. The field should contain a list of disallowed CSS patterns (property names, value patterns like `url(`) that trigger full block removal.
- **D-02:** When `stripHeadStyles` is true AND no conditional behavior is configured, behavior remains unchanged (strip all -- Naver backward compat).
- **D-03:** When conditional behavior IS configured, engine parses each `<style>` block's CSS text, checks against disallowed patterns, and strips the entire block only if a match is found.
- **D-04:** Start with known Gmail block-killers: `background-image: url()`, `@import`, `position: fixed/absolute`, `expression()`. This list is data-driven and extensible via the ruleset file.
- **D-05:** Extend the existing `applyClientRules` function -- do NOT create a separate Gmail engine. Add a conditional branch for the new ruleset field.
- **D-06:** Update `gmailRuleset` in `lib/rulesets/gmail.ts` with the new field. Update `ClientRuleset` type in `lib/rulesets/types.ts` with the optional new field.

### Claude's Discretion
- Exact field name and type for the conditional behavior config
- CSS parsing approach for `<style>` block inspection (regex on raw text vs proper CSS parser)
- Test case design and coverage specifics

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SIM-03 | User can see how their HTML email renders in Gmail (all-or-nothing `<style>` block stripping behavior) | Gmail block-kill patterns identified; type extension design complete; engine extension strategy documented; test coverage plan defined |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CSS pattern matching in `<style>` blocks | Engine (pure function) | -- | Business logic: detecting disallowed patterns is a data transform |
| `<style>` block retention/removal | Engine (pure function) | -- | DOM manipulation via cheerio, same tier as Phase 2 |
| Disallowed pattern data | Ruleset data layer | -- | Pattern list lives in `gmailRuleset` constant, not in engine code |
| Type system extension | Type definition layer | -- | `ClientRuleset` interface extension in `types.ts` |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | 1.2.0 | DOM parsing and `<style>` element text extraction | Already in use from Phase 2; jQuery-like API for server-side HTML manipulation [VERIFIED: package.json] |
| vitest | 4.1.5 | Unit testing | Already configured and passing 43 tests [VERIFIED: vitest run] |
| typescript | ^5 | Type system | Project standard [VERIFIED: package.json] |

### Supporting
No additional libraries needed. CSS pattern matching uses native RegExp -- no CSS parser library required.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RegExp on CSS text | css-tree or postcss for parsing | Overkill -- we only need to detect presence of disallowed patterns, not parse the CSS AST. Regex is sufficient for matching `url(`, `@import`, `expression(`, `position:\s*(fixed|absolute)` |

**Installation:**
No new packages needed.

**Version verification:**
- cheerio: 1.2.0 [VERIFIED: npm view cheerio version]
- vitest: 4.1.5 [VERIFIED: npx vitest --version]

## Architecture Patterns

### System Architecture Diagram

```
HTML input string
       |
       v
applyClientRules(html, ruleset)
       |
       +--[ruleset.styleBlockBehavior exists?]
       |       |
       |    YES: For each <style> element:
       |       |   Extract CSS text
       |       |   Test against disallowedPatterns[]
       |       |   Match found? -> Remove entire <style> block
       |       |   No match?    -> Retain <style> block
       |       |
       |    NO: [ruleset.stripHeadStyles?]
       |       |
       |    YES: Remove ALL <style> blocks (Naver path)
       |    NO:  Keep all <style> blocks
       |
       +-- Remove strippedElements
       +-- Filter inline style properties
       |
       v
Transformed HTML string
```

### Recommended Type Extension

```typescript
// In lib/rulesets/types.ts

export interface StyleBlockBehavior {
  /** When a <style> block's text matches ANY of these patterns, strip the entire block */
  disallowedPatterns: string[]
}

export interface ClientRuleset {
  stripHeadStyles: boolean
  styleBlockBehavior?: StyleBlockBehavior  // NEW — optional
  allowedInlineProperties: string[] | null
  strippedProperties: string[]
  strippedElements: string[]
  confidence: Confidence
  provenance: Provenance
}
```

**Rationale for this design:**

1. **Optional field** -- Naver ruleset does not need it; backward compatible. When absent, `stripHeadStyles: true` strips everything (D-02). [VERIFIED: existing naverRuleset has no such field]
2. **`disallowedPatterns: string[]`** -- Array of regex-compatible pattern strings. Each is compiled to a RegExp and tested against the `<style>` element's text content. If ANY pattern matches, the entire block is removed. [Supports D-03, D-04]
3. **`stripHeadStyles` becomes `false` for Gmail** -- Gmail does NOT unconditionally strip `<style>` blocks. The conditional logic in `styleBlockBehavior` replaces the boolean for Gmail. [Supports D-01]

### Pattern: Conditional Style Block Processing

```typescript
// In applyClientRules, after cheerio.load:

if (ruleset.styleBlockBehavior) {
  const patterns = ruleset.styleBlockBehavior.disallowedPatterns.map(
    p => new RegExp(p, 'i')
  )
  $('style').each((_, el) => {
    const cssText = $(el).text()
    const hasDisallowed = patterns.some(re => re.test(cssText))
    if (hasDisallowed) {
      $(el).remove()
    }
  })
} else if (ruleset.stripHeadStyles) {
  $('style').remove()
}
```

**Key design decisions:**
- `styleBlockBehavior` takes precedence over `stripHeadStyles` when present. This avoids ambiguity.
- Case-insensitive matching (`'i'` flag) because CSS is case-insensitive for properties.
- Each `<style>` block is evaluated independently -- one block can be killed while another survives (this matches real Gmail behavior). [CITED: freshinbox.com/blog/gmail-rolling-out-changes-that-strip-background-image-css/]

### Anti-Patterns to Avoid
- **Do not parse CSS with a full AST parser** -- The requirement is pattern detection, not transformation. A full parser adds dependency weight and complexity for no benefit.
- **Do not hardcode Gmail patterns in engine code** -- Patterns must live in the ruleset data (D-04). The engine is pattern-agnostic.
- **Do not modify the Naver code path** -- Naver's `stripHeadStyles: true` path must remain unchanged (D-02). The conditional branch is additive.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS AST parsing | Custom CSS tokenizer | RegExp on raw text | We only need substring/pattern detection, not full parsing. Gmail patterns like `url(`, `@import`, `expression(` are easily matched with regex |
| HTML DOM manipulation | String replacement | cheerio | Already in use; handles edge cases (multiple `<style>` tags, nested elements, attribute encoding) |
| Test framework | Custom assertion helpers | Vitest built-in matchers | `toContain`, `not.toContain`, `toBe` are sufficient for all test cases |

## Gmail `<style>` Block-Kill Patterns (Research Findings)

### Confirmed Block-Kill Triggers

Based on research from multiple sources:

| Pattern | RegExp | Source | Confidence |
|---------|--------|--------|------------|
| `background-image: url()` | `background-image\\s*:\\s*url\\s*\\(` | [CITED: freshinbox.com/blog/gmail-rolling-out-changes-that-strip-background-image-css/] | MEDIUM -- Gmail rolled back this change in Aug 2023, but the behavior is well-documented and appropriate for simulation |
| `background` shorthand with `url()` | `background\\s*:[^;]*url\\s*\\(` | [CITED: freshinbox.com/blog/gmail-rolling-out-changes-that-strip-background-image-css/] | MEDIUM |
| `@import` | `@import` | [CITED: emailonacid.com/blog/article/email-development/12-things-you-must-know-when-developing-for-gmail-and-gmail-mobile-apps-2/] | HIGH |
| `@font-face` inside media query | `@font-face` | [CITED: emailonacid.com] | HIGH |
| `position: fixed` | `position\\s*:\\s*fixed` | [CITED: emailens.dev/blog/gmail-html-email] | HIGH |
| `position: absolute` | `position\\s*:\\s*absolute` | [CITED: emailens.dev/blog/gmail-html-email] | HIGH |
| `expression()` | `expression\\s*\\(` | [ASSUMED] -- IE-era CSS expression, universally blocked by email clients | HIGH |
| Malformed nested `@` rules | Complex pattern | [CITED: github.com/hteumeuleu/email-bugs/issues/21] | MEDIUM |
| `<style>` block > 8192 chars | Size check, not regex | [CITED: emailonacid.com] | MEDIUM |

### Important Nuance: Gmail's Behavior is Context-Dependent

Gmail's CSS sanitizer behavior varies by:
- **Client type**: Webmail vs mobile app vs IMAP (mobile apps strip ALL `<style>` blocks regardless) [CITED: freshinbox.com/blog/gmail-supports-style-sort-of/]
- **Account type**: Consumer (@gmail.com) vs Workspace (may strip more aggressively) [CITED: freshinbox.com/blog/gmail-supports-style-sort-of/]
- **Time**: Google has changed behavior multiple times (background-image stripping was added then rolled back in 2023) [CITED: freshinbox.com/blog/gmail-rolls-back-changes-that-strip-css-with-background-images/]

**For this simulation:** We model the "worst-case webmail" behavior per D-04. The pattern list is conservative and extensible. The provenance field documents the uncertainty.

### Recommended Initial Pattern List (for D-04)

```typescript
disallowedPatterns: [
  'background-image\\s*:\\s*url\\s*\\(',    // background-image with url()
  'background\\s*:[^;]*url\\s*\\(',          // background shorthand with url()
  '@import',                                  // @import rule
  '@font-face',                               // @font-face rule
  'position\\s*:\\s*(fixed|absolute)',        // position: fixed or absolute
  'expression\\s*\\(',                        // IE expression()
]
```

## Common Pitfalls

### Pitfall 1: Breaking Naver Backward Compatibility
**What goes wrong:** Adding `styleBlockBehavior` to the engine without guarding the existing `stripHeadStyles` path causes Naver tests to fail.
**Why it happens:** The conditional branch replaces the boolean check instead of augmenting it.
**How to avoid:** Use `if (ruleset.styleBlockBehavior) { ... } else if (ruleset.stripHeadStyles) { ... }` -- the `else if` ensures Naver's path is only taken when no conditional behavior is configured.
**Warning signs:** Existing Naver tests fail after engine changes.

### Pitfall 2: Case Sensitivity in Pattern Matching
**What goes wrong:** Patterns fail to match CSS written in mixed case (e.g., `Background-Image: URL(`).
**Why it happens:** CSS property names are case-insensitive, but regex defaults to case-sensitive.
**How to avoid:** Always compile patterns with the `'i'` (case-insensitive) flag.
**Warning signs:** Tests pass with lowercase input but fail with mixed-case input.

### Pitfall 3: Regex Special Characters in Patterns
**What goes wrong:** Patterns with parentheses like `url(` or `expression(` cause regex compilation errors.
**Why it happens:** `(` is a regex special character.
**How to avoid:** Patterns in the ruleset are already regex strings -- they must escape special characters. Document this in the type's JSDoc. The examples above use `\\(` correctly.
**Warning signs:** `new RegExp(pattern)` throws at runtime.

### Pitfall 4: Mutating Shared Cheerio State
**What goes wrong:** Removing a `<style>` element during `.each()` iteration causes skipped elements.
**Why it happens:** cheerio's `.each()` uses index-based iteration; removing elements shifts indices.
**How to avoid:** Collect elements to remove in an array, then remove after iteration. Or use cheerio's `.filter()` then `.remove()`.
**Warning signs:** Only the first of multiple `<style>` blocks gets checked/removed.

### Pitfall 5: Gmail Ruleset Still Has `stripHeadStyles: true`
**What goes wrong:** Engine strips all `<style>` blocks via the boolean path, bypassing the conditional logic entirely.
**Why it happens:** The existing `gmailRuleset` has `stripHeadStyles: true` from Phase 1. If not updated to `false`, the new `styleBlockBehavior` field is never reached.
**How to avoid:** Update `gmailRuleset` to set `stripHeadStyles: false` and add the `styleBlockBehavior` field simultaneously.
**Warning signs:** Gmail simulation behaves identically to Naver (strips all blocks).

## Code Examples

### Type Extension
```typescript
// Source: Designed for this phase based on D-01, D-06
// File: lib/rulesets/types.ts

export interface StyleBlockBehavior {
  /** Regex pattern strings. If any matches <style> text, entire block is removed. */
  disallowedPatterns: string[]
}

export interface ClientRuleset {
  stripHeadStyles: boolean
  styleBlockBehavior?: StyleBlockBehavior
  allowedInlineProperties: string[] | null
  strippedProperties: string[]
  strippedElements: string[]
  confidence: Confidence
  provenance: Provenance
}
```

### Updated Gmail Ruleset
```typescript
// Source: Designed for this phase based on D-04, D-06
// File: lib/rulesets/gmail.ts

import type { ClientRuleset } from './types'

export const gmailRuleset: ClientRuleset = {
  stripHeadStyles: false,  // Changed from true -- Gmail uses conditional behavior
  styleBlockBehavior: {
    disallowedPatterns: [
      'background-image\\s*:\\s*url\\s*\\(',
      'background\\s*:[^;]*url\\s*\\(',
      '@import',
      '@font-face',
      'position\\s*:\\s*(fixed|absolute)',
      'expression\\s*\\(',
    ],
  },
  allowedInlineProperties: null,
  strippedProperties: [],
  strippedElements: [],
  confidence: 'high',
  provenance: {
    source: 'Gmail webmail inspection + community reports',
    method: 'webmail-inspection',
    lastVerified: '2026-04-24',
    notes: 'Gmail conditionally strips <style> blocks containing disallowed patterns; pattern list based on known block-kill triggers from freshinbox.com and emailonacid.com',
  },
} as const
```

### Engine Extension
```typescript
// Source: Designed for this phase based on D-03, D-05
// File: lib/engine/applyClientRules.ts (modified section)

// Inside applyClientRules, replace the stripHeadStyles block:

if (ruleset.styleBlockBehavior) {
  const patterns = ruleset.styleBlockBehavior.disallowedPatterns.map(
    p => new RegExp(p, 'i')
  )
  const toRemove: cheerio.Element[] = []
  $('style').each((_, el) => {
    const cssText = $(el).text()
    if (patterns.some(re => re.test(cssText))) {
      toRemove.push(el)
    }
  })
  toRemove.forEach(el => $(el).remove())
} else if (ruleset.stripHeadStyles) {
  $('style').remove()
}
```

### Test Cases (block-kill and block-retain)
```typescript
// Source: Test pattern from existing __tests__/engine/applyClientRules.test.ts
// File: __tests__/engine/applyClientRules.test.ts (new describe block)

describe('applyClientRules -- gmailRuleset', () => {
  describe('SIM-03: conditional <style> block stripping', () => {
    it('strips entire <style> block when background-image url() is present', () => {
      const input = '<html><head><style>.hero { background-image: url("bg.jpg"); color: red; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
      expect(result).not.toContain('color: red')  // entire block gone
    })

    it('retains <style> block when only allowed properties are used', () => {
      const input = '<html><head><style>.text { color: red; font-size: 14px; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).toContain('<style>')
      expect(result).toContain('color: red')
    })

    it('strips block with @import rule', () => {
      const input = '<html><head><style>@import url("fonts.css"); .text { color: red; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('strips block with position: fixed', () => {
      const input = '<html><head><style>.overlay { position: fixed; top: 0; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('handles multiple <style> blocks independently', () => {
      const input = '<html><head><style>.safe { color: red; }</style><style>.bad { background-image: url("x"); }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).toContain('color: red')       // safe block retained
      expect(result).not.toContain('background-image')  // bad block removed
    })
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Gmail strips ALL `<style>` blocks | Gmail conditionally retains `<style>` blocks with only allowed CSS | ~2016 (Gmail added `<style>` support) | Simulation must model conditional behavior, not blanket stripping |
| Background-image URL triggers block kill | Background-image block-kill was rolled back | Aug 2023 | Pattern is still valid for conservative simulation but actual Gmail may allow it now [CITED: freshinbox.com] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `expression()` is a block-kill trigger for Gmail | Gmail Block-Kill Patterns | LOW -- `expression()` is an IE-only CSS feature universally blocked by all email clients; including it is conservative and harmless |
| A2 | cheerio `.each()` has index-shifting behavior on removal | Common Pitfalls | LOW -- this is standard jQuery behavior and the collect-then-remove pattern is a safe mitigation regardless |
| A3 | `@font-face` triggers block-level removal (not just property stripping) | Gmail Block-Kill Patterns | MEDIUM -- some sources indicate it is stripped as a property, not necessarily killing the whole block. Conservative to include as block-killer. |

## Open Questions

1. **Block size limit (8192 chars)**
   - What we know: Multiple sources cite that Gmail strips `<style>` blocks exceeding 8192 characters [CITED: emailonacid.com]
   - What's unclear: Whether to model this in Phase 3 or defer
   - Recommendation: Defer to a future enhancement. The 8192-char limit is an edge case that complicates the engine without serving common use cases. The pattern-based model from D-04 covers the primary simulation need.

2. **Gmail mobile app behavior**
   - What we know: Gmail mobile apps strip ALL `<style>` blocks regardless of content [CITED: freshinbox.com/blog/gmail-supports-style-sort-of/]
   - What's unclear: Whether to model mobile-specific behavior as a separate ruleset variant
   - Recommendation: Out of scope for Phase 3. If needed later, create `gmailMobileRuleset` with `stripHeadStyles: true` and no `styleBlockBehavior`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.5 |
| Config file | `vitest.config.mts` |
| Quick run command | `npx vitest run __tests__/engine/applyClientRules.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIM-03a | `<style>` block with disallowed pattern is stripped entirely | unit | `npx vitest run __tests__/engine/applyClientRules.test.ts -t "strips entire"` | Exists (to be extended) |
| SIM-03b | `<style>` block with only allowed CSS is retained intact | unit | `npx vitest run __tests__/engine/applyClientRules.test.ts -t "retains"` | Exists (to be extended) |
| SIM-03c | Multiple `<style>` blocks handled independently | unit | `npx vitest run __tests__/engine/applyClientRules.test.ts -t "multiple"` | Exists (to be extended) |
| SIM-03d | `applyClientRules(html, gmailRuleset)` is a pure function | unit | `npx vitest run __tests__/engine/applyClientRules.test.ts -t "pure function"` | Exists (to be extended) |

### Sampling Rate
- **Per task commit:** `npx vitest run __tests__/engine/applyClientRules.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. Test file `__tests__/engine/applyClientRules.test.ts` exists and will be extended with Gmail-specific test cases.

## Project Constraints (from CLAUDE.md)

- Read the relevant guide in `node_modules/next/dist/docs/` before writing any code (from AGENTS.md). Phase 3 is engine-only with no Next.js route changes, so this applies only if touching framework-level code.
- Heed deprecation notices in Next.js docs.
- Today's date is 2026-04-24.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `lib/engine/applyClientRules.ts`, `lib/rulesets/types.ts`, `lib/rulesets/gmail.ts` -- verified via Read tool
- Existing tests: `__tests__/engine/applyClientRules.test.ts` -- verified via Read tool and `npx vitest run`
- [Google Gmail CSS Support docs](https://developers.google.com/workspace/gmail/design/css) -- official list of supported CSS properties

### Secondary (MEDIUM confidence)
- [FreshInbox: Gmail rolling out changes that strip CSS with background images](https://freshinbox.com/blog/gmail-rolling-out-changes-that-strip-background-image-css/) -- detailed block-kill behavior documentation
- [FreshInbox: Gmail rolls back background-image stripping](https://freshinbox.com/blog/gmail-rolls-back-changes-that-strip-css-with-background-images/) -- rollback confirmation
- [FreshInbox: Gmail supports style sort of](https://freshinbox.com/blog/gmail-supports-style-sort-of/) -- conditional retention behavior
- [Emailens: Gmail HTML Email](https://emailens.dev/blog/gmail-html-email) -- CSS support overview
- [Email on Acid: Gmail HTML Email Development](https://www.emailonacid.com/blog/article/email-development/12-things-you-must-know-when-developing-for-gmail-and-gmail-mobile-apps-2/) -- block-kill triggers
- [hteumeuleu/email-bugs#21](https://github.com/hteumeuleu/email-bugs/issues/21) -- nested @ declaration removal

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies; extending existing proven code
- Architecture: HIGH -- type extension and conditional branch are minimal, well-constrained changes
- Pitfalls: HIGH -- identified from Phase 2 experience and cheerio behavior

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (stable -- engine code, no fast-moving external dependencies)
