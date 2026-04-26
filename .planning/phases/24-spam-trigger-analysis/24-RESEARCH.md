# Phase 24: 스팸 트리거 분석 - Research

**Researched:** 2026-04-26
**Domain:** Email spam trigger detection, HTML analysis, pure function engine pattern
**Confidence:** HIGH

## Summary

Phase 24는 기존의 WarningPanel 패턴을 세 번째로 확장하는 작업이다. Phase 22(링크 검증)와 Phase 23(접근성 검사)에서 확립된 패턴이 완전히 재사용 가능하다: `analyzeX(html)` 순수 함수 → `SpamSummary` 반환 → WarningPanel에 📧 섹션 추가. 외부 의존성 없이 cheerio(이미 설치됨)만 사용하는 100% 클라이언트 사이드 구현이 가능하다.

스팸 분석의 핵심은 세 가지 영역이다: (1) 텍스트 패턴 탐지(대문자 남용, 특수문자 반복, 키워드 매칭), (2) 이미지/텍스트 비율 계산(cheerio로 img 태그 수 vs 텍스트 노드 수), (3) 위험도 점수 집계(Low/Medium/High). 이 세 영역 모두 새로운 라이브러리 없이 구현 가능하다.

이미지/텍스트 비율은 실제 픽셀 면적이 아닌 "노드 수 기반" 또는 "이미지 태그 수 vs 텍스트 길이(bytes)" 방식이 현실적이다. 브라우저 없이는 실제 렌더링 면적을 계산할 수 없으므로, HTML 구조 분석으로 근사한다.

**Primary recommendation:** `analyzeAccessibility.ts` 패턴을 그대로 따르되, 스팸 고유의 3단계 위험도(Low/Medium/High) summary를 추가한다. 키워드 목록은 `spamKeywords.ts`로 분리하여 테스트 가능성과 확장성을 확보한다.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01 스팸 트리거 패턴 (탐지 대상):**
1. 과도한 대문자 사용 (단어의 70% 이상이 대문자인 경우)
2. 연속 감탄사/특수문자 남용 (!!!, ???, $$$ 등)
3. 한국어 스팸 키워드 (무료, 할인, 긴급, 당첨, 수익, 대출 등)
4. 영어 스팸 키워드 (FREE, WINNER, URGENT, ACT NOW, LIMITED TIME 등)
5. 과도한 색상/크기 강조 (빨간색 텍스트 + 큰 폰트 조합)

**D-02:** 키워드 목록은 `lib/engine/spamKeywords.ts`에 별도 파일로 관리한다.

**D-03:** 이메일 본문 중 이미지 면적과 텍스트 면적 비율을 분석한다.

**D-04:** 이미지 비율 60% 이상 시 warning, 80% 이상 시 error로 표시한다.

**D-05:** 텍스트 없이 이미지만 있는 이메일(이미지 전용 메일)은 별도 경고한다.

**D-06:** 전체 스팸 위험도를 저(Low)/중(Medium)/고(High) 3단계로 표시한다.

**D-07:** 패널 헤더에 위험도 단계와 탐지된 이슈 수를 함께 표시한다 (Phase 23의 "통과 X / 경고 Y" 패턴 재사용).

**D-08:** 기존 WarningPanel에 📧 스팸 섹션을 추가한다. CSS(🎨) / 링크(🔗) / 접근성(♿) / 스팸(📧) 4개 섹션이 하나의 패널에 통합 표시된다.

**D-09:** 각 스팸 경고에 줄 번호, 문제 유형, 구체적 개선 방법을 표시한다.

### Claude's Discretion

- 스팸 키워드 정확한 목록 및 매칭 알고리즘 (정규식 vs 전체 단어 매칭)
- 이미지/텍스트 비율 계산 방식 (면적 기반 vs 바이트 기반 vs 노드 수 기반)
- 위험도 점수 가중치 및 임계값
- 각 경고의 한국어 개선 안내 문구

### Deferred Ideas (OUT OF SCOPE)

없음 — 토론이 phase 범위 내에서 진행됨.

