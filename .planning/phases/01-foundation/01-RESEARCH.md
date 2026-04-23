# Phase 1: Foundation - Research

**Researched:** 2026-04-23
**Domain:** TypeScript type definitions, const data modeling, Vitest test setup
**Confidence:** HIGH

## Summary

Phase 1 is a pure TypeScript data-contract phase. There is no runtime behavior, no UI, no simulation logic. The deliverables are: one `ClientRuleset` interface, one `Provenance` type, three client ruleset constants (Naver, Gmail, Daum/Kakao), and a schema test asserting field completeness.

The stack is entirely already installed — TypeScript 5.9.3 with strict mode, no extra dependencies for the types or ruleset data themselves. The only new dependency is the test framework (Vitest), which the official Next.js 16.2.4 documentation explicitly supports and documents.

File placement is the primary discretionary decision. The project has no `lib/` or `src/` layer yet — only `app/`. Standard Next.js App Router convention for shared non-UI utilities is a `lib/` directory at the project root, accessed via the `@/lib/` alias already configured in `tsconfig.json`.

**Primary recommendation:** Create `lib/rulesets/` for type definitions and per-client constants. Install Vitest per the official Next.js 16 guide. Write one schema test in `__tests__/rulesets/`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Minimal 6-axis `ClientRuleset` interface: `stripHeadStyles`, `allowedInlineProperties`, `strippedProperties`, `strippedElements`, `confidence`, `provenance`. Do not add speculative fields — extend the type in Phases 2-4 when actual simulation needs arise.

**D-02:** Per-client list model — each client chooses the model that fits its behavior. Naver uses a blocklist (strip specific properties like `margin`), Gmail uses a conditional flag (all-or-nothing on `<style>` block), Daum/Kakao uses a conservative baseline. The type supports both allowlist and blocklist via optional fields rather than forcing one model.

**D-03:** Typed `Provenance` object with fields: `source` (URL or human-readable description), `method` (enum: `'official-docs' | 'webmail-inspection' | 'community-data' | 'inferred'`), `lastVerified` (ISO date string), and optional `notes` (string). No evidence links array.

**D-04:** Confidence as a string enum: `'high' | 'medium' | 'estimated'`. Maps directly to the UI confidence badges in Phase 10. Naver and Gmail get `'high'`, Daum/Kakao gets `'estimated'`.

### Claude's Discretion

- File organization — where types and ruleset data files live (e.g., `lib/`, `app/lib/`, or a new `src/` layer)
- Testing framework choice (Vitest vs Jest) and test structure
- Exact naming of type fields and files
- Whether to use a barrel export pattern or direct imports

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `ClientRuleset` interface | Shared lib (TypeScript) | — | Pure type contract, no tier-specific concern |
| `Provenance` type | Shared lib (TypeScript) | — | Data annotation type, imported by any tier |
| Per-client ruleset constants | Shared lib (TypeScript) | — | Immutable data consumed by simulation engine (Phases 2-4) and UI (Phase 10) |
| Schema validation test | Test layer | — | Asserts structural contract, not runtime behavior |

This phase has no frontend/backend split. All output is shared TypeScript types and constants — flat file artifacts with no runtime tier boundary.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.9.3 (installed) | Type definitions, const assertions | Already in project; strict mode enforced |

### Supporting (Test Layer Only)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 4.1.5 | Unit test runner | Official Next.js 16 test framework of choice |
| @vitejs/plugin-react | 6.0.1 | React + JSX support for Vitest | Required for Next.js/React projects |
| vite-tsconfig-paths | 6.1.1 | Resolves `@/*` aliases in tests | Required so test imports mirror app imports |

**Version verification:** [VERIFIED: npm registry — 2026-04-23]
- `vitest`: 4.1.5
- `@vitejs/plugin-react`: 6.0.1
- `vite-tsconfig-paths`: 6.1.1

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Jest requires `ts-jest` transform config; Vitest is native TypeScript and officially documented in Next.js 16 guide |

