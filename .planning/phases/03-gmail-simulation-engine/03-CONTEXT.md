# Phase 3: Gmail Simulation Engine - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Gmail simulation engine extending `applyClientRules` to handle Gmail's conditional `<style>` block behavior. Gmail inspects `<style>` block content — if any disallowed CSS property or value is found (e.g., `background-image: url()`), the ENTIRE `<style>` block is stripped. If the block contains only allowed properties, it is retained intact. This is the "all-or-nothing" behavior described in SIM-03.

No UI — just engine extension and unit tests.

</domain>

<decisions>
## Implementation Decisions

### Gmail `<style>` Block Behavior
- **D-01:** Extend `ClientRuleset` with a `gmailStyleBlockBehavior` or equivalent field that models conditional `<style>` stripping. The field should contain a list of disallowed CSS patterns (property names, value patterns like `url(`) that trigger full block removal.
- **D-02:** When `stripHeadStyles` is true AND no conditional behavior is configured, behavior remains unchanged (strip all — Naver backward compat).
- **D-03:** When conditional behavior IS configured, engine parses each `<style>` block's CSS text, checks against disallowed patterns, and strips the entire block only if a match is found.

### Gmail Disallowed CSS Patterns
- **D-04:** Start with known Gmail block-killers: `background-image: url()`, `@import`, `position: fixed/absolute`, `expression()`. This list is data-driven and extensible via the ruleset file.

### Engine Extension Strategy
- **D-05:** Extend the existing `applyClientRules` function in `lib/engine/applyClientRules.ts` — do NOT create a separate Gmail engine. Add a conditional branch for the new ruleset field.
- **D-06:** Update `gmailRuleset` in `lib/rulesets/gmail.ts` with the new field. Update `ClientRuleset` type in `lib/rulesets/types.ts` with the optional new field.

### Claude's Discretion
- Exact field name and type for the conditional behavior config
- CSS parsing approach for `<style>` block inspection (regex on raw text vs proper CSS parser)
- Test case design and coverage specifics

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/engine/applyClientRules.ts` — Phase 2 engine with cheerio, filterInlineStyle helper
- `lib/rulesets/types.ts` — ClientRuleset interface (needs extension)
- `lib/rulesets/gmail.ts` — Gmail ruleset constant (needs update)
- `__tests__/engine/applyClientRules.test.ts` — Existing test patterns

### Established Patterns
- cheerio for DOM parsing with `{ decodeEntities: false }`
- Pure function pattern: `applyClientRules(html, ruleset): string`
- TDD: RED (failing tests) → GREEN (implementation) → REFACTOR
- Vitest with `@/` path alias imports

### Integration Points
- Phase 4 (Daum/Kakao) will use same `applyClientRules` interface
- Phase 6 will call engine from server component/API route

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

*Phase: 03-gmail-simulation-engine*
*Context gathered: 2026-04-24*