</user_constraints>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 스팸 키워드 탐지 | API / Backend (lib/engine) | — | 순수 함수; 브라우저/서버 양쪽에서 실행 가능 |
| 이미지/텍스트 비율 계산 | API / Backend (lib/engine) | — | cheerio DOM 파싱으로 서버 사이드에서 처리 |
| 위험도 점수 집계 | API / Backend (lib/engine) | — | 분석 함수 내부 로직 |
| WarningPanel UI 통합 | Browser / Client | — | React 컴포넌트, useMemo 패턴 |
| 키워드 목록 관리 | API / Backend (lib/engine) | — | 별도 파일(spamKeywords.ts)로 분리 |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | ^1.2.0 (설치됨) | HTML 파싱, img 태그 추출, 텍스트 추출 | 이미 프로젝트 표준; Phase 22, 23에서도 동일하게 사용 [VERIFIED: package.json] |
| TypeScript | ^5 (설치됨) | 타입 안전성 | 프로젝트 표준 [VERIFIED: package.json] |
| vitest | ^4.1.5 (설치됨) | 단위 테스트 | 프로젝트 표준 테스트 프레임워크 [VERIFIED: package.json] |

### Supporting

추가 설치 필요 라이브러리 없음. 모든 구현은 기존 의존성으로 가능하다.

**Installation:**
```bash
# 설치 불필요 — 모든 의존성 기존 설치됨
```

---

## Architecture Patterns

### System Architecture Diagram

```
HTML input (string)
        │
        ▼
┌─────────────────────────────────┐
│  analyzeSpamTriggers(html)      │
│  lib/engine/analyzeSpamTriggers.ts │
│                                 │
│  ┌─── cheerio.load(html) ───┐   │
│  │                          │   │
│  ├── 1. 텍스트 패턴 탐지 ──┤   │
│  │   · 대문자 비율 (단어별) │   │
│  │   · 연속 특수문자 (!!!等)│   │
│  │   · 스팸 키워드 (KO/EN)  │   │
│  │   · 색상+폰트 조합       │   │
│  │                          │   │
│  ├── 2. 이미지/텍스트 비율 ─┤   │
│  │   · img 태그 수           │   │
│  │   · 텍스트 길이 (bytes)  │   │
│  │   · 이미지 전용 메일 여부│   │
│  │                          │   │
│  └── 3. 위험도 점수 집계 ───┘   │
│       · error × 고점수           │
│       · warning × 저점수         │
│       → Low/Medium/High          │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│ SpamSummary 반환        │
│ { warnings, riskLevel,  │
│   issueCount }          │
└─────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ WarningPanel.tsx (Client Component)  │
│ useMemo → analyzeSpamTriggers(html)  │
│ 📧 스팸 섹션 렌더링                  │
│ totalIssues 합산                     │
└──────────────────────────────────────┘
```

### Recommended Project Structure

```
lib/engine/
├── spamKeywords.ts          # 신규: KO/EN 스팸 키워드 목록 (상수만)
├── analyzeSpamTriggers.ts   # 신규: 순수 분석 함수
├── analyzeSpamTriggers.test.ts  # 신규: 단위 테스트
├── analyzeLinkProblems.ts   # 기존
├── analyzeAccessibility.ts  # 기존
└── ...
app/components/
└── WarningPanel.tsx         # 수정: 📧 스팸 섹션 추가
```

### Pattern 1: analyzeX 순수 함수 패턴 (기존 확립됨)

**What:** HTML 문자열을 받아 warnings 배열과 summary를 반환하는 순수 함수. Side-effect 없음.

**When to use:** 모든 분석 엔진. 테스트 가능성 극대화.

```typescript
// Source: lib/engine/analyzeAccessibility.ts (기존 패턴)
export interface SpamWarning {
  type: 'excessive-caps' | 'repeated-punctuation' | 'spam-keyword' | 'color-emphasis' | 'image-ratio' | 'image-only'
  severity: 'error' | 'warning'
  message: string
  lineNumber: number
  detail?: {
    matched?: string        // 탐지된 키워드/패턴
    capsRatio?: number      // 대문자 비율 (0~1)
    imageRatio?: number     // 이미지 비율 (0~1)
    fix?: string            // 개선 방법
  }
}

export interface SpamSummary {
  warnings: SpamWarning[]
  riskLevel: 'Low' | 'Medium' | 'High'
  issueCount: number
}

export function analyzeSpamTriggers(html: string): SpamSummary {
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: SpamWarning[] = []
  // ... 분석 로직
  return { warnings, riskLevel, issueCount: warnings.length }
}
```

