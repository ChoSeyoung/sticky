# Architecture Research

**Domain:** Email HTML preview / client rendering simulation tool
**Researched:** 2026-04-23
**Confidence:** HIGH (iframe patterns well-established; Korean client specifics MEDIUM)

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                          UI Layer (Next.js)                         │
│                                                                     │
│  ┌─────────────────────┐         ┌────────────────────────────┐    │
│  │    Code Editor       │         │    Preview Panel           │    │
│  │  (CodeMirror/Monaco) │──HTML──▶│  (parallel client frames) │    │
│  └─────────────────────┘         │                            │    │
│                                   │  ┌──────┐ ┌──────┐        │    │
│                                   │  │Naver │ │ Daum │        │    │
│                                   │  │ iframe│ │iframe│        │    │
│                                   │  └──────┘ └──────┘        │    │
│                                   │  ┌──────┐ ┌──────┐        │    │
│                                   │  │Gmail │ │Outl. │        │    │
│                                   │  │iframe│ │iframe│        │    │
│                                   │  └──────┘ └──────┘        │    │
│                                   └────────────────────────────┘    │
├────────────────────────────────────────────────────────────────────┤
│                      Simulation Engine Layer                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Client Rule Engine                               │  │
│  │                                                               │  │
│  │  rawHTML ──▶ [parse DOM] ──▶ [apply client ruleset] ──▶       │  │
│  │             [strip unsupported CSS] ──▶ [inject wrapper] ──▶  │  │
│  │             simulatedHTML                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────┐   ┌──────────────────────────────────┐   │
│  │  Client Definitions  │   │        CSS Support Database       │   │
│  │  (per-client rules)  │   │  (caniemail data, custom Korean)  │   │
│  └──────────────────────┘   └──────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Code Editor | Accept/display raw HTML input; emit onChange events | CodeMirror 6 (`@uiw/react-codemirror`) with HTML mode |
| Preview Panel | Layout container for N parallel client previews | CSS Grid or Flexbox row with labeled headers |
| Client Frame | Render one client's simulation in isolation | `<iframe srcdoc>` with `sandbox` attribute |
| Client Rule Engine | Transform raw HTML into per-client simulated HTML | Pure function: `(html, clientRuleset) => simulatedHTML` |
| Client Definitions | Data file declaring each client's CSS/HTML restrictions | Static TypeScript constants or JSON |
| CSS Support Database | Source-of-truth for what each client supports | caniemail npm package + hand-curated Korean client rules |
| Frame Wrapper | Security/reset template injected around email HTML | HTML string template with CSP meta tag, base href, reset CSS |

---

## Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Root page — mounts EditorPreviewLayout
│   ├── layout.tsx                  # App shell
│   └── globals.css                 # Minimal global reset
│
├── components/
│   ├── editor/
│   │   └── HtmlEditor.tsx          # CodeMirror wrapper, emits onChange
│   ├── preview/
│   │   ├── PreviewPanel.tsx        # Grid of ClientFrame components
│   │   ├── ClientFrame.tsx         # Single sandboxed iframe for one client
│   │   └── ClientLabel.tsx         # Client name/logo header above iframe
│   └── layout/
│       └── EditorPreviewLayout.tsx # Two-column split: editor left, previews right
│
├── lib/
│   ├── simulation/
│   │   ├── engine.ts               # Core transform: applyClientRules(html, client)
│   │   ├── dom-utils.ts            # DOMParser helpers, style extraction/injection
│   │   ├── css-processor.ts        # Strip unsupported properties, inline styles
│   │   └── frame-wrapper.ts        # Build srcdoc string with security wrapper
│   │
│   ├── clients/
│   │   ├── index.ts                # Re-exports all client definitions
│   │   ├── naver.ts                # Naver Mail ruleset
│   │   ├── daum.ts                 # Daum/Kakao Mail ruleset
│   │   ├── gmail.ts                # Gmail ruleset
│   │   └── outlook.ts              # Outlook ruleset
│   │
│   └── data/
│       ├── caniemail.ts            # Typed wrapper around caniemail npm data
│       └── korean-clients.ts       # Hand-curated rules for Naver/Daum not in caniemail
│
└── types/
    ├── client.ts                   # ClientDefinition, ClientRuleset interfaces
    └── simulation.ts               # SimulationResult, TransformOptions interfaces
