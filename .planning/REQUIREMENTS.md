# Requirements: Sticky

**Defined:** 2026-04-23
**Core Value:** 각 이메일 클라이언트의 CSS 제한사항을 정확하게 시뮬레이션하여 실제 클라이언트에서 보이는 것과 거의 동일한 프리뷰를 제공하는 것.

## v1 Requirements (Completed)

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
- [x] **UX-02**: User can toggle between mobile (375px) and desktop (600px) viewport per preview pane

## v2 Requirements

### 레이아웃

- [ ] **LAYOUT-01**: 에디터가 뷰포트 높이를 꽉 채우고 프리뷰 영역과 수평으로 분할된다
- [ ] **LAYOUT-02**: 프리뷰 패널들이 수평으로 배치되며 프리뷰 영역만 수평 스크롤된다 (에디터는 고정)

### CSS 분석

- [ ] **CSS-01**: 사용자가 작성한 HTML에서 각 클라이언트별 호환되지 않는 CSS 속성을 경고 패널에 표시한다
- [ ] **CSS-02**: 사용자가 `<style>` 블록의 CSS를 자동으로 inline style로 변환할 수 있다
- [ ] **CSS-03**: Gmail의 102KB 제한에 대해 현재 HTML 크기를 표시하고 초과 시 경고한다

### Outlook 시뮬레이션

- [ ] **OUT-01**: Outlook Classic (Word 엔진) 렌더링 시뮬레이션을 제공한다
- [ ] **OUT-02**: Outlook New (Chromium 엔진) 렌더링 시뮬레이션을 제공한다

### 입력 확장

- [ ] **INPUT-01**: 사용자가 HTML 파일을 드래그앤드롭 또는 파일 선택으로 에디터에 로드할 수 있다

### 수익화

- [ ] **AD-01**: 페이지에 광고 영역이 표시되며 사용자 경험을 방해하지 않는 위치에 배치된다

## v3 Requirements (Deferred)

- **COL-01**: User can share preview via URL
- **COL-02**: User can copy client-specific inlined HTML for export
- **ENH-05**: User can toggle dark mode preview per client
- **ENH-06**: User sees preheader/subject line preview above email body

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real screenshot capture | Infrastructure complexity, breaks static deployment constraint |
| User accounts / login | Tool should be instantly usable without auth |
| Mobile app | Web-first approach |
| Spam score checking | Requires server-side processing |
| Send test email to real inbox | SMTP infrastructure out of scope |
| AI-generated email HTML | Distraction from core preview value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 | Phase 5 (v1) | Complete |
| EDIT-02 | Phase 5 (v1) | Complete |
| EDIT-03 | Phase 6 (v1) | Complete |
| SIM-01 | Phase 2 (v1) | Complete |
| SIM-02 | Phase 4 (v1) | Complete |
| SIM-03 | Phase 3 (v1) | Complete |
| UX-01 | Phase 7 (v1) | Complete |
| UX-02 | Phase 8 (v1) | Complete |
| LAYOUT-01 | Phase 11 (v2) | Pending |
| LAYOUT-02 | Phase 11 (v2) | Pending |
| CSS-01 | Phase 12 (v2) | Pending |
| CSS-02 | Phase 13 (v2) | Pending |
| CSS-03 | Phase 14 (v2) | Pending |
| INPUT-01 | Phase 15 (v2) | Pending |
| OUT-01 | Phase 16 (v2) | Pending |
| OUT-02 | Phase 16 (v2) | Pending |
| AD-01 | Phase 17 (v2) | Pending |

**Coverage:**
- v1 requirements: 8 total — 8 complete
- v2 requirements: 9 total — 9 mapped to phases
- Mapped to phases: 9/9 (100%)

---
*Requirements defined: 2026-04-23*
*Last updated: 2026-04-24 — v2.0 traceability mapped (Phases 11-18)*