### Pattern 2: lineOf 유틸리티 (기존 패턴 복사)

```typescript
// Source: lib/engine/analyzeLinkProblems.ts (기존 패턴)
function lineOf(html: string, needle: string): number {
  const idx = html.indexOf(needle)
  if (idx === -1) return 0
  return html.slice(0, idx).split('\n').length
}
```

### Pattern 3: 이미지/텍스트 비율 계산 (노드 기반 근사법)

실제 픽셀 면적 계산은 브라우저 렌더링 없이 불가능하다. 대신 두 가지 근사 방식이 있다:

**방식 A: img 수 vs 총 요소 수** — 직관적이지 않음.

**방식 B (권장): 이미지 바이트 추정 vs 텍스트 바이트** — img 태그 수와 텍스트 길이를 비교. 이미지 하나당 고정 "가중치"를 부여하고 텍스트 문자 수와 비율 계산.

```typescript
// 권장 알고리즘
function calcImageRatio($: cheerio.CheerioAPI): number {
  const imgCount = $('img').length
  const textLength = $('body').text().replace(/\s+/g, ' ').trim().length
  
  if (imgCount === 0 && textLength === 0) return 0
  if (imgCount === 0) return 0
  if (textLength === 0) return 1  // 이미지 전용
  
  // 이미지 하나당 평균 이메일 이미지 크기를 텍스트 200자 상당으로 가중
  const IMAGE_WEIGHT = 200
  const imageScore = imgCount * IMAGE_WEIGHT
  return imageScore / (imageScore + textLength)
}
```

**D-03 대한 결정 권고:** 노드/바이트 기반 근사법을 사용한다. 실제 렌더링 면적은 서버/정적 환경에서 계산 불가능하며, 이 근사법으로 D-04의 60%/80% 임계값을 의미있게 적용할 수 있다.

### Pattern 4: 대문자 비율 탐지

```typescript
// D-01.1: 단어 70% 이상 대문자인 경우
function detectExcessiveCaps(text: string): { lineNumber: number, word: string }[] {
  const results: { lineNumber: number, word: string }[] = []
  const lines = text.split('\n')
  lines.forEach((line, idx) => {
    const words = line.match(/[a-zA-Z가-힣]{3,}/g) || []
    for (const word of words) {
      const upperCount = (word.match(/[A-Z]/g) || []).length
      const alphaCount = (word.match(/[a-zA-Z]/g) || []).length
      if (alphaCount > 0 && upperCount / alphaCount >= 0.7) {
        results.push({ lineNumber: idx + 1, word })
      }
    }
  })
  return results
}
```

### Pattern 5: 연속 특수문자 탐지

```typescript
// D-01.2: !!!, ???, $$$, !!!!, 등
const REPEATED_PUNCT_REGEX = /([!?$]{3,})/g
```

### Pattern 6: 색상+폰트 강조 탐지 (D-01.5)

```typescript
// 빨간색 텍스트 + 큰 폰트 (16px 이상) 조합
$('[style]').each((_, el) => {
  const style = $(el).attr('style') || ''
  const isRed = /color\s*:\s*(red|#[fF][0-9a-fA-F]{0,4}00|rgb\s*\(\s*2[0-5][0-9]|rgb\s*\(\s*1[5-9][0-9])/i.test(style)
  const isBigFont = /font-size\s*:\s*([2-9][0-9]|1[6-9])px/i.test(style)
  if (isRed && isBigFont) { /* 경고 */ }
})
```

### Pattern 7: WarningPanel 스팸 섹션 추가

