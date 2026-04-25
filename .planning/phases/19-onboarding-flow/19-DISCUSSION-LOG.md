# Phase 19: 온보딩 플로우 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-25
**Phase:** 19-onboarding-flow
**Areas discussed:** 온보딩 형태, 안내 콘텐츠, 건너뛰기/재진입, 완료 상태 저장
**Mode:** --auto (all decisions auto-selected with recommended defaults)

---

## 온보딩 형태

| Option | Description | Selected |
|--------|-------------|----------|
| 오버레이 스텝 가이드 | tooltip/popover로 실제 UI 요소를 가리키며 설명 | ✓ |
| 모달 슬라이드쇼 | 전체 화면 모달에서 스크린샷 기반 안내 | |
| 인라인 배너 | 페이지 상단에 접을 수 있는 안내 배너 | |

**User's choice:** [auto] 오버레이 스텝 가이드 (recommended — 도구 특성에 맞는 인터랙티브 안내)
**Notes:** 실제 에디터, 프리뷰 패널, 클라이언트 선택 등 UI 요소를 직접 가리키며 설명하는 방식

---

## 안내 콘텐츠

| Option | Description | Selected |
|--------|-------------|----------|
| 핵심 3단계 | 도구 목적 → 샘플 역할 → 클라이언트별 차이 | ✓ |
| 상세 5단계 | 위 3단계 + 에디터 기능 + 추가 기능 소개 | |
| 최소 1단계 | 한 줄 소개 + 시작 버튼만 | |

**User's choice:** [auto] 핵심 3단계 (recommended — Success Criteria에 명시된 3가지 항목과 일치)
**Notes:** ROADMAP.md success criteria에서 요구하는 3가지: 도구 목적, 샘플 역할, 클라이언트별 차이

---

## 건너뛰기/재진입

| Option | Description | Selected |
|--------|-------------|----------|
| 건너뛰기 + 헤더 재진입 | 항상 건너뛰기 표시 + 헤더에 가이드 버튼 | ✓ |
| 건너뛰기만 | 건너뛰기만 가능, 재진입 없음 | |
| ESC로 닫기 + 설정 메뉴 재진입 | ESC 키로 닫기 + 별도 설정에서 재실행 | |

**User's choice:** [auto] 건너뛰기 + 헤더 재진입 (recommended — 최소 마찰 + 접근성)
**Notes:** 온보딩 중 항상 건너뛰기 가능, 완료 후 헤더에 "?" 또는 "가이드" 버튼으로 재접근

---

## 완료 상태 저장

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage | 기존 enabledClients 패턴과 동일, 서버 불필요 | ✓ |
| Cookie | 서버 사이드에서도 읽을 수 있음 | |
| sessionStorage | 탭 닫으면 초기화 — 매 방문마다 온보딩 | |

**User's choice:** [auto] localStorage (recommended — 기존 패턴과 일관성, 서버 불필요)
**Notes:** `sticky:onboardingCompleted` 키로 저장, 기존 `sticky:enabledClients` 패턴과 동일

---

## Claude's Discretion

- tooltip/popover 라이브러리 선택 또는 자체 구현
- 각 스텝의 정확한 위치 및 하이라이트 대상
- 애니메이션 및 트랜지션
- 재진입 버튼 아이콘/위치
- 온보딩 언어

## Deferred Ideas

None — discussion stayed within phase scope
