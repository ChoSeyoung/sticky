# Phase 2: Naver Simulation Engine - Pattern Map

**Mapped:** 2026-04-23
**Files analyzed:** 2 (1 engine implementation + 1 test file)
**Analogs found:** 2 / 2

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `lib/engine/applyClientRules.ts` | utility / transform | transform (string-in, string-out) | `lib/rulesets/naver.ts` | partial (same lib/ tier, same `import type` convention, same `as const` pattern — different responsibility) |
| `__tests__/engine/applyClientRules.test.ts` | test | request-response (input → expected output assertions) | `__tests__/rulesets/schema.test.ts` | exact (same test framework, same describe/it nesting, same import aliases, same Vitest import style) |

---

## Pattern Assignments

### `lib/engine/applyClientRules.ts` (utility, transform)

**Analog:** `lib/rulesets/naver.ts`

The engine file has no close structural analog in the codebase (no other transform functions exist). The analog below covers the conventions that must be applied: `import type` for type-only imports, `@/` path alias, named exports, no default exports, TypeScript strict mode.

**Imports pattern** — copy from `lib/rulesets/naver.ts` lines 1-1:
```typescript
import type { ClientRuleset } from './types'
```

Adapt for the engine file:
```typescript
import * as cheerio from 'cheerio'
import type { ClientRuleset } from '@/lib/rulesets/types'
```

Key conventions:
- `import type` for type-only imports (enforced by strict TypeScript + CONVENTIONS.md)
- `@/*` path alias for imports from outside the local directory
- Relative imports (`'./types'`) only when the target is in the same directory
- Named export (`export function applyClientRules`), no default export (lib utilities use named exports per Phase 1 pattern)

**Core transform pattern** — derived from RESEARCH.md code examples (no existing codebase analog; use the verified skeleton):
```typescript
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

  // 4. Apply allow-list (only if non-null — not active for Naver)
  if (ruleset.allowedInlineProperties !== null) {
    // Phase 3/4 will implement this branch
  }

  return $.html()
}
```

**Helper function pattern** — inline style filtering, derived from RESEARCH.md:
```typescript
function filterInlineStyle(styleValue: string, blocked: ReadonlyArray<string>): string {
  const blockedSet = new Set(blocked.map(p => p.toLowerCase()))
  return styleValue
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
}
```

**Error handling pattern:**
No try/catch required. This is a pure string→string transform with no I/O, no network, no async. TypeScript strict mode and input type `string` are the only guards needed. Callers in Phase 6 (server component / API route) handle their own error boundaries.

**No analog for:** Internal pipeline structure. The file has a single exported function and one private helper. Follow CONVENTIONS.md: minimal, self-documenting, no JSDoc unless non-obvious behavior needs documentation.

---

### `__tests__/engine/applyClientRules.test.ts` (test, request-response)

**Analog:** `__tests__/rulesets/schema.test.ts`

**Imports pattern** — copy from `__tests__/rulesets/schema.test.ts` lines 1-5:
```typescript
import { describe, it, expect } from 'vitest'
import { naverRuleset } from '@/lib/rulesets/naver'
import { gmailRuleset } from '@/lib/rulesets/gmail'
import { daumRuleset } from '@/lib/rulesets/daum'
import type { ClientRuleset, Provenance } from '@/lib/rulesets/types'
```

Adapt for the engine test:
```typescript
import { describe, it, expect } from 'vitest'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import { naverRuleset } from '@/lib/rulesets/naver'
```

**Test structure pattern** — copy from `__tests__/rulesets/schema.test.ts` lines 28-52:
```typescript
describe('ClientRuleset schema', () => {
  rulesets.forEach(({ name, ruleset }) => {
    describe(name, () => {
      REQUIRED_FIELDS.forEach((field) => {
        it(`has required field: ${field}`, () => {
          expect(ruleset).toHaveProperty(field)
        })
      })
    })
  })
})
```