```typescript
// Source: app/components/WarningPanel.tsx (기존 패턴 확장)
// 새로 추가할 state
const [expandedSpamIdx, setExpandedSpamIdx] = useState<number | null>(null)

// useMemo 추가
const spamSummary = useMemo(
  () => analyzeSpamTriggers(debouncedHtml),
  [debouncedHtml]
)

// totalIssues 합산에 추가
const totalIssues = warnings.length + linkWarnings.length + a11ySummary.warnings.length + spamSummary.warnings.length

// 섹션 헤더 (D-07: Phase 23 패턴 재사용)
<div className="flex items-center gap-1 pt-1.5 pb-0.5 text-[10px] text-zinc-500 font-medium">
  <span>📧</span>
  <span>스팸 분석</span>
  <span className={`ml-1 px-1 rounded text-[9px] ${
    spamSummary.riskLevel === 'High' ? 'bg-red-900 text-red-300' :
    spamSummary.riskLevel === 'Medium' ? 'bg-amber-900 text-amber-300' :
    'bg-green-900 text-green-300'
  }`}>{spamSummary.riskLevel}</span>
  <span className="ml-auto text-zinc-600">이슈 {spamSummary.issueCount}</span>
</div>
```

### Anti-Patterns to Avoid

- **외부 스팸 체크 API 호출:** 프로젝트 원칙이 "All features must work client-side only, no external API dependencies" [VERIFIED: STATE.md]
- **실제 픽셀 면적 계산 시도:** 브라우저 렌더링 없이 불가능. 노드 기반 근사법이 유일한 현실적 방법.
- **한국어 텍스트에 대문자 비율 계산:** 한국어는 대/소문자 개념이 없으므로 영어 단어에만 적용.
- **새로운 Row 컴포넌트 없이 인라인 렌더링:** 기존 `WarningRow`, `LinkWarningRow`, `A11yWarningRow` 패턴처럼 `SpamWarningRow` 컴포넌트를 별도로 만든다. 일관성 유지.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML 파싱 | 직접 정규식으로 파싱 | cheerio (이미 설치됨) | 중첩 태그, 인코딩, 엣지 케이스 처리 |
| 줄 번호 계산 | 복잡한 offset 추적 | `lineOf(html, needle)` 기존 패턴 복사 | Phase 22, 23에서 검증된 패턴 |
| 실제 스팸 판정 | 발신자 평판, DKIM 등 점검 | 범위 밖 — 컨텐츠 분석만 | 외부 API 없이 불가능 |

---

## Spam Keyword Research Findings

### English Spam Keywords (Representative, not exhaustive)

고빈도 스팸 트리거로 업계에서 공통적으로 언급되는 영어 키워드들 [CITED: clearout.io/blog/email-spam-trigger-words, mailmeteor.com/blog/spam-words]:

**Financial:** FREE, FREE OFFER, CASH, MONEY, PROFIT, EARN, INCOME, INVEST, LOAN, CREDIT, WIN, WINNER, PRIZE, REWARD

**Urgency:** URGENT, ACT NOW, LIMITED TIME, EXPIRES, DEADLINE, HURRY, IMMEDIATELY, TODAY ONLY

**Claims:** GUARANTEED, 100%, PROMISE, CERTIFIED, APPROVED, NO RISK, RISK FREE

**Action:** CLICK HERE, SUBSCRIBE, SIGN UP FREE, CALL NOW

### Korean Spam Keywords (Representative)

한국 이메일 스팸 필터에서 일반적으로 트리거되는 키워드 [ASSUMED — 한국 스팸 필터 공식 문서 없음, 일반적 스팸 메일 패턴에서 도출]:

**금융/혜택:** 무료, 할인, 수익, 대출, 투자, 당첨, 상금, 혜택, 이벤트 당첨, 보상, 리워드

**긴급:** 긴급, 즉시, 마감, 오늘만, 한정, 서두르세요

**주장:** 보장, 확실, 100%, 승인

**행동유도:** 지금 클릭, 지금 신청, 지금 바로

**Claude's Discretion 영역:** 정확한 키워드 목록과 매칭 알고리즘(전체 단어 vs 부분 문자열)은 구현 시 결정한다. 한국어는 형태소 경계가 명확하지 않으므로 단순 substring 매칭이 현실적이다 (예: "무료" 포함 여부).

