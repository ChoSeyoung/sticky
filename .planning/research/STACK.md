# Technology Stack

**Project:** Sticky — Korean Email Client Preview Tool
**Researched:** 2026-04-23
**Overall confidence:** MEDIUM-HIGH

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.4 (pinned) | App framework | Already scaffolded; App Router is the current standard. Next.js 16 ships with React 19. Do NOT upgrade without reading `node_modules/next/dist/docs/` — breaking changes are present. |
| React | 19.2.4 (pinned) | UI runtime | Scaffolded. React 19 concurrent features improve the editor's live-update feel. |
| TypeScript | ^5 | Type safety | Scaffolded. Critical for the CSS compatibility data model — email client rules are complex enough that untyped data will cause bugs. |

### Code Editor

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@monaco-editor/react` | ^4.7 (use `@next` for React 19 compat) | HTML code editor pane | VS Code's editor. HTML syntax highlighting, IntelliSense, and error squiggles work out of the box. Widely used, Context7-verified for Next.js App Router. The `dynamic(() => import(...), { ssr: false })` pattern is required — Monaco uses `document` and cannot run server-side. |

**Why not CodeMirror?** CodeMirror 6 via `@uiw/react-codemirror` is lighter (~250 KB vs Monaco's ~2 MB), but Monaco's built-in HTML language server gives developers inline CSS property hints inside `<style>` tags — directly relevant to the use case. For this tool, editor power matters more than bundle size.

**Why not a raw `<textarea>`?** No syntax highlighting, no error feedback. Users pasting complex HTML will be miserable.

### Layout

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `allotment` | ^1.9 | Resizable editor/preview split | Derived from VS Code's own split-pane code. SSR-incompatible like Monaco, so wrap with `dynamic(() => import(...), { ssr: false })`. The VS Code pedigree means it handles edge cases (min/max constraints, snap) correctly. Verified with Context7. |

**Why not CSS Flexbox/Grid with a drag handle?** Building a drag handle from scratch with correct cursor behavior, keyboard accessibility, and edge cases takes significant time. Allotment solves this.

**Why not `react-split-pane`?** Unmaintained (last commit 2022+). Allotment is actively maintained.

### CSS Simulation Engine

This is the core differentiating logic of the tool. No single npm package does "simulate rendering for email client X."

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Custom CSS filter module (hand-written) | — | Per-client CSS stripping/transformation | Each email client has a known set of supported/unsupported properties. The simulation transforms input HTML by applying client-specific rules before injecting into the preview iframe. |
| `juice/client` (from `juice` package) | ^11 | CSS inlining step | Required for Naver Mail simulation: Naver strips `<style>` tags entirely, so the simulation must inline all CSS before preview. `juice/client` is the browser-safe subset (excludes `fs`-dependent methods). Verified: `require('juice/client')` bundles cleanly without Node.js `fs`. |
| caniemail.com data (raw JSON) | latest | CSS property support database | The hteumeuleu/caniemail GitHub repo stores YAML/JSON data for ~300 CSS/HTML features across major clients. Fetch the raw data at build time or bundle a snapshot. **Critical caveat: Naver Mail and Daum/Kakao Mail are NOT in caniemail's dataset.** Their rules must be manually researched and hand-coded. |
| `@jsx-email/doiuse-email` | ^0.3 | CSS compatibility linting | Provides programmatic access to caniemail data: `doIUseEmail(html, { emailClients: ['gmail.*'] })`. Useful for the compatibility warning overlay feature. Covers Gmail, Outlook, Apple Mail, Yahoo, ProtonMail — but not Korean clients. |

#### Korean Client CSS Rules (Hand-Coded, No Package Exists)

caniemail.com has no data for Naver Mail or Daum/Kakao Mail. The simulation rules must be built from primary research:

**Naver Mail (네이버 메일):**
- Strips all `<style>` tags from `<head>` (confirmed by Email on Acid testing)
- Supports: inline CSS `style=""`, `border-radius`, `background-image`, animated GIF, `max-width`, ordered/unordered lists, font properties, padding, borders
- Does NOT support: CSS classes, CSS IDs, any selector-based styling
- Simulation: run `juice/client` to inline all styles, then strip `<style>` blocks before injecting into iframe

**Daum/Kakao Mail (다음/카카오 메일):**
- Historically shared codebase with Daum Mail (separated February 2026 per Kakao announcement)
- Generally webmail-class behavior: likely strips or scopes `<style>` tags, class-based selectors unreliable
- CONFIDENCE: LOW — no authoritative documentation found. Requires manual empirical testing against live clients before shipping this simulation. Flag this for Phase-specific research.

**Gmail:**
- Historically stripped `<style>` tags, now supports `<style>` in `<head>` (partially, since ~2016)
- Strips IDs, external CSS, `position`, `float`, many shorthand properties
- `@media` queries supported in newer Gmail versions
- doiuse-email covers Gmail variants adequately

**Outlook (Desktop, Word engine):**
- Uses Word rendering engine (Outlook 2007–2025 desktop); changing to web engine October 2026
- Strips: flexbox, grid, `position`, pseudo-classes, `margin`/`padding` on `<div>` and `<img>`, most advanced CSS
- Supports: VML, `width`/`height` HTML attributes, `mso-*` proprietary properties, table-based layouts
- Simulation: strip the known unsupported property set
- doiuse-email covers Outlook variants

### Preview Rendering

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `<iframe srcdoc>` (native browser API) | — | Isolated HTML rendering sandbox | Each client preview panel renders transformed HTML in a sandboxed iframe. `srcdoc` attribute injects HTML directly without a network request. Add `sandbox="allow-same-origin"` to prevent script execution while preserving CSS rendering. |

**Why not a `<div>` with `dangerouslySetInnerHTML`?** Email HTML contains `<html>`, `<head>`, `<body>` tags and full document structure. Injecting this into a React component DOM corrupts the host document. `<iframe srcdoc>` creates a proper isolated document context.

**Security note:** Use `sandbox` attribute without `allow-scripts` to prevent arbitrary JS execution from pasted HTML.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React `useState` + `useReducer` (built-in) | — | Editor content and active client selection | The app's state is simple: current HTML string, selected active client tabs, maybe a debounce timer. No need for an external state library at v1. Adding Zustand later costs 5 minutes; removing a premature Zustand dependency costs much more. |

**Why not Zustand?** Zustand is excellent but introduces unnecessary complexity for a single-page tool with two main state variables. Revisit if state grows complex (saved snippets, user preferences, history).

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^4 (scaffolded via `@tailwindcss/postcss`) | Tool UI chrome | Already scaffolded. Tailwind v4 with CSS-first `@theme` config is the current standard. Use it for the editor chrome, tabs, and layout — NOT for the email preview content (which must render its own CSS in isolation). |

### Development / Build

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| ESLint | ^9 | Linting | Scaffolded (`eslint-config-next`). |
| TypeScript strict mode | — | Type safety | Enable `"strict": true` in `tsconfig.json`. Email client CSS rule objects benefit heavily from discriminated unions. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Code editor | `@monaco-editor/react` | `@uiw/react-codemirror` (CodeMirror 6) | CodeMirror is lighter but Monaco's HTML IntelliSense is directly useful for email HTML authoring. Bundle size cost is acceptable for a developer tool. |
| Code editor | `@monaco-editor/react` | `<textarea>` | No syntax highlighting or inline hints. Poor UX for code editing. |
| Split layout | `allotment` | CSS grid with JS drag handle | Too much custom code for edge cases. Allotment is VS Code's own implementation. |
| Split layout | `allotment` | `react-split-pane` | Unmaintained since 2022. |
| CSS inlining | `juice/client` | `@css-inline/css-inline` | `@css-inline` is Rust-based WASM — adds complexity for marginal performance gain in a dev tool context. `juice/client` is simpler to bundle. |
| CSS compat data | caniemail raw JSON + `@jsx-email/doiuse-email` | Building a custom CSS compat DB | caniemail has 300+ tested features, maintained by the community. No reason to duplicate it. |
| Preview rendering | `<iframe srcdoc>` | `<div dangerouslySetInnerHTML>` | Cannot render full HTML documents (`<html>`, `<head>`, `<body>`) in a div without corrupting host DOM. |
| State management | React built-in | Zustand / Jotai | Premature complexity. V1 state fits in a single `useState`. |

---

## Installation

```bash
# Editor
npm install @monaco-editor/react@next

