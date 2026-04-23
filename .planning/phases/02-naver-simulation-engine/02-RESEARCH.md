# Phase 2: Naver Simulation Engine - Research

**Researched:** 2026-04-23
**Domain:** HTML parsing, CSS property filtering, pure-function engine design
**Confidence:** MEDIUM (core approach verified; Naver inline-strip property list requires user validation)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a DOM parser library (cheerio, linkedom, or parse5). No regex-based HTML manipulation.
- **D-02:** No juice/client dependency. Implement CSS filtering directly using the chosen DOM parser.
- **D-03:** Strip-only strategy. Remove `<style>` blocks; filter blocked properties from inline styles. Do NOT inline `<style>` CSS into elements first.
- **D-04:** Start with `strippedProperties: ['margin', 'padding', 'font-family']`. Expand list if research uncovers more blocked properties. Engine must be data-driven (ruleset file change = no code change needed).
- **D-05:** API signature: `applyClientRules(html: string, ruleset: ClientRuleset): string`. Pure string return, no metadata.
- **D-06:** Server-side (Node.js) first. Engine runs in Node context; Phase 6 calls it from API route or Server Component.

### Claude's Discretion
- DOM parser library final selection (cheerio vs linkedom vs parse5 — bundle size, API convenience, performance)
- Engine function internal implementation pattern (pipeline, single-pass, etc.)
- Test structure and test case design
- File location (lib/engine/, lib/simulation/, etc.)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SIM-01 | User can see how their HTML email renders in Naver Mail (strips `<style>`, inline CSS only, blocks `margin` inline) | DOM parser can remove `<style>` elements and filter inline style properties per ClientRuleset; pure function interface maps directly to success criteria |
</phase_requirements>

---

## Summary

Phase 2 implements a pure function `applyClientRules(html: string, ruleset: ClientRuleset): string` that transforms an HTML string to simulate how Naver Mail's rendering engine processes it. The transformation has two distinct operations: (1) remove all `<style>` elements when `stripHeadStyles: true`, and (2) filter blocked CSS properties from every element's `style` attribute using the `strippedProperties` list.

The implementation is entirely server-side (Node.js), uses a DOM parser library for reliable tree manipulation, and is designed to be data-driven — the same engine code will serve Phase 3 (Gmail) and Phase 4 (Daum/Kakao) by passing different rulesets. No regex-based HTML manipulation is used.

**Critical finding on Naver inline style behavior:** EmailOnAcid's Naver webmail testing article states that inline margin, padding, and font-family render correctly in Naver. The current `strippedProperties: ['margin', 'padding', 'font-family']` list in `naver.ts` is marked `[ASSUMED]` — it was derived from webmail inspection and community reports noted in the provenance, but no independent primary source confirms Naver strips these properties from inline styles. The engine architecture (data-driven ruleset) is sound regardless; the ruleset values need user validation before finalizing.

**Primary recommendation:** Use cheerio for DOM parsing. It has a mature jQuery-like API, excellent TypeScript types, and handles complex HTML edge cases. Its `style` attribute manipulation is direct (`attr('style', ...)`) and serialization via `$.html()` roundtrips cleanly.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTML parsing and serialization | Backend / lib | — | Node-only DOM parser; no browser runtime in Phase 2 |
| CSS property filtering | Backend / lib | — | Pure function runs in Node; called from server component/API route in Phase 6 |
| `<style>` block removal | Backend / lib | — | DOM tree operation; same tier as parsing |
| Ruleset data (strippedProperties list) | Static data file | — | `lib/rulesets/naver.ts` — already exists, Phase 2 does not change it |
| Unit testing | Test layer | — | Vitest, Node environment (already configured) |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | 1.2.0 [VERIFIED: npm registry] | HTML parsing + DOM manipulation | jQuery-like API, mature, TypeScript native, handles malformed HTML gracefully |
| vitest | ^4.1.5 [VERIFIED: package.json] | Unit testing | Already installed in project; `pnpm test` runs it |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| linkedom | 0.18.12 [VERIFIED: npm registry] | DOM manipulation alternative | If cheerio has edge-case issues with email HTML quirks |
| parse5 | 8.0.1 [VERIFIED: npm registry] | Low-level spec-compliant HTML parser | If you only need parse+serialize with custom tree traversal (no jQuery API) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| cheerio (1MB unpacked) | parse5 (337KB unpacked) + custom walker | parse5 is spec-compliant and lighter; tradeoff is you write manual tree traversal instead of `$('[style]').each(...)` — more code for same result |
| cheerio | linkedom (920KB) | linkedom has a real CSSOM; overkill for strip-only operations. API is more browser-like but less convenient for server-side template manipulation |
| cheerio | htmlparser2 + domutils directly | Same parse layer cheerio uses internally; skips the jQuery wrapper. Suitable if you want minimum surface area, but API is lower-level |