### 이미지/텍스트 비율 업계 기준

[CITED: emailconsul.com/blog, smartreach.io/blog/image-to-text-ratio-email-deliverability]:
- 권장 비율: 텍스트 60% : 이미지 40% (60/40 룰)
- 경고 임계값 60% 이상 이미지: warning (D-04와 일치)
- 위험 임계값 80% 이상 이미지: error (D-04와 일치)
- 이미지 전용 메일: 별도 error 경고 필요 (D-05와 일치)

D-04의 60%/80% 임계값은 업계 표준과 정확히 일치한다. [VERIFIED: 복수 출처 교차 검증]

---

## Common Pitfalls

### Pitfall 1: 한국어 단어에 대문자 비율 적용
**What goes wrong:** 한국어 텍스트에 `capsRatio` 계산을 적용하면 항상 0이 나와 의미 없음.
**Why it happens:** 대소문자 개념 없는 문자 체계.
**How to avoid:** 영어 알파벳 단어(`/[a-zA-Z]+/`)에만 대문자 비율 계산 적용.
**Warning signs:** 한국어 이메일에서 excessive-caps 경고가 0건으로 나오면 정상.

### Pitfall 2: 이미지 비율을 실제 픽셀로 계산하려는 시도
**What goes wrong:** img 태그의 width/height 속성을 곱해 면적 계산 시도 → 속성 없는 경우, CSS로 크기 지정된 경우, 반응형 이미지에서 오작동.
**Why it happens:** D-03 "면적" 기반 요구에서 착각.
**How to avoid:** 노드 수 + 텍스트 길이 기반 근사법 사용. 이미지 1개 = 텍스트 200자 상당으로 가중.
**Warning signs:** img에 width/height 없을 때 계산값 0이 되면 잘못된 구현.

### Pitfall 3: 스팸 키워드를 HTML 태그/속성에서도 탐지
**What goes wrong:** `href="https://free-offer.com"` 같은 URL이나 class명의 "free"가 키워드로 탐지됨.
**Why it happens:** `html.toLowerCase().includes(keyword)` 방식으로 전체 HTML을 탐색.
**How to avoid:** cheerio로 텍스트 노드만 추출 후 매칭. `$('body').text()`나 텍스트 노드를 순회.

### Pitfall 4: 색상 강조 탐지 시 false positive
**What goes wrong:** 빨간 테두리(border-color: red)나 빨간 배경 등 비텍스트 요소를 텍스트 강조로 오탐.
**Why it happens:** style 속성에 "red" 포함 여부만 체크.
**How to avoid:** `color` 속성(전경색)과 `font-size` 조합에만 집중. `background-color: red`는 제외.

### Pitfall 5: 위험도 점수 임계값 결정
**What goes wrong:** error 1개가 High, warning 10개가 Low처럼 일관성 없는 기준.
**Why it happens:** 가중치 임계값을 명확히 정의하지 않음.
**How to avoid:** 명확한 룰 정의 (예시):
- High: error ≥ 1 OR warnings ≥ 5
- Medium: warnings 2–4
- Low: warnings ≤ 1 AND error = 0

---

## Code Examples

### spamKeywords.ts 파일 구조

```typescript
// lib/engine/spamKeywords.ts
// Source: 업계 표준 스팸 트리거 목록에서 도출
// [CITED: clearout.io, mailmeteor.com]

export const SPAM_KEYWORDS_EN: string[] = [
  'FREE', 'WINNER', 'URGENT', 'ACT NOW', 'LIMITED TIME',
  'GUARANTEED', 'CASH', 'PRIZE', 'CLICK HERE', 'SUBSCRIBE NOW',
  'EARN', 'PROFIT', 'LOAN', 'CREDIT', 'NO RISK', 'RISK FREE',
  'EXPIRES', 'HURRY', 'TODAY ONLY', 'SIGN UP FREE',
]

export const SPAM_KEYWORDS_KO: string[] = [
  '무료', '할인', '긴급', '당첨', '수익', '대출',
  '투자', '보장', '혜택', '이벤트 당첨', '마감',
  '지금 클릭', '지금 신청', '한정', '오늘만',
]
```

