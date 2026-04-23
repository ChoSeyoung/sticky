# Project Research Summary

**Project:** Sticky — Korean Email Client Preview Tool
**Domain:** Email HTML rendering simulation
**Researched:** 2026-04-23
**Confidence:** MEDIUM-HIGH

## Executive Summary

Sticky is a client-side HTML email rendering simulation tool targeting the Korean market gap — no existing tool (Litmus, Email on Acid, Parcel) covers Naver Mail or Daum/Kakao Mail. Instead of real screenshot capture via test email delivery, it uses browser-side CSS transformation to simulate per-client rendering: instant, free, statically deployable. The existing Next.js 16 scaffold (React 19, TypeScript, Tailwind v4) is the right foundation.

The architecture is a three-layer pipeline: typed client ruleset data → pure-function simulation engine → React UI with sandboxed iframes. The simulation engine is a pure `applyClientRules(html, ruleset) => simulatedHTML` function, independently unit-testable before any UI exists. Each client is a declarative ruleset file — adding a new client requires zero engine changes.

The single highest risk is the **Korean client data gap**. caniemail.com has zero entries for Naver or Daum/Kakao. Naver's behavior is reasonably documented (strips `<style>` blocks, blocks `margin` even inline). Daum/Kakao has essentially no public documentation and must ship labeled "estimated." This must be designed into the data model from Phase 1, not patched later.

## Key Findings

### Recommended Stack

The existing scaffold is correct — no framework changes needed.

**Core technologies:**
- **Next.js 16.2.4 + React 19**: Already scaffolded; App Router standard
- **Monaco Editor (`@monaco-editor/react@next`)**: HTML IntelliSense with inline CSS hints, directly useful for email HTML authoring. Requires `dynamic()` SSR bypass.
- **Allotment**: VS Code-derived resizable split pane. Same `dynamic()` SSR pattern.
- **`juice/client`**: Browser-safe CSS inliner for Naver simulation (strips `<style>`, inlines CSS)
- **`<iframe srcdoc>` + `sandbox`**: Isolated HTML rendering — non-negotiable for email preview
- **Custom simulation engine**: No off-the-shelf package exists. Pure function pipeline: parse → strip → filter → serialize.

### Expected Features

**Must have (table stakes):**
- HTML code editor with syntax highlighting
- Real-time preview update (debounced ~300ms)
- Gmail, Outlook, Naver, Daum/Kakao simulation panes
- Side-by-side parallel layout
- Mobile/desktop viewport toggle

**Should have (competitive):**
- Korean-specific CSS compatibility warnings
- Inline CSS auto-fix suggestion
- Client-specific warning panel
- Dark mode preview toggle

**Defer (v2+):**
- Shareable preview URL (conflicts with static deployment)
- File upload
- Keyboard shortcuts

### Architecture Approach

Three-layer pipeline: client ruleset data → simulation engine → UI. The engine is a pure string-in/string-out function. Each email client is a static TypeScript constant describing `stripHeadStyles`, `allowedInlineProperties`, `strippedProperties`, `strippedElements`, and optional imperative transforms. Previews render in sandboxed `<iframe srcdoc>` with CSP meta tag as defense-in-depth.

**Major components:**
1. **Client Definitions** (`lib/clients/`) — per-client CSS restriction rulesets as TypeScript data
2. **Simulation Engine** (`lib/simulation/engine.ts`) — pure function: parse DOM → apply ruleset → serialize
3. **Frame Wrapper** (`lib/simulation/frame-wrapper.ts`) — security template with CSP, base tag, reset CSS
4. **Preview Panel** (`components/preview/`) — grid of sandboxed iframes, one per client
5. **Code Editor** (`components/editor/`) — Monaco wrapper with HTML mode

### Critical Pitfalls

1. **caniemail has NO Korean client data** — Naver/Daum rules must be hand-curated in a separate data layer with provenance fields
2. **Style stripping ≠ inline property blocking** — Naver strips `<style>` AND blocks `margin` even inline; simulation needs two layers
3. **Gmail all-or-nothing `<style>` block stripping** — one `background-image: url()` or syntax error kills the entire block, not just the property
4. **Dual Outlook engine** — Classic (Word) and New (Chromium) have nearly opposite CSS support; model as two targets
5. **iframe security** — never combine `allow-scripts` + `allow-same-origin`; add CSP inside iframe document

## Implications for Roadmap

