# Phase 22: 링크 검증 - Research

**Researched:** 2026-04-25
**Domain:** HTML link validation, WarningPanel extension, cheerio DOM parsing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 4가지 링크 문제 탐지:
  1. 빈 href (`href=""` 또는 href 속성 없음)
  2. `#` placeholder 링크 (`href="#"`)
  3. `example.com` 포함 링크 (테스트 URL)
  4. 프로토콜 누락 링크 (`www.example.com` 등 http(s):// 없는 URL)
- **D-02:** 기존 `WarningPanel` 컴포넌트를 확장. 별도 패널 추가 금지.
- **D-03:** 링크 경고와 CSS 경고를 카테고리 또는 아이콘으로 구분한다.
- **D-04:** 각 링크 경고에 링크 텍스트(또는 href 값), 문제 유형, 줄 번호를 표시. CSS 경고와 동일한 형식을 따른다.
- **D-05:** HTML 수정 시 실시간 갱신 — 기존 CSS 경고와 동일한 debounce 파이프라인 사용.

### Claude's Discretion
- 링크 검증 함수의 정확한 구현 (cheerio 사용 여부, regex 패턴)
- WarningPanel 내부 CSS/링크 경고 구분 UI (탭, 섹션, 아이콘 등)
- 경고 클릭 시 에디터 줄 이동 기능의 구현 방식

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 22는 순수 함수 `analyzeLinkProblems(html)` 를 `lib/engine/` 에 추가하고, 기존 `WarningPanel`이 CSS 경고와 링크 경고를 함께 표시하도록 확장하는 작업이다.

cheerio는 이미 설치(`^1.2.0`)되어 있고 `analyzeCssCompatibility` 가 이미 사용 중이다. 동일한 패턴으로 `$('a[href]').each()` 로 링크를 순회하고, 각 규칙을 정규식으로 판별하면 된다. 줄 번호는 cheerio가 직접 제공하지 않으므로 raw HTML에서 `String.prototype.indexOf` + 줄 카운트로 계산한다.

`WarningPanel`은 현재 CSS 경고만 받는다. `LinkWarning[]` 타입을 별도로 정의하고 prop으로 추가하거나, 두 경고 타입을 구별할 수 있는 통합 `Warning` 유니온 타입으로 합치는 방법 중 하나를 선택해야 한다. 두 방법 모두 유효하나 **prop 추가 방식(linkWarnings 별도 prop)** 이 기존 CSS 코드를 건드리지 않아 더 안전하다.

**Primary recommendation:** `lib/engine/analyzeLinkProblems.ts` 를 순수 함수로 작성 → `WarningPanel`에 `linkWarnings` prop 추가 → 패널 내부에서 CSS/링크 섹션을 아이콘으로 구분 표시.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 링크 문제 탐지 로직 | lib/engine (순수 함수) | — | 기존 analyzeCssCompatibility 패턴과 동일. 테스트 가능성 확보. |
| 경고 UI 표시 | Frontend (WarningPanel.tsx) | — | 이미 경고 패널이 있음. 확장만 필요. |
| debounce / 실시간 갱신 | Frontend (useDebounce hook) | — | 기존 300ms debounce 파이프라인 재사용 |
| page.tsx 연결 | Frontend (app/page.tsx) | — | WarningPanel prop 전달 지점 |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| cheerio | ^1.2.0 | HTML DOM 파싱, `<a>` 요소 순회 | 이미 설치됨, analyzeCssCompatibility에서 사용 중 [VERIFIED: package.json] |
| TypeScript | (project) | 타입 정의 (LinkWarning interface) | 기존 프로젝트 표준 |
| vitest | ^4.1.5 | 순수 함수 단위 테스트 | 기존 테스트 인프라 [VERIFIED: package.json + pnpm test] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (없음) | — | — | 추가 라이브러리 불필요 |

**Version verification:** [VERIFIED: package.json 직접 확인]

---

## Architecture Patterns

### System Architecture Diagram

```
HTML (편집기)
    │ onChange (debounced 300ms via useDebounce)
    ▼
analyzeLinkProblems(html)   analyzeCssCompatibility(html, clients)
    │                                │
    ▼                                ▼
LinkWarning[]                  CssWarning[]
    │                                │
    └──────────────┬─────────────────┘
                   ▼
           WarningPanel
        (linkWarnings + cssWarnings props)
                   │
                   ▼
        [CSS 섹션] [링크 섹션]  (아이콘 구분)
```

### Recommended Project Structure
```
lib/engine/
├── analyzeCssCompatibility.ts   # 기존 (변경 없음)
├── analyzeLinkProblems.ts       # 신규
├── analyzeLinkProblems.test.ts  # 신규 (vitest)
└── ...

app/components/
└── WarningPanel.tsx             # 수정: linkWarnings prop 추가
```

### Pattern 1: 순수 함수 링크 분석 (analyzeCssCompatibility와 동일 패턴)

**What:** cheerio로 HTML 파싱 → `$('a')` 순회 → 4가지 규칙 적용 → `LinkWarning[]` 반환
**When to use:** HTML 변경 시마다 (debounced)

```typescript
// Source: lib/engine/analyzeCssCompatibility.ts 패턴 참조 [VERIFIED: codebase]
import * as cheerio from 'cheerio'

export interface LinkWarning {
  href: string
  text: string
  lineNumber: number
  problem: 'empty-href' | 'hash-placeholder' | 'example-domain' | 'missing-protocol'
  severity: 'error' | 'warning'
  message: string
}

export function analyzeLinkProblems(html: string): LinkWarning[] {
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: LinkWarning[] = []

  $('a').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const text = $(el).text().trim() || href

    // Rule 1: 빈 href
    if (href === '') {
      warnings.push({ href, text, lineNumber: getLineNumber(html, $(el).toString()), problem: 'empty-href', severity: 'error', message: 'href가 비어 있습니다' })
    }

    // Rule 2: # placeholder
    else if (href === '#') {
      warnings.push({ href, text, lineNumber: getLineNumber(html, $(el).toString()), problem: 'hash-placeholder', severity: 'warning', message: '# placeholder 링크입니다' })
    }

    // Rule 3: example.com
    else if (/example\.com/i.test(href)) {
      warnings.push({ href, text, lineNumber: getLineNumber(html, $(el).toString()), problem: 'example-domain', severity: 'warning', message: 'example.com 테스트 도메인이 포함되어 있습니다' })
    }

    // Rule 4: 프로토콜 누락 (www. 로 시작하거나, / 없이 도메인처럼 보이는 URL)
    else if (/^www\./i.test(href) || (/^[a-z0-9-]+\.[a-z]{2,}/i.test(href) && !/^(https?|mailto|tel|ftp):/.test(href))) {
      warnings.push({ href, text, lineNumber: getLineNumber(html, $(el).toString()), problem: 'missing-protocol', severity: 'error', message: `프로토콜이 없습니다 (https:// 추가 필요)` })
    }
  })

  return warnings
}

