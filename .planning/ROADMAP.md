# Roadmap: Sticky — Korean Email Client Preview Tool

## Overview

Sticky is built in three layers: typed client data → pure-function simulation engine → React UI. The roadmap follows that order. Foundation and client rulesets come first because simulation accuracy is the core value — wrong data equals a wrong tool. The engine is proven in isolation before any UI exists. The editor and real-time pipeline are wired together next, validated on a single client. The multi-client layout fans out from that proven pipeline. Viewport toggles, security hardening, and UX polish complete the v1 product.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-10 (shipped 2026-04-24)
- 🚧 **v2.0 프로덕션 확장** - Phases 11-18 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 MVP (Phases 1-10) - SHIPPED 2026-04-24</summary>

- [x] **Phase 1: Foundation** - TypeScript types, client ruleset data model, provenance fields
- [x] **Phase 2: Naver Simulation Engine** - Pure-function CSS transform for Naver Mail (SIM-01) ✓ 2026-04-24
- [x] **Phase 3: Gmail Simulation Engine** - All-or-nothing `<style>` block behavior (SIM-03) ✓ 2026-04-24
- [x] **Phase 4: Daum/Kakao Simulation Engine** - Conservative estimated baseline (SIM-02) ✓ 2026-04-24
- [x] **Phase 5: Code Editor** - Monaco editor with syntax highlighting and paste fidelity (EDIT-01, EDIT-02) ✓ 2026-04-24
- [x] **Phase 6: Real-time Preview Pipeline** - Debounced editor→engine→iframe data flow (EDIT-03) ✓ 2026-04-24
- [x] **Phase 7: Multi-Client Parallel Layout** - Side-by-side preview grid for all clients (UX-01) ✓ 2026-04-24
- [x] **Phase 8: Viewport Toggle** - Mobile/desktop width toggle per preview pane (UX-02) ✓ 2026-04-24
- [x] **Phase 9: Security & Sandbox Hardening** - iframe CSP, sandbox attributes, frame-wrapper ✓ 2026-04-24
- [x] **Phase 10: UX Polish & Launch Readiness** - Client labels, disclaimers, confidence indicators ✓ 2026-04-24

</details>

### v2.0 프로덕션 확장 (Complete)

- [x] **Phase 11: 레이아웃 개선** - 에디터 뷰포트 꽉채움, 프리뷰 수평 배치 + 수평 스크롤 ✓ 2026-04-24
- [x] **Phase 12: CSS 호환성 경고 패널** - 클라이언트별 비호환 CSS 속성 경고 표시 ✓ 2026-04-24
- [x] **Phase 13: Inline CSS 자동 변환** - `<style>` 블록을 inline style로 자동 변환 ✓ 2026-04-24
- [x] **Phase 14: Gmail 102KB 카운터** - HTML 크기 실시간 표시 및 초과 경고 ✓ 2026-04-24
- [x] **Phase 15: HTML 파일 업로드** - 드래그앤드롭 / 파일 선택으로 HTML 로드 ✓ 2026-04-24
- [x] **Phase 16: Outlook 시뮬레이션** - Outlook Classic (Word) + New (Chromium) 엔진 시뮬레이션 ✓ 2026-04-24
- [x] **Phase 17: 광고 수익화** - AdSense 기반 비침해적 광고 배치 ✓ 2026-04-24
- [x] **Phase 18: v2 런칭 준비** - 최종 QA, 크로스브라우저 검증, 성능 최적화 ✓ 2026-04-24

## Phase Details

<details>
<summary>v1.0 MVP Phase Details (Phases 1-10)</summary>

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
**Plans:** 1 plan
Plans:
- [x] 03-01-PLAN.md — TDD: Gmail conditional style block stripping + engine extension + unit tests

