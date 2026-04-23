# Requirements: Sticky

**Defined:** 2026-04-23
**Core Value:** 각 이메일 클라이언트의 CSS 제한사항을 정확하게 시뮬레이션하여 실제 클라이언트에서 보이는 것과 거의 동일한 프리뷰를 제공하는 것.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Editor

- [x] **EDIT-01**: User can write and edit HTML in a code editor with syntax highlighting
- [x] **EDIT-02**: User can paste HTML into the editor without content being mangled or reformatted
- [x] **EDIT-03**: User sees preview update in real-time as they edit HTML (debounced ~300ms)

### Client Simulation

- [x] **SIM-01**: User can see how their HTML email renders in Naver Mail (strips `<style>`, inline CSS only, blocks `margin` inline)
- [x] **SIM-02**: User can see how their HTML email renders in Daum/Kakao Mail (estimated rules, conservative webmail baseline, labeled as "estimated")
- [x] **SIM-03**: User can see how their HTML email renders in Gmail (all-or-nothing `<style>` block stripping behavior)

### Layout & UX

- [x] **UX-01**: User can see all client previews side-by-side in a parallel layout
- [ ] **UX-02**: User can toggle between mobile (375px) and desktop (600px) viewport per preview pane

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Outlook Simulation

- **OUT-01**: User can see how their HTML renders in Outlook Classic (Word engine)
- **OUT-02**: User can see how their HTML renders in Outlook New (Chromium engine)

### Enhanced UX

- **ENH-01**: User sees simulation disclaimer per preview pane
- **ENH-02**: User sees confidence badge (HIGH/MEDIUM/LOW) per client
- **ENH-03**: User sees Korean-specific CSS compatibility warnings
- **ENH-04**: User can auto-fix inline CSS for clients that strip `<style>` tags
- **ENH-05**: User can toggle dark mode preview per client
- **ENH-06**: User sees preheader/subject line preview above email body
- **ENH-07**: User sees Gmail 102KB size counter with warning

### Collaboration

- **COL-01**: User can share preview via URL
- **COL-02**: User can copy client-specific inlined HTML for export

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real screenshot capture (send test email + capture) | Infrastructure complexity, breaks static deployment constraint |
| User accounts / login | Adds auth complexity; tool should be instantly usable |
| File upload (HTML/EML/MJML) | v1 focuses on code editor input only |
| Team collaboration / comments | Requires real-time sync infrastructure |
| Spam score checking | Requires server-side processing |
| Send test email to real inbox | SMTP infrastructure out of scope |
| AI-generated email HTML | Distraction from core preview value |
| Mobile app | Web-first approach |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 | Phase 5 | Pending |
| EDIT-02 | Phase 5 | Pending |
| EDIT-03 | Phase 6 | Pending |
| SIM-01 | Phase 2 | Complete |
| SIM-02 | Phase 4 | Pending |
| SIM-03 | Phase 3 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-23*
*Last updated: 2026-04-23 after roadmap creation*
