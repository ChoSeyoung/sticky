# Phase 23: 접근성 검사 - Research

**Researched:** 2026-04-26
**Domain:** WCAG AA accessibility analysis — contrast ratio, alt text, heading structure
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 3가지 접근성 문제 탐지:
  1. img alt 누락 (alt="" 빈 문자열은 장식 이미지로 허용)
  2. 텍스트/배경 색상 대비 WCAG AA 미달 (일반 텍스트 4.5:1, 큰 텍스트 3:1)
  3. 헤딩 레벨 건너뛰기 (h1→h3 등)
- **D-02:** 기존 WarningPanel에 ♿ 접근성 섹션 추가 — Phase 22의 🔗 링크 섹션 패턴과 동일하게 구현
- **D-03:** CSS(🎨) / 링크(🔗) / 접근성(♿) 3개 섹션이 하나의 패널에 통합 표시
- **D-04:** 패널 헤더에 전체 이슈 수(CSS + 링크 + 접근성 합산) 표시
- **D-05:** 접근성 섹션 내부에 "통과 X / 경고 Y" 형태 요약 표시

### Claude's Discretion

- 색상 대비 계산 알고리즘 구현 (WCAG 상대 휘도 공식)
- inline style vs CSS class의 색상 추출 방식
- 각 접근성 경고의 한국어 레이블
- 접근성 점수 계산 방식 (단순 통과/실패 비율 또는 가중치 적용)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QA-02 | 사용자가 이메일 템플릿의 접근성 문제(alt 텍스트 누락, 색상 대비, 시맨틱 구조)를 자동 검사할 수 있다 | WCAG formula verified, cheerio patterns confirmed, Phase 22 pattern reuse documented |
</phase_requirements>

---

## Summary

Phase 23은 `analyzeAccessibility(html)` 순수 함수와 WarningPanel 확장으로 구성된다. Phase 22의 `analyzeLinkProblems` 패턴을 그대로 복제하여 구조 일관성을 유지한다. 새 파일 하나(`lib/engine/analyzeAccessibility.ts`)와 WarningPanel에 섹션 하나 추가로 완결된다.

WCAG AA 대비 계산은 표준 상대 휘도 공식(W3C 공식 문서 확인)을 순수 TypeScript로 구현한다. 외부 라이브러리 없이 가능하다 — 공식이 단순하고 cheerio로 inline style에서 색상을 추출하는 것도 충분히 구현 가능하다. HTML 이메일에서 색상 정보는 거의 항상 `style="color: ...; background-color: ..."` 형태의 inline style에 있어, CSS class 기반 색상 추출은 범위 밖이다.

헤딩 순서 건너뛰기는 cheerio로 h1~h6를 순서대로 수집하여 레벨 차이가 2 이상인 경우를 탐지한다. img alt 누락은 `attr('alt')` 가 `undefined`인 경우만 경고(빈 문자열 `""` 허용).

**Primary recommendation:** `analyzeLinkProblems.ts` 구조를 템플릿으로 복사하여 `analyzeAccessibility.ts`를 작성하고, WarningPanel에 `accessibilityWarnings` useMemo와 `♿ 접근성` 섹션 렌더링을 추가한다.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| alt 텍스트 탐지 | lib/engine (서버 가능, 순수 함수) | — | HTML 파싱은 DOM과 무관하게 cheerio로 처리 |
| 색상 대비 계산 | lib/engine (순수 함수) | — | 수학 공식 — I/O 없음 |
| 헤딩 순서 탐지 | lib/engine (순수 함수) | — | HTML 파싱 — cheerio |
| 결과 표시 | Frontend (WarningPanel.tsx) | — | Phase 22와 동일 패턴 |
| debounce + useMemo | Frontend (WarningPanel.tsx) | — | 기존 파이프라인 재사용 |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | 1.2.0 | HTML 파싱 — img/heading 탐지 | 이미 설치됨, Phase 2부터 사용 |
| TypeScript | ^5 | 타입 안전성 | 프로젝트 표준 |
| Vitest | ^4.1.5 | 단위 테스트 | 프로젝트 표준 |