### Phase 4: Daum/Kakao Simulation Engine
**Goal**: Users can see a conservative estimated baseline for how Daum/Kakao Mail renders their email
**Depends on**: Phase 1
**Requirements**: SIM-02
**Success Criteria** (what must be TRUE):
  1. User sees a Daum/Kakao preview pane that applies a conservative webmail baseline ruleset (block external resources, strip unsupported at-rules)
  2. The Daum/Kakao pane is visually labeled "estimated" so users understand the confidence level
  3. The simulation engine for Daum/Kakao uses the same `applyClientRules` interface as Naver and Gmail
  4. Unit tests document the assumed restrictions and pass against the conservative baseline ruleset
**Plans:** 1 plan
Plans:
- [x] 04-01-PLAN.md — Daum/Kakao simulation engine

### Phase 5: Code Editor
**Goal**: Users can write and paste HTML email code into a syntax-highlighted editor without content being mangled
**Depends on**: Nothing (can run in parallel with Phases 1-4)
**Requirements**: EDIT-01, EDIT-02
**Success Criteria** (what must be TRUE):
  1. User can open the app and see a Monaco editor with HTML syntax highlighting active
  2. User pastes an HTML email (including multi-line attributes, special characters, and `<style>` blocks) — the content is preserved exactly, character for character
  3. The editor renders without SSR errors (dynamic import bypass applied correctly)
  4. The editor accepts HTML IntelliSense and does not mangle indentation or encoding on paste
**Plans:** 1 plan
Plans:
- [x] 05-01-PLAN.md — Monaco editor with HTML syntax highlighting, paste fidelity, and dynamic import

### Phase 6: Real-time Preview Pipeline
**Goal**: Users see their preview update within ~300ms of making any edit in the code editor
**Depends on**: Phase 2 (at least one working simulation engine), Phase 5 (editor)
**Requirements**: EDIT-03
**Success Criteria** (what must be TRUE):
  1. User types a character in the editor — a preview pane updates within approximately 300ms (debounced)
  2. User pastes a complete HTML email — all active preview panes update without a page reload
  3. The preview renders inside a sandboxed `<iframe srcdoc>` (verified via DevTools sandbox attribute)
  4. Rapid successive edits do not trigger multiple simultaneous renders — only the final state after debounce fires
**Plans:** 1 plan
Plans:
- [x] 06-01-PLAN.md — Debounced preview pipeline

### Phase 7: Multi-Client Parallel Layout
**Goal**: Users can see all client previews side-by-side and compare rendering differences at a glance
**Depends on**: Phase 6 (real-time pipeline), Phases 2, 3, 4 (all simulation engines)
**Requirements**: UX-01
**Success Criteria** (what must be TRUE):
  1. User sees Naver, Gmail, and Daum/Kakao preview panes displayed simultaneously in a side-by-side grid
  2. Each preview pane is labeled with the client name
  3. User can resize the split between the editor and the preview area using a drag handle
  4. All panes update in real time when the user edits HTML in the editor
**Plans:** 1 plan
Plans:
- [x] 07-01-PLAN.md — Multi-client parallel layout

### Phase 8: Viewport Toggle
**Goal**: Users can switch each preview pane between mobile and desktop widths to test responsive rendering
**Depends on**: Phase 7
**Requirements**: UX-02
**Success Criteria** (what must be TRUE):
  1. User clicks a toggle on a preview pane — the iframe width changes from 600px (desktop) to 375px (mobile) or vice versa
  2. The toggle state is independent per pane (one pane can be mobile while another is desktop)
  3. The viewport toggle does not reload or re-simulate the email — only the iframe container width changes
  4. The toggle button clearly indicates the current viewport state (mobile or desktop)
**Plans:** 1 plan
Plans:
- [x] 08-01-PLAN.md — Viewport toggle