# Layout
npm install allotment

# CSS inlining + compat data
npm install juice @jsx-email/doiuse-email

# Types (if not already present)
npm install -D @types/node @types/react @types/react-dom
```

### Key Integration Notes

**Monaco in Next.js App Router:**
```tsx
// src/components/HtmlEditor.tsx
'use client';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-full bg-[#1e1e1e]" />,
});
```

**Allotment in Next.js App Router:**
```tsx
// src/components/PreviewLayout.tsx
'use client';
import dynamic from 'next/dynamic';

const Allotment = dynamic(
  () => import('allotment').then((m) => m.Allotment),
  { ssr: false }
);
// Also import 'allotment/dist/style.css' in your root layout
```

**juice/client for browser-safe inlining:**
```ts
// src/lib/simulateClient.ts
import juice from 'juice/client';

export function inlineStyles(html: string): string {
  return juice(html);
}
```

---

## Confidence Levels by Component

| Component | Confidence | Rationale |
|-----------|------------|-----------|
| Next.js + React + TypeScript scaffold | HIGH | Verified in installed `package.json` |
| Monaco editor (`@monaco-editor/react`) | HIGH | Context7-verified, Next.js App Router pattern confirmed |
| Allotment split pane | HIGH | Context7-verified, actively maintained, Next.js SSR pattern documented |
| Tailwind CSS v4 | HIGH | Already scaffolded, official docs confirm Next.js compatibility |
| `<iframe srcdoc>` for preview | HIGH | Standard browser API, well-documented |
| `juice/client` for CSS inlining | MEDIUM | `juice/client` browser bundle confirmed in official README; webpack/Next.js bundling not explicitly verified — test at integration time |
| `@jsx-email/doiuse-email` for compat linting | MEDIUM | API confirmed, covers major clients; last publish April 2022 — verify it still resolves against current caniemail data |
| caniemail raw JSON data | MEDIUM | Open source, actively maintained; no npm package for clean consumption — must fetch/bundle JSON directly from GitHub or use as build-time asset |
| Gmail simulation rules | MEDIUM | Well-documented by multiple sources; specific support boundaries shift over time |
| Outlook simulation rules | MEDIUM | Well-documented (Word engine); desktop Outlook transitioning to web engine October 2026 — decide which Outlook versions to target |
| Naver Mail simulation rules | MEDIUM | `<style>` stripping confirmed by Email on Acid. Other limitations require empirical testing |
| Daum/Kakao Mail simulation rules | LOW | No authoritative CSS documentation found. Kakao/Daum service separation happened February 2026. Requires direct empirical testing before shipping simulation |

---

## Critical Risks

1. **Korean client data gap:** caniemail.com does not cover Naver or Daum/Kakao. The Korean-specific simulation is the product's core differentiator, but requires original research (manual testing against live clients or community-sourced data). Without this, the Korean client previews will be inaccurate guesses.

2. **`juice/client` bundling:** `juice` uses `require('fs')` in its main entry. `juice/client` is the browser-safe subset. Verify this bundles correctly with Next.js webpack before committing to it. Alternative: a lightweight custom CSS inliner using `document.createElement('style')` + `getComputedStyle`.

3. **Monaco bundle size:** `@monaco-editor/react` adds ~2 MB to the client bundle (CDN-loaded by default, so not in your bundle, but still a network cost). For a developer tool, this is acceptable. For mobile users on slow connections, it degrades load time.

4. **Outlook targeting ambiguity:** Classic Outlook (Word engine) is being EOL'd October 2026. New Outlook uses a web engine. The simulation target ("Outlook") needs to be versioned or split — users may mean old Word-engine Outlook or new web-engine Outlook.

---

## Sources

- Next.js 16 docs: `node_modules/next/dist/docs/` (local)
- `@monaco-editor/react` Next.js integration: Context7 `/suren-atoyan/monaco-react` (HIGH confidence)
- `allotment` usage: Context7 `/johnwalley/allotment` (HIGH confidence)
- Naver Mail CSS: [Email on Acid — Naver Webmail Testing](https://www.emailonacid.com/blog/article/email-development/naver-webmail-testing-what-you-need-to-know/)
- caniemail clients list: [caniemail.com/clients](https://www.caniemail.com/clients/) — Korean clients absent
- caniemail data repo: [hteumeuleu/caniemail on GitHub](https://github.com/hteumeuleu/caniemail)
- `@jsx-email/doiuse-email`: [npm](https://www.npmjs.com/package/@jsx-email/doiuse-email), [GitHub shellscape/doiuse-email](https://github.com/shellscape/doiuse-email)
- `juice` browser bundle: [Automattic/juice README](https://github.com/Automattic/juice) — `juice/client` documented
- Outlook Word engine: [HTeuMeuLeu — Outlook rendering engine](https://www.hteumeuleu.com/2020/outlook-rendering-engine/)
- Kakao/Daum separation: Search results citing Kakao announcements (MEDIUM confidence)
- Tailwind v4 + Next.js: [Tailwind CSS official docs](https://tailwindcss.com/docs/guides/nextjs)
