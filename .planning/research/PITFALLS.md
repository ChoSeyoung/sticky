# Pitfalls Research

**Domain:** Email HTML rendering simulation tool — Korean email clients (Naver, Daum/Kakao, Gmail, Outlook)
**Researched:** 2026-04-23
**Confidence:** MEDIUM — Korean-client-specific CSS behavior is sparsely documented in public English sources; general email simulation patterns are HIGH confidence from multiple verified sources.

---

## Critical Pitfalls

### Pitfall 1: Presenting Simulation as Ground Truth

**What goes wrong:**
Users treat the simulated preview as a guarantee of how their email will actually render. Email simulation tools (including Litmus, the industry leader) explicitly disclaim that previews are generated from raw HTML and cannot guarantee pixel-identical rendering with actual clients. When users trust the simulation unconditionally, they ship broken emails to real inboxes.

**Why it happens:**
The tool looks authoritative. A rendered preview in an iframe looks "real." Developers assume a passing preview means a passing email. The distinction between simulation (CSS rules applied programmatically) and screenshot testing (actual client rendering + screenshot) is invisible to users.

**How to avoid:**
- Display a persistent disclaimer in the UI: "Simulation based on known CSS compatibility data — actual rendering may differ."
- Distinguish clearly in UI copy between "simulated" and "verified" results.
- Do not label unsupported properties as broken unless caniemail explicitly flags them as stripped — many properties degrade gracefully rather than catastrophically.
- Consider a confidence indicator per client (HIGH for well-documented clients like Gmail, LOW for Naver/Daum where public data is sparse).

**Warning signs:**
- Bug reports saying "your tool shows it works but it broke in real Naver Mail."
- Users sharing screenshots that contradict the simulation output.

**Phase to address:** Foundation phase (before any rendering logic ships). The disclaimer and confidence model should be part of the core design, not added retroactively.

---

### Pitfall 2: caniemail.com Has No Korean Email Client Data

**What goes wrong:**
The tool's core data source — caniemail.com — does not track Naver Mail, Daum Mail, or Kakao Mail. The scoreboard covers 21 clients across French, German, Russian, and US providers, but zero Korean providers. Relying on caniemail data alone means the Korean-specific simulations are built on guesswork dressed as data.

**Why it happens:**
caniemail.com relies on Litmus tracking infrastructure. Litmus does not support Korean email clients (their primary pitch is the gap this tool fills). Korean clients are not represented in any major CSS compatibility database that is publicly verifiable.

**How to avoid:**
- Build a separate, manually curated Korean client data layer distinct from the caniemail dataset.
- Source Naver and Daum behavior from Email on Acid's Naver article (verified: Naver strips `<style>` tags entirely, does not support margin, supports inline CSS, borders, font styling, background colors, max-width).
- Treat Daum/Kakao as underdocumented — apply conservative simulation (assume webmail-level restrictions: strip `<style>`, apply inline CSS only) and flag this uncertainty in the UI.
- Document data provenance per client: where did each rule come from, and when was it last verified?

**Warning signs:**
- Korean client simulation rules sourced entirely from caniemail — this is a red flag because that data doesn't exist there.
- No separate data file for Korean clients in the codebase.

**Phase to address:** Data modeling phase (the first phase that touches CSS compatibility rules). The data schema must accommodate source provenance and confidence levels from day one.

---

### Pitfall 3: Style Tag Stripping Is Not the Same as Inline CSS Application

**What goes wrong:**
Simulating a client that strips `<style>` tags is implemented by simply removing `<style>` blocks. But the correct simulation is: strip the tag, then render with only the surviving inline styles. Many developers implement the strip correctly but forget that properties like `margin` may be independently blocked by Naver even when inlined. The simulation shows correct styling when it should show broken spacing.

**Why it happens:**
CSS-stripping simulation focuses on the mechanism (`<style>` removal) rather than the full property allowlist. Naver, for example, strips `<style>` blocks AND does not render `margin` even when inlined. These are two separate rules that must both be applied.