### Phase 9: Security & Sandbox Hardening
**Goal**: The preview iframes are fully sandboxed and cannot exfiltrate data, execute scripts against the host, or access the parent frame
**Depends on**: Phase 6
**Requirements**: (none — security hardening, cross-cutting concern)
**Success Criteria** (what must be TRUE):
  1. All preview iframes have `sandbox` attribute set to `allow-same-origin` only (no `allow-scripts` combined with `allow-same-origin`)
  2. Each iframe document contains a CSP meta tag restricting scripts, external connections, and form submissions
  3. A `<base target="_blank">` tag is present in each frame document so links cannot navigate the parent
  4. Injecting `<script>alert(1)</script>` into the editor does not execute in any preview pane
**Plans:** 1 plan
Plans:
- [x] 09-01-PLAN.md — Security & sandbox hardening

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
**Plans:** 1 plan
Plans:
- [x] 10-01-PLAN.md — UX polish & launch readiness

</details>

### Phase 11: 레이아웃 개선
**Goal**: 에디터가 뷰포트 전체 높이를 차지하고 프리뷰 패널이 수평으로 배치되어 전문 도구다운 레이아웃을 제공한다
**Depends on**: Phase 10 (v1 완료)
**Requirements**: LAYOUT-01, LAYOUT-02
**Success Criteria** (what must be TRUE):
  1. 에디터가 브라우저 뷰포트 높이를 꽉 채우며 페이지 전체 스크롤 없이 사용할 수 있다
  2. 에디터와 프리뷰 영역이 수평으로 분할되며 에디터는 화면 왼쪽에 고정된다
  3. 프리뷰 패널들이 가로로 나란히 배치되며 프리뷰 영역만 독립적으로 수평 스크롤된다
  4. 에디터를 스크롤하거나 편집할 때 프리뷰 영역의 수평 스크롤 위치가 유지된다
**Plans**: TBD
**UI hint**: yes

### Phase 12: CSS 호환성 경고 패널
**Goal**: 사용자가 작성한 HTML에서 각 클라이언트별 호환되지 않는 CSS 속성을 한눈에 확인할 수 있다
**Depends on**: Phase 11
**Requirements**: CSS-01
**Success Criteria** (what must be TRUE):
  1. 사용자가 비호환 CSS 속성을 사용하면 경고 패널에 클라이언트명, 속성명, 줄 번호가 표시된다
  2. 경고 항목을 클릭하면 에디터에서 해당 줄로 이동한다
  3. HTML을 수정하면 경고 목록이 실시간으로 갱신된다
  4. 경고 패널을 접거나 펼 수 있어 작업 공간을 확보할 수 있다
**Plans**: TBD
**UI hint**: yes

### Phase 13: Inline CSS 자동 변환
**Goal**: 사용자가 `<style>` 블록의 CSS를 버튼 하나로 inline style로 변환하여 이메일 호환성을 높일 수 있다
**Depends on**: Phase 12 (경고 → 자동 수정 흐름)
**Requirements**: CSS-02
**Success Criteria** (what must be TRUE):
  1. 사용자가 "Inline CSS" 버튼을 클릭하면 `<style>` 블록의 규칙이 대응 요소의 inline style로 변환된다
  2. 변환 후 에디터 내용이 자동 갱신되고 프리뷰가 즉시 반영된다
  3. 변환 전 원본 HTML로 되돌릴 수 있는 Undo 기능이 제공된다
  4. 미디어 쿼리 등 inline으로 변환 불가능한 규칙은 보존되고 사용자에게 알림이 표시된다
**Plans**: TBD
**UI hint**: yes

### Phase 14: Gmail 102KB 카운터
**Goal**: 사용자가 Gmail의 102KB HTML 크기 제한에 대해 현재 상태를 실시간으로 파악할 수 있다
**Depends on**: Phase 11 (레이아웃에 카운터 배치)
**Requirements**: CSS-03
**Success Criteria** (what must be TRUE):
  1. 에디터 또는 상태바 영역에 현재 HTML 크기(KB)가 실시간으로 표시된다
  2. 102KB를 초과하면 카운터가 경고 색상으로 변하고 경고 메시지가 표시된다
  3. 크기 계산은 UTF-8 바이트 기준이며 에디터 수정 시 실시간 갱신된다