**Installation:**
```bash
pnpm add cheerio
```

**Version verification:**
```
npm view cheerio version  =>  1.2.0  (verified 2026-04-23)
npm view linkedom version =>  0.18.12
npm view parse5 version   =>  8.0.1
```

---

## Architecture Patterns

### System Architecture Diagram

```
HTML string input
       │
       ▼
  cheerio.load(html)
       │
       ├─── if ruleset.stripHeadStyles ──► remove all <style> elements
       │                                   ($('style').remove())
       │
       ├─── if ruleset.strippedElements ─► remove listed elements
       │                                   (e.g., $('script').remove())
       │
       └─── filter inline styles ─────────► for each element with style attr
                │                           parse style string → object
                │                           delete blocked properties
                │                           serialize back → set attr
                ▼
       $.html()  →  transformed HTML string output
```

### Recommended Project Structure
```
lib/
├── rulesets/          # Phase 1 — existing
│   ├── types.ts
│   ├── naver.ts
│   ├── gmail.ts
│   ├── daum.ts
│   └── index.ts
└── engine/            # Phase 2 — new
    └── applyClientRules.ts

__tests__/
├── rulesets/          # Phase 1 — existing
│   └── schema.test.ts
└── engine/            # Phase 2 — new
    └── applyClientRules.test.ts
```

### Pattern 1: Strip `<style>` elements
**What:** Remove all `<style>` nodes from the parsed document when `ruleset.stripHeadStyles` is true.
**When to use:** Naver (and Gmail) strip `<style>` blocks entirely.
**Example:**
```typescript
// Source: Context7 / cheeriojs/cheerio
import * as cheerio from 'cheerio'
import type { ClientRuleset } from '@/lib/rulesets/types'

export function applyClientRules(html: string, ruleset: ClientRuleset): string {
  const $ = cheerio.load(html, { decodeEntities: false })

  if (ruleset.stripHeadStyles) {
    $('style').remove()
  }

  // ... inline property filtering

  return $.html()
}
```

### Pattern 2: Filter inline style properties
**What:** For each element that has a `style` attribute, parse the property list, remove blocked properties, and write back the filtered value.
**When to use:** Naver blocks certain inline CSS properties (exact list is ASSUMED — see Assumptions Log).
**Example:**
```typescript
// Source: ASSUMED pattern — standard CSS property string parsing
function filterInlineStyle(styleValue: string, blocked: string[]): string {
  const blockedSet = new Set(blocked)
  return styleValue
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(decl => {
      const prop = decl.split(':')[0].trim().toLowerCase()
      return !blockedSet.has(prop)
    })
    .join('; ')
}

// Applied via cheerio:
$('[style]').each((_, el) => {
  const original = $(el).attr('style') ?? ''
  const filtered = filterInlineStyle(original, ruleset.strippedProperties)
  if (filtered) {
    $(el).attr('style', filtered)
  } else {
    $(el).removeAttr('style')
  }
})
```

### Pattern 3: Data-driven ruleset extension
**What:** The engine reads `ruleset.strippedProperties` from the `ClientRuleset` object. Adding a new blocked property requires changing only `lib/rulesets/naver.ts`, not engine code.
**When to use:** Required per D-04.
**Example:** Adding `'background'` to the Naver list requires only:
```typescript
// lib/rulesets/naver.ts
strippedProperties: ['margin', 'padding', 'font-family', 'background'],
```

