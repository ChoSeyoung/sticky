# Sticky — Korean Email Client Preview Tool

## What This Is

HTML 이메일을 입력하면 한국에서 주로 사용되는 이메일 클라이언트(네이버 메일, 다음/카카오 메일, Gmail, Outlook)에서 어떻게 보이는지 시뮬레이션해주는 웹 기반 프리뷰 도구. 왼쪽 코드 에디터에 HTML을 작성하면 오른쪽에 각 클라이언트별 렌더링 결과가 나란히 표시된다.

## Core Value

각 이메일 클라이언트의 CSS 제한사항을 정확하게 시뮬레이션하여 실제 클라이언트에서 보이는 것과 거의 동일한 프리뷰를 제공하는 것.

## Current Milestone: v2.0 프로덕션 확장

**Goal:** 레이아웃 개선, CSS 경고 시스템, 추가 클라이언트 지원, 광고 수익화로 런칭 가능한 프로덕션 서비스로 확장

**Target features:**
- 레이아웃 개선 (에디터 높이 꽉채움, 프리뷰 수평 배치 + 수평 스크롤)
- CSS 호환성 경고 패널
- Inline CSS 자동 변환 (`<style>` → inline style)
- Gmail 102KB 사이즈 카운터 + 경고
- HTML 파일 업로드 / 드래그앤드롭
- Outlook Classic + New 시뮬레이션
- 광고 기반 수익화 (Google AdSense 등)

## Requirements

### Validated (v1.0)

- [x] HTML 코드 에디터에서 이메일 HTML 작성/붙여넣기 (EDIT-01, EDIT-02)
- [x] 네이버 메일 렌더링 시뮬레이션 (SIM-01)
- [x] 다음/카카오 메일 렌더링 시뮬레이션 (SIM-02)
- [x] Gmail 렌더링 시뮬레이션 (SIM-03)
- [x] 각 클라이언트 프리뷰를 나란히 병렬 표시 (UX-01)
- [x] 실시간 프리뷰 반영 (EDIT-03)
- [x] 모바일/데스크톱 뷰포트 토글 (UX-02)

### Active (v2.0)

- [ ] 레이아웃 개선 — 에디터 뷰포트 꽉채움, 프리뷰 수평 배치 + 수평 스크롤
- [ ] CSS 호환성 경고 패널
- [ ] Inline CSS 자동 변환
- [ ] Gmail 102KB 사이즈 카운터
- [ ] HTML 파일 업로드 / 드래그앤드롭
- [ ] Outlook 시뮬레이션 (Classic + New)
- [ ] 광고 기반 수익화

### Out of Scope

- 실제 스크린샷 방식 (테스트 메일 발송 후 캡처) — 인프라 복잡도
- 모바일 앱 — 웹 서비스로 시작
- 사용자 계정/로그인 — 누구나 바로 사용 가능한 공개 서비스
- 유료 기능 — 광고 수익 모델
- 공유 URL — v3
- 다크모드 프리뷰 — v3
- 프리헤더/제목줄 미리보기 — v3
- 클라이언트별 CSS 복사/내보내기 — v3

## Context

- 기존 codebase: Next.js (Create Next App) 기반 프로젝트 스캐폴드
- 한국 이메일 시장: 네이버 메일이 가장 높은 점유율, 다음/카카오 메일이 그 다음, Gmail과 Outlook도 기업 사용자 중심으로 널리 사용
- 기존 도구 한계: Litmus, Email on Acid 등은 한국 이메일 클라이언트를 지원하지 않음
- CSS 호환성 데이터: caniemail.com에서 이메일 클라이언트별 CSS/HTML 지원 현황 데이터를 활용 가능
- 한국 이메일 클라이언트(특히 네이버, 다음)는 고유한 CSS 제한사항이 있어 별도 조사 필요

## Constraints

- **Tech stack**: Next.js (이미 스캐폴드 존재)
- **Rendering**: 클라이언트사이드 시뮬레이션 (서버 불필요, 정적 배포 가능)
- **Data source**: caniemail.com 등 공개 데이터 활용

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 렌더링 시뮬레이션 방식 채택 | 실제 스크린샷은 인프라 복잡도 높음, 시뮬레이션은 즉시 피드백 가능 | — Pending |
| caniemail.com 데이터 활용 | 이미 검증된 CSS 호환성 데이터베이스, 직접 조사 비용 절감 | — Pending |
| 나란히 병렬 레이아웃 | 클라이언트 간 차이를 한눈에 비교 가능 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-24 — v2.0 마일스톤 시작. v1.0 완료 (10 phases, 8 requirements validated)*