Adapt for engine tests: use nested `describe` blocks to group by behavior category (not data-driven forEach), with explicit `it` strings matching the SIM-01 requirement language:
```typescript
describe('applyClientRules — naverRuleset', () => {
  describe('SIM-01: <style> stripping', () => {
    it('removes <style> blocks from <head>', () => { ... })
    it('removes <style> blocks from <body>', () => { ... })
  })

  describe('SIM-01: inline property filtering', () => {
    it('strips margin from inline style', () => { ... })
    it('strips padding from inline style', () => { ... })
    it('strips font-family from inline style', () => { ... })
    it('removes style attr when all properties stripped', () => { ... })
    it('handles case-insensitive property names (MARGIN)', () => { ... })
  })

  describe('SIM-01: passthrough (identity cases)', () => {
    it('does not alter inline-safe CSS properties', () => { ... })
    it('preserves &nbsp; and HTML entities', () => { ... })
    it('is a pure function — same input same output', () => { ... })
  })
})
```

**Assertion pattern** — copy from `__tests__/rulesets/schema.test.ts` lines 44-51 (positive + negative assertions):
```typescript
it('daum ruleset has confidence: estimated', () => {
  expect(daumRuleset.confidence).toBe('estimated')
})
```

Adapt for engine: use `toContain` / `not.toContain` for HTML string assertions:
```typescript
it('strips margin from inline style', () => {
  const input = '<p style="margin: 10px; color: red;">text</p>'
  const result = applyClientRules(input, naverRuleset)
  expect(result).not.toContain('margin')
  expect(result).toContain('color: red')
})
```

**Vitest config — no changes needed.** `vitest.config.mts` already uses `environment: 'node'` and `tsconfigPaths()` plugin (resolves `@/` alias). No new config required.

---

## Shared Patterns

### Import style
**Source:** `lib/rulesets/naver.ts` line 1, `__tests__/rulesets/schema.test.ts` lines 1-5
**Apply to:** Both new files
```typescript
// Type-only imports use `import type`
import type { ClientRuleset } from '@/lib/rulesets/types'

// Value imports use regular import
import { naverRuleset } from '@/lib/rulesets/naver'
```

### Path alias usage
**Source:** `__tests__/rulesets/schema.test.ts` lines 2-5
**Apply to:** Both new files
- Use `@/` for any import that crosses directory boundaries (from `__tests__/` into `lib/`, or from `lib/engine/` into `lib/rulesets/`)
- Use relative `'./filename'` only for imports within the same directory

### Named exports (no defaults)
**Source:** `lib/rulesets/naver.ts` line 3, `lib/rulesets/index.ts`
**Apply to:** `lib/engine/applyClientRules.ts`
```typescript
// lib/rulesets/naver.ts pattern
export const naverRuleset: ClientRuleset = { ... } as const

// Engine: use named export function
export function applyClientRules(html: string, ruleset: ClientRuleset): string { ... }
```

### TypeScript explicit types
**Source:** `lib/rulesets/types.ts` (all fields typed), `lib/rulesets/naver.ts` line 3
**Apply to:** `lib/engine/applyClientRules.ts`
- All function parameters must have explicit type annotations
- Return type must be annotated explicitly on exported functions: `): string`
- Use `ReadonlyArray<string>` for parameters that should not be mutated

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `lib/engine/applyClientRules.ts` (core logic) | utility | transform | No existing transform/processing functions in the codebase. All `lib/` code so far is static data (rulesets). Engine logic must follow RESEARCH.md patterns + conventions from analog rulesets files. |

---

## Metadata

**Analog search scope:** `lib/`, `__tests__/`, `vitest.config.mts`, `.planning/codebase/CONVENTIONS.md`
**Files scanned:** 8 (`lib/rulesets/types.ts`, `lib/rulesets/naver.ts`, `lib/rulesets/gmail.ts`, `lib/rulesets/daum.ts`, `lib/rulesets/index.ts`, `__tests__/rulesets/schema.test.ts`, `vitest.config.mts`, `.planning/codebase/CONVENTIONS.md`)
**Pattern extraction date:** 2026-04-23