function getLineNumber(html: string, fragment: string): number {
  const idx = html.indexOf(fragment)
  if (idx === -1) return 0
  return html.slice(0, idx).split('\n').length
}
```

### Pattern 2: WarningPanel prop 확장

**What:** `linkWarnings` prop을 `WarningPanel`에 추가하고, 내부에서 CSS/링크 섹션을 아이콘으로 구분.
**When to use:** 별도 패널 없이 통합 표시할 때 (D-02 결정 준수)

```tsx
// Source: app/components/WarningPanel.tsx 기존 구조 참조 [VERIFIED: codebase]
interface WarningPanelProps {
  html: string
  clients: { name: string; ruleset: ClientRuleset }[]
  linkWarnings?: LinkWarning[]  // 신규 prop
}
```

UI 구분 옵션:
- **아이콘 prefix** (권장): `🔗` 링크, `🎨` CSS — 탭 전환 없이 단일 스크롤 리스트
- 탭 UI: 구현 복잡도가 높고 패널이 작아 공간 낭비

### Anti-Patterns to Avoid
- **cheerio로 줄 번호 직접 추출 시도:** cheerio는 줄 번호를 제공하지 않는다. raw HTML에서 `indexOf` + `split('\n').length` 방식이 실용적. [ASSUMED] 정확도가 낮을 수 있으나 이메일 HTML 규모에서는 충분.
- **링크 href가 없는 `<a>` 무시:** href 속성 자체가 없는 경우를 빈 href와 동일하게 처리해야 한다. `$(el).attr('href') ?? ''` 로 처리.
- **절대 경로 `/page` 를 프로토콜 누락으로 오탐:** `/`로 시작하는 URL은 상대 경로이므로 Rule 4에서 제외해야 한다.
- **`mailto:`, `tel:` 프로토콜을 누락으로 오탐:** Rule 4 정규식에서 `mailto|tel|ftp` 예외 처리 필수.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML 파싱 | 직접 regex로 `<a>` 파싱 | cheerio | 중첩 태그, 속성 순서, 인코딩 처리 엣지케이스 |
| debounce | setTimeout 직접 구현 | useDebounce hook (기존) | 이미 300ms로 검증된 구현이 있음 |

---

## Common Pitfalls

### Pitfall 1: `<a>` 없는 href (아닌 요소) 오탐
**What goes wrong:** 일부 이메일 템플릿에서 `<area href="">` 등 다른 요소에 href가 있을 수 있다.
**Why it happens:** `$('[href]')` 대신 `$('a')` 를 타겟으로 해야 한다.
**How to avoid:** `$('a')` 만 선택.

### Pitfall 2: 줄 번호 부정확
**What goes wrong:** cheerio가 HTML을 파싱하면 whitespace 정규화로 원본 줄 번호와 달라질 수 있다.
**Why it happens:** `$(el).toString()`으로 재직렬화한 후 원본에서 검색하면 불일치 가능.
**How to avoid:** 원본 HTML에서 `href` 값으로 검색하는 방식이 더 안정적: `html.slice(0, html.indexOf(`href="${href}"`)).split('\n').length`.

### Pitfall 3: example.com이 DEFAULT_HTML에 포함됨
**What goes wrong:** 기본 샘플 HTML에 `https://example.com` 링크가 있어, 처음부터 경고가 표시된다.
**Why it happens:** `app/page.tsx`의 `DEFAULT_HTML` 참조. [VERIFIED: codebase]
**How to avoid:** 이는 의도된 동작 (링크 검증 기능을 즉시 시연). 문서화만 하면 됨.

