# Feature Research

**Domain:** Email client HTML preview / rendering simulation tool
**Researched:** 2026-04-23
**Confidence:** MEDIUM (Korean client CSS specifics LOW due to scarce public data)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| HTML code editor with syntax highlighting | Every developer tool has one; raw textarea feels broken | LOW | CodeMirror or Monaco are standard choices |
| Live / real-time preview update | Litmus Builder, Parcel, Postdrop all do this; any delay feels like a regression | LOW | Debounce input ~300ms, render into sandboxed iframe |
| Multi-client side-by-side rendering | Core value prop of every preview tool; single-pane defeats the purpose | MEDIUM | Each pane = isolated iframe with client-specific CSS stripping rules |
| Gmail rendering simulation | Gmail is the global default; first thing any user will test | MEDIUM | Strip `<style>` blocks; remove external CSS; apply Gmail-specific attribute stripping |
| Outlook rendering simulation | Critical for Korean B2B users; Outlook behavior is the hardest to predict | HIGH | Word/HTML rendering engine quirks: no border-radius, no box-shadow, conditional comments needed |
| Naver Mail rendering simulation | Highest Korean market share; the key differentiator from Western tools | HIGH | Strips `<style>` in `<head>`; inline CSS only; good border/border-radius support otherwise |
| Daum/Kakao Mail rendering simulation | Second Korean webmail; paired with Naver as the Korean-specific pair | HIGH | Limited public data; behavior similar to Naver (webmail stripping patterns) |
| Paste HTML into editor | Primary workflow; must accept arbitrary HTML paste without mangling it | LOW | No auto-reformatting on paste that breaks user's structure |
| Responsive / mobile preview toggle | All modern preview tools offer desktop+mobile toggle | LOW | CSS viewport width simulation (600px desktop, 375px mobile) |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Korean-specific CSS compatibility warnings | No Western tool covers Naver/Daum — this is the entire gap in the market | HIGH | Parse HTML/CSS, flag properties unsupported by Korean clients (e.g., `<style>` blocks, CSS variables, flexbox) |
| Inline CSS suggestion / auto-fix | If Naver strips `<style>`, tell the user what to inline and offer to do it | MEDIUM | CSS inliner (juice or inline-css npm packages) applied per-client |
| Client-specific warning panel | Show what broke and why for each client, not just a broken preview | MEDIUM | Annotated diff of what CSS/HTML was removed during simulation |
| Dark mode preview toggle | Growing importance; Gmail, Apple Mail, Outlook all have dark mode | MEDIUM | Apply `prefers-color-scheme: dark` inside preview iframe |
| Shareable preview URL | Teams need to share results without paying for Litmus collaboration tier | MEDIUM | Encode HTML in URL params or short-lived server-side hash (complicates static deployment) |
| Keyboard shortcut support | Power users (email developers) expect Cmd+S, Cmd+Shift+F etc. | LOW | Map common shortcuts to format, copy output, toggle preview |
| Copy client-specific inlined HTML | Export per-client optimized HTML for direct paste into ESP | MEDIUM | Run inliner + CSS strip per client, output clean HTML |
| Preheader / subject line preview | Inbox preview (sender, subject, snippet) is shown by Litmus and Parcel | LOW | Render a mock inbox row above the email body preview |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real screenshot capture (send test email + screenshot) | Feels like "real" verification; Litmus uses this | Requires email sending infrastructure, headless browser farm, and per-test latency of 10-60s; breaks static deployment constraint; high infra cost | CSS simulation is 95% accurate and instant; label it clearly as simulation |
| User accounts / saved templates | "Save my work" is natural | Adds auth infrastructure, database, GDPR obligations, and login friction; defeats "open immediately" goal | Browser localStorage for draft persistence; no account needed |
| File upload (EML / MJML import) | Some users have files not clipboard content | Adds format parsing complexity; MJML requires server-side compilation; EML parsing is brittle | Stay with paste-HTML workflow for v1; add file input as enhancement after validation |
| Team collaboration / comments | Litmus charges $500/mo partly for this | Requires real-time sync (WebSocket), auth, and comment storage; huge scope | Shareable URL covers 80% of the collaboration use case |
| Spam score checking | Email on Acid bundles this | SpamAssassin integration needs server-side processing; out of scope for client-side tool | Provide a link to external spam checkers (mail-tester.com) |
| Send test email to real inbox | Feels like "final validation" | Requires SMTP integration, deliverability management, bounce handling; complex infra | Out of scope for v1; framing as simulation tool manages expectations |
| AI-generated email HTML | Users see AI everywhere | Distraction from core value; adds LLM costs and latency; editing AI output in a preview tool is redundant with other tools | Focus on previewing hand-written or template HTML |