**How to avoid:**
- The simulation engine must apply two distinct layers: (1) structural stripping rules (which tags/attributes are removed), and (2) property-level filtering (which CSS properties are ignored even inline).
- Maintain a per-client blocklist of properties that are stripped even when inlined, not just the `<style>`-stripping flag.
- For Naver: confirmed unsupported even inline: `margin`. Confirmed supported inline: `padding`, `border`, `border-radius`, `font-size`, `font-family`, `line-height`, `background-color`, `max-width`.

**Warning signs:**
- Simulation engine has a single boolean `stripsStyleTag: true` with no per-property inline filter.
- Naver preview shows correct spacing when margin is used inline — this is wrong behavior.

**Phase to address:** CSS simulation engine phase. The data schema and the rendering transform must handle both layers simultaneously.

---

### Pitfall 4: Gmail's All-or-Nothing CSS Block Behavior

**What goes wrong:**
Gmail does not partially parse `<style>` blocks. A single syntax error, a single invalid property, or any use of `background-image: url(...)` anywhere in the block causes Gmail to strip the **entire** `<style>` block. A simulation that removes only the individual unsupported properties gives users a false picture — in reality, Gmail would render with zero styles.

**Why it happens:**
Developers implement CSS filtering as property-level removal (strip `position: fixed`, strip `grid`, etc.) without modeling Gmail's block-level destruction behavior. The simulation is technically applying the right rules but at the wrong granularity.

**How to avoid:**
- Implement a pre-pass validation step for Gmail simulation: scan the `<style>` block for any property known to trigger full-block removal.
- If any trigger is detected, strip the entire `<style>` block for the Gmail preview, not just the invalid properties.
- Known Gmail block-kill triggers: `background-image: url(...)` anywhere in the block; any `@import`; syntax errors; block exceeding 8,192 characters.
- Display a warning in the UI when Gmail simulation triggers full-block stripping: "Gmail will strip all styles in this block."

**Warning signs:**
- Gmail simulation applies property-by-property filtering but still shows styled output even when `background-image` is present in the style block.
- No 8,192-character limit check in the simulation engine.

**Phase to address:** Gmail-specific simulation rules phase.

---

### Pitfall 5: Dual Outlook Engine Complexity (Word vs. Chromium)

**What goes wrong:**
As of 2025-2026, there are two distinct Outlook rendering engines in active use: the classic Word-based engine (Windows desktop, older) and the new Chromium-based engine (New Outlook, post-January 2025 migration). Simulating "Outlook" as a single client produces incorrect results for a significant fraction of users. The two engines have nearly opposite CSS support profiles.

**Why it happens:**
Outlook historically had one terrible rendering engine. The new Chromium-based Outlook is a fundamentally different product. Most documentation and caniemail data still refers to the Word engine. A tool that simulates only one will be wrong for the other — and Microsoft is actively migrating Business Standard/Premium users.

**How to avoid:**
- Model Outlook as two distinct preview targets: "Outlook (Classic / Word engine)" and "Outlook (New / Chromium)".
- Word engine: no flexbox, no grid, no `border-radius`, no web fonts (falls back to Times New Roman), supports VML and MSO conditional comments.
- Chromium engine: supports modern CSS but ignores MSO conditional comments. Treat like a modern browser with email-specific quirks.
- If the project scope says "Outlook" as one target, clearly document which engine and explicitly call out the dual-engine situation in the UI.

**Warning signs:**
- Single "Outlook" profile in the client data.
- `border-radius` shown as unsupported in Outlook when it should be supported in New Outlook.

**Phase to address:** Client data modeling phase, before any Outlook-specific simulation is implemented.

---

### Pitfall 6: iframe Security Misconfiguration for Untrusted HTML Rendering

**What goes wrong:**
The preview renders user-supplied HTML. Without proper iframe sandboxing, a malicious user can embed JavaScript that executes in the parent application context, enabling XSS attacks — especially dangerous if the tool is ever used in a multi-user or shared context.

**Why it happens:**
iframes with `srcdoc` are injection sinks. Developers add a sandbox attribute but use permissive settings (`allow-scripts allow-same-origin` together defeats the sandbox entirely — the child can re-enable itself). CSS injection attacks (exfiltrating data via CSS selectors) are possible even without script execution.