### Supporting

없음 — 외부 라이브러리 추가 불필요. WCAG 계산은 수식을 직접 구현한다.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 직접 구현 | `color-contrast-checker` npm | 외부 의존성 추가 불필요. 공식 자체가 20줄 이내. |
| 직접 구현 | `wcag-contrast` npm | 동일 이유 — 사이즈 대비 이득 없음 |

**Installation:** 추가 설치 불필요.

---

## Architecture Patterns

### System Architecture Diagram

```
HTML input (debouncedHtml)
         │
         ▼
analyzeAccessibility(html)  ←── lib/engine/analyzeAccessibility.ts
         │
         ├─── cheerio.load(html)
         │         │
         │         ├── $('img').each()  ──► alt 누락 탐지
         │         ├── $('h1,h2,h3,h4,h5,h6')  ──► 헤딩 순서 탐지
         │         └── $('[style]').each()  ──► inline style 색상 추출
         │                   │
         │                   └── parseColor(value) ──► relativeLuminance(r,g,b)
         │                                ──► contrastRatio(L1, L2) ──► 대비 탐지
         │
         ▼
  AccessibilityWarning[]
         │
         ▼
WarningPanel.tsx (useMemo)
         │
         ├── CSS 섹션 (🎨)       [기존]
         ├── 링크 섹션 (🔗)       [Phase 22]
         └── 접근성 섹션 (♿)     [Phase 23 신규]
                   │
                   └── "통과 X / 경고 Y" 요약 + AccessibilityWarningRow[]
```

### Recommended Project Structure

```
lib/engine/
├── analyzeAccessibility.ts       # 신규: 순수 함수 (이 phase)
├── analyzeAccessibility.test.ts  # 신규: Vitest 단위 테스트 (이 phase)
├── analyzeLinkProblems.ts        # Phase 22 (참조 패턴)
├── analyzeLinkProblems.test.ts   # Phase 22 (참조 패턴)
└── analyzeCssCompatibility.ts   # 기존

app/components/
└── WarningPanel.tsx              # 접근성 섹션 추가
```

### Pattern 1: analyzeAccessibility 인터페이스

`analyzeLinkProblems.ts`와 동일한 구조.

```typescript
// Source: analyzeLinkProblems.ts 패턴 (프로젝트 내 확립된 패턴)
export interface AccessibilityWarning {
  type: 'missing-alt' | 'low-contrast' | 'heading-skip'
  severity: 'error' | 'warning'
  message: string
  lineNumber: number
  // type별 추가 필드 (예: colors, ratio)
}

export function analyzeAccessibility(html: string): AccessibilityWarning[] {
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: AccessibilityWarning[] = []
  // ... 3가지 검사
  return warnings
}
```

### Pattern 2: WCAG 상대 휘도 및 대비 공식

[VERIFIED: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html]

```typescript
// WCAG 2.1 SC 1.4.3 공식
function linearize(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
```

WCAG AA 기준:
- 일반 텍스트: 4.5:1 이상
- 큰 텍스트 (18pt 이상 또는 14pt bold): 3:1 이상

### Pattern 3: img alt 탐지

[VERIFIED: cheerio 1.2.0 + 프로젝트 내 패턴]

```typescript
$('img').each((_, el) => {
  const alt = $(el).attr('alt')
  if (alt === undefined) {
    // alt 속성 자체가 없음 → 경고
    const tagHtml = $.html(el)
    warnings.push({
      type: 'missing-alt',
      severity: 'error',
      message: 'img 태그에 alt 속성이 없습니다',
      lineNumber: lineOf(html, tagHtml),
    })
  }
  // alt="" 는 장식 이미지로 허용 (D-01)
})
```