**Plans**: TBD
**UI hint**: yes

### Phase 15: HTML 파일 업로드
**Goal**: 사용자가 로컬 HTML 파일을 드래그앤드롭 또는 파일 선택으로 에디터에 바로 로드할 수 있다
**Depends on**: Phase 11 (레이아웃 완성 후)
**Requirements**: INPUT-01
**Success Criteria** (what must be TRUE):
  1. 사용자가 HTML 파일을 에디터 영역에 드래그앤드롭하면 파일 내용이 에디터에 로드된다
  2. 파일 선택 버튼을 클릭하여 파일 탐색기에서 HTML 파일을 선택할 수 있다
  3. .html/.htm 이외의 파일은 거부되고 사용자에게 안내 메시지가 표시된다
  4. 파일 로드 후 프리뷰가 자동으로 갱신된다
**Plans**: TBD
**UI hint**: yes

### Phase 16: Outlook 시뮬레이션
**Goal**: 사용자가 Outlook Classic(Word 엔진)과 Outlook New(Chromium 엔진)에서의 이메일 렌더링을 시뮬레이션으로 확인할 수 있다
**Depends on**: Phase 11 (수평 스크롤 레이아웃에 새 패널 추가)
**Requirements**: OUT-01, OUT-02
**Success Criteria** (what must be TRUE):
  1. 프리뷰 영역에 Outlook Classic과 Outlook New 패널이 추가되어 기존 클라이언트와 나란히 표시된다
  2. Outlook Classic 패널은 Word 엔진의 CSS 제한을 시뮬레이션한다 (float 무시, max-width 미지원, CSS position 제거 등)
  3. Outlook New 패널은 Chromium 기반 제한을 시뮬레이션한다 (대부분 CSS 지원, 일부 제한)
  4. 두 Outlook 패널 모두 기존 뷰포트 토글과 실시간 프리뷰 파이프라인이 작동한다
**Plans**: TBD

### Phase 17: 광고 수익화
**Goal**: 사용자 경험을 방해하지 않는 위치에 광고가 표시되어 서비스 운영 비용을 충당할 수 있다
**Depends on**: Phase 11 (레이아웃 확정 후 광고 위치 결정)
**Requirements**: AD-01
**Success Criteria** (what must be TRUE):
  1. 페이지에 광고 영역이 렌더링되며 에디터와 프리뷰 작업 영역을 가리지 않는다
  2. 광고 영역은 반응형으로 다양한 화면 크기에서 적절히 배치된다
  3. 광고가 로드 실패해도 앱 기능에 영향을 주지 않는다 (graceful degradation)
**Plans**: TBD
**UI hint**: yes

### Phase 18: v2 런칭 준비
**Goal**: v2.0의 모든 기능이 통합 검증되고 프로덕션 배포 가능한 상태가 된다
**Depends on**: Phase 12, 13, 14, 15, 16, 17 (모든 v2 기능 완료)
**Requirements**: (none — QA/launch quality)
**Success Criteria** (what must be TRUE):
  1. 5개 클라이언트(네이버, 다음/카카오, Gmail, Outlook Classic, Outlook New) 프리뷰가 모두 동시에 작동한다
  2. CSS 경고 패널, inline 변환, 102KB 카운터, 파일 업로드가 에디터와 함께 끊김 없이 작동한다
  3. Chrome, Firefox, Safari 최신 버전에서 레이아웃 깨짐 없이 동작한다
  4. Lighthouse Performance 점수 80 이상을 달성한다

### v3.0 사용성 개선