```

### Structure Rationale

- **`lib/simulation/`:** The engine is a pure data-in/data-out pipeline. Keeping it framework-free makes it unit-testable without mounting React components.
- **`lib/clients/`:** Each client is a self-contained ruleset file. Adding a new client is a single new file + export — no changes to engine logic required.
- **`lib/data/`:** The CSS support database is decoupled from rule application. Rules reference database entries by feature ID, so database updates don't break the engine.
- **`components/preview/ClientFrame`:** Each iframe is an independent component. They render in parallel, one per client, with no shared state between frames.

---

## Architectural Patterns

### Pattern 1: Sandboxed srcdoc iframe for Isolation

**What:** Inject simulated HTML into an `<iframe srcdoc="...">` with restrictive `sandbox` attributes, rather than serving a separate URL endpoint.

**When to use:** Whenever rendering untrusted or user-supplied HTML. Mandatory for email preview to prevent XSS and script execution.

**Trade-offs:** Slightly more complex height auto-sizing; eliminates the need for a backend endpoint. Strongly preferred over `src=` URL approach for a static-deploy tool.

**Example:**
```typescript
// lib/simulation/frame-wrapper.ts
export function buildSrcdoc(simulatedHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Security-Policy" content="script-src 'none'">
  <base target="_blank">
  <style>
    body { margin: 0; font-family: sans-serif; }
    img { max-width: 100%; }
  </style>
</head>
<body>${simulatedHtml}</body>
</html>`;
}

// components/preview/ClientFrame.tsx
<iframe
  srcdoc={buildSrcdoc(simulatedHtml)}
  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
  referrerPolicy="no-referrer"
  style={{ width: '100%', border: 'none' }}
/>
```

### Pattern 2: Per-Client Ruleset as Pure Data

**What:** Each email client is described as a static TypeScript object containing: a list of supported CSS properties, a list of stripped HTML elements, and transform functions for edge cases (e.g., Gmail class-name prefixing).

**When to use:** Always. This is the core abstraction. Rulesets should be declarative data, not imperative logic scattered in if-else trees.

**Trade-offs:** Requires upfront design of the ClientDefinition interface. Pays off immediately: adding a fifth client (e.g., Outlook 365) is a new data file, zero engine changes.

**Example:**
```typescript
// types/client.ts
export interface ClientRuleset {
  id: string;
  label: string;
  stripHeadStyles: boolean;           // true for Naver, Gmail
  allowedInlineProperties: string[];  // whitelist; undefined = allow all
  strippedProperties: string[];       // blacklist overrides
  strippedElements: string[];         // e.g. ['video', 'audio', 'form']
  transforms?: Array<(doc: Document) => void>;  // imperative escape hatches
}

// lib/clients/naver.ts
export const naverRuleset: ClientRuleset = {
  id: 'naver',
  label: '네이버 메일',
  stripHeadStyles: true,      // strips <style> from <head>
  allowedInlineProperties: [
    'color', 'background-color', 'font-size', 'font-family',
    'line-height', 'padding', 'margin', 'border', 'border-radius',
    'max-width', 'width', 'display', 'text-align',
  ],
  strippedProperties: ['animation', 'transition', 'transform', 'grid', 'flex'],
  strippedElements: ['script', 'form', 'video', 'audio'],
};
```

### Pattern 3: Debounced Real-Time Transform Pipeline

**What:** Editor onChange triggers a debounced simulation run. The simulation runs synchronously in the browser (no server round-trip) and writes results into state, which flows to each ClientFrame.

**When to use:** Always for real-time preview. The debounce (200–400ms) prevents thrashing on every keystroke without making the preview feel sluggish.

**Trade-offs:** Large HTML inputs with complex CSS could cause brief jank. Mitigation: run transformation in a Web Worker for inputs above a size threshold.

**Example:**
```typescript
// Simplified state flow
const [html, setHtml] = useState(STARTER_HTML);
const debouncedHtml = useDebounce(html, 300);

const simulations = useMemo(() =>
  ALL_CLIENTS.map(client => ({
    client,
    srcdoc: buildSrcdoc(applyClientRules(debouncedHtml, client)),
  })),
  [debouncedHtml]
);
```

---

## Data Flow

### Primary Flow: Editor → Preview

```
User types HTML
    │
    ▼
HtmlEditor.onChange(rawHtml)
    │
    ▼ (debounce 300ms)
applyClientRules(rawHtml, naverRuleset)
applyClientRules(rawHtml, daumRuleset)      ← run for each client (sync, parallel in useMemo)
applyClientRules(rawHtml, gmailRuleset)
applyClientRules(rawHtml, outlookRuleset)
    │
    ▼
buildSrcdoc(simulatedHtml)                  ← wrap each in security template
    │
    ▼
<iframe srcdoc={srcdoc}>                    ← browser renders independently per client
```

### Simulation Engine Internal Flow

```
rawHtml (string)
    │
    ▼ DOMParser.parseFromString()
document (DOM tree)
    │
    ▼ strip <script>, <form>, ruleset.strippedElements
    │
    ▼ if ruleset.stripHeadStyles: remove <style> from <head>
    │
    ▼ walk all elements:
    │   - collect inline style declarations
    │   - remove properties not in allowedInlineProperties
    │   - remove properties in strippedProperties
    │   - re-serialize cleaned inline styles
    │
    ▼ apply ruleset.transforms[] (imperative edge cases)
    │
    ▼ serialize DOM back to HTML string
simulatedHtml (string)
    │
    ▼ buildSrcdoc() — add CSP, base tag, reset styles
srcdoc (string) → ClientFrame prop
```

### Key Data Flows

1. **CSS Support Database → Client Definitions:** `caniemail` npm data is consumed once at build time (or module load) to seed the `allowedInlineProperties` lists. Korean-client overrides extend or replace caniemail entries where caniemail data is absent.

2. **State → Multiple Frames (fan-out):** A single `debouncedHtml` state value fans out to N parallel simulations. Each simulation is independent — no frame shares state with another. This means adding a fifth client adds zero coordination complexity.

3. **iframe → parent (height sync):** iframes post their `document.body.scrollHeight` to the parent via `postMessage` once content loads, allowing the parent to set `iframe.height` and avoid double scrollbars.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single-user tool (target) | Fully client-side, no backend. Static export via `next export`. All simulation in-browser. |
| Many concurrent users | Still no scaling concern — simulation is pure client-side JS. CDN-hosted static assets handle load. |
| Adding more email clients | New file in `lib/clients/`. No engine changes. Add entry to ALL_CLIENTS array. |
| Complex transform rules | Move heavy simulation to a Web Worker to keep UI thread responsive. |
| CSS database growth | caniemail data updates are a package version bump. Korean-client rules live in a versioned static file. |

### Scaling Priorities

1. **First bottleneck — simulation performance on large HTML:** DOM parsing + serialization for 4 clients on a 50KB email template could cause jank. Fix: Web Worker or `requestIdleCallback` scheduling.
2. **Second bottleneck — iframe height calculation:** Naive polling is fragile. Fix: ResizeObserver inside iframe posting to parent, or fixed-height scrollable frames as a simpler alternative.

---

## Anti-Patterns

### Anti-Pattern 1: One Big Conditional Per Client

**What people do:** Write `if (client === 'gmail') { ... } else if (client === 'naver') { ... }` inside the engine.

**Why it's wrong:** Engine code grows with every new client. Adding Outlook 365 or a fifth Korean client requires editing the engine. Bugs in one client's branch affect the whole engine.

**Do this instead:** Pure data rulesets. The engine is generic; only the client definition file changes.

### Anti-Pattern 2: Serving Simulated HTML from a Backend Route

**What people do:** POST raw HTML to `/api/simulate?client=gmail`, run transformation server-side, return simulated HTML.

**Why it's wrong:** Adds server dependency, latency, and infrastructure cost for what is purely a stateless pure function. Breaks offline use and makes static deployment impossible.

**Do this instead:** Client-side simulation only. DOMParser is available in all modern browsers. The transformation is fast enough to run synchronously for typical email HTML sizes.

### Anti-Pattern 3: Embedding Email HTML Directly in the Page DOM

**What people do:** Set `innerHTML` on a div to show the preview instead of using an iframe.

**Why it's wrong:** Email HTML frequently uses styles (e.g., `body { ... }`, `* { ... }`) and attribute-based styling that leak into and corrupt the host application's CSS. Scripts in the email HTML execute in the app's context.

**Do this instead:** Always iframe with `srcdoc` + `sandbox`. This is non-negotiable for email preview tools.

### Anti-Pattern 4: Polling for iframe Height

**What people do:** `setInterval(() => iframe.height = iframe.contentDocument.body.scrollHeight, 100)`.

**Why it's wrong:** Requires `allow-same-origin` in sandbox (which weakens isolation), polls unnecessarily, and can loop infinitely if content triggers reflow.

**Do this instead:** Use ResizeObserver inside the iframe's `srcdoc` HTML that posts height to the parent via `postMessage`. Or use fixed-height scrollable frames (simpler, slightly less elegant).

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| caniemail (npm) | Static import at module load; data baked into bundle | `@hteumeuleu/caniemail` or `caniemail` npm package; used only to derive initial allowedInlineProperties lists |
| No backend | N/A | All simulation is client-side by design |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Editor → Simulation Engine | React state / prop drilling | `debouncedHtml: string` passed down |
| Simulation Engine → ClientFrame | Props | `srcdoc: string` per client |
| ClientFrame (iframe) → PreviewPanel | `postMessage` | Height sync only; no data flows back up |
| Client Definitions → Engine | Direct import | Rulesets are static data, zero runtime coupling |
| CSS Database → Client Definitions | Build-time / module-init | Used to populate ruleset arrays; not called during simulation |

---

## Build Order (Phase Dependencies)

The architecture naturally sequences into layers where each depends on the prior:

```
1. Client Definitions + Types          ← no dependencies; just data/interfaces
        │
        ▼
2. Simulation Engine (pure functions)  ← depends on ClientDefinition type only
        │
        ▼
3. Frame Wrapper (srcdoc builder)      ← depends on simulated HTML string
        │
        ▼
4. ClientFrame component (iframe)      ← depends on frame-wrapper
        │
        ▼
5. Code Editor component               ← independent; can be built in parallel with 2-4
        │
        ▼
6. PreviewPanel + EditorPreviewLayout  ← integrates editor + N client frames
        │
        ▼
7. CSS Support Database integration    ← refines client definitions; retrofit step
```

**Key dependency insight:** Steps 1-3 (the simulation pipeline) can be built and unit-tested with plain strings before any React component exists. This means the hardest logic — the CSS transform engine — is independently verifiable before UI work begins.

---

## Sources

- Close Engineering: [Rendering Untrusted HTML Email Safely](https://making.close.com/posts/rendering-untrusted-html-email-safely/) — iframe + srcdoc + sandbox patterns
- AdGuard Engineering: [How We Created a Safe HTML Email Renderer](https://adguard.com/en/blog/how-we-created-safe-html-email.html) — DOMPurify + csstree + iframe architecture
- MailPace: [Adding HTML Email Previews with iframe sandbox](https://blog.mailpace.com/blog/adding-html-previews-with-iframe-sandbox/) — practical srcdoc implementation
- Email on Acid: [Naver Webmail Testing](https://www.emailonacid.com/blog/article/email-development/naver-webmail-testing-what-you-need-to-know/) — Naver CSS support specifics
- caniemail GitHub: [hteumeuleu/caniemail](https://github.com/hteumeuleu/caniemail) — CSS support database structure
- DEV Community: [Complete Guide to Email Client Rendering Differences in 2026](https://dev.to/mailpeek/the-complete-guide-to-email-client-rendering-differences-in-2026-243f) — per-client rendering behaviors

---
*Architecture research for: Korean email client HTML preview / rendering simulation tool*
*Researched: 2026-04-23*