### Pattern 4: 헤딩 순서 건너뛰기 탐지

```typescript
const headings: { level: number; lineNumber: number }[] = []
$('h1, h2, h3, h4, h5, h6').each((_, el) => {
  const level = parseInt(el.tagName[1], 10)
  const tagHtml = $.html(el)
  headings.push({ level, lineNumber: lineOf(html, tagHtml) })
})

for (let i = 1; i < headings.length; i++) {
  const diff = headings[i].level - headings[i - 1].level
  if (diff > 1) {
    // 예: h2 → h4 (diff=2) → 경고
    warnings.push({
      type: 'heading-skip',
      severity: 'warning',
      message: `h${headings[i-1].level}에서 h${headings[i].level}로 건너뜀`,
      lineNumber: headings[i].lineNumber,
    })
  }
}
```

### Pattern 5: inline style 색상 추출

이메일 HTML에서 색상은 거의 전적으로 inline style에 있다. `color` + `background-color` 쌍을 추출하여 대비를 계산한다.

```typescript
// 색상 형식 지원: #RGB, #RRGGBB, rgb(r,g,b)
function parseColor(value: string): [number, number, number] | null {
  // hex: #RGB 또는 #RRGGBB
  const hex6 = value.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (hex6) return [parseInt(hex6[1],16), parseInt(hex6[2],16), parseInt(hex6[3],16)]
  const hex3 = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (hex3) return [
    parseInt(hex3[1]+hex3[1],16),
    parseInt(hex3[2]+hex3[2],16),
    parseInt(hex3[3]+hex3[3],16),
  ]
  // rgb(r, g, b)
  const rgb = value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgb) return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])]
  return null
}
```

