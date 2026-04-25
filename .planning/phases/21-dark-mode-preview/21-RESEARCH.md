# Phase 21: 다크모드 프리뷰 - Research

**Researched:** 2026-04-25
**Domain:** Email dark mode simulation — CSS injection in iframe srcdoc, client-specific inversion algorithms
**Confidence:** MEDIUM (client behavior well-documented; Naver/Daum Korean clients have no public dark mode specs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** iframe srcdoc에 CSS를 주입하여 `prefers-color-scheme: dark` 미디어쿼리를 강제 적용하는 방식으로 시뮬레이션한다. 실제 브라우저의 prefers-color-scheme 설정을 변경하는 것이 아니라, CSS 래핑으로 다크모드 미디어쿼리 규칙을 활성화한다.
- **D-02:** 다크모드 미대응 템플릿(prefers-color-scheme: dark 미디어쿼리가 없는 경우)에 대해 클라이언트별 자동 색상 반전 로직을 적용한다. Gmail, Outlook 등의 실제 다크모드 동작을 시뮬레이션하여 배경색 반전 + 텍스트 색상 반전을 수행한다.
- **D-03:** 각 프리뷰 패널의 기존 뷰포트 토글(Desktop/Mobile) 옆에 라이트/다크 모드 토글 버튼을 추가한다. 토글 상태는 패널별로 독립적이다 (한 패널만 다크모드로 전환 가능).
- **D-04:** 각 클라이언트(Naver, Gmail, Outlook Classic, Outlook New, Daum/Kakao)의 다크모드 동작이 서로 다를 수 있다. 정확한 클라이언트별 동작은 researcher가 조사하여 결정한다.

### Claude's Discretion
- 클라이언트별 자동 색상 반전의 세부 알고리즘 (어떤 색상을 어떻게 반전할지)
- prefers-color-scheme CSS 주입의 정확한 구현 방법
- 다크모드 토글 아이콘/텍스트 디자인
- 다크모드 토글 상태의 localStorage 저장 여부

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 21 adds per-panel dark mode simulation to the existing 5-client email preview tool. The core challenge is two-fold: (1) activating `prefers-color-scheme: dark` CSS rules that already exist in a template, and (2) simulating what each email client does to templates that have no dark mode support at all.

For goal (1), the D-01 decision rules out manipulating browser-level OS settings. Instead, CSS text rewriting is the correct approach: parse `<style>` block content and transform `@media (prefers-color-scheme: dark)` rules into unconditional rules by extracting and re-injecting their contents. This is purely a string/regex transformation on the HTML before it enters `srcdoc` — no JavaScript CSSOM manipulation inside the iframe needed.

For goal (2), each email client has a distinct documented inversion behavior. Gmail iOS does full inversion; Gmail Android and Outlook do partial inversion (only light backgrounds and dark text are flipped); Naver and Daum have no published dark mode behavior and must be approximated. The implementation fits cleanly into the existing `lib/engine/` pure function architecture as a new `applyDarkMode(html, strategy)` function, called before `wrapWithSecurityHeaders` in `PreviewPane`.

**Primary recommendation:** Implement a string-based CSS rewriter (`activateDarkMediaQueries`) plus a color-inversion transform (`applyAutoInversion`) as two pure functions in `lib/engine/darkMode.ts`, and add `darkMode` prop + toggle state to `PreviewPane.tsx` following the existing `viewport` toggle pattern exactly.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dark mode toggle UI | Browser/Client (React) | — | State is per-panel UI state, same as viewport toggle |
| CSS media query rewriting | Frontend (lib/engine) | — | Pure string transform on HTML before srcdoc injection |
| Auto color inversion (no dark CSS) | Frontend (lib/engine) | — | DOM parse + color transform with cheerio, same as applyClientRules |
| Dark mode strategy per client | lib/rulesets + lib/engine | — | Strategy object in ruleset, consumed by engine function |
| localStorage persistence | Browser/Client | — | Optional; same pattern as enabledClients in page.tsx |

---

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | ^1.2.0 [VERIFIED: package.json] | DOM parse + CSS transform for inversion | Already used in applyClientRules |
| React useState | 19.2.4 [VERIFIED: package.json] | Per-panel dark mode toggle state | Already used for viewport toggle |
| Next.js | 16.2.4 [VERIFIED: package.json] | App framework | Project foundation |

### No New Dependencies Required
All transformations can be implemented with the existing cheerio + vanilla TypeScript stack. No additional npm packages needed.

---

## Architecture Patterns

### System Architecture Diagram

```
User HTML (editor)
       │
       ▼
applyClientRules(html, ruleset)          ← existing
       │
       ▼
applyDarkMode(html, darkStrategy)        ← NEW (only when darkMode=true)
  ├─ if template HAS prefers-color-scheme:dark rules
  │     activateDarkMediaQueries(html)   ← CSS text rewrite
  └─ if template has NO dark media queries
        applyAutoInversion(html, strategy) ← color inversion per client
       │
       ▼
wrapWithSecurityHeaders(html)            ← existing
       │
       ▼
iframe srcdoc
```

### Recommended Project Structure
```
lib/
├── engine/
│   ├── applyClientRules.ts   (existing)
│   ├── inlineCss.ts          (existing)
│   ├── analyzeCssCompatibility.ts (existing)
│   └── darkMode.ts           ← NEW: activateDarkMediaQueries + applyAutoInversion
├── rulesets/
│   ├── types.ts              ← extend ClientRuleset with darkModeStrategy
│   ├── naver.ts              ← add darkModeStrategy field
│   ├── gmail.ts              ← add darkModeStrategy field
│   └── ...
app/components/
└── PreviewPane.tsx           ← add darkMode state + toggle UI
```

### Pattern 1: CSS Media Query Rewrite (activateDarkMediaQueries)
**What:** When dark mode is ON and the template contains `@media (prefers-color-scheme: dark) { ... }` blocks, rewrite those blocks to be unconditional so the browser renders them regardless of OS settings.
**When to use:** Dark mode toggle is ON AND `hasDarkMediaQuery(html)` returns true.

```typescript
// Source: adapted from mybyways.com/blog/forcing-dark-mode-with-prefs-color-scheme-media-query
// and D-01 decision (CSS wrapping, not CSSOM manipulation)

/**
 * Rewrite @media (prefers-color-scheme: dark) blocks to be unconditional.
 * Works on the raw HTML string — no iframe CSSOM access needed.
 */
export function activateDarkMediaQueries(html: string): string {
  // Replace the media condition while preserving the rule body.
  // Handles: @media (prefers-color-scheme: dark) and
  //          @media screen and (prefers-color-scheme: dark) etc.
  return html.replace(
    /@media\s+[^{]*\(prefers-color-scheme\s*:\s*dark\)[^{]*\{/gi,
    '@media all {'
  )
}

/**
 * Detect whether the HTML has any prefers-color-scheme: dark media queries.
 */
export function hasDarkMediaQuery(html: string): boolean {
  return /\(prefers-color-scheme\s*:\s*dark\)/i.test(html)
}
```

**Limitation:** Regex-based rewrite won't handle deeply nested `@supports` + `@media` combinations correctly, but these are rare in email. [ASSUMED]

### Pattern 2: Auto Color Inversion (applyAutoInversion)
**What:** When dark mode is ON and the template has NO dark media queries, simulate the email client's automatic dark mode behavior by programmatically changing light background colors and dark text colors.
**When to use:** Dark mode toggle is ON AND `hasDarkMediaQuery(html)` returns false.

```typescript
// Source: email dark mode inversion logic documented at litmus.com, emailonacid.com
// Strategy interface determines per-client behavior

export type DarkModeStrategy =
  | 'none'           // No dark mode (e.g., Naver/Daum webmail — no known inversion)
  | 'partial'        // Light bg → dark bg, dark text → light text (Gmail Android, Outlook New)
  | 'full'           // All colors inverted (Gmail iOS behavior)

export function applyAutoInversion(html: string, strategy: DarkModeStrategy): string {
  if (strategy === 'none') return html
  // Use cheerio to walk element style attributes and transform colors
  const $ = cheerio.load(html, { decodeEntities: false })
  $('[style],[bgcolor],[color]').each((_, el) => {
    // Transform background-color and color values per strategy
    // partial: only invert near-white backgrounds and near-black text
    // full: invert all color values
  })
  $('style').each((_, el) => {
    // Transform color values in <style> block text
  })
  return $.html()
}
```

**Color threshold for partial inversion** (Claude's discretion per D-04):
- Background: if HSL lightness > 85% → map to dark equivalent (e.g., #1a1a1a – #2d2d2d range)
- Text: if HSL lightness < 25% → map to light equivalent (e.g., #e0e0e0 – #ffffff range)
- Images: not inverted [CITED: litmus.com dark mode guide]
- Mid-range colors: leave unchanged (partial strategy)

### Pattern 3: Toggle UI in PreviewPane
**What:** Replicate the exact viewport toggle button pattern for the dark mode toggle.
**When to use:** Always — all panels get a light/dark toggle.

```typescript
// Follows existing viewport toggle pattern in PreviewPane.tsx exactly
type ColorMode = 'light' | 'dark'

// In component:
const [colorMode, setColorMode] = useState<ColorMode>('light')

// In header bar, next to viewport buttons:
<button
  onClick={() => setColorMode('light')}
  className={`px-2 py-0.5 text-xs rounded ${
    colorMode === 'light'
      ? 'bg-zinc-300 text-zinc-700'
      : 'text-zinc-400 hover:text-zinc-600'
  }`}
  title="Light mode"
>
  Light
</button>
<button
  onClick={() => setColorMode('dark')}
  className={`px-2 py-0.5 text-xs rounded ${
    colorMode === 'dark'
      ? 'bg-zinc-700 text-zinc-200'
      : 'text-zinc-400 hover:text-zinc-600'
  }`}
  title="Dark mode"
>
  Dark
</button>
```

State is kept **inside PreviewPane** — not lifted to page.tsx — preserving panel independence (D-03).

### Pattern 4: Updated simulatedHtml useMemo
```typescript
// In PreviewPane.tsx — extend existing useMemo
const simulatedHtml = useMemo(() => {
  const transformed = applyClientRules(debouncedHtml, ruleset)
  const withDark = colorMode === 'dark'
    ? applyDarkMode(transformed, ruleset.darkModeStrategy)
    : transformed
  return wrapWithSecurityHeaders(withDark)
}, [debouncedHtml, ruleset, colorMode])
```

The `colorMode` dependency ensures instant re-render on toggle (D-04 "즉시 갱신").

### Anti-Patterns to Avoid
- **postMessage into iframe to manipulate CSSOM:** Blocked by `sandbox="allow-same-origin"` and CSP. The iframe has no JS execution (`allow-scripts` is absent). Use HTML string transformation instead. [VERIFIED: PreviewPane.tsx sandbox attribute]
- **Setting `color-scheme: dark` on the `<iframe>` element:** This affects browser chrome (scrollbars, form controls) but does NOT activate CSS `@media (prefers-color-scheme: dark)` rules inside the document. It is the wrong mechanism for this phase. [CITED: fvsch.com/transparent-iframes]
- **Using `<meta name="color-scheme" content="dark">` injection:** Same issue — affects UA stylesheet defaults, not authored `prefers-color-scheme` media queries.
- **Regex that deletes the @media wrapper entirely:** The body rules would still apply but be unscoped — correct approach is replacing the condition, not removing the wrapper.

---

## Client Dark Mode Strategy Map

This is the core research finding that answers D-04.

| Client | Dark Mode Behavior | Strategy Value | Source | Confidence |
|--------|-------------------|---------------|--------|------------|
| **Gmail (Android web + app)** | Partial inversion: only near-white backgrounds and near-black text are flipped. Images untouched. `prefers-color-scheme` NOT honored in Gmail webmail. | `'partial'` | [CITED: litmus.com, emailonacid.com] | HIGH |
| **Gmail (iOS app)** | Full inversion: all colors inverted, then images re-inverted. Most aggressive. `prefers-color-scheme` NOT honored. | `'full'` | [CITED: litmus.com, emailonacid.com] | HIGH |
| **Outlook Classic (Windows)** | Partial inversion: light backgrounds → dark, dark text → light. Does NOT honor `prefers-color-scheme`. Injects `data-ogsb`/`data-ogsc` attributes in actual client but behavior is partial flip. | `'partial'` | [CITED: litmus.com, learn.microsoft.com] | MEDIUM |
| **Outlook New** | Partial inversion; follows system dark mode setting more aggressively than Classic. Does NOT honor `prefers-color-scheme`. | `'partial'` | [CITED: litmus.com] | MEDIUM |
| **Naver Mail** | No published dark mode email specification. App supports dark mode UI but email body rendering in dark mode is unknown. | `'none'` (approximation) | [ASSUMED] | LOW |
| **Daum/Kakao Mail** | No published dark mode email specification. Kakao and Daum Mail separated in early 2026 but neither publishes HTML rendering specs. | `'none'` (approximation) | [ASSUMED] | LOW |

**Key insight for simulation purposes:** This tool already labels Korean client rulesets as `'estimated'`. Using `strategy: 'none'` for Naver/Daum dark mode is consistent with that established convention — it means the preview renders the email in a dark browser background wrapper but applies no color transformation to the email body itself (since the actual client behavior is unknown).

**Recommendation for Gmail split (Android vs iOS):** Since this tool has one Gmail client and must pick one strategy, use `'partial'` — it corresponds to the more commonly observed Gmail Android web behavior and is less surprising than full inversion. The toggle serves as a "will this survive dark mode?" check, not an exact pixel-perfect replica. [ASSUMED — Claude's discretion]

---

## ClientRuleset Type Extension

The existing `ClientRuleset` interface in `lib/rulesets/types.ts` needs one new optional field:

```typescript
export type DarkModeStrategy = 'none' | 'partial' | 'full'

export interface ClientRuleset {
  // ... existing fields unchanged ...
  darkModeStrategy: DarkModeStrategy   // NEW: how this client handles dark mode
}
```

Each ruleset file gets a `darkModeStrategy` value added. This is backward-compatible since TypeScript will flag any missing additions at build time.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hex color parsing | Custom hex parser | Existing browser color parsing via canvas, or a simple HSL converter utility | Hex comes in many forms (#fff, #ffffff, rgb(), rgba(), named colors) |
| Full CSS parser for @media extraction | Custom CSS parser | Regex on known `@media (prefers-color-scheme: dark)` pattern | Email CSS is constrained; a full parser is overkill and adds deps |
| iframe JS injection for CSSOM | postMessage / script injection | String-level HTML transform before srcdoc | iframe has no `allow-scripts`, CSSOM approach is impossible |

**Key insight:** The existing pattern of transforming HTML as a string before injecting into `srcdoc` is the only viable approach given the `sandbox="allow-same-origin"` (no scripts) constraint.

---

## Common Pitfalls

### Pitfall 1: Regex `@media` Rewrite Breaks Nested Braces
**What goes wrong:** A simple regex to extract `@media (prefers-color-scheme: dark) { ... }` will fail on nested rules like `@media ... { .foo { } }` if the regex doesn't handle brace depth.
**Why it happens:** CSS `@media` blocks can contain any number of nested `{}` pairs.
**How to avoid:** The `activateDarkMediaQueries` approach (replace the media condition string `@media all {`) does NOT try to extract the block body — it only rewrites the condition. This sidesteps nested brace counting entirely.
**Warning signs:** If testing with a template that has multi-selector dark media queries and colors stop applying, check the regex rewrite.

### Pitfall 2: Color Inversion Makes Images Look Wrong
**What goes wrong:** Full inversion inverts `<img>` element color too if you apply CSS `filter: invert(1)` naively.
**Why it happens:** `filter: invert(1)` on the `<body>` inverts everything including images.
**How to avoid:** Apply auto-inversion at the element style attribute level (transform specific `background-color` and `color` values), NOT as a CSS filter on `<body>`. Images carry no `background-color` or `color` attributes, so they're naturally skipped. [CITED: emailonacid.com dark mode guide]

### Pitfall 3: applyClientRules Strips Styles Needed for Dark Mode Detection
**What goes wrong:** For Naver (stripHeadStyles: true), `applyClientRules` removes all `<style>` blocks — including any `@media (prefers-color-scheme: dark)` rules — BEFORE `hasDarkMediaQuery` can detect them.
**Why it happens:** Pipeline order: applyClientRules runs first and destroys dark media query evidence.
**How to avoid:** Call `hasDarkMediaQuery(originalHtml)` on the **pre-transform** HTML, not on the result of `applyClientRules`. The detection should happen on the original input; the inversion strategy is then determined by the ruleset's `darkModeStrategy`, not by the detection result in the transformed HTML.

Recommended pipeline:
```typescript
const hasDarkCss = hasDarkMediaQuery(debouncedHtml)  // check ORIGINAL
const transformed = applyClientRules(debouncedHtml, ruleset)
const withDark = colorMode === 'dark'
  ? applyDarkMode(transformed, ruleset.darkModeStrategy, hasDarkCss)
  : transformed
```

### Pitfall 4: Color Transform Corrupts Named Colors and CSS Variables
**What goes wrong:** Attempting to invert CSS variables (`--brand-color`) or named colors (`red`, `transparent`) with hex/RGB logic produces garbage.
**Why it happens:** Named colors and CSS variables aren't parseable as hex.
**How to avoid:** The inversion logic should only transform values that match `#xxx`, `#xxxxxx`, `rgb(...)`, `rgba(...)` patterns. Skip everything else. [ASSUMED]

### Pitfall 5: Toggle State Causes Flash on Mount
**What goes wrong:** If dark mode state is initialized from localStorage, the iframe first renders light, then re-renders dark after hydration — visible flash.
**Why it happens:** Next.js SSR renders without localStorage access; hydration then corrects state.
**How to avoid:** Initialize `colorMode` state to `'light'` always (no localStorage read on mount). This matches D-03 ("토글 상태는 패널별로 독립적") and is simpler. If localStorage persistence is later desired (Claude's discretion), use the `useEffect` after-mount pattern that `useEnabledClients` uses in page.tsx.

---

## Code Examples

### hasDarkMediaQuery detection
```typescript
// Source: regex pattern derived from CSS spec @media syntax
export function hasDarkMediaQuery(html: string): boolean {
  return /\(prefers-color-scheme\s*:\s*dark\)/i.test(html)
}
```

### activateDarkMediaQueries (CSS text rewrite)
```typescript
// Source: technique from mybyways.com/blog/forcing-dark-mode-with-prefs-color-scheme-media-query
// Adapted: rewrites condition in HTML string rather than CSSOM manipulation
export function activateDarkMediaQueries(html: string): string {
  return html.replace(
    /@media\b([^{]*)\(prefers-color-scheme\s*:\s*dark\)([^{]*)\{/gi,
    '@media all {'
  )
}
```

### applyDarkMode orchestrator
```typescript
// Source: project pattern (pure function, same as applyClientRules)
import { hasDarkMediaQuery, activateDarkMediaQueries, applyAutoInversion } from './darkMode'
import type { DarkModeStrategy } from '@/lib/rulesets/types'

export function applyDarkMode(
  html: string,
  strategy: DarkModeStrategy,
  originalHasDarkCss: boolean
): string {
  if (originalHasDarkCss) {
    return activateDarkMediaQueries(html)
  }
  return applyAutoInversion(html, strategy)
}
```

### Partial inversion — HSL lightness threshold approach
```typescript
// Source: color inversion thresholds from litmus.com/emailonacid.com dark mode guides
// [ASSUMED]: exact thresholds are Claude's discretion (D-04)
function hexToHsl(hex: string): [number, number, number] | null {
  // parse #rgb, #rrggbb → [h, s, l] in 0-360, 0-100, 0-100
  ...
}

function invertColorPartial(value: string): string {
  const hsl = hexToHsl(value)
  if (!hsl) return value
  const [h, s, l] = hsl
  if (l > 85) return `hsl(${h}, ${s}%, ${100 - l}%)`   // near-white bg → dark
  if (l < 15) return `hsl(${h}, ${s}%, ${100 - l}%)`   // near-black text → light
  return value  // mid-range colors unchanged
}
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (inferred from Next.js 16 project; no test files found) |
| Config file | None found — Wave 0 gap |
| Quick run command | `npx vitest run lib/engine/darkMode.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIM-04-a | hasDarkMediaQuery returns true when template has @media (prefers-color-scheme: dark) | unit | `npx vitest run lib/engine/darkMode.test.ts` | ❌ Wave 0 |
| SIM-04-b | activateDarkMediaQueries transforms media condition correctly | unit | `npx vitest run lib/engine/darkMode.test.ts` | ❌ Wave 0 |
| SIM-04-c | applyAutoInversion with 'partial' strategy inverts near-white backgrounds | unit | `npx vitest run lib/engine/darkMode.test.ts` | ❌ Wave 0 |
| SIM-04-d | applyAutoInversion with 'none' strategy returns html unchanged | unit | `npx vitest run lib/engine/darkMode.test.ts` | ❌ Wave 0 |
| SIM-04-e | PreviewPane toggle state is independent per panel | manual | — | manual |
| SIM-04-f | simulatedHtml recomputes immediately when colorMode changes | unit (hooks test) | `npx vitest run` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run lib/engine/darkMode.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `lib/engine/darkMode.test.ts` — covers SIM-04-a through SIM-04-d, SIM-04-f
- [ ] Vitest install check: `npm view vitest version` — confirm already in devDeps or install

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Naver Mail's dark mode does not invert email body colors (strategy: 'none') | Client Strategy Map | If Naver actually does inversion, preview would look wrong; fixable by updating strategy |
| A2 | Daum/Kakao Mail's dark mode does not invert email body colors (strategy: 'none') | Client Strategy Map | Same as A1 |
| A3 | Gmail single client uses 'partial' strategy (Android behavior) rather than 'full' (iOS) | Client Strategy Map | Preview would understate inversion severity for iOS Gmail users |
| A4 | Regex @media rewrite is sufficient for email CSS patterns (no deeply nested @supports cases) | Pattern 1 | If templates use @supports + @media nesting, the rewrite breaks; edge case in email |
| A5 | Named colors and CSS variables in templates are uncommon enough to skip in inversion | Pitfall 4 | If a template uses named colors heavily, inversion produces no change for those values |
| A6 | `colorMode` state initialized to 'light' always (no localStorage) | Toggle Pattern | Low risk — simplicity is correct default; can add localStorage later |
| A7 | Vitest is the correct test framework (no test infra found in codebase) | Validation | If project uses Jest, test command syntax differs slightly |

---

## Open Questions

1. **Gmail strategy: partial vs full?**
   - What we know: Gmail iOS uses full inversion; Gmail Android/web uses partial
   - What's unclear: The single "Gmail" client in this tool should pick one
   - Recommendation: Use `'partial'` as default (majority of webmail usage); add a comment in the ruleset explaining the iOS vs Android split

2. **Color inversion algorithm depth**
   - What we know: Need to parse hex/rgb color values and apply HSL threshold logic
   - What's unclear: Whether to build a minimal inline color parser or pull a tiny utility
   - Recommendation: Build a minimal self-contained `hexToHsl` / `rgbToHsl` utility in `darkMode.ts` — avoids new dependencies, sufficient for the constrained email color palette

3. **`@media (prefers-color-scheme: light)` handling**
   - What we know: Some templates declare explicit light mode rules too
   - What's unclear: Should light-mode rules be deactivated when dark toggle is ON?
   - Recommendation: Yes — in `activateDarkMediaQueries`, also deactivate `@media (prefers-color-scheme: light)` blocks (replace with `@media not all {` so they are suppressed). [ASSUMED]

---

## Environment Availability

Step 2.6: SKIPPED — no new external dependencies; phase is pure code change within existing Next.js + cheerio stack.

---

## Sources

### Primary (HIGH confidence)
- PreviewPane.tsx (codebase) — viewport toggle pattern, sandbox constraints, CSP, iframe srcdoc pattern [VERIFIED]
- applyClientRules.ts (codebase) — pure function engine architecture, cheerio usage [VERIFIED]
- lib/rulesets/types.ts (codebase) — ClientRuleset interface [VERIFIED]
- package.json (codebase) — cheerio ^1.2.0, React 19.2.4, Next.js 16.2.4 [VERIFIED]

### Secondary (MEDIUM confidence)
- [litmus.com — Ultimate Guide to Dark Mode for Email](https://www.litmus.com/blog/the-ultimate-guide-to-dark-mode-for-email-marketers) — partial vs full inversion taxonomy, client matrix
- [emailonacid.com — Dark Mode for Email](https://www.emailonacid.com/blog/article/email-development/dark-mode-for-email/) — Gmail, Outlook inversion behaviors
- [caniemail.com — prefers-color-scheme](https://www.caniemail.com/features/css-at-media-prefers-color-scheme/) — client support matrix (41.86% support overall)
- [parcel.io — Color scheme in email](https://parcel.io/guides/color-scheme-in-email) — Outlook data-ogsb/data-ogsc behavior
- [mybyways.com — Forcing Dark Mode](https://mybyways.com/blog/forcing-dark-mode-with-prefs-color-scheme-media-query) — CSS media query manipulation technique

### Tertiary (LOW confidence)
- Naver Mail dark mode behavior — no public spec found; approximated as 'none' [ASSUMED]
- Daum/Kakao Mail dark mode behavior — no public spec found; approximated as 'none' [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all existing, verified in package.json
- CSS rewrite technique: HIGH — verified against CSSOM constraints from existing sandbox config
- Gmail/Outlook inversion behavior: MEDIUM — documented by email testing vendors but exact thresholds not published
- Naver/Daum dark mode: LOW — no public specification; approximated from general knowledge

**Research date:** 2026-04-25
**Valid until:** 2026-10-25 (stable email client behaviors; Naver/Daum may change without notice)
