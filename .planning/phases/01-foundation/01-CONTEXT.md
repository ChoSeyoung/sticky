# Phase 1: Foundation - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

TypeScript types, client ruleset data model, and provenance fields. This is the typed infrastructure that every simulation engine (Phases 2-4) builds on. No UI, no simulation logic — just the data contracts and initial ruleset constants for Naver, Gmail, and Daum/Kakao.

</domain>

<decisions>
## Implementation Decisions

### Ruleset granularity
- **D-01:** Minimal 6-axis `ClientRuleset` interface: `stripHeadStyles`, `allowedInlineProperties`, `strippedProperties`, `strippedElements`, `confidence`, `provenance`. Do not add speculative fields — extend the type in Phases 2-4 when actual simulation needs arise.
- **D-02:** Per-client list model — each client chooses the model that fits its behavior. Naver uses a blocklist (strip specific properties like `margin`), Gmail uses a conditional flag (all-or-nothing on `<style>` block), Daum/Kakao uses a conservative baseline. The type supports both allowlist and blocklist via optional fields rather than forcing one model.

### Provenance model
- **D-03:** Typed `Provenance` object with fields: `source` (URL or human-readable description), `method` (enum: `'official-docs' | 'webmail-inspection' | 'community-data' | 'inferred'`), `lastVerified` (ISO date string), and optional `notes` (string). No evidence links array — keep it auditable but not heavy.
- **D-04:** Confidence as a string enum: `'high' | 'medium' | 'estimated'`. Maps directly to the UI confidence badges in Phase 10. Naver and Gmail get `'high'`, Daum/Kakao gets `'estimated'`.

### Claude's Discretion
- File organization — where types and ruleset data files live (e.g., `lib/`, `app/lib/`, or a new `src/` layer)
- Testing framework choice (Vitest vs Jest) and test structure
- Exact naming of type fields and files
- Whether to use a barrel export pattern or direct imports

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above and the ROADMAP.md success criteria.

### Project context
- `.planning/ROADMAP.md` — Phase 1 success criteria define the 4 acceptance tests
- `.planning/REQUIREMENTS.md` — SIM-01, SIM-02, SIM-03 requirements that Phase 1 must enable
- `.planning/codebase/STACK.md` — Next.js 16.2.4, TypeScript 5.9.3, Tailwind CSS 4, pnpm
- `.planning/codebase/CONVENTIONS.md` — Naming patterns, import order, TypeScript strict mode

### Key project decisions
- `.planning/STATE.md` §Accumulated Context — caniemail.com has zero Korean client data; Naver/Daum rules must be hand-curated; Daum/Kakao confidence is "estimated" by design

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — fresh Next.js scaffold with only `app/page.tsx`, `app/layout.tsx`, and `app/globals.css`

### Established Patterns
- TypeScript strict mode enabled — all types must be explicit
- Path alias `@/*` maps to project root — use for imports
- No `src/` directory exists — code lives directly under project root or `app/`
- ESLint with Next.js core-web-vitals config active

### Integration Points
- Phases 2-4 will import `ClientRuleset` type and individual client ruleset constants
- Phase 6 will pass rulesets to `applyClientRules(html, ruleset)` engine functions
- Phase 10 will read `confidence` field for UI badge display

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-23*