### analyzeSpamTriggers.ts 전체 구조

```typescript
// lib/engine/analyzeSpamTriggers.ts
import * as cheerio from 'cheerio'
import { SPAM_KEYWORDS_EN, SPAM_KEYWORDS_KO } from './spamKeywords'

export interface SpamWarning {
  type: 'excessive-caps' | 'repeated-punctuation' | 'spam-keyword-en' | 'spam-keyword-ko' | 'color-emphasis' | 'image-ratio' | 'image-only'
  severity: 'error' | 'warning'
  message: string
  lineNumber: number
  detail?: {
    matched?: string
    capsRatio?: number
    imageRatio?: number
  }
  fix: string   // D-09: 개선 방법 항상 포함
}

export interface SpamSummary {
  warnings: SpamWarning[]
  riskLevel: 'Low' | 'Medium' | 'High'
  issueCount: number
}

function lineOf(html: string, needle: string): number {
  const idx = html.indexOf(needle)
  if (idx === -1) return 0
  return html.slice(0, idx).split('\n').length
}

export function analyzeSpamTriggers(html: string): SpamSummary {
  // @ts-expect-error — decodeEntities is a valid htmlparser2 option
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: SpamWarning[] = []

  // 1. 대문자 탐지 (영어만)
  // 2. 연속 특수문자 탐지
  // 3. 한국어/영어 스팸 키워드 탐지 (텍스트 노드에서만)
  // 4. 색상+폰트 강조 탐지
  // 5. 이미지 비율 계산

  const errorCount = warnings.filter(w => w.severity === 'error').length
  const warningCount = warnings.filter(w => w.severity === 'warning').length

  const riskLevel: 'Low' | 'Medium' | 'High' =
    errorCount >= 1 || warningCount >= 5 ? 'High' :
    warningCount >= 2 ? 'Medium' : 'Low'

  return { warnings, riskLevel, issueCount: warnings.length }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 단어 기반 스팸 필터 (SpamAssassin 등) | ML 기반 필터 (발신자 평판 위주) | ~2020 | 키워드 단독으로 스팸 판정 안함; 컨텐츠 분석은 보조 신호로 작동 |
| 이미지 전용 이메일 우회 전략 | 이미지 전용 이메일 = 스팸 강한 신호 | ~2015 | 이미지 전용 메일 경고 여전히 유효 |

**업계 맥락:** 현대 스팸 필터는 ML 기반으로 키워드만으로 결정하지 않는다 [CITED: mailwarm.com]. 그러나 이 도구의 목적은 "스팸 판정"이 아닌 "작성자에게 잠재적 위험 요소를 사전 안내"하는 것이므로, 규칙 기반 탐지가 여전히 유효한 접근법이다.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 한국어 스팸 키워드 목록 (무료, 할인, 긴급 등) | Spam Keyword Research | 목록이 불완전하거나 과도할 수 있음 — spamKeywords.ts 분리로 향후 수정 용이 |
| A2 | 이미지 1개 = 텍스트 200자 상당 가중치 | Architecture Patterns Pattern 3 | 실제 이메일 크기와 다를 수 있음 — 임계값 60%/80%로 보정됨 |
| A3 | 위험도 임계값 (High: error≥1 OR warning≥5) | Code Examples | 사용자 경험에 따라 민감도 조정 필요 가능 |

---

## Open Questions

1. **한국어 키워드 형태소 처리**
   - What we know: "무료배송"처럼 키워드가 복합어에 포함될 경우 substring 매칭으로 탐지됨.
   - What's unclear: 이것이 false positive가 될지 desired behavior가 될지.
   - Recommendation: substring 매칭 사용. 형태소 분석기(mecab 등)는 외부 의존성이 생기므로 범위 밖. "무료배송"도 스팸성이므로 탐지하는 것이 적절하다.

2. **대문자 탐지 기준 70%의 최소 단어 길이**
   - What we know: D-01.1은 "단어의 70% 이상이 대문자"로 정의.
   - What's unclear: "OK", "ID" 같은 2~3자 대문자 약어가 false positive가 될 수 있음.
   - Recommendation: 최소 4자 이상인 영어 단어에만 적용. 약어(2-3자) 제외.

---

## Environment Availability

Step 2.6: SKIPPED — cheerio, vitest 모두 기존 설치됨. 외부 서비스/API 의존성 없음.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.5 |
| Config file | vitest.config.mts |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QA-03 (SC-1) | 스팸 트리거 키워드 탐지 | unit | `pnpm test lib/engine/analyzeSpamTriggers.test.ts` | ❌ Wave 0 |
| QA-03 (SC-2) | 이미지/텍스트 비율 분석 | unit | `pnpm test lib/engine/analyzeSpamTriggers.test.ts` | ❌ Wave 0 |
| QA-03 (SC-3) | 위험도 점수 Low/Medium/High | unit | `pnpm test lib/engine/analyzeSpamTriggers.test.ts` | ❌ Wave 0 |
| QA-03 (SC-4) | 개선 방법 포함 여부 | unit | `pnpm test lib/engine/analyzeSpamTriggers.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `lib/engine/analyzeSpamTriggers.test.ts` — covers QA-03 (SC-1~4)
- [ ] `lib/engine/spamKeywords.ts` — keyword constants (no tests needed, 상수만)

