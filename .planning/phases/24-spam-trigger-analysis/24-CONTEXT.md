# Phase 24: 스팸 트리거 분석 - Context

**Gathered:** 2026-04-26
**Status:** Ready for planning

<domain>
## Phase Boundary

이메일이 스팸 필터에 걸릴 가능성을 사전에 분석하여 도달률을 높인다. 스팸 트리거 키워드 탐지, 이미지/텍스트 비율 분석, 전체 스팸 위험도 점수 제공, 각 경고에 개선 방법 안내를 포함한다. WarningPanel에 통합 표시한다.

</domain>

<decisions>
## Implementation Decisions

### 스팸 키워드 탐지 규칙
- **D-01:** 다음 스팸 트리거 패턴을 탐지한다:
  1. 과도한 대문자 사용 (단어의 70% 이상이 대문자인 경우)
  2. 연속 감탄사/특수문자 남용 (!!!, ???, $$$ 등)
  3. 한국어 스팸 키워드 (무료, 할인, 긴급, 당첨, 수익, 대출 등)
  4. 영어 스팸 키워드 (FREE, WINNER, URGENT, ACT NOW, LIMITED TIME 등)
  5. 과도한 색상/크기 강조 (빨간색 텍스트 + 큰 폰트 조합)
- **D-02:** 키워드 목록은 `lib/engine/spamKeywords.ts`에 별도 파일로 관리하여 향후 확장이 용이하도록 한다.

### 이미지/텍스트 비율 분석
- **D-03:** 이메일 본문 중 이미지 면적과 텍스트 면적 비율을 분석한다.
- **D-04:** 이미지 비율 60% 이상 시 warning, 80% 이상 시 error로 표시한다.
- **D-05:** 텍스트 없이 이미지만 있는 이메일(이미지 전용 메일)은 별도 경고한다.

### 위험도 점수 체계
- **D-06:** 전체 스팸 위험도를 저(Low)/중(Medium)/고(High) 3단계로 표시한다.
- **D-07:** 패널 헤더에 위험도 단계와 탐지된 이슈 수를 함께 표시한다 (Phase 23의 "통과 X / 경고 Y" 패턴 재사용).

### WarningPanel 통합
- **D-08:** 기존 WarningPanel에 📧 스팸 섹션을 추가한다. CSS(🎨) / 링크(🔗) / 접근성(♿) / 스팸(📧) 4개 섹션이 하나의 패널에 통합 표시된다.
- **D-09:** 각 스팸 경고에 줄 번호, 문제 유형, 구체적 개선 방법을 표시한다 (성공 기준 4번 충족).

### Claude's Discretion
- 스팸 키워드 정확한 목록 및 매칭 알고리즘 (정규식 vs 전체 단어 매칭)
- 이미지/텍스트 비율 계산 방식 (면적 기반 vs 바이트 기반 vs 노드 수 기반)
- 위험도 점수 가중치 및 임계값
- 각 경고의 한국어 개선 안내 문구

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ROADMAP Success Criteria
- `.planning/ROADMAP.md` §Phase 24 — 4가지 성공 기준 (키워드 탐지, 이미지/텍스트 비율, 위험도 점수, 개선 안내)

### Requirements
- `.planning/REQUIREMENTS.md` §QA-03 — 스팸 트리거 분석 요구사항

### Prior Phase Patterns
- `.planning/phases/22-link-validation/22-CONTEXT.md` — WarningPanel 확장 패턴 원본
- `.planning/phases/23-accessibility-check/23-CONTEXT.md` — WarningPanel 확장 + 점수 요약 패턴

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/components/WarningPanel.tsx`: CSS + 링크 + 접근성 통합 패널 — 스팸 섹션 추가 대상
- `lib/engine/analyzeLinkProblems.ts`: 순수 분석 함수 패턴 — 동일 패턴으로 `analyzeSpamTriggers.ts` 구현
- `lib/engine/analyzeAccessibility.ts`: 점수 요약(passCount/failCount) 패턴 — 위험도 점수 패턴 참고
- `cheerio`: HTML 파싱 (이미지 태그 추출, 텍스트 추출)에 사용 가능

### Established Patterns
- `analyzeX(html)` 순수 함수 → warnings 배열 + summary 반환
- WarningPanel 내부 `useMemo`로 분석 실행, 아이콘으로 섹션 구분
- 줄 번호 계산: `html.indexOf()` + `split('\n').length` 패턴
- severity: `'error' | 'warning'` 2단계

### Integration Points
- `app/components/WarningPanel.tsx`: 스팸 분석 import 추가 + 📧 섹션 렌더링
- `lib/engine/`: `analyzeSpamTriggers.ts` + `spamKeywords.ts` 신규 파일
- `app/components/WarningPanel.tsx`: totalIssues 합산에 스팸 경고 추가

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard email spam trigger analysis approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-spam-trigger-analysis*
*Context gathered: 2026-04-26*
