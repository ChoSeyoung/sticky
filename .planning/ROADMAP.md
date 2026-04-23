# Roadmap: Sticky — Korean Email Client Preview Tool

## Overview

Sticky is built in three layers: typed client data → pure-function simulation engine → React UI. The roadmap follows that order. Foundation and client rulesets come first because simulation accuracy is the core value — wrong data equals a wrong tool. The engine is proven in isolation before any UI exists. The editor and real-time pipeline are wired together next, validated on a single client. The multi-client layout fans out from that proven pipeline. Viewport toggles, security hardening, and UX polish complete the v1 product.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - TypeScript types, client ruleset data model, provenance fields
- [ ] **Phase 2: Naver Simulation Engine** - Pure-function CSS transform for Naver Mail (SIM-01)
- [ ] **Phase 3: Gmail Simulation Engine** - All-or-nothing `<style>` block behavior (SIM-03)
- [ ] **Phase 4: Daum/Kakao Simulation Engine** - Conservative estimated baseline (SIM-02)
- [ ] **Phase 5: Code Editor** - Monaco editor with syntax highlighting and paste fidelity (EDIT-01, EDIT-02)
- [ ] **Phase 6: Real-time Preview Pipeline** - Debounced editor→engine→iframe data flow (EDIT-03)
- [ ] **Phase 7: Multi-Client Parallel Layout** - Side-by-side preview grid for all clients (UX-01)
- [ ] **Phase 8: Viewport Toggle** - Mobile/desktop width toggle per preview pane (UX-02)
- [ ] **Phase 9: Security & Sandbox Hardening** - iframe CSP, sandbox attributes, frame-wrapper
- [ ] **Phase 10: UX Polish & Launch Readiness** - Client labels, disclaimers, confidence indicators

## Phase Details

### Phase 1: Foundation
**Goal**: The typed data model and client ruleset infrastructure that every simulation phase builds on
**Depends on**: Nothing (first phase)
**Requirements**: (none — foundational prerequisite for SIM-01, SIM-02, SIM-03)
**Success Criteria** (what must be TRUE):
  1. `ClientRuleset` TypeScript interface compiles with no errors and captures all simulation axes (stripHeadStyles, allowedInlineProperties, strippedProperties, strippedElements, confidence, provenance)
  2. Naver, Gmail, and Daum/Kakao ruleset files exist as typed constants and import cleanly
  3. Daum/Kakao ruleset has `confidence: "estimated"` and a `provenance` field documenting the inference basis
  4. A ruleset schema test asserts all required fields are present for each defined client
**Plans:** 1 plan
Plans:
- [x] 01-01-PLAN.md — Type contracts, client rulesets, Vitest setup, and schema test

### Phase 2: Naver Simulation Engine
**Goal**: Users can see accurately how their HTML email renders under Naver Mail's CSS restrictions
**Depends on**: Phase 1
**Requirements**: SIM-01
**Success Criteria** (what must be TRUE):
  1. User pastes an HTML email with a `<style>` block — the Naver preview shows the email with all `<style>` content stripped
  2. User writes an element with `margin` set inline — the Naver preview strips the `margin` property even from inline styles
  3. The simulation is a pure `applyClientRules(html, naverRuleset) => string` function with a passing unit test suite
  4. An HTML email with only inline-safe CSS renders identically in the Naver pane and the raw iframe
**Plans:** 1 plan
Plans:
- [x] 02-01-PLAN.md — TDD: applyClientRules engine function + cheerio + unit tests

### Phase 3: Gmail Simulation Engine
**Goal**: Users can see how Gmail's all-or-nothing `<style>` block stripping affects their email
**Depends on**: Phase 1
**Requirements**: SIM-03
**Success Criteria** (what must be TRUE):
  1. User writes a `<style>` block with a `background-image: url()` rule — the Gmail preview strips the entire `<style>` block, not just that property
  2. User writes a valid `<style>` block with no disallowed properties — the Gmail preview retains the entire block intact
  3. The Gmail simulation engine has unit tests covering both the block-kill and block-retain code paths
  4. The `applyClientRules(html, gmailRuleset)` function is a pure function consistent with the Phase 1 engine interface
**Plans**: TBD

### Phase 4: Daum/Kakao Simulation Engine
**Goal**: Users can see a conservative estimated baseline for how Daum/Kakao Mail renders their email
**Depends on**: Phase 1
**Requirements**: SIM-02
**Success Criteria** (what must be TRUE):
  1. User sees a Daum/Kakao preview pane that applies a conservative webmail baseline ruleset (block external resources, strip unsupported at-rules)
  2. The Daum/Kakao pane is visually labeled "estimated" so users understand the confidence level
  3. The simulation engine for Daum/Kakao uses the same `applyClientRules` interface as Naver and Gmail
  4. Unit tests document the assumed restrictions and pass against the conservative baseline ruleset
**Plans**: TBD