### Phase 19: 온보딩 플로우
**Goal**: 처음 방문한 사용자가 Sticky의 목적을 이해하고 자기 템플릿으로 검수를 시작하기까지 자연스럽게 안내한다
**Depends on**: Phase 18 (v2 완료)
**Requirements**: (none - UX 개선)
**Success Criteria** (what must be TRUE):
  1. 첫 방문 사용자에게 도구의 목적과 주요 기능을 설명하는 온보딩 가이드가 표시된다
  2. 샘플 템플릿의 역할과 각 클라이언트별 프리뷰 차이를 안내한다
  3. 사용자가 온보딩을 건너뛰거나 다시 볼 수 있다
  4. 온보딩 완료 여부가 저장되어 재방문 시 다시 표시되지 않는다
**Plans:** 2/2 plans complete
**UI hint**: yes
Plans:
- [x] 19-01-PLAN.md — OnboardingOverlay component + useOnboarding hook + unit tests
- [x] 19-02-PLAN.md — page.tsx integration + visual checkpoint

### Phase 20: HTML 소스 복사
**Goal**: 검수 완료된 HTML 소스코드를 클립보드에 복사하여 프로젝트에 바로 가져갈 수 있다
**Depends on**: Phase 18 (v2 완료)
**Requirements**: (none - UX 개선)
**Success Criteria** (what must be TRUE):
  1. 헤더에 "소스 복사" 버튼이 있으며 클릭 시 에디터의 HTML이 클립보드에 복사된다
  2. 복사 완료 시 시각적 피드백이 제공된다 (버튼 텍스트 변경 또는 토스트)
  3. 클립보드 API 미지원 브라우저에서도 fallback이 동작한다
**Plans:** 1/1 plans complete
Plans:
- [x] 20-01-PLAN.md — Header copy button with clipboard API + fallback

### Phase 21: 다크모드 프리뷰
**Goal**: 이메일 클라이언트의 다크모드에서 템플릿이 어떻게 보이는지 시뮬레이션으로 확인할 수 있다
**Depends on**: Phase 18 (v2 완료)
**Requirements**: (none - 시뮬레이션 확장)
**Success Criteria** (what must be TRUE):
  1. 각 프리뷰 패널의 뷰포트 토글 옆에 다크모드 토글이 있다
  2. 다크모드 활성화 시 `prefers-color-scheme: dark` 미디어쿼리가 적용된다
  3. 다크모드 미대응 템플릿의 경우 클라이언트별 자동 색상 반전 로직이 시뮬레이션된다
  4. 라이트/다크 모드 전환 시 프리뷰가 즉시 갱신된다
**Plans:** 2/2 plans complete
**UI hint**: yes
Plans:
- [x] 21-01-PLAN.md — Dark mode engine: type extension, client strategies, pure functions, unit tests
- [x] 21-02-PLAN.md — PreviewPane dark mode toggle UI and pipeline integration

### Phase 22: 링크 검증
**Goal**: 템플릿 내 링크의 문제점을 자동으로 탐지하여 발송 전 실수를 방지한다
**Depends on**: Phase 12 (WarningPanel 확장)
**Requirements**: QA-01
**Success Criteria** (what must be TRUE):
  1. 빈 href, `#` placeholder, `example.com` 링크를 경고로 표시한다
  2. 프로토콜 누락 (예: `www.example.com`) 링크를 탐지한다
  3. 링크 검증 결과가 CSS 호환성 패널과 함께 통합 표시된다
  4. HTML 수정 시 링크 검증 결과가 실시간으로 갱신된다
**Plans:** 2/2 plans complete
Plans:
- [x] 22-01-PLAN.md — TDD: analyzeLinkProblems pure function + unit tests
- [x] 22-02-PLAN.md — WarningPanel extension with link warning integration

### Phase 23: 접근성 검사
**Goal**: 이메일 템플릿의 접근성 문제를 자동으로 검사하여 WCAG 기준을 충족하도록 안내한다
**Depends on**: Phase 22 (검증 패널 확장)
**Requirements**: QA-02
**Success Criteria** (what must be TRUE):
  1. img 태그의 alt 텍스트 누락을 경고로 표시한다
  2. 텍스트/배경 색상 대비가 WCAG AA 기준 미달인 경우 경고한다
  3. 시맨틱 구조 문제 (예: 헤딩 순서 건너뛰기)를 탐지한다
  4. 접근성 점수 또는 통과/미통과 요약을 제공한다