---

## Security Domain

이 phase는 순수 텍스트 분석이다. 사용자 입력 HTML을 cheerio로 파싱하지만 실행하거나 외부로 전송하지 않는다. 추가 보안 도메인 적용 없음.

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

- **Next.js 버전 주의:** `AGENTS.md` 지시: "This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code." — 이 phase는 Next.js API를 직접 사용하지 않음 (lib/engine 순수 함수 + Client Component 확장만). 해당 없음.
- **외부 API 금지:** STATE.md 결정: "All features must work client-side only, no external API dependencies" [VERIFIED: STATE.md] — 준수됨. 외부 스팸 체크 API 사용 안 함.
- **cheerio 선택:** STATE.md 결정: "cheerio selected over linkedom/parse5 for DOM parsing" [VERIFIED: STATE.md] — 준수됨.

---

## Sources

### Primary (HIGH confidence)

- `lib/engine/analyzeAccessibility.ts` [VERIFIED: 직접 읽음] — SpamSummary 인터페이스 및 analyzeX 패턴의 기준
- `lib/engine/analyzeLinkProblems.ts` [VERIFIED: 직접 읽음] — lineOf 유틸리티, warning 인터페이스 기준
- `app/components/WarningPanel.tsx` [VERIFIED: 직접 읽음] — 통합 패턴, useMemo, expandedIdx 상태 패턴
- `package.json` [VERIFIED: 직접 읽음] — 의존성 목록 (cheerio ^1.2.0, vitest ^4.1.5)
- `.planning/phases/24-spam-trigger-analysis/24-CONTEXT.md` [VERIFIED: 직접 읽음] — 잠긴 결정

### Secondary (MEDIUM confidence)

- emailconsul.com/blog — 이미지/텍스트 비율 60/40 룰 (복수 출처 교차 검증)
- smartreach.io/blog/image-to-text-ratio-email-deliverability — 이미지 비율 임계값
- clearout.io/blog/email-spam-trigger-words — 영어 스팸 키워드 목록
- mailmeteor.com/blog/spam-words — 영어 스팸 키워드 목록

### Tertiary (LOW confidence)

- 한국어 스팸 키워드 목록 — 공식 출처 없음, 일반적 스팸 패턴에서 도출 [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 모든 의존성 기존 설치 확인
- Architecture: HIGH — 동일 패턴이 Phase 22, 23에서 두 번 검증됨
- Spam keyword list (EN): MEDIUM — 복수 업계 자료에서 교차 검증
- Spam keyword list (KO): LOW — 공식 한국 스팸 필터 기준 없음
- Image ratio thresholds: MEDIUM — 업계 표준 60/40 룰, D-04와 일치

**Research date:** 2026-04-26
**Valid until:** 2026-05-26 (스팸 필터 업계 기준 안정적)