### Pitfall 4: WarningPanel prop 변경으로 인한 타입 오류
**What goes wrong:** `app/page.tsx`에서 `<WarningPanel>` 호출 시 `linkWarnings` prop을 전달해야 한다.
**Why it happens:** prop 추가 후 page.tsx 업데이트를 빠뜨릴 수 있다.
**How to avoid:** `linkWarnings?` 를 optional prop으로 만들거나, page.tsx에서 `useMemo`로 계산 후 전달.

---

## Code Examples

### 기존 CSS 경고와 동일한 WarningRow 재사용 패턴

```tsx
// Source: app/components/WarningPanel.tsx [VERIFIED: codebase]
// CSS 경고의 기존 WarningRow 구조를 링크 경고에도 적용:
// client 자리 → 문제 유형 (예: "빈 href")
// impact 자리 → 링크 텍스트 및 href
// fix 자리 → 해결 방법 (예: "실제 URL로 교체")
```

### page.tsx에서 linkWarnings 계산 및 전달

```tsx
// Source: app/page.tsx 패턴 참조 [VERIFIED: codebase]
// option A: page.tsx에서 계산 후 prop 전달
import { analyzeLinkProblems } from '@/lib/engine/analyzeLinkProblems'
// ...
const linkWarnings = useMemo(() => analyzeLinkProblems(html), [html]) // debounce는 WarningPanel 내부에서 처리
<WarningPanel html={html} clients={...} linkWarnings={linkWarnings} />

// option B: WarningPanel 내부에서 처리 (CSS와 동일한 방식)
// WarningPanel 내부에서 debouncedHtml로 analyzeLinkProblems 호출
// → 더 캡슐화되고 기존 CSS 패턴과 완전히 동일
```