**Plans:** 2/2 plans complete
Plans:
- [x] 23-01-PLAN.md — TDD: analyzeAccessibility pure function + WCAG contrast + unit tests
- [x] 23-02-PLAN.md — WarningPanel accessibility section integration + visual checkpoint

### Phase 24: 스팸 트리거 분석
**Goal**: 이메일이 스팸 필터에 걸릴 가능성을 사전에 분석하여 도달률을 높인다
**Depends on**: Phase 22 (검증 패널 확장)
**Requirements**: (none - 검수 품질 향상)
**Success Criteria** (what must be TRUE):
  1. 스팸 트리거 키워드 (과도한 대문자, 감탄사 남용 등)를 탐지한다
  2. 이미지/텍스트 비율을 분석하여 이미지 과다 사용을 경고한다
  3. 전체 스팸 위험도 점수를 요약 표시한다
  4. 각 경고 항목에 개선 방법을 안내한다
**Plans:** 2/2 plans complete
Plans:
- [x] 24-01-PLAN.md — TDD: analyzeSpamTriggers pure function + spamKeywords + unit tests
- [x] 24-02-PLAN.md — WarningPanel spam section integration


## Progress

**Execution Order:**
Phases 1-10 (v1.0): Complete.
Phases 11-18 (v2.0): Complete.
Phases 19-24 (v3.0): 19 → 20 → 21 → 22 → 23 → 24

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 1/1 | Complete | 2026-04-24 |
| 2. Naver Simulation Engine | v1.0 | 1/1 | Complete | 2026-04-24 |
| 3. Gmail Simulation Engine | v1.0 | 1/1 | Complete | 2026-04-24 |
| 4. Daum/Kakao Simulation Engine | v1.0 | 1/1 | Complete | 2026-04-24 |
| 5. Code Editor | v1.0 | 1/1 | Complete | 2026-04-24 |
| 6. Real-time Preview Pipeline | v1.0 | 1/1 | Complete | 2026-04-24 |
| 7. Multi-Client Parallel Layout | v1.0 | 1/1 | Complete | 2026-04-24 |
| 8. Viewport Toggle | v1.0 | 1/1 | Complete | 2026-04-24 |
| 9. Security & Sandbox Hardening | v1.0 | 1/1 | Complete | 2026-04-24 |
| 10. UX Polish & Launch Readiness | v1.0 | 1/1 | Complete | 2026-04-24 |
| 11. 레이아웃 개선 | v2.0 | 0/? | Not started | - |
| 12. CSS 호환성 경고 패널 | v2.0 | 0/? | Not started | - |
| 13. Inline CSS 자동 변환 | v2.0 | 0/? | Not started | - |
| 14. Gmail 102KB 카운터 | v2.0 | 0/? | Not started | - |
| 15. HTML 파일 업로드 | v2.0 | 0/? | Not started | - |
| 16. Outlook 시뮬레이션 | v2.0 | 0/? | Not started | - |
| 17. 광고 수익화 | v2.0 | 0/? | Not started | - |
| 18. v2 런칭 준비 | v2.0 | 0/? | Not started | - |
| 19. 온보딩 플로우 | v3.0 | 2/2 | Complete    | 2026-04-25 |
| 20. HTML 소스 복사 | v3.0 | 1/1 | Complete    | 2026-04-25 |
| 21. 다크모드 프리뷰 | v3.0 | 2/2 | Complete    | 2026-04-25 |
| 22. 링크 검증 | v3.0 | 2/2 | Complete    | 2026-04-26 |
| 23. 접근성 검사 | v3.0 | 2/2 | Complete    | 2026-04-26 |
| 24. 스팸 트리거 분석 | v3.0 | 2/2 | Complete    | 2026-04-26 |