### Phase 1: Foundation — Types, Client Data, Security Model
**Rationale:** Nothing else can be built correctly without typed client definitions and the data model supporting confidence/provenance fields
**Delivers:** `ClientRuleset` TypeScript interface, all client data files (Naver, Daum with "estimated" confidence, Gmail, Outlook split Classic/New), Korean client data separate from caniemail
**Addresses:** Table stakes (data foundation), Pitfalls 2, 5, 7
**Avoids:** Building simulation on untyped/unprovenanced data

### Phase 2: Simulation Engine (Pure Functions, No UI)
**Rationale:** The hardest logic should be proven before UI investment — a common mistake is building the split-panel first
**Delivers:** `applyClientRules()` pure functions, two-layer CSS filter (structural + property-level), frame-wrapper security template
**Uses:** Client definitions from Phase 1
**Implements:** Core simulation pipeline
**Avoids:** Pitfalls 3, 4 (Gmail block-kill), 6 (iframe security)

### Phase 3: Core UI — Editor + Split Pane + Single Preview
**Rationale:** Validate the full pipeline end-to-end with one client before scaling to four
**Delivers:** Monaco editor, Allotment split layout, one working sandboxed iframe, debounced real-time preview
**Uses:** Monaco, Allotment, iframe srcdoc
**Implements:** Editor → Engine → Preview data flow

### Phase 4: Multi-Client Preview Panel
**Rationale:** Expand to all 4 client frames once single-frame pipeline is proven
**Delivers:** Parallel preview grid (Naver, Daum, Gmail, Outlook), mobile/desktop viewport toggle, client labels with confidence badges
**Implements:** Fan-out architecture, lazy rendering for performance

### Phase 5: UX Polish — Disclaimers, Warnings, Confidence
**Rationale:** Must ship before real users see the tool
**Delivers:** Simulation disclaimer per pane, confidence badges (HIGH/MEDIUM/LOW), Gmail block-kill warning, 102KB byte counter, Outlook engine labels

### Phase 6: Enhanced Features (v1.x)
**Rationale:** Post-validation additions once core is confirmed working
**Delivers:** Inline CSS auto-fix via juice, dark mode toggle, preheader/subject preview, CSS compatibility warning panel

### Phase Ordering Rationale

- Data model first because simulation accuracy is the core value — wrong data = wrong tool
- Engine before UI because the CSS transform logic is the highest-risk component
- Single-frame before multi-frame to validate the pipeline with minimal complexity
- UX polish before launch because simulation disclaimers affect user trust

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Daum/Kakao CSS rules — no primary source exists; must establish conservative baseline
- **Phase 2:** `juice/client` bundling with Next.js 16 webpack — unverified, needs integration test
- **Phase 4:** iframe height auto-sizing strategy — ResizeObserver vs fixed-height decision

Phases with standard patterns (skip research-phase):
- **Phase 3:** Monaco + Next.js App Router — Context7-verified, `dynamic()` pattern documented
- **Phase 3:** Allotment — Context7-verified, identical SSR bypass pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Scaffold verified; Monaco/Allotment Context7-verified |
| Features | MEDIUM-HIGH | Table stakes clear; Daum features must be labeled "estimated" |
| Architecture | HIGH | Sandboxed iframe + pure-function engine verified from multiple sources |
| Pitfalls | HIGH (general) / LOW (Daum) | Gmail, Outlook, Naver, security pitfalls well-sourced |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Daum/Kakao CSS rules**: No primary source exists. Ship as "estimated, conservative" with provenance fields
- **`juice/client` webpack bundling**: Unverified in Next.js 16. Test at integration time; fallback is custom inliner
- **Outlook Classic EOL (Oct 2026)**: Decide during Phase 1 whether to invest in Word-engine simulation
- **Naver data freshness**: Email on Acid source is ~2019; behavior may have changed

## Sources

### Primary (HIGH confidence)
- Close Engineering — iframe srcdoc + sandbox patterns
- caniemail.com — CSS support database (confirmed: no Korean clients)
- MDN — iframe sandbox attribute documentation
- Context7 — Monaco, Allotment Next.js patterns

### Secondary (MEDIUM confidence)
- Email on Acid — Naver Mail CSS limitations (~2019)
- DEV Community — Email client rendering differences 2026
- Litmus/Parcel — Feature landscape and competitor analysis

### Tertiary (LOW confidence)
- Korean developer blogs — Naver inline CSS requirement
- Inferred Daum/Kakao behavior from webmail patterns (no direct verification)

---
*Research completed: 2026-04-23*
*Ready for roadmap: yes*
