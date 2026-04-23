# Phase 2: Naver Simulation Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 02-naver-simulation-engine
**Areas discussed:** HTML 파싱 방식, CSS 인라이닝 전략, Naver 룰셋 정확도, 엔진 API 설계

---

## HTML 파싱 방식

| Option | Description | Selected |
|--------|-------------|----------|
| DOM 파서 라이브러리 | cheerio, linkedom, parse5 등 사용 — HTML을 DOM 트리로 파싱해서 노드 단위로 조작. 안정적이고 edge case 처리가 확실함. | ✓ |
| 정규식 기반 | regex로 `<style>` 태그 제거, inline style 속성 필터링 — 가볍우나 복잡한 HTML에서 깨질 수 있음. | |
| Claude에게 맡기기 | 기술적 판단에 따라 가장 적합한 라이브러리를 선택. | |

**User's choice:** DOM 파서 라이브러리
**Notes:** None

### Follow-up: juice/client 폴백

| Option | Description | Selected |
|--------|-------------|----------|
| 직접 구현 | juice 의존성 없이 cheerio/linkedom으로 직접 CSS 인라이너 구현 — 시뮬레이터에 필요한 기능만 최소한으로 구현. | ✓ |
| juice 우선 시도 | juice/client를 먼저 시도하고, webpack 번들링 실패 시 직접 구현으로 폴백. | |
| Claude에게 맡기기 | 연구 단계에서 검증 후 최적 방식 선택. | |

**User's choice:** 직접 구현
**Notes:** STATE.md에 juice/client Next.js 16 호환성 미검증 플래그 있었음 — 직접 구현으로 이슈 우회.

---

## CSS 인라이닝 전략

| Option | Description | Selected |
|--------|-------------|----------|
| 그냥 strip만 | `<style>` 블록을 제거하고 inline style에서 차단 속성만 필터링 — 실제 Naver가 하는 그대로 시뮬레이션. | ✓ |
| 인라인화 후 strip | `<style>` CSS를 먼저 inline으로 변환한 다음 `<style>` 제거 — 사용자의 의도를 최대한 살려서 보여줌. | |
| 두 가지 모드 제공 | 'Naver가 보는 그대로' vs 'inline화 후 Naver' 두 모드를 나중에 제공할 수 있도록 엔진을 설계. | |

**User's choice:** 그냥 strip만
**Notes:** 실제 Naver 동작을 정확하게 시뮬레이션하는 것이 핵심 가치.

---

## Naver 룰셋 정확도

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 리스트로 시작 | 지금 있는 3개 속성으로 시작하고, 리서치 단계에서 추가 발견시 확장. 룰셋은 데이터 파일만 수정하면 엔진 코드 변경 없이 확장 가능하도록 설계. | ✓ |
| 리서치 먼저 | Phase 2 시작 전에 Naver 웹메일을 직접 검사해서 정확한 차단 속성 목록을 먼저 확정한 다음 구현. | |
| Claude에게 맡기기 | 리서치 단계에서 알아서 조사하고 최적 리스트 구성. | |

**User's choice:** 현재 리스트로 시작
**Notes:** 엔진이 데이터 주도(data-driven) 설계여야 확장 용이.

---

## 엔진 API 설계

| Option | Description | Selected |
|--------|-------------|----------|
| 순수 string 반환 | `applyClientRules(html, ruleset) => string` — 변환된 HTML만 반환. 단순하고 Phase 6에서 iframe srcdoc에 바로 넣을 수 있음. | ✓ |
| 결과 객체 반환 | `{ html: string, stripped: string[], warnings: string[] }` — 어떤 속성이 strip됐는지 메타데이터 포함. Phase 10 UX에서 경고 표시에 활용 가능. | |
| Claude에게 맡기기 | Phase 3, 4와의 일관성을 고려해 최적 설계 선택. | |

**User's choice:** 순수 string 반환
**Notes:** None

### Follow-up: 런타임 환경

| Option | Description | Selected |
|--------|-------------|----------|
| 서버사이드 우선 | Node.js 환경에서 동작 — cheerio/linkedom 등 Node DOM 파서 사용. Phase 6에서 API route로 호출하거나 서버 컴포넌트에서 처리. | ✓ |
| 클라이언트사이드 우선 | 브라우저에서 동작 — DOMParser 사용. 정적 배포 제약에 맞지만 브라우저 호환성 고려 필요. | |
| Claude에게 맡기기 | PROJECT.md의 '정적 배포 가능' 제약과 테스트 용이성을 고려해 최적 선택. | |

**User's choice:** 서버사이드 우선
**Notes:** None

---

## Claude's Discretion

- DOM 파서 라이브러리 최종 선택 (cheerio vs linkedom vs parse5)
- 엔진 함수 내부 구현 패턴
- 테스트 구조 및 테스트 케이스 설계
- 파일 위치

## Deferred Ideas

None