**Installation (test dependencies only — no runtime deps needed for Phase 1):**
```bash
pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

## Architecture Patterns

### System Architecture Diagram

```
lib/rulesets/
  types.ts          ← ClientRuleset interface + Provenance type
  naver.ts          ← naverRuleset constant (confidence: 'high')
  gmail.ts          ← gmailRuleset constant (confidence: 'high')
  daum.ts           ← daumRuleset constant (confidence: 'estimated')
  index.ts          ← barrel export (optional)
  
__tests__/rulesets/
  schema.test.ts    ← asserts all required fields present on each constant

vitest.config.mts   ← test configuration (project root)
```

Data flow:
```
types.ts (ClientRuleset, Provenance)
    ↓ imported by
naver.ts / gmail.ts / daum.ts  (typed constants)
    ↓ imported by
Phase 2-4 simulation engines
Phase 10 UI confidence badges
    ↓ tested by
__tests__/rulesets/schema.test.ts
```

### Recommended Project Structure
```
lib/
└── rulesets/
    ├── types.ts        # ClientRuleset interface + Confidence + Provenance types
    ├── naver.ts        # naverRuleset: ClientRuleset = { ... }
    ├── gmail.ts        # gmailRuleset: ClientRuleset = { ... }
    ├── daum.ts         # daumRuleset: ClientRuleset = { ... }
    └── index.ts        # barrel: export * from './types'; export * from each client

__tests__/
└── rulesets/
    └── schema.test.ts  # schema completeness assertions

vitest.config.mts       # project root
```

No `src/` directory: the existing project uses `app/` for Next.js routes. Shared utilities live at the project root in named directories (consistent with `app/`, `public/`). Using `lib/` is the natural companion. [ASSUMED — convention, not enforced by Next.js 16]

### Pattern 1: Typed `const` assertions for ruleset constants

**What:** Declare ruleset constants with explicit type annotation to get compile-time validation.
**When to use:** Any time an immutable data record must satisfy a known interface.

```typescript
// Source: TypeScript handbook — const assertions + explicit typing
import type { ClientRuleset } from './types'

export const naverRuleset: ClientRuleset = {
  stripHeadStyles: true,
  allowedInlineProperties: null,    // allowlist not applicable — Naver uses blocklist
  strippedProperties: ['margin', 'padding', 'font-family'],
  strippedElements: [],
  confidence: 'high',
  provenance: {
    source: 'Naver Mail webmail inspection + community reports',
    method: 'webmail-inspection',
    lastVerified: '2026-04-23',
    notes: 'Naver strips <style> blocks and blocks certain inline properties'
  }
} as const
```

The `as const` assertion narrows string literals (prevents widening to `string`), which is important for the `confidence` and `method` enums. [VERIFIED: TypeScript docs — const assertions]

### Pattern 2: String literal union types for enums (no `enum` keyword)

**What:** Use string union types instead of TypeScript `enum` keyword.
**When to use:** Always, for data that crosses module or serialization boundaries.

```typescript
// Source: TypeScript handbook — string literal types
export type Confidence = 'high' | 'medium' | 'estimated'
export type ProvenanceMethod = 'official-docs' | 'webmail-inspection' | 'community-data' | 'inferred'
```

Using `enum` keyword in TypeScript introduces runtime artifacts (numeric mappings) and complicates tree-shaking. String unions are idiomatic modern TypeScript. [ASSUMED — community convention, not TypeScript spec requirement]

### Pattern 3: Optional vs. required fields for the dual-model (allowlist / blocklist)

Decision D-02 requires the interface to support both allowlist (`allowedInlineProperties`) and blocklist (`strippedProperties`) without forcing one model. The clean TypeScript approach:

```typescript
export interface ClientRuleset {
  // Behavior axes
  stripHeadStyles: boolean
  allowedInlineProperties: string[] | null  // null = no allowlist restriction
  strippedProperties: string[]               // empty = nothing blocked by name
  strippedElements: string[]