**How to avoid:**
- Use `sandbox` attribute with minimal permissions: `allow-popups allow-popups-to-escape-sandbox allow-same-origin` — no `allow-scripts`.
- Add a CSP meta tag inside the iframe content: `<meta http-equiv="Content-Security-Policy" content="script-src 'none';">`.
- Never combine `allow-scripts` and `allow-same-origin` in the same sandbox — this combination completely nullifies sandboxing.
- Validate that links open in new tabs (not same frame) and do not execute JavaScript URIs (`javascript:` protocol).
- For same-origin deployments: the `allow-same-origin` flag is safe without `allow-scripts`, because script access is independently blocked.

**Warning signs:**
- `sandbox="allow-scripts allow-same-origin"` in the iframe — this is a critical misconfiguration.
- No CSP inside the iframe content document.
- No origin validation on any `postMessage` listeners.

**Phase to address:** Preview rendering implementation (first phase that renders user HTML). Security cannot be retrofitted — it must be built in at iframe creation time.

---

### Pitfall 7: Simulating Korean Clients Without Primary Source Data

**What goes wrong:**
Daum/Kakao Mail has almost no publicly documented CSS/HTML behavior. Unlike Naver (which has a documented Email on Acid test report) or Gmail (extensively documented), Daum's rendering rules are essentially unknown in public English or Korean developer communities. Building a Daum simulation without verified data means inventing rules.

**Why it happens:**
The tool's unique selling point is Korean email client support — but the clients that make it unique are the least documented ones. It is tempting to approximate Daum as "similar to Naver" or "similar to Yahoo Mail" without verification.

**How to avoid:**
- Clearly label the Daum/Kakao preview as "estimated" with lower confidence than Gmail or Naver.
- Apply the most conservative webmail baseline for Daum simulation: strip `<style>` tags, apply inline-only CSS, block modern layout properties (flexbox, grid, transforms, animations).
- Build the simulation data layer with a provenance field so that when verified Daum behavior is discovered (via direct testing), rules can be promoted from "estimated" to "verified."
- Consider creating a community verification workflow — allow users who have actually sent emails to Daum to report observed behavior.
- Do not claim Daum simulation accuracy in marketing copy until rules are verified against real Daum Mail behavior.

**Warning signs:**
- Daum simulation rules have the same data structure and confidence as Gmail rules (which are well-documented).
- No provenance or confidence field in the CSS compatibility data model.