### Anti-Patterns to Avoid
- **Regex `<style>` removal:** `html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')` — breaks on CDATA sections, nested content, multiline attributes. Use DOM parser (D-01 is locked).
- **Regex inline style filtering:** `style.replace(/margin:[^;]+;?/g, '')` — misses property variations like `MARGIN`, ` margin `, `margin-top`. Use split-on-semicolon approach.
- **cheerio `decodeEntities: true` (default):** This re-encodes HTML entities in text content, which can corrupt email HTML that contains `&nbsp;`, `&mdash;`, etc. Pass `{ decodeEntities: false }` to `cheerio.load()`.
- **`allowedInlineProperties` allow-list enforcement:** The current `ClientRuleset` has `allowedInlineProperties: null` for Naver, meaning no allow-list is enforced. Don't implement allow-list logic in Phase 2 — it's only needed when the value is non-null (may apply to Phase 3/4).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing from string | Custom tokenizer or regex parser | cheerio / parse5 | HTML parsing edge cases (CDATA, malformed tags, attribute quirks) are vast; spec-compliant parsers handle them |
| CSS property parsing | Custom CSS declaration parser | Simple `split(';')` + `split(':')` is sufficient for inline styles | Full CSS parsers (postcss, css-tree) are overkill for inline style attribute values — inline styles are flat property lists, not full CSS |
| Serialization back to string | Manual DOM reconstruction | `$.html()` from cheerio | cheerio handles void elements, attribute quoting, whitespace correctly |

**Key insight:** The inline style filtering logic is simple enough that `string.split(';')` is the right tool. Don't pull in a full CSS parser for `style="margin: 0; padding: 0"` — the format is a flat declaration list, not a selector-bearing stylesheet.

---

## Common Pitfalls

### Pitfall 1: cheerio `decodeEntities` corrupts email HTML entities
**What goes wrong:** `cheerio.load(html)` with default options re-encodes `&nbsp;` as `&amp;nbsp;` in text nodes.
**Why it happens:** cheerio's default `decodeEntities: true` decodes then re-encodes entities during serialization.
**How to avoid:** Always pass `{ decodeEntities: false }` to `cheerio.load()`.
**Warning signs:** Output HTML has `&amp;nbsp;` or `&#x...;` where the input had `&nbsp;`.

### Pitfall 2: Inline style property name case sensitivity
**What goes wrong:** Filtering `'margin'` from `style="MARGIN: 0"` misses the blocked property.
**Why it happens:** CSS property names are case-insensitive but string comparison is not.
**How to avoid:** Normalize property names to lowercase before comparison: `prop.trim().toLowerCase()`.
**Warning signs:** Test case with uppercase property passes through when it should be stripped.

### Pitfall 3: Empty `style` attribute left on elements
**What goes wrong:** After filtering all properties, element gets `style=""` — not harmful but unclean.
**Why it happens:** Joining an empty array produces an empty string, which gets set as the attribute value.
**How to avoid:** After filtering, if the result is empty string, call `$(el).removeAttr('style')` instead of `$(el).attr('style', '')`.

### Pitfall 4: `strippedElements` vs `strippedProperties` confusion
**What goes wrong:** Phase 2 implements Naver which has `strippedElements: []` — no element removal needed. Future phases (Gmail) may use `strippedElements`. Don't conflate the two operations.
**How to avoid:** Guard with `if (ruleset.strippedElements.length > 0)` before element removal loop.

### Pitfall 5: `allowedInlineProperties` allow-list not needed for Phase 2
**What goes wrong:** Implementing allow-list enforcement (`allowedInlineProperties` is the whitelist of permitted properties) when Naver's value is `null` — `null` means "no allow-list, only block-list applies."
**How to avoid:** Only apply allow-list logic if `ruleset.allowedInlineProperties !== null`. For Phase 2, this path will not execute.

---

## Code Examples

### Complete engine skeleton (verified pattern)
```typescript
// lib/engine/applyClientRules.ts
// Source: Context7 cheeriojs/cheerio + project conventions
import * as cheerio from 'cheerio'
import type { ClientRuleset } from '@/lib/rulesets/types'

function filterInlineStyle(styleValue: string, blocked: ReadonlyArray<string>): string {
  const blockedSet = new Set(blocked.map(p => p.toLowerCase()))
  const result = styleValue
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(decl => {
      const colonIdx = decl.indexOf(':')
      if (colonIdx === -1) return false
      const prop = decl.slice(0, colonIdx).trim().toLowerCase()
      return !blockedSet.has(prop)
    })
    .join('; ')
  return result
}

export function applyClientRules(html: string, ruleset: ClientRuleset): string {
  const $ = cheerio.load(html, { decodeEntities: false })

  // 1. Strip <style> elements
  if (ruleset.stripHeadStyles) {
    $('style').remove()
  }

  // 2. Remove blocked elements
  for (const tag of ruleset.strippedElements) {
    $(tag).remove()
  }

  // 3. Filter blocked inline properties
  if (ruleset.strippedProperties.length > 0) {
    $('[style]').each((_, el) => {
      const original = $(el).attr('style') ?? ''
      const filtered = filterInlineStyle(original, ruleset.strippedProperties)
      if (filtered) {
        $(el).attr('style', filtered)
      } else {
        $(el).removeAttr('style')
      }
    })
  }

  // 4. Apply allow-list (only if non-null)
  if (ruleset.allowedInlineProperties !== null) {
    const allowed = new Set(ruleset.allowedInlineProperties.map(p => p.toLowerCase()))
    $('[style]').each((_, el) => {
      const original = $(el).attr('style') ?? ''
      const filtered = filterInlineStyle(original, [
        ...Array.from(allowed).map(p => `not-${p}`), // invert logic for allow-list
      ])
      // NOTE: allow-list logic is inverted — keep only allowed props
      // Implement properly in Phase 3/4 when needed
      void filtered
    })
  }

  return $.html()
}
```