  // Audit fields
  confidence: Confidence
  provenance: Provenance
}
```

`null` is preferred over `undefined` for optional list fields when the field is always structurally present but may have no data — it makes the absence explicit. [ASSUMED — style decision consistent with strict null checks]

### Pattern 4: Vitest config for Next.js 16 (no React Testing Library needed for Phase 1)

Phase 1 has no React components. The schema test is pure TypeScript assertion logic. However, the config should be future-proof:

```typescript
// vitest.config.mts
// Source: Next.js 16 official docs — node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',   // Phase 1 tests are pure logic, no DOM needed
  },
})
```

`vite-tsconfig-paths` is required to resolve `@/*` aliases in test files. [VERIFIED: Next.js 16 official docs]

### Anti-Patterns to Avoid

- **TypeScript `enum` keyword:** Produces runtime artifacts. Use string literal unions.
- **`undefined` for absent list fields:** Prefer `null` — explicit absence is clearer under `strictNullChecks`.
- **Putting ruleset constants in `app/` directory:** Next.js routes live in `app/`. Placing shared data models there creates an architectural leakage — later phases would import simulation data from a routing layer.
- **One giant types file:** Don't bundle types and constants in the same file. Types in `types.ts`, constants in separate client files — enables clean tree-shaking and phased extension.
- **`as const` without explicit type annotation:** `as const` alone narrows the type but doesn't validate against the interface. Always annotate: `const x: ClientRuleset = { ... } as const`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TypeScript string enum | Custom string map object | String literal union type | Native TypeScript, no runtime overhead |
| Field presence assertion | Manual property-check loops | `expect(obj).toHaveProperty(key)` in Vitest | Built into Vitest's `expect` API |

**Key insight:** Phase 1 is intentionally minimal. The temptation is to add runtime validation (zod schemas, guard functions). Resist — Phases 2-4 will reveal what runtime validation is actually needed. Build only what the 4 success criteria require.

## Common Pitfalls

### Pitfall 1: `as const` widens confidence/method strings back to `string`
**What goes wrong:** Omitting `as const` means `confidence: 'high'` is typed as `string`, not `'high'`. TypeScript strict mode won't catch this if the property type is `Confidence` (union) rather than `'high'` (literal).
**Why it happens:** TypeScript infers the narrowest literal type only with `as const` or explicit literal annotation.
**How to avoid:** Use `const x: ClientRuleset = { ... } as const` pattern consistently.
**Warning signs:** IntelliSense shows `confidence: string` instead of `confidence: 'high'`.

### Pitfall 2: `@/*` path alias not resolving in Vitest tests
**What goes wrong:** Tests that `import { ClientRuleset } from '@/lib/rulesets/types'` fail with "Cannot resolve module" even though app code works fine.
**Why it happens:** Vitest uses Vite's module resolver, which doesn't read `tsconfig.json` path aliases by default.
**How to avoid:** Include `vite-tsconfig-paths` plugin in `vitest.config.mts` — this is explicitly required by the official Next.js 16 Vitest guide.
**Warning signs:** `Error: Failed to resolve import "@/lib/rulesets/types"` in test output.

### Pitfall 3: Ruleset constants placed in `app/` violate Next.js routing conventions
**What goes wrong:** Files under `app/` are treated as routes or route segments by Next.js App Router. A `app/lib/rulesets/types.ts` file may trigger unexpected route behavior or at minimum creates semantic confusion.
**Why it happens:** Developers accustomed to Next.js Pages Router placing utilities anywhere.
**How to avoid:** Place non-route code in `lib/` at the project root, not inside `app/`.

### Pitfall 4: Daum/Kakao confidence labeled incorrectly
**What goes wrong:** Developer marks `daumRuleset` with `confidence: 'medium'` intending to communicate partial certainty.
**Why it happens:** `'medium'` feels like the right midpoint, but the project decision (D-04 + STATE.md) explicitly assigns `'estimated'` to Daum/Kakao and maps it to a specific UI badge in Phase 10.
**How to avoid:** Follow D-04 exactly — `'estimated'` is the correct value. The provenance `notes` field carries the explanation.

## Code Examples

### Full `types.ts`

```typescript
// Source: D-01 through D-04 in 01-CONTEXT.md (locked decisions)
export type Confidence = 'high' | 'medium' | 'estimated'

export type ProvenanceMethod =
  | 'official-docs'
  | 'webmail-inspection'
  | 'community-data'
  | 'inferred'

export interface Provenance {
  source: string
  method: ProvenanceMethod
  lastVerified: string   // ISO date string, e.g. '2026-04-23'
  notes?: string
}

export interface ClientRuleset {
  stripHeadStyles: boolean
  allowedInlineProperties: string[] | null
  strippedProperties: string[]
  strippedElements: string[]
  confidence: Confidence
  provenance: Provenance
}
```

### Schema test pattern

```typescript
// Source: Vitest docs — /vitest-dev/vitest; pattern is standard Jest-compatible assertion
import { describe, it, expect } from 'vitest'
import { naverRuleset } from '@/lib/rulesets/naver'
import { gmailRuleset } from '@/lib/rulesets/gmail'
import { daumRuleset } from '@/lib/rulesets/daum'
import type { ClientRuleset } from '@/lib/rulesets/types'

const REQUIRED_FIELDS: (keyof ClientRuleset)[] = [
  'stripHeadStyles',
  'allowedInlineProperties',
  'strippedProperties',
  'strippedElements',
  'confidence',
  'provenance',
]

const REQUIRED_PROVENANCE_FIELDS: (keyof import('@/lib/rulesets/types').Provenance)[] = [
  'source',
  'method',
  'lastVerified',
]

const rulesets = [
  { name: 'naver', ruleset: naverRuleset },
  { name: 'gmail', ruleset: gmailRuleset },
  { name: 'daum', ruleset: daumRuleset },
]

describe('ClientRuleset schema', () => {
  rulesets.forEach(({ name, ruleset }) => {
    describe(name, () => {
      REQUIRED_FIELDS.forEach((field) => {
        it(`has required field: ${field}`, () => {
          expect(ruleset).toHaveProperty(field)
        })
      })

      REQUIRED_PROVENANCE_FIELDS.forEach((field) => {
        it(`provenance has required field: ${field}`, () => {
          expect(ruleset.provenance).toHaveProperty(field)
        })
      })
    })
  })

  it('daum ruleset has confidence: estimated', () => {
    expect(daumRuleset.confidence).toBe('estimated')
  })

  it('daum ruleset provenance has notes field', () => {
    expect(daumRuleset.provenance.notes).toBeDefined()
  })
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TypeScript `enum` keyword | String literal union types | ~TS 2.4+ | No runtime artifacts, cleaner serialization |
| Jest for TS projects | Vitest | 2022+ (Vite ecosystem) | Native ESM/TS support, no transform config needed |
| Manual null checks | `strictNullChecks: true` in tsconfig | TS 2.0+ | Compiler-enforced null safety |

**Deprecated/outdated:**
- `ts-jest`: heavy transform layer for Jest; replaced by Vitest in modern Next.js projects. Official Next.js 16 guide documents Vitest, not Jest.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `lib/` at project root is the correct location for shared non-UI utilities | Architecture Patterns | Low — alternative is `app/lib/` but that risks route confusion; easy to move |
| A2 | `null` preferred over `undefined` for absent list fields | Pattern 3 | Low — cosmetic; either works under strict null checks |
| A3 | String literal union preferred over `enum` keyword | Pattern 2 | Low — both compile; convention only |
| A4 | Barrel `index.ts` export is optional | Standard Stack | Low — downstream phases can choose direct imports |

## Open Questions

1. **Naver `strippedProperties` exact list**
   - What we know: Naver blocks `margin` and related layout properties (from hand-curation; caniemail.com has no Korean data)
   - What's unclear: The exhaustive property blocklist is not documented — it must be approximated
   - Recommendation: Use a conservative well-documented baseline for v1; annotate in provenance `notes` that the list is approximate. Phase 2 (Naver simulation) can refine it during testing.

2. **Gmail `stripHeadStyles` conditionality**
   - What we know: Gmail's `<style>` stripping is version/context-dependent (strips in some Gmail UI variants, not others)
   - What's unclear: Whether to model this as a boolean or a more nuanced flag
   - Recommendation: For Phase 1, use `stripHeadStyles: true` with a provenance note. Phase 3 (Gmail simulation) owns the behavioral nuance. The interface should not be over-engineered here.

## Environment Availability

Step 2.6: SKIPPED for type definitions and ruleset constants (no external runtime dependencies). Vitest install is a dev-dependency install only — no service availability probe needed.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| TypeScript | Types, ruleset constants | Already installed | 5.9.3 | — |
| vitest | Schema test | Not installed | — (4.1.5 on npm) | Jest (not preferred) |
| @vitejs/plugin-react | vitest.config.mts | Not installed | — (6.0.1 on npm) | Omit if test env is `node` only |
| vite-tsconfig-paths | @/* alias resolution in tests | Not installed | — (6.1.1 on npm) | Manual path rewrite in config |

**Missing dependencies with no fallback:**
- None — everything has install path or is already present.

**Missing dependencies with fallback:**
- `vite-tsconfig-paths`: if omitted, test imports must use relative paths instead of `@/` alias. Prefer installing it.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (to be installed) |
| Config file | `vitest.config.mts` (Wave 0 — does not exist yet) |
| Quick run command | `pnpm vitest run __tests__/rulesets/schema.test.ts` |
| Full suite command | `pnpm vitest run` |

### Phase Requirements → Test Map

Phase 1 has no formal requirement IDs (it is a foundational prerequisite). The 4 success criteria from the roadmap map as follows:

| Success Criterion | Behavior | Test Type | Automated Command |
|-------------------|----------|-----------|-------------------|
| SC-1: `ClientRuleset` compiles | All 6 axes present, strict TS passes | compile (tsc --noEmit) | `pnpm tsc --noEmit` |
| SC-2: Naver, Gmail, Daum files exist and import cleanly | Import without error | unit | `pnpm vitest run __tests__/rulesets/schema.test.ts` |
| SC-3: Daum has `confidence: 'estimated'` and provenance notes | Correct field values | unit | included in schema test |
| SC-4: Schema test asserts all required fields | Test file exists and passes | unit | `pnpm vitest run __tests__/rulesets/schema.test.ts` |

### Sampling Rate
- **Per task commit:** `pnpm tsc --noEmit`
- **Per wave merge:** `pnpm vitest run`
- **Phase gate:** Both green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.mts` — does not exist; must be created in Wave 0
- [ ] `__tests__/rulesets/schema.test.ts` — does not exist; must be created alongside constants
- [ ] Install vitest dev deps: `pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths`

## Security Domain

Phase 1 has no network I/O, authentication, user input, cryptography, or external service calls. It is pure TypeScript type declarations and immutable constant data. ASVS categories V2–V6 do not apply.

No security requirements for this phase.

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` — official Next.js 16.2.4 Vitest setup guide (confirmed in project)
- `/vitest-dev/vitest` (Context7) — Vitest configuration patterns
- `tsconfig.json` (project file) — confirmed strict mode, `@/*` alias, ES2017 target
- `.planning/phases/01-foundation/01-CONTEXT.md` — locked decisions D-01 through D-04

### Secondary (MEDIUM confidence)
- npm registry — verified package versions for vitest (4.1.5), @vitejs/plugin-react (6.0.1), vite-tsconfig-paths (6.1.1) on 2026-04-23

### Tertiary (LOW confidence)
- `lib/` directory placement convention — assumed from Next.js community patterns, not enforced by framework
- String union over `enum` keyword preference — community convention, not TypeScript spec

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — TypeScript version verified in project; Vitest version verified on npm registry
- Architecture: HIGH — types + constants pattern is well-established TypeScript; file placement is ASSUMED
- Pitfalls: HIGH — compiler behavior pitfalls verified against TypeScript spec; Vitest path alias pitfall verified in official Next.js docs
- Test patterns: HIGH — taken directly from official Next.js 16 Vitest guide

**Research date:** 2026-04-23
**Valid until:** 2026-07-23 (stable — TypeScript and Vitest evolve slowly at this tier)