**Phase to address:** Data modeling phase, and again during the Daum-specific simulation phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single flat `clientRules.json` with no provenance | Simple to start | Cannot distinguish verified vs. estimated rules; impossible to audit data quality | Never — provenance must be in schema from day one |
| Boolean `stripsStyleTag` without per-property inline filter | Less complex data model | Wrong simulation for Naver (margin blocked even inline) | Never |
| Treating "Outlook" as one client | Simpler UI | Wrong for 50%+ of Outlook users during 2025-2026 dual-engine transition | Acceptable only if labeled "Classic Outlook" explicitly |
| Hard-coding CSS compatibility rules as constants | Fast MVP | Cannot update rules without code deploy; stale data silently accumulates | Acceptable for early MVP if rules are in a separate data file (not logic) |
| Debouncing preview on every keystroke | Real-time feel | High re-render frequency; each render creates a new iframe document | Acceptable if debounce threshold is ≥300ms |
| Applying only global `<style>` block rules and ignoring `<head>` vs `<body>` distinction | Simpler parsing | Some clients behave differently for styles in `<head>` vs. `<body>` | Low risk for MVP, address when accuracy issues appear |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| caniemail.com data | Assuming it covers Korean clients | It covers 21 clients — none Korean. Build a separate Korean data layer. |
| caniemail.com data | Using estimated support percentages as behavioral rules | Percentages are market share estimates, not per-client boolean support flags. Use per-client feature rows, not aggregate percentages. |
| iframe srcdoc | Injecting raw user HTML directly as srcdoc value | Wrap in a full HTML document with reset styles and CSP meta tag before injecting |
| iframe postMessage for height | Using `document.body.scrollHeight` for resize detection | Causes infinite resize loop. Use the height of a fixed inner container element instead. |
| Email on Acid / Naver data | Treating 2019 Naver test data as current | Email clients update. Naver's `<style>` stripping behavior is documented as of 2019; verify that behavior has not changed before shipping as authoritative. |
| Gmail 8,192-character `<style>` limit | Not surfacing this to users | Show a character counter for `<style>` blocks in the editor, warn when approaching the Gmail limit. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-parsing full HTML AST on every keystroke | Preview lags on large HTML inputs | Debounce at ≥300ms; consider Web Worker for CSS parsing | Inputs >5KB with fast typists |
| Creating a new iframe DOM on every render | Flicker, memory leak over long sessions | Mutate the iframe `srcdoc` property rather than destroying/recreating the iframe element | After ~100 re-renders in a single session |
| Applying CSS simulation transforms in the render thread | Main thread jank, frozen editor | Move CSS property filtering to a Web Worker or memoized transform | HTML inputs >10KB |
| Rendering all 4 client previews simultaneously on every change | 4x render cost | Render only the currently visible/active preview; lazy-render others on tab switch | Immediately — 4 simultaneous iframes is expensive from the start |
| Loading the full caniemail JSON dataset on every simulation call | Slow first render | Cache parsed rules in module scope or IndexedDB on first load | Not a scaling issue but a first-load UX issue |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `sandbox="allow-scripts allow-same-origin"` | Complete sandbox bypass — iframe can access parent DOM | Never combine these two flags. Use `allow-same-origin` without `allow-scripts`. |
| No CSP inside iframe content | CSS injection attacks — exfiltrate data via CSS attribute selectors | Add `<meta http-equiv="Content-Security-Policy" content="script-src 'none';">` inside every iframe document |
| Accepting `javascript:` hrefs from email HTML | Code execution via link click inside preview | Strip or neutralize `javascript:` protocol on all `href` and `src` attributes before rendering |
| No `postMessage` origin validation | Malicious pages can send fake resize/interaction events | Always check `event.origin` in any `postMessage` listener |
| Serving iframe content from same origin without sandbox | Arbitrary user HTML can access cookies and localStorage | Always include `sandbox` attribute even for same-origin iframes rendering user content |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No disclaimer distinguishing simulation from real rendering | Users ship broken emails believing the simulation was a guarantee | Persistent "simulation accuracy" notice per preview; link to what was tested vs. estimated |
| Showing all 4 previews with equal visual weight regardless of data confidence | Users trust Daum preview as much as Gmail preview | Confidence badge per client: HIGH (Gmail, Outlook), MEDIUM (Naver), LOW/ESTIMATED (Daum) |
| No feedback when Gmail would strip the entire `<style>` block | User sees styled Gmail preview but real Gmail would be unstyled | Real-time warning: "Your Gmail preview is showing styles, but Gmail will strip your entire style block due to [reason]." |
| Editor and preview not in sync visually | User edits code but cannot see which part affects which preview | Highlight or diff the rendering change in the preview when code changes |
| No size indicator for Gmail's 102KB limit | Heavy emails show as fine in preview but get clipped by Gmail | Show live HTML byte count in the editor toolbar; warn at 80KB, error indicator at 102KB |
| Client tab labels without rendering engine clarification | Users don't know if "Outlook" means Word engine or Chromium engine | Label tabs as "Outlook (Classic)" and "Outlook (New)" — or at minimum add a tooltip |

---

## "Looks Done But Isn't" Checklist

