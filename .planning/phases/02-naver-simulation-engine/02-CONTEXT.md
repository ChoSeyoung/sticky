# Phase 2: Naver Simulation Engine - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Pure-function CSS transform engine for Naver Mail simulation (SIM-01). Takes HTML input + Naver ruleset, returns transformed HTML that matches Naver Mail's actual rendering restrictions. No UI — just the engine function and its unit tests.

</domain>

<decisions>
## Implementation Decisions

### HTML 파싱 방식
- **D-01:** DOM 파서 라이브러리 사용 — cheerio, linkedom, parse5 중 선택. HTML을 DOM 트리로 파싱해서 노드 단위로 조작. 정규식 기반 접근은 사용하지 않음.
- **D-02:** juice/client 의존성 없이 직접 구현 — juice의 Next.js 16 webpack 호환성 미검증 이슈를 우회. DOM 파서 라이브러리로 필요한 CSS 인라이닝/필터링 기능을 직접 구현.

### CSS 인라이닝 전략
- **D-03:** Strip만 수행 — `<style>` 블록을 제거하고 inline style에서 차단 속성만 필터링. 실제 Naver가 하는 그대로 시뮬레이션. `<style>` CSS를 인라인화해서 보존하는 방식은 사용하지 않음 (실제 Naver 동작과 다르므로).

### Naver 룰셋 정확도
- **D-04:** 현재 strippedProperties 리스트 ['margin', 'padding', 'font-family']로 시작. 리서치 단계에서 웹메일 검사/커뮤니티 데이터로 추가 속성 발견 시 확장. 엔진은 룰셋 데이터 파일만 수정하면 코드 변경 없이 확장 가능하도록 설계.

### 엔진 API 설계
- **D-05:** 순수 string 반환 — `applyClientRules(html: string, ruleset: ClientRuleset): string`. 변환 메타데이터(어떤 속성이 strip됐는지 등)는 포함하지 않음. Phase 3, 4에서 동일 인터페이스 재사용.
- **D-06:** 서버사이드(Node.js) 우선 — Node DOM 파서(cheerio/linkedom) 사용. Phase 6에서 API route 또는 서버 컴포넌트에서 호출.

### Claude's Discretion
- DOM 파서 라이브러리 최종 선택 (cheerio vs linkedom vs parse5 — 번들 크기, API 편의성, 성능 고려)
- 엔진 함수 내부 구현 패턴 (파이프라인, 단일 pass 등)
- 테스트 구조 및 테스트 케이스 설계
- 파일 위치 (lib/engine/, lib/simulation/ 등)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 기반
- `lib/rulesets/types.ts` — ClientRuleset, Provenance, Confidence 타입 정의
- `lib/rulesets/naver.ts` — Naver 룰셋 상수 (stripHeadStyles, strippedProperties 등)
- `lib/rulesets/index.ts` — 배럴 export (naverRuleset, gmailRuleset, daumRuleset)
- `__tests__/rulesets/schema.test.ts` — 룰셋 스키마 테스트 패턴 참고

### 프로젝트 컨텍스트
- `.planning/ROADMAP.md` — Phase 2 성공 기준 4개 항목
- `.planning/REQUIREMENTS.md` — SIM-01 요구사항
- `.planning/STATE.md` §Blockers/Concerns — juice/client 검증 플래그 (직접 구현으로 결정됨)
- `.planning/codebase/STACK.md` — Next.js 16.2.4, TypeScript 5.9.3, pnpm
- `.planning/codebase/CONVENTIONS.md` — 네이밍 패턴, import 순서, TypeScript strict mode

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/rulesets/types.ts` — ClientRuleset 인터페이스 (6-axis: stripHeadStyles, allowedInlineProperties, strippedProperties, strippedElements, confidence, provenance)
- `lib/rulesets/naver.ts` — Naver 룰셋 상수 (`stripHeadStyles: true`, `strippedProperties: ['margin', 'padding', 'font-family']`)
- `__tests__/rulesets/schema.test.ts` — Vitest 테스트 패턴 참고

### Established Patterns
- TypeScript strict mode — 모든 타입 명시적
- Path alias `@/*` — 프로젝트 루트 매핑
- Vitest — Phase 1에서 테스트 프레임워크로 설정됨
- `lib/` 디렉토리 — rulesets가 여기 위치하므로 엔진도 동일 레벨 권장

### Integration Points
- Phase 3, 4 — 동일 `applyClientRules` 인터페이스로 Gmail, Daum/Kakao 엔진 구현
- Phase 6 — 서버 컴포넌트/API route에서 `applyClientRules(html, naverRuleset)` 호출
- Phase 10 — confidence 필드로 UI 뱃지 표시

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-naver-simulation-engine*
*Context gathered: 2026-04-23*