---

## Feature Dependencies

```
[HTML Code Editor]
    └──requires──> [Sandboxed iframe renderer]
                       └──requires──> [Per-client CSS stripping rules]
                                          └──requires──> [Client CSS capability data]

[Real-time preview]
    └──requires──> [HTML Code Editor]
    └──requires──> [Sandboxed iframe renderer]

[Korean client simulation (Naver/Daum)]
    └──requires──> [Per-client CSS stripping rules]
    └──requires──> [Research: Korean client CSS support data] (no caniemail.com data exists for these)

[CSS compatibility warning panel]
    └──requires──> [Per-client CSS stripping rules]
    └──enhances──> [Multi-client side-by-side rendering]

[Inline CSS suggestion / auto-fix]
    └──requires──> [Per-client CSS stripping rules]
    └──enhances──> [CSS compatibility warning panel]

[Dark mode preview toggle]
    └──requires──> [Sandboxed iframe renderer]
    └──enhances──> [Multi-client side-by-side rendering]

[Shareable preview URL]
    └──conflicts──> [Static deployment constraint] (needs server or very long URL)

[Preheader / subject line preview]
    └──enhances──> [Multi-client side-by-side rendering]
```

### Dependency Notes

- **Korean client simulation requires original research:** caniemail.com does NOT include Naver or Daum/Kakao. The CSS capability data for these clients must be manually researched and hardcoded. This is the highest-risk dependency in the entire project.
- **Sandboxed iframe renderer is the foundation:** Every preview feature depends on getting iframe sandbox right (prevent script execution, isolate styles, handle relative paths).
- **Shareable URL conflicts with static deployment:** Encoding full HTML in URL params works for small emails but breaks for large ones. Either accept the limitation or add a minimal backend (e.g., Vercel KV, R2) — decide at architecture phase.
- **Dark mode enhances multi-client:** Each client pane gets its own dark mode toggle, not a global one, because different clients handle dark mode differently.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] HTML code editor with syntax highlighting — without this, the tool is unusable
- [ ] Real-time preview update (debounced) — delay kills workflow
- [ ] Gmail simulation pane — global default client, first credibility test
- [ ] Outlook simulation pane — B2B Korean users; known rendering quirks needed
- [ ] Naver Mail simulation pane — the primary differentiator; must ship on day 1
- [ ] Daum/Kakao Mail simulation pane — paired with Naver; Korean-specific pair is the product's identity
- [ ] Side-by-side layout (all 4 panes visible simultaneously) — stated requirement in PROJECT.md
- [ ] Mobile/desktop viewport toggle per pane — baseline expectation of any preview tool

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] CSS compatibility warning panel — add when user feedback confirms simulation alone is not enough
- [ ] Inline CSS auto-fix suggestion — add when users complain about Naver breaking their styles
- [ ] Dark mode toggle — add when dark mode adoption makes it a common question
- [ ] Preheader / subject line preview — add when users ask about inbox appearance, not just body

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Shareable preview URL — defer; requires backend decision; validate need first
- [ ] Copy client-specific inlined HTML — defer; build after users request clean export workflow
- [ ] Keyboard shortcuts — defer; nice-to-have polish after core is stable
- [ ] File upload (HTML file) — defer; paste workflow covers most users initially

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| HTML code editor | HIGH | LOW | P1 |
| Real-time preview | HIGH | LOW | P1 |
| Gmail simulation | HIGH | MEDIUM | P1 |
| Outlook simulation | HIGH | HIGH | P1 |
| Naver Mail simulation | HIGH | HIGH | P1 |
| Daum/Kakao simulation | HIGH | HIGH | P1 |
| Side-by-side layout | HIGH | LOW | P1 |
| Mobile/desktop toggle | MEDIUM | LOW | P1 |
| CSS warning panel | HIGH | MEDIUM | P2 |
| Inline CSS auto-fix | MEDIUM | MEDIUM | P2 |
| Dark mode toggle | MEDIUM | LOW | P2 |
| Preheader preview | LOW | LOW | P2 |
| Shareable URL | MEDIUM | HIGH | P3 |
| Keyboard shortcuts | LOW | LOW | P3 |
| Copy inlined HTML | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Litmus | Email on Acid | Parcel | Sticky (our approach) |
|---------|--------|---------------|--------|----------------------|
| Live code editor | Yes (Litmus Builder) | Paste-and-test | Yes (primary UX) | Yes — split pane |
| Real-time preview | Yes | No (manual trigger) | Yes | Yes |
| Korean clients (Naver/Daum) | No | No | No | Yes — core differentiator |
| Gmail simulation | Yes (screenshot) | Yes (screenshot) | Yes (screenshot) | Yes (CSS simulation) |
| Outlook simulation | Yes (screenshot) | Yes (screenshot) | Yes (screenshot) | Yes (CSS simulation) |
| Rendering method | Real screenshots via test email | Real screenshots via test email | Real screenshots via test email | Client-side CSS simulation |
| Dark mode preview | Yes | Yes | Yes | v1.x |
| CSS compatibility checker | Yes | Yes | Yes | v1.x |
| Inline CSS export | No | No | No | v2+ |
| Price | $500/mo | $74/mo | Paid tiers | Free |
| Korean market awareness | None | None | None | Primary focus |

