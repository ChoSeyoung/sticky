# Phase 5: Code Editor - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Monaco editor component for writing/pasting HTML email code. Must support syntax highlighting, preserve content exactly on paste (no mangling), and avoid SSR errors via dynamic import. This is the left-side panel of the split-pane layout.

</domain>

<decisions>
## Implementation Decisions

### Editor Library
- **D-01:** Use Monaco Editor via `@monaco-editor/react` package — industry standard, full HTML language support, IntelliSense, paste fidelity.
- **D-02:** Dynamic import with `ssr: false` or `next/dynamic` to prevent SSR errors — Monaco requires browser APIs.

### Editor Configuration
- **D-03:** Default language: HTML. Enable word wrap, minimap off (email HTML is typically short), auto-closing tags.
- **D-04:** Editor should fill its container height (flex layout). No fixed pixel heights.

### State Management
- **D-05:** Editor content managed via React state (`useState`). onChange callback updates state. This state will be consumed by Phase 6 (preview pipeline) via props or context.

### Claude's Discretion
- Component file location (e.g., `app/components/Editor.tsx` or `components/Editor.tsx`)
- Exact Monaco options and theme
- Whether to use a wrapper component or direct `@monaco-editor/react`

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/layout.tsx` — Root layout
- `app/page.tsx` — Main page (will host the editor)
- `app/globals.css` — Global styles with Tailwind

### Established Patterns
- Next.js 16 with App Router
- React 19
- Tailwind CSS 4
- TypeScript strict mode

### Integration Points
- Phase 6 will consume editor content for preview pipeline
- Phase 7 will place editor in split-pane layout alongside preview panels

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

*Phase: 05-code-editor*
*Context gathered: 2026-04-24*