Option B (WarningPanel 내부 처리)가 기존 CSS 경고 패턴과 완전히 일관되므로 권장.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A (신규 기능) | 순수 함수 + cheerio 파싱 | Phase 22 (신규) | — |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 줄 번호를 `html.indexOf(href)` 기반으로 계산하면 충분히 정확하다 | Code Examples | 줄 번호가 부정확하게 표시될 수 있으나 기능에 치명적이지 않음 |
| A2 | 아이콘 prefix (🔗 / 🎨) 로 CSS/링크 경고 구분이 충분한 UX를 제공한다 | Architecture Patterns | 탭 UI가 더 명확할 수 있으나 구현 복잡도 상승 |
| A3 | `href` 없는 `<a>` (anchor)는 링크 경고 대상에서 제외한다 | Code Examples | 일부 이메일에서 anchor-only `<a>`가 있을 수 있음 — 제외가 맞는 동작 |

---

## Open Questions

1. **줄 번호 표시 방식**
   - What we know: cheerio는 줄 번호를 직접 제공하지 않음
   - What's unclear: raw HTML에서 href 값 검색 vs 재직렬화된 태그 검색 중 어느 쪽이 더 안정적인가
   - Recommendation: href 값 기반 검색 (`html.indexOf(`href="${href}"`)`)이 재직렬화 오차 없이 더 안정적

2. **`<a>` href 없는 경우 처리**
   - What we know: `<a name="top">` 같은 anchor tag는 href가 없음
   - What's unclear: 이를 "빈 href 오류"로 표시할지 무시할지
   - Recommendation: `$('a')` 순회 시 href 속성 자체가 없는 경우는 경고 제외 (anchor tag는 링크가 아님)

---

## Environment Availability

Step 2.6: SKIPPED — 이 phase는 외부 서비스/CLI 없이 기존 codebase 내부 코드 추가만 필요.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.5 |
| Config file | none — vitest는 Next.js vite config에서 자동 감지 |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

현재 103 tests all passing. [VERIFIED: pnpm test 실행]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QA-01-a | 빈 href 탐지 | unit | `pnpm test analyzeLinkProblems` | ❌ Wave 0 |
| QA-01-b | `#` placeholder 탐지 | unit | `pnpm test analyzeLinkProblems` | ❌ Wave 0 |
| QA-01-c | example.com 탐지 | unit | `pnpm test analyzeLinkProblems` | ❌ Wave 0 |
| QA-01-d | 프로토콜 누락 탐지 | unit | `pnpm test analyzeLinkProblems` | ❌ Wave 0 |
| QA-01-e | 정상 href는 경고 없음 | unit | `pnpm test analyzeLinkProblems` | ❌ Wave 0 |
| QA-01-f | `mailto:`, `tel:` 오탐 없음 | unit | `pnpm test analyzeLinkProblems` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `lib/engine/analyzeLinkProblems.test.ts` — covers QA-01-a through QA-01-f

---

## Security Domain

`security_enforcement` 기본값(활성화). 이 phase의 보안 고려사항:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | HTML은 이미 cheerio로 파싱 — XSS 위험 없음 (분석만 수행, 렌더링 없음) |
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V6 Cryptography | no | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| 악의적 href 값 (`javascript:`) 파싱 시 평가 | Tampering | cheerio는 href를 문자열로만 읽음 — 실행 없음. `javascript:` 를 추가 경고 규칙으로 고려 가능 [ASSUMED] |

---

## Sources

### Primary (HIGH confidence)
- `/Users/sy/XcodeProject/sticky/app/components/WarningPanel.tsx` — 기존 구조 직접 확인
- `/Users/sy/XcodeProject/sticky/lib/engine/analyzeCssCompatibility.ts` — 동일 패턴 확인
- `/Users/sy/XcodeProject/sticky/package.json` — cheerio ^1.2.0, vitest ^4.1.5 확인
- `pnpm test` 실행 결과 — 103 tests passing 확인

### Secondary (MEDIUM confidence)
- `.planning/phases/22-link-validation/22-CONTEXT.md` — 확정된 구현 결정

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 codebase에서 직접 확인
- Architecture: HIGH — 기존 패턴의 직접 확장
- Pitfalls: MEDIUM — cheerio 줄 번호 계산은 실험적

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (cheerio API 안정적, 30일 유효)