**Key insight:** Every major competitor uses real screenshot capture (send email, get screenshot). Sticky uses client-side CSS simulation instead. This is simultaneously the primary constraint (less pixel-perfect) and the primary advantage (instant, free, no infrastructure, Korean clients possible without actual mailboxes).

---

## Critical Research Gap

**Naver and Daum/Kakao CSS support data does not exist in caniemail.com.** This is the single most important finding from this research. The project's core differentiator depends on data that must be gathered independently:

1. Naver Mail: `<style>` blocks stripped from `<head>`; inline CSS works; borders, border-radius, animated GIFs supported; RGB/RGBA color formats may be unreliable (use hex); no external stylesheets.
2. Daum/Kakao Mail: Minimal public documentation found. Behavior likely similar to Naver (webmail pattern), but requires empirical testing to confirm specific CSS properties stripped.

This gap means the Korean client simulation rules will need to be researched and maintained by the project team as a bespoke knowledge base — this is a permanent ongoing cost, not a one-time task.

---

## Sources

- [Email on Acid: Naver Webmail Testing](https://www.emailonacid.com/blog/article/email-development/naver-webmail-testing-what-you-need-to-know/) — Naver CSS limitations (inline only, no head style blocks)
- [caniemail.com/clients](https://www.caniemail.com/clients/) — Confirmed: Naver and Daum/Kakao are NOT in caniemail database
- [BigDevSoon Email HTML Preview](https://bigdevsoon.me/tools/email-html-preview/) — CSS stripping simulation approach reference
- [Mailosaur blog: email preview tools 2026](https://mailosaur.com/blog/previews-tools-2026) — Feature comparison across Litmus, Email on Acid, Mailosaur
- [Parcel: Previews & Testing](https://parcel.io/platform/previews) — Parcel feature set
- [Korean developer blog: HTML email CSS in Naver/clients](https://heropy.blog/2018/12/30/html-email-template/) — Korean-language source confirming inline CSS requirement
- [Email on Acid vs Litmus comparison](https://emailwarmup.com/blog/email-testing/email-on-acid-vs-litmus/) — Competitor feature breakdown

---
*Feature research for: Korean email client HTML preview tool (Sticky)*
*Researched: 2026-04-23*
