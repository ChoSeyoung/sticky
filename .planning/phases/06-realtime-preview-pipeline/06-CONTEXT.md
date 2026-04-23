# Phase 6: Real-time Preview Pipeline - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Debounced editor→engine→iframe data flow. When the user edits HTML in the Monaco editor, the content is transformed through `applyClientRules` and rendered in a sandboxed `<iframe srcdoc>`. The preview updates within ~300ms via debounce. Phase 6 implements the pipeline for a single client (Naver) first — Phase 7 fans out to all clients.

</domain>

<decisions>
## Implementation Decisions

### Pipeline Architecture
- **D-01:** Client-side pipeline — run `applyClientRules` directly in the browser. Cheerio works in Node.js; for client-side, use the engine in a client component. If cheerio doesn't bundle for client, use a Next.js API route or Server Action.
- **D-02:** Debounce HTML changes with ~300ms delay before triggering simulation. Use a simple `setTimeout`/`clearTimeout` pattern or a `useDebouncedValue` hook.

### Preview Rendering
- **D-03:** Use `<iframe srcdoc={simulatedHtml}>` for preview rendering. srcdoc is the standard way to inject HTML into an iframe without a separate URL.
- **D-04:** Add `sandbox` attribute to iframe for basic security (full hardening in Phase 9).

### State Flow
- **D-05:** Editor's `html` state (from Phase 5 useState) → debounce → `applyClientRules(html, naverRuleset)` → `simulatedHtml` state → iframe srcdoc. All in the same client component tree.

### Claude's Discretion
- Whether to run engine client-side or via API route
- Debounce implementation (custom hook vs inline)
- Preview component design and styling

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/page.tsx` — Has `const [html, setHtml] = useState<string>(DEFAULT_HTML)` — the source
- `lib/engine/applyClientRules.ts` — Engine function to call
- `lib/rulesets/naver.ts` — naverRuleset for first preview

### Established Patterns
- 'use client' components with dynamic imports
- Flex layout filling viewport
- Tailwind CSS for styling

### Integration Points
- Phase 7 will add multiple preview panes (Gmail, Daum) alongside the Naver pane
- Phase 8 will add viewport toggle to each pane
- Phase 9 will harden the iframe sandbox attributes

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

*Phase: 06-realtime-preview-pipeline*
*Context gathered: 2026-04-24*