**색상 추출 범위 결정 (Claude's Discretion):**

이메일 HTML에서 inline style로 `color`와 `background-color`가 같은 요소 또는 직계 부모/자식에 있을 때 쌍으로 분석한다. 같은 요소에 두 속성이 모두 있을 때만 검사하는 단순 전략이 이메일에 적합하다 (DOM 상속 추적은 불필요한 복잡성, CSS class 기반 상속은 이 도구 범위 밖).

```typescript
$('[style]').each((_, el) => {
  const style = $(el).attr('style') || ''
  const fg = extractCssProperty(style, 'color')
  const bg = extractCssProperty(style, 'background-color')
  if (!fg || !bg) return
  const fgRgb = parseColor(fg.trim())
  const bgRgb = parseColor(bg.trim())
  if (!fgRgb || !bgRgb) return
  const ratio = contrastRatio(
    relativeLuminance(...fgRgb),
    relativeLuminance(...bgRgb)
  )
  if (ratio < 4.5) {
    warnings.push({ type: 'low-contrast', ... ratio, fg, bg })
  }
})
```

### Pattern 6: WarningPanel 확장

Phase 22 패턴과 완전히 동일한 구조.

```typescript
// WarningPanel.tsx 추가 내용
import { analyzeAccessibility, type AccessibilityWarning } from '@/lib/engine/analyzeAccessibility'

// useMemo 추가
const accessibilityWarnings = useMemo(
  () => analyzeAccessibility(debouncedHtml),
  [debouncedHtml]
)

// totalIssues 계산에 포함
const totalIssues = warnings.length + linkWarnings.length + accessibilityWarnings.length

// 렌더링 섹션 추가 (링크 섹션 다음에)
{accessibilityWarnings.length > 0 && (
  <>
    <div className="flex items-center gap-1 pt-1.5 pb-0.5 text-[10px] text-zinc-500 font-medium">
      <span>♿</span>
      <span>접근성</span>
      <span className="ml-auto text-zinc-600">
        통과 {passCount} / 경고 {accessibilityWarnings.length}
      </span>
    </div>
    {accessibilityWarnings.map((w, i) => (
      <AccessibilityWarningRow key={i} warning={w} ... />
    ))}
  </>
)}
```

**D-05 "통과 X" 계산 (Claude's Discretion):**
통과 수 = 검사 항목 수 - 경고 수. 검사 항목 수는 (img 수) + (heading 검사 대상 수) + (색상 쌍 수)로 계산. 단순 비율이 적합 — 가중치 적용은 과도한 복잡성.

### Anti-Patterns to Avoid

- **CSS class 기반 색상 상속 추적:** 이메일 HTML은 CSS class 상속이 클라이언트마다 다르게 동작함 — inline style만 신뢰 가능
- **named 색상 지원 (red, blue 등):** 이메일에서 드물고 변환 테이블이 복잡함 — 추출 실패 시 조용히 skip
- **중첩 색상 상속:** 부모의 `background-color`를 자식의 `color`와 매칭하는 DOM 트리 탐색은 이 phase 범위 밖
- **대규모 외부 라이브러리:** 색상 파싱을 위해 `chroma-js`, `color` 등을 추가하는 것은 과도함

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML 파싱 | 직접 regex로 img/heading 파싱 | cheerio | 이미 설치됨, 안전한 트리 탐색 |
| WCAG 공식 | 근사치 공식 | 검증된 W3C 공식 그대로 구현 | 틀리면 잘못된 경고 발생 |

**Key insight:** 이 phase의 핵심 복잡성은 WCAG 공식 자체가 아니라 색상 파싱과 "어떤 쌍을 검사할 것인가"의 스코프 결정이다. 스코프를 단순하게(같은 요소에 둘 다 있을 때만) 유지하면 구현이 단순해진다.

---

## Common Pitfalls

### Pitfall 1: alt="" 를 에러로 처리
**What goes wrong:** `alt=""` 는 WAI-ARIA에서 장식 이미지를 나타내는 표준 방법 — 경고하면 오탐
**Why it happens:** `if (!alt)` 조건이 빈 문자열도 falsy로 처리
**How to avoid:** `if (alt === undefined)` 로 명시적 비교 (D-01에서 명시됨)
**Warning signs:** 테스트에서 `alt=""` 케이스가 경고를 발생시키면 버그

### Pitfall 2: linearize 공식의 임계값 혼동
**What goes wrong:** 일부 오래된 구현이 0.03928을 사용 — WCAG 2.1은 0.04045 사용
**Why it happens:** WCAG 2.0 초안에서 반올림 오류가 있었음
**How to avoid:** `c <= 0.04045 ? c/12.92 : ...` (WCAG 2.1 공식 준수)
**Warning signs:** 밝은 색상의 경계값 근처에서 결과가 다른 도구와 약간 다름

### Pitfall 3: 색상 추출 실패 시 경고 발생
**What goes wrong:** `parseColor()`가 `null`을 반환할 때 contrast를 0으로 처리하면 오탐
**Why it happens:** named color, rgba(), hsl() 등 지원하지 않는 형식
**How to avoid:** `if (!fgRgb || !bgRgb) return` — 파싱 실패 시 해당 요소 조용히 skip
**Warning signs:** 모든 요소에 대해 경고가 발생하거나 ratio가 NaN

### Pitfall 4: `$.html(el)` 라인 번호 탐색 성능
**What goes wrong:** 요소 수가 많을 때 `html.indexOf(tagHtml)`이 느릴 수 있음
**Why it happens:** O(n*m) — 전체 HTML에서 각 요소의 직렬화된 HTML을 검색
**How to avoid:** Phase 22와 동일한 방식(lineOf) 사용 — 이메일 HTML은 보통 수백 줄 이내라 실용적으로 충분
**Warning signs:** 수천 개 요소가 있는 대형 이메일에서 분석이 느림 (이메일에서는 현실적으로 발생 안함)

### Pitfall 5: 헤딩 건너뛰기 — 최초 헤딩이 h2인 경우
**What goes wrong:** h1이 없고 h2로 시작할 때 이것을 경고해야 하는가?
**Why it happens:** WCAG는 문서 구조에 대한 것, 이메일은 종종 h1 없이 시작
**How to avoid:** 건너뛰기(skip)만 탐지 — 최초 헤딩 레벨은 경고하지 않음. h2→h4처럼 레벨 차이 >1인 경우만 경고.
**Warning signs:** 정상적인 이메일에서 과도한 헤딩 경고 발생

---

## Code Examples

### 완전한 analyzeAccessibility 시그니처

```typescript
// Source: 프로젝트 내 analyzeLinkProblems.ts 패턴 (VERIFIED)
// lib/engine/analyzeAccessibility.ts

import * as cheerio from 'cheerio'

export interface AccessibilityWarning {
  type: 'missing-alt' | 'low-contrast' | 'heading-skip'
  severity: 'error' | 'warning'
  message: string
  lineNumber: number
  detail?: {
    // low-contrast 전용
    fg?: string
    bg?: string
    ratio?: number
    required?: number
    // heading-skip 전용
    fromLevel?: number
    toLevel?: number
  }
}

export interface AccessibilitySummary {
  warnings: AccessibilityWarning[]
  passCount: number   // 검사 통과 항목 수 (D-05)
  failCount: number   // 경고 항목 수
}

export function analyzeAccessibility(html: string): AccessibilitySummary
```

### 테스트 패턴

```typescript
// Source: analyzeLinkProblems.test.ts 패턴 (VERIFIED)
// lib/engine/analyzeAccessibility.test.ts

import { describe, it, expect } from 'vitest'
import { analyzeAccessibility } from './analyzeAccessibility'

describe('analyzeAccessibility', () => {
  describe('missing-alt detection', () => {
    it('flags <img> without alt attribute', () => {
      const result = analyzeAccessibility('<img src="x.jpg">')
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('missing-alt')
    })
    it('does NOT flag alt="" (decorative image)', () => {
      const result = analyzeAccessibility('<img src="x.jpg" alt="">')
      expect(result.warnings).toHaveLength(0)
    })
  })
  // ... 헤딩, 대비 테스트
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 0.03928 threshold (WCAG 2.0 draft) | 0.04045 threshold (WCAG 2.1) | WCAG 2.1 2018 | 경계값 색상에서 약간 다른 결과 |
| WCAG AA 4.5:1 only | 4.5:1 일반 + 3:1 큰 텍스트 | 항상 AA에 포함 | 큰 텍스트 감지 시 낮은 임계값 적용 |

**이 phase에서 큰 텍스트 감지:** inline style의 `font-size`를 파싱하여 18px 이상(혹은 14px+bold)이면 3:1 임계값 적용. 구현 복잡성 대비 이메일에서 빈도가 낮으므로 Claude의 재량에 맡김 — 단순화하려면 모두 4.5:1 적용도 가능.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 이메일 HTML에서 색상은 주로 inline style에 있으므로 CSS class 기반 상속 추적 불필요 | Color extraction | 드물게 CSS class로 색상을 설정한 경우 low-contrast 미탐지 — 사용자가 결과를 놓칠 수 있지만 오탐은 없음 |
| A2 | 같은 요소에 color+background-color가 모두 있는 쌍만 검사하는 단순 전략이 충분 | Color extraction | 배경색이 부모에 있고 텍스트색이 자식에 있는 경우 미탐지 |
| A3 | named color (red, white 등) 지원 없이 hex/#RGB/rgb() 만 지원하면 실용적으로 충분 | parseColor | named color 사용 시 해당 요소 skip → 오탐 없음, 미탐 가능 |

---

## Open Questions

1. **큰 텍스트(large text) 임계값 적용 여부**
   - What we know: WCAG AA는 18pt(24px) 또는 14pt bold(~18.67px) 이상을 큰 텍스트로 정의
   - What's unclear: 이메일 HTML에서 font-size를 inline style에서 파싱하는 복잡성 대비 이득
   - Recommendation: 단순화하여 모두 4.5:1 적용. 큰 텍스트 구분이 필요하면 `font-size >= 18px` 조건으로 3:1 적용 — Claude's discretion

2. **passCount 계산 방법**
   - What we know: D-05는 "통과 X / 경고 Y" 요약을 요구
   - What's unclear: "검사 항목"의 단위 (각 img 1개, 각 heading pair 1개, 각 color pair 1개)
   - Recommendation: img 수 + heading pair 수(실제 건너뛰기 검사 대상) + color pair 수를 각각 검사 항목으로 카운트

---

## Environment Availability

Step 2.6: SKIPPED (no external tool dependencies — cheerio 1.2.0 already installed, pure TypeScript computation)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.5 |
| Config file | vitest.config.ts (프로젝트 루트) |
| Quick run command | `npx vitest run lib/engine/analyzeAccessibility.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QA-02-alt | img alt 누락 탐지 | unit | `npx vitest run lib/engine/analyzeAccessibility.test.ts` | ❌ Wave 0 |
| QA-02-contrast | WCAG AA 대비 미달 탐지 | unit | `npx vitest run lib/engine/analyzeAccessibility.test.ts` | ❌ Wave 0 |
| QA-02-heading | 헤딩 건너뛰기 탐지 | unit | `npx vitest run lib/engine/analyzeAccessibility.test.ts` | ❌ Wave 0 |
| QA-02-summary | 통과/경고 요약 | unit | `npx vitest run lib/engine/analyzeAccessibility.test.ts` | ❌ Wave 0 |
| QA-02-panel | WarningPanel 통합 | manual | 브라우저에서 ♿ 섹션 확인 | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run lib/engine/analyzeAccessibility.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `lib/engine/analyzeAccessibility.ts` — 핵심 구현
- [ ] `lib/engine/analyzeAccessibility.test.ts` — 단위 테스트 (QA-02-alt, QA-02-contrast, QA-02-heading, QA-02-summary)

---

## Security Domain

이 phase는 HTML 파싱(읽기 전용) 및 수학 계산만 수행한다. 외부 API 없음. 새로운 보안 표면 없음.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | no | HTML 파싱은 cheerio로 안전하게 처리, 결과는 읽기 전용 |
| V6 Cryptography | no | 해당 없음 |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html] — 상대 휘도 공식 (0.2126R + 0.7152G + 0.0722B), 0.04045 임계값, 대비 공식 ((L1+0.05)/(L2+0.05)), AA 기준 (4.5:1 / 3:1)
- [VERIFIED: https://www.w3.org/TR/WCAG21/#contrast-minimum] — WCAG 2.1 SC 1.4.3 규범 텍스트
- [VERIFIED: npm registry] — cheerio 1.2.0 설치 확인 (node_modules)
- [VERIFIED: codebase] — analyzeLinkProblems.ts 패턴, WarningPanel.tsx 현재 구조, Vitest 4.1.5 테스트 환경

### Secondary (MEDIUM confidence)
- [CITED: context7/cheeriojs/cheerio] — `attr()` API, `.each()` 패턴, `$.html(el)` 직렬화

### Tertiary (LOW confidence)
없음

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — cheerio 1.2.0 설치 확인, 추가 라이브러리 불필요
- Architecture: HIGH — Phase 22 패턴과 동일, 코드베이스에서 검증됨
- WCAG formula: HIGH — W3C 공식 문서에서 직접 확인
- Color extraction scope: MEDIUM — 단순화된 전략(same-element-only)이 이메일에 실용적이지만 일부 미탐 가능성 있음
- Pitfalls: HIGH — 공식 문서와 코드 검토에서 도출

**Research date:** 2026-04-26
**Valid until:** 2027-04-26 (WCAG 공식은 안정적, cheerio API는 1.x 유지)