- [ ] **Korean client simulation:** Preview renders — but verify the CSS property blocklist includes per-property inline rules (not just `<style>` tag stripping). Naver blocks `margin` even inline.
- [ ] **Gmail simulation:** Preview shows styled output — but verify the all-or-nothing `<style>` block stripping is implemented. If `background-image: url()` is present in the block, the entire block should be stripped.
- [ ] **Outlook simulation:** One Outlook tab renders — but verify it is labeled (Classic vs. New) and that the rules match the correct engine's behavior.
- [ ] **iframe security:** Preview renders user HTML — but verify `sandbox` attribute does not include both `allow-scripts` and `allow-same-origin`. Verify CSP meta tag is inside the iframe document.
- [ ] **Daum simulation:** Preview renders — but verify the data is labeled as "estimated" and rules are documented with provenance noting they are not verified against real Daum behavior.
- [ ] **caniemail data:** Naver and Daum rules populate — but verify those rules are NOT sourced from caniemail (which has no Korean client data) and are sourced from a separately maintained Korean client data file.
- [ ] **Real-time update:** Preview updates on typing — but verify the debounce threshold prevents main-thread blocking and that the iframe is mutated rather than re-created on each update.
- [ ] **Gmail 102KB limit:** No warning shown — but verify a byte counter is visible in the editor and a warning fires before the 102KB clip threshold.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Simulation presented as ground truth with no disclaimer | LOW | Add UI disclaimer text and confidence badges — no architecture change needed |
| Korean client rules built on no primary data | HIGH | Requires building a new verified data layer, re-testing rules against real clients, and potentially reverting incorrect simulations already shipped |
| Single Outlook client (not split into Classic/New) | MEDIUM | Add a second client profile, duplicate and differentiate the CSS rules, update UI with two tabs |
| iframe security misconfiguration discovered post-launch | HIGH | Requires hotfix deploy; potential security incident if user data was exposed; trust damage with users |
| caniemail data used for Korean clients | MEDIUM | Identify which rules were incorrectly sourced, replace with Korean-specific data, re-validate simulation behavior |
| Gmail all-or-nothing stripping not implemented | MEDIUM | Add pre-pass validation step to Gmail simulation; update CSS rule application order |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Simulation presented as ground truth | Phase 1 (Foundation / UI design) | Disclaimer text visible in every preview panel before any code ships |
| caniemail has no Korean client data | Phase 1 (Data modeling) | Korean client rules exist in a separate data file with provenance fields; no Korean rules sourced from caniemail |
| Style tag stripping ≠ inline property blocking | Phase 2 (CSS simulation engine) | Naver preview strips margin even on inline-styled elements; confirmed with test input |
| Gmail all-or-nothing `<style>` block stripping | Phase 2 (Gmail-specific rules) | Test input with `background-image: url()` in style block shows unstyled Gmail preview |
| Dual Outlook engine not modeled | Phase 1 (Client data modeling) | Two Outlook entries exist in client data before any Outlook rendering is implemented |
| iframe security misconfiguration | Phase 2 (Preview rendering) | Security review checklist passed: no `allow-scripts + allow-same-origin`, CSP present, `javascript:` stripped |
| Daum simulation without verified data | Phase 1 (Data modeling) + Phase 3 (Daum-specific) | Daum rules carry `confidence: "estimated"` and UI shows confidence level; no claim of accuracy in copy |
| Performance: 4 iframes re-rendered simultaneously | Phase 2 (Preview rendering) | Only active tab renders on change; inactive previews render on tab focus |

---

## Sources

- Email on Acid — Naver Webmail Testing: https://www.emailonacid.com/blog/article/email-development/naver-webmail-testing-what-you-need-to-know/
- caniemail.com Scoreboard (21 clients listed, no Korean clients): https://www.caniemail.com/scoreboard/
- caniemail.com About Estimated Support: https://www.caniemail.com/support/
- Close.com — Rendering Untrusted HTML Email Safely: https://making.close.com/posts/rendering-untrusted-html-email-safely/
- DEV Community — Complete Guide to Email Client Rendering Differences 2026: https://dev.to/mailpeek/the-complete-guide-to-email-client-rendering-differences-in-2026-243f
- Litmus — Gmail Email Clipping 102KB: https://www.litmus.com/blog/how-to-keep-gmail-from-clipping-your-emails
- hteumeuleu email-bugs — Gmail clips at 102kB: https://github.com/hteumeuleu/email-bugs/issues/41
- HTeuMeuLeu — Email Coding Guidelines (international clients that strip style tags, including Naver): https://www.hteumeuleu.com/2019/email-coding-guidelines/
- Stripo — Dark Mode Email Preview Tools: https://stripo.email/blog/best-tools-for-dark-mode-email-preview-what-we-tested/
- Mailsoftly — Outlook Rendering Issues 2025: https://mailsoftly.com/blog/why-does-my-outlook-look-different/

---
*Pitfalls research for: Korean email client HTML preview/simulation tool*
*Researched: 2026-04-23*