### Test case skeleton (Vitest, following schema.test.ts pattern)
```typescript
// __tests__/engine/applyClientRules.test.ts
import { describe, it, expect } from 'vitest'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import { naverRuleset } from '@/lib/rulesets/naver'

describe('applyClientRules — naverRuleset', () => {
  describe('SIM-01: <style> stripping', () => {
    it('removes <style> blocks from <head>', () => {
      const input = '<html><head><style>body{color:red}</style></head><body>hi</body></html>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('<style>')
    })

    it('removes <style> blocks from <body>', () => {
      const input = '<body><style>.foo{color:red}</style><p>hi</p></body>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('<style>')
    })
  })

  describe('SIM-01: inline property filtering', () => {
    it('strips margin from inline style', () => {
      const input = '<p style="margin: 10px; color: red;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('margin')
      expect(result).toContain('color: red')
    })

    it('strips padding from inline style', () => {
      const input = '<td style="padding: 10px; font-size: 14px;">cell</td>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('padding')
      expect(result).toContain('font-size: 14px')
    })

    it('removes style attr when all properties stripped', () => {
      const input = '<p style="margin: 0; padding: 0;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('style=')
    })
  })

  describe('SIM-01: identity case', () => {
    it('does not alter inline-safe CSS', () => {
      const input = '<p style="color: red; font-size: 14px;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).toContain('color: red')
      expect(result).toContain('font-size: 14px')
    })
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| juice/client for CSS inlining | Direct DOM manipulation with cheerio | Phase 2 decision (D-02) | Removes unverified Next.js 16 webpack dependency |
| Full CSS parser (postcss) for inline style parsing | `split(';')` flat declaration parsing | This phase | Appropriate for inline style attribute values (no selectors) |

**Deprecated/outdated:**
- `juice/client`: Flagged in STATE.md as unverified with Next.js 16 webpack. Decision locked to direct implementation.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `strippedProperties: ['margin', 'padding', 'font-family']` accurately reflects what Naver strips from inline styles | Standard Stack / Code Examples | EmailOnAcid testing (2024) suggests these properties actually render correctly in Naver inline. If wrong, the simulation will incorrectly strip valid properties, showing users a distorted preview. The engine architecture is unaffected — only the data file needs updating. |
| A2 | cheerio `{ decodeEntities: false }` preserves HTML entities in email content without corruption | Code Examples | LOW risk — this is documented cheerio behavior [CITED: cheeriojs/cheerio README] |
| A3 | `$('style').remove()` in cheerio removes both `<head>` and `<body>` style elements | Architecture Patterns | LOW risk — cheerio selects across the full document tree |

**Note on A1:** The current `naver.ts` provenance says "webmail-inspection + community reports" — the inline-style block list was hand-curated. Research could not find a primary source (official Naver docs or verified test matrix) confirming margin/padding/font-family are stripped from inline styles. EmailOnAcid's Naver article explicitly states "all the usual spacing methods" (which includes margin/padding) work in Naver inline CSS. This needs user validation or live Naver webmail testing before the property list is treated as authoritative.

---

## Open Questions (RESOLVED)

1. **Are margin, padding, and font-family actually stripped from Naver inline styles?**
   - What we know: EmailOnAcid says Naver supports "all the usual spacing methods" inline. The current naver.ts list came from webmail inspection (provenance notes say approximate).
   - What's unclear: Whether there are specific contexts (certain HTML tags, email types) where Naver strips these, or if the block list is overly conservative.
   - RESOLVED: Per locked decision D-04, start with the current list `['margin', 'padding', 'font-family']`. The engine is data-driven — correcting the list requires only editing `naver.ts`, no code change. Flag as known approximation in Phase 10 confidence badge.

2. **Does Naver strip `<style>` from `<body>` as well as `<head>`?**
   - What we know: Most sources describe stripping `<style>` "from the header." It is common for webmail to strip all `<style>` regardless of position.
   - RESOLVED: `$('style').remove()` removes all `<style>` elements regardless of position — the safer default. If live testing reveals body `<style>` is preserved, scope with `$('head > style').remove()`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | DOM parser (server-side) | ✓ | v23.3.0 | — |
| pnpm | Package install | ✓ | 9.15.1 | — |
| vitest | Unit testing | ✓ | ^4.1.5 | — |
| cheerio | HTML parsing | ✗ (not yet installed) | 1.2.0 on npm | linkedom or parse5 |

**Missing dependencies with no fallback:** None — cheerio install is a single `pnpm add cheerio`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 |
| Config file | `vitest.config.ts` (exists, `environment: 'node'`) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIM-01 | `<style>` block removed from output | unit | `pnpm test` | ❌ Wave 0 |
| SIM-01 | `margin` stripped from inline style | unit | `pnpm test` | ❌ Wave 0 |
| SIM-01 | `padding` stripped from inline style | unit | `pnpm test` | ❌ Wave 0 |
| SIM-01 | Inline-safe properties pass through unchanged | unit | `pnpm test` | ❌ Wave 0 |
| SIM-01 | Pure function: same input always same output | unit | `pnpm test` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `__tests__/engine/applyClientRules.test.ts` — covers all SIM-01 behaviors
- [ ] `lib/engine/applyClientRules.ts` — engine implementation file

*(Framework and config already set up; no new infra needed)*

---

## Security Domain

This phase is a pure string transformation function with no network I/O, authentication, database access, or user credential handling. No ASVS categories apply.

The only relevant concern is XSS — but since `applyClientRules` is a simulation engine (not a sanitizer), it is not responsible for XSS prevention. The caller (Phase 6 server component) renders the output in a sandboxed iframe with `srcdoc`. This is noted here so the planner does not add sanitization requirements to this phase.

---

## Project Constraints (from CLAUDE.md)

The project's `CLAUDE.md` references `AGENTS.md` which states:

> This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

**Impact on Phase 2:** The engine (`lib/engine/applyClientRules.ts`) is a plain Node.js module with zero Next.js API usage. This constraint does not affect engine implementation. It applies to Phase 6 (API route / Server Component integration).

**Other constraints (from CONVENTIONS.md):**
- TypeScript strict mode — all types explicit
- `@/*` path alias for imports
- `import type` for type-only imports
- Vitest for tests
- camelCase for function names, PascalCase for types/interfaces

---

## Sources

### Primary (HIGH confidence)
- [cheeriojs/cheerio Context7 docs] — `cheerio.load()`, `$().remove()`, `$().attr()`, `$.html()` API verified
- [npm registry] — cheerio 1.2.0, linkedom 0.18.12, parse5 8.0.1 versions verified
- `lib/rulesets/types.ts` — `ClientRuleset` interface verified from codebase
- `lib/rulesets/naver.ts` — `naverRuleset` constants verified from codebase
- `vitest.config.ts` — test environment confirmed as `'node'`

### Secondary (MEDIUM confidence)
- [emailonacid.com/naver-webmail-testing](https://www.emailonacid.com/blog/article/email-development/naver-webmail-testing-what-you-need-to-know/) — Naver strips `<style>`, inline CSS (including margin/padding) works

### Tertiary (LOW confidence — needs validation)
- `naver.ts` provenance notes: "webmail-inspection + community reports" — `strippedProperties` list is approximate [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Engine API and architecture: HIGH — locked decisions, existing `ClientRuleset` interface is clear
- cheerio library selection: HIGH — verified version, API confirmed via Context7
- Naver `strippedProperties` list accuracy: LOW — EmailOnAcid contradicts the assumption; user validation needed
- Test structure: HIGH — mirrors existing `schema.test.ts` pattern, Vitest already configured

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (stable domain; cheerio API unlikely to change)
