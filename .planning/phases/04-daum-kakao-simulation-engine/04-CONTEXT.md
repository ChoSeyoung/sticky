# Phase 4: Daum/Kakao Simulation Engine - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Daum/Kakao Mail simulation engine using the existing `applyClientRules` function with `daumRuleset`. The ruleset already exists from Phase 1 with `confidence: 'estimated'` and conservative settings (strip `<style>`, remove script/iframe/object/embed elements). Phase 4 adds unit tests proving the engine correctly applies these rules, completing SIM-02.

No UI — just engine tests validating the existing ruleset behavior.

</domain>

<decisions>
## Implementation Decisions

### Engine Reuse
- **D-01:** No engine code changes needed — `daumRuleset` already uses `stripHeadStyles: true` and `strippedElements: ['script', 'iframe', 'object', 'embed']`, which the existing `applyClientRules` already handles from Phase 2.
- **D-02:** Focus is on writing comprehensive unit tests that document the assumed restrictions and prove the engine handles them correctly.

### Daum/Kakao Ruleset Accuracy
- **D-03:** Accept current conservative baseline as-is. The `estimated` confidence and provenance notes already communicate uncertainty. No ruleset data changes in this phase.

### Claude's Discretion
- Test case design and organization
- Whether to add any edge case tests beyond the standard patterns

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/engine/applyClientRules.ts` — Engine already handles stripHeadStyles and strippedElements
- `lib/rulesets/daum.ts` — Daum ruleset constant with estimated confidence
- `__tests__/engine/applyClientRules.test.ts` — Naver and Gmail test patterns to follow

### Established Patterns
- TDD: RED → GREEN → REFACTOR
- cheerio DOM parsing with `{ decodeEntities: false }`
- Pure function: `applyClientRules(html, ruleset): string`

### Integration Points
- Phase 6 will call `applyClientRules(html, daumRuleset)` from server component
- Phase 10 will display `estimated` confidence badge on the Daum preview pane

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

*Phase: 04-daum-kakao-simulation-engine*
*Context gathered: 2026-04-24*