### Phase 5: Code Editor
**Goal**: Users can write and paste HTML email code into a syntax-highlighted editor without content being mangled
**Depends on**: Nothing (can run in parallel with Phases 1–4)
**Requirements**: EDIT-01, EDIT-02
**Success Criteria** (what must be TRUE):
  1. User can open the app and see a Monaco editor with HTML syntax highlighting active
  2. User pastes an HTML email (including multi-line attributes, special characters, and `<style>` blocks) — the content is preserved exactly, character for character
  3. The editor renders without SSR errors (dynamic import bypass applied correctly)
  4. The editor accepts HTML IntelliSense and does not mangle indentation or encoding on paste
**Plans**: TBD
**UI hint**: yes

### Phase 6: Real-time Preview Pipeline
**Goal**: Users see their preview update within ~300ms of making any edit in the code editor
**Depends on**: Phase 2 (at least one working simulation engine), Phase 5 (editor)
**Requirements**: EDIT-03
**Success Criteria** (what must be TRUE):
  1. User types a character in the editor — a preview pane updates within approximately 300ms (debounced)
  2. User pastes a complete HTML email — all active preview panes update without a page reload
  3. The preview renders inside a sandboxed `<iframe srcdoc>` (verified via DevTools sandbox attribute)
  4. Rapid successive edits do not trigger multiple simultaneous renders — only the final state after debounce fires
**Plans**: TBD
**UI hint**: yes

### Phase 7: Multi-Client Parallel Layout
**Goal**: Users can see all client previews side-by-side and compare rendering differences at a glance
**Depends on**: Phase 6 (real-time pipeline), Phases 2, 3, 4 (all simulation engines)
**Requirements**: UX-01
**Success Criteria** (what must be TRUE):
  1. User sees Naver, Gmail, and Daum/Kakao preview panes displayed simultaneously in a side-by-side grid
  2. Each preview pane is labeled with the client name
  3. User can resize the split between the editor and the preview area using a drag handle
  4. All panes update in real time when the user edits HTML in the editor
**Plans**: TBD
**UI hint**: yes

### Phase 8: Viewport Toggle
**Goal**: Users can switch each preview pane between mobile and desktop widths to test responsive rendering
**Depends on**: Phase 7
**Requirements**: UX-02
**Success Criteria** (what must be TRUE):
  1. User clicks a toggle on a preview pane — the iframe width changes from 600px (desktop) to 375px (mobile) or vice versa
  2. The toggle state is independent per pane (one pane can be mobile while another is desktop)
  3. The viewport toggle does not reload or re-simulate the email — only the iframe container width changes
  4. The toggle button clearly indicates the current viewport state (mobile or desktop)
**Plans**: TBD
**UI hint**: yes

### Phase 9: Security & Sandbox Hardening
**Goal**: The preview iframes are fully sandboxed and cannot exfiltrate data, execute scripts against the host, or access the parent frame
**Depends on**: Phase 6
**Requirements**: (none — security hardening, cross-cutting concern)
**Success Criteria** (what must be TRUE):
  1. All preview iframes have `sandbox` attribute set to `allow-same-origin` only (no `allow-scripts` combined with `allow-same-origin`)
  2. Each iframe document contains a CSP meta tag restricting scripts, external connections, and form submissions
  3. A `<base target="_blank">` tag is present in each frame document so links cannot navigate the parent
  4. Injecting `<script>alert(1)</script>` into the editor does not execute in any preview pane
**Plans**: TBD

### Phase 10: UX Polish & Launch Readiness
**Goal**: The tool is ready for real users — client labels, simulation disclaimers, and confidence indicators are visible so users understand what they are seeing
**Depends on**: Phase 8, Phase 9
**Requirements**: (none — launch quality, no direct v1 req but required for shipping)
**Success Criteria** (what must be TRUE):
  1. Each preview pane shows a simulation disclaimer ("This is a simulation, not a screenshot")
  2. The Daum/Kakao pane shows a confidence indicator labeled "Estimated" that is visually distinct
  3. The Naver and Gmail panes show confidence labeled "High" or equivalent
  4. The app renders without layout breaks at browser widths from 1024px to 1920px
  5. The app has a title, brief description, and is ready to be shared publicly at a URL
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
Note: Phase 5 (Code Editor) has no dependency on Phases 1-4 and may be executed in parallel if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/1 | Planning complete | - |
| 2. Naver Simulation Engine | 1/1 | In Progress | - |
| 3. Gmail Simulation Engine | 0/TBD | Not started | - |
| 4. Daum/Kakao Simulation Engine | 0/TBD | Not started | - |
| 5. Code Editor | 0/TBD | Not started | - |
| 6. Real-time Preview Pipeline | 0/TBD | Not started | - |
| 7. Multi-Client Parallel Layout | 0/TBD | Not started | - |
| 8. Viewport Toggle | 0/TBD | Not started | - |
| 9. Security & Sandbox Hardening | 0/TBD | Not started | - |
| 10. UX Polish & Launch Readiness | 0/TBD | Not started | - |
