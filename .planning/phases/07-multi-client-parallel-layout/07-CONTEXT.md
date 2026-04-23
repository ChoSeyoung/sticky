# Phase 7: Multi-Client Parallel Layout - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor the single Naver preview pane into a multi-client grid showing Naver, Gmail, and Daum/Kakao side-by-side. Each pane runs its own simulation with the appropriate ruleset. The editor occupies the left side, the 3 preview panes stack or grid on the right. A drag handle between editor and preview areas allows resizing.

</domain>

<decisions>
## Implementation Decisions

### PreviewPane Generalization
- **D-01:** Refactor PreviewPane to accept `clientName` and `ruleset` as props instead of hardcoding naverRuleset. Each pane is an instance of the same component with different data.

### Layout
- **D-02:** Editor on left, preview grid on right. Preview panes stacked vertically (3 rows) within the right panel. Each pane has a client name label header.
- **D-03:** Resizable split between editor and preview via a drag handle. Use a simple drag implementation or a library like `react-resizable-panels`.

### Client Configuration
- **D-04:** Define a client config array: `[{ name: 'Naver Mail', ruleset: naverRuleset }, { name: 'Gmail', ruleset: gmailRuleset }, { name: 'Daum/Kakao Mail', ruleset: daumRuleset }]` — map over this to render preview panes.

### Claude's Discretion
- Resizable panel implementation approach
- Preview pane layout (vertical stack vs grid)
- Styling details

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/PreviewPane.tsx` — Current Naver-only preview (needs refactor to accept ruleset prop)
- `app/components/useDebounce.ts` — Debounce hook (reuse as-is)
- `lib/rulesets/naver.ts`, `lib/rulesets/gmail.ts`, `lib/rulesets/daum.ts` — All 3 rulesets ready
- `lib/engine/applyClientRules.ts` — Engine handles all 3 rulesets

### Integration Points
- Phase 8 will add viewport toggle to each pane
- Phase 10 will add confidence badges and disclaimers

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

*Phase: 07-multi-client-parallel-layout*
*Context gathered: 2026-04-24*
