# Phase 19: 온보딩 플로우 - Research

**Researched:** 2026-04-25
**Domain:** UI overlay / step-by-step onboarding, React state management, localStorage persistence
**Confidence:** HIGH

## Summary

이 단계는 처음 방문 사용자에게 Sticky의 핵심 기능을 안내하는 오버레이 스텝 가이드를 구현한다. CONTEXT.md에서 결정된 사항(D-01 ~ D-04)에 따라 형태, 콘텐츠, 건너뛰기/재진입, localStorage 저장 방식이 모두 고정되어 있다. 구현 자유도는 라이브러리 선택, 하이라이트 대상 요소, 애니메이션, 언어 혼용에 한정된다.

기존 코드베이스는 완전한 클라이언트 컴포넌트 패턴(`'use client'`, `useState`/`useCallback`, dynamic import + `ssr: false`)을 확립하고 있다. 온보딩 컴포넌트도 동일한 패턴으로 추가할 수 있다. 외부 라이브러리 없이 자체 구현이 가능하며, 이 프로젝트 규모(3단계, 단순 포지셔닝)에서는 자체 구현이 더 가볍고 Tailwind 일관성을 유지하기 쉽다.

**Primary recommendation:** 외부 라이브러리 없이 React + Tailwind CSS로 자체 온보딩 오버레이 컴포넌트를 구현한다. `getBoundingClientRect()`로 대상 요소를 측정하고, `fixed` 포지션 오버레이 + 하이라이트 컷아웃(box-shadow trick)으로 3단계 가이드를 렌더링한다.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 오버레이 스텝 가이드 (tooltip/popover) 방식. 실제 UI 요소를 하이라이트+설명 팝오버로 순차 표시. 에디터 → 프리뷰 패널 → 클라이언트 선택 순서.
- **D-02:** 핵심 3단계 구성:
  1. 도구 목적 소개 ("HTML 이메일을 한국 주요 이메일 클라이언트에서 어떻게 보이는지 미리 확인하는 도구")
  2. 샘플 템플릿 역할 설명 ("기본으로 로드된 예시 HTML로 각 클라이언트의 차이를 바로 확인")
  3. 클라이언트별 프리뷰 차이 안내 ("네이버는 style 블록 제거, Gmail은 조건부 제거 등 각 클라이언트의 CSS 제한사항이 다르게 적용됨")
- **D-03:** 진행 중 "건너뛰기" 버튼 항상 표시. 완료/건너뛰기 후 헤더에 "가이드" 또는 "?" 버튼으로 재진입.
- **D-04:** `localStorage`에 `sticky:onboardingCompleted` 키로 완료 여부 저장.

### Claude's Discretion

- 정확한 tooltip/popover 라이브러리 선택 또는 자체 구현 여부
- 각 스텝의 정확한 위치 지정 (어떤 요소를 하이라이트할지 세부 사항)
- 온보딩 애니메이션 및 트랜지션 효과
- 재진입 버튼의 정확한 아이콘 및 위치 (헤더 우측 등)
- 온보딩 언어 (한국어/영어 또는 혼용)

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-03 | 첫 방문 사용자에게 도구의 목적과 사용법을 안내하는 온보딩 가이드가 표시된다 | D-01 오버레이 패턴 + localStorage 상태 초기화 읽기로 구현 |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 온보딩 오버레이 렌더링 | Browser / Client | — | 클라이언트 상태(스텝 인덱스, 보임 여부)와 DOM 측정이 필요 |
| 완료 상태 저장/읽기 | Browser / Client | — | localStorage는 브라우저 전용, 서버 불필요 |
| 하이라이트 대상 요소 참조 | Browser / Client | — | `ref`로 DOM 요소 측정 |
| 재진입 버튼 (헤더) | Browser / Client | — | 헤더는 `app/page.tsx` 내 클라이언트 컴포넌트 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (useState, useEffect, useRef, useCallback) | 19.2.4 (installed) [VERIFIED: package.json] | 스텝 상태, DOM 측정, 이벤트 핸들링 | 프로젝트 전체에서 사용 중 |
| Tailwind CSS | v4 (installed) [VERIFIED: package.json] | 오버레이, 팝오버, 버튼 스타일링 | 기존 컴포넌트 모두 Tailwind 사용 |
| localStorage API | 브라우저 네이티브 | 완료 상태 저장 | D-04에서 명시적 선택, `sticky:enabledClients` 패턴과 일관 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| driver.js | 1.4.0 (npm latest) [VERIFIED: npm registry] | 외부 투어 라이브러리 | 자체 구현보다 빠른 개발이 필요할 때 (이 프로젝트는 자체 구현 권장) |
| intro.js | 8.3.2 (npm latest) [VERIFIED: npm registry] | 외부 투어 라이브러리 | 자체 구현 대안 (번들 크기 ~40KB, Tailwind 일관성 깨짐) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 자체 구현 | driver.js 1.4.0 | driver.js는 API가 간단하지만 CSS 클래스 오버라이드 필요, Tailwind v4와 충돌 가능. 자체 구현은 번들 추가 없이 완전한 스타일 제어 |
| 자체 구현 | intro.js 8.3.2 | intro.js는 오래된 API, 커스터마이징이 번거로움. 3단계 간단 가이드에는 과도한 의존성 |

**Installation:** 자체 구현 선택 시 추가 패키지 없음.

## Architecture Patterns

### System Architecture Diagram

```
page.tsx (Home)
  │
  ├── useOnboarding() hook
  │     ├── localStorage read → isCompleted?
  │     ├── stepIndex state (0-2)
  │     ├── isVisible state
  │     └── complete() / skip() / restart()
  │
  ├── OnboardingOverlay (fixed, z-50)
  │     ├── backdrop (semi-transparent)
  │     ├── highlight box (box-shadow cutout around target element)
  │     ├── popover (positioned near target)
  │     │     ├── step description (한국어)
  │     │     ├── step counter (1/3, 2/3, 3/3)
  │     │     ├── [건너뛰기] button (always visible)
  │     │     └── [다음 / 완료] button
  │     └── renders null when !isVisible
  │
  └── header "?" button (renders when !isVisible && wasShown)
        └── onClick → restart onboarding
```

**데이터 흐름:**
1. 초기 마운트 → `localStorage.getItem('sticky:onboardingCompleted')` 읽기
2. 미완료 → `isVisible=true`, `stepIndex=0` → 오버레이 표시
3. 스텝 진행 → `stepIndex++` → 대상 요소 `ref` 재측정 → 팝오버 위치 업데이트
4. 완료/건너뛰기 → `localStorage.setItem('sticky:onboardingCompleted', 'true')` → `isVisible=false`
5. 재진입 → "?" 버튼 → `isVisible=true`, `stepIndex=0`

### Recommended Project Structure

```
app/
├── components/
│   └── OnboardingOverlay.tsx   # 온보딩 오버레이 컴포넌트
├── page.tsx                     # ref 추가 + OnboardingOverlay 마운트
```

### Pattern 1: localStorage 온보딩 상태 훅

기존 `useEnabledClients` 패턴을 그대로 따름.

```typescript
// Source: app/page.tsx (기존 패턴 분석) [VERIFIED: codebase]
const ONBOARDING_KEY = 'sticky:onboardingCompleted'

function useOnboarding() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== 'true'
    } catch { return false }
  })
  const [step, setStep] = useState(0)

  const complete = useCallback(() => {
    try { localStorage.setItem(ONBOARDING_KEY, 'true') } catch { /* ignore */ }
    setVisible(false)
  }, [])

  const restart = useCallback(() => {
    setStep(0)
    setVisible(true)
  }, [])

  return { visible, step, setStep, complete, restart }
}
```

### Pattern 2: 하이라이트 컷아웃 (box-shadow trick)

외부 라이브러리 없이 특정 영역만 노출하는 표준 CSS 기법. [ASSUMED - 표준 CSS 기법]

```typescript
// Source: 표준 CSS 패턴 [ASSUMED]
// target: DOMRect from getBoundingClientRect()
const highlightStyle = {
  position: 'fixed' as const,
  top: target.top - padding,
  left: target.left - padding,
  width: target.width + padding * 2,
  height: target.height + padding * 2,
  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
  borderRadius: '4px',
  pointerEvents: 'none' as const,
  zIndex: 50,
}
```

### Pattern 3: 팝오버 위치 계산

```typescript
// Source: 표준 DOM 측정 패턴 [ASSUMED]
function getPopoverPosition(rect: DOMRect, placement: 'bottom' | 'right' | 'top') {
  if (placement === 'bottom') {
    return { top: rect.bottom + 12, left: rect.left }
  }
  if (placement === 'right') {
    return { top: rect.top, left: rect.right + 12 }
  }
  // top
  return { top: rect.top - 12, left: rect.left, transform: 'translateY(-100%)' }
}
```

### Pattern 4: `dynamic` import (기존 패턴과 일관)

```typescript
// Source: app/page.tsx (기존 패턴) [VERIFIED: codebase]
const OnboardingOverlay = dynamic(
  () => import('@/app/components/OnboardingOverlay'),
  { ssr: false }
)
```

### Anti-Patterns to Avoid

- **SSR에서 localStorage 직접 접근:** `typeof window === 'undefined'` 체크 없이 사용하면 Next.js SSR에서 오류. 기존 `useEnabledClients`처럼 초기화 함수 안에서 체크.
- **ref 없이 querySelector로 대상 찾기:** `querySelector`는 컴포넌트 경계를 넘어 취약. `useRef`로 직접 전달 또는 `data-onboarding-target` 속성으로 마킹.
- **window resize 미처리:** 오버레이가 열린 상태에서 창 크기가 바뀌면 하이라이트 위치 오차 발생. `resize` 이벤트 또는 `ResizeObserver`로 재측정.
- **z-index 충돌:** 기존 `SendEmailModal`이 `z-50`을 사용. 온보딩 오버레이는 `z-[60]` 이상 또는 동일 레벨 사용 (모달이 열린 동안에는 온보딩 비활성화).
- **포커스 트랩 미구현:** 모달 열린 동안 Tab 키가 배경으로 이동하는 접근성 문제. 팝오버 내부에서 포커스 순환 처리.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage SSR 안전 읽기 | 별도 유틸 함수 | 기존 `useEnabledClients` 패턴 복사 | 이미 검증된 패턴이 코드베이스에 존재 |
| 오버레이 배경 흐리기 | 복잡한 Canvas/SVG 마스킹 | CSS `box-shadow: 0 0 0 9999px rgba(0,0,0,0.5)` | 표준 CSS 기법, 성능 우수 |

**Key insight:** 3단계 가이드는 자체 구현 비용이 낮고, 외부 라이브러리(driver.js, intro.js) 대비 번들 절감 및 스타일 일관성 우위가 크다.

## Common Pitfalls

### Pitfall 1: SSR에서 localStorage 접근

**What goes wrong:** Next.js SSR 단계에서 `window` 없음 → `ReferenceError`
**Why it happens:** `useState` 초기값이 서버에서도 실행됨
**How to avoid:** 초기화 함수 패턴 `useState(() => { if (typeof window === 'undefined') return false; ... })`
**Warning signs:** `Error: localStorage is not defined` 빌드/런타임 오류

### Pitfall 2: 하이라이트 대상 요소 측정 타이밍

**What goes wrong:** 스텝 변경 직후 `getBoundingClientRect()` 호출 시 요소가 아직 렌더링 전이거나 레이아웃 계산 전
**Why it happens:** React 상태 업데이트는 비동기, DOM 갱신은 다음 페인트에서 완료
**How to avoid:** `useEffect`의 deps에 `step`을 넣어 렌더 후 측정. `useLayoutEffect` 고려.
**Warning signs:** 팝오버가 잘못된 위치에 표시됨

### Pitfall 3: dynamic import 된 컴포넌트에 ref 전달 불가

**What goes wrong:** `dynamic()` 래핑된 컴포넌트에 `ref`를 직접 전달하려 할 때 `null` 반환
**Why it happens:** dynamic import는 `React.forwardRef` 없이 ref를 전달하지 않음
**How to avoid:** 하이라이트 대상 ref는 `page.tsx`에서 직접 관리하고 `data-onboarding-target` 속성으로 마킹하거나, `forwardRef`로 래핑
**Warning signs:** `ref.current === null`인 채로 `getBoundingClientRect()` 호출

### Pitfall 4: SendEmailModal과 z-index 충돌

**What goes wrong:** SendEmailModal(`z-50`)이 열린 상태에서 온보딩 오버레이가 같은 z-index로 렌더링되면 순서가 DOM 순서에 의존
**Why it happens:** Tailwind `z-50` = 50, 동일 레벨
**How to avoid:** 온보딩 오버레이를 `z-[60]` 사용, 또는 SendEmailModal이 열려 있을 때 온보딩 비활성화
**Warning signs:** 오버레이가 모달 뒤에 가려짐

### Pitfall 5: 스크롤 상태에서 위치 오차

**What goes wrong:** 프리뷰 패널 영역이 스크롤된 상태에서 `getBoundingClientRect()`는 뷰포트 기준 반환 — `fixed` 포지션 오버레이와 매칭은 올바르지만, 대상이 뷰포트 밖으로 나가있으면 음수 좌표 발생
**Why it happens:** 오버레이는 `fixed`, 대상은 스크롤된 컨테이너 안
**How to avoid:** 온보딩 스텝 전환 시 대상 요소를 뷰포트로 스크롤 (`scrollIntoView`)
**Warning signs:** 팝오버가 화면 밖에 표시됨

## Code Examples

### OnboardingOverlay 컴포넌트 골격

```typescript
// app/components/OnboardingOverlay.tsx [ASSUMED - 구현 패턴]
'use client'

import { useEffect, useState, RefObject } from 'react'

interface Step {
  targetRef: RefObject<HTMLElement | null>
  title: string
  description: string
  placement: 'bottom' | 'right' | 'top'
}

interface Props {
  steps: Step[]
  onComplete: () => void
  onSkip: () => void
}

export default function OnboardingOverlay({ steps, onComplete, onSkip }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const el = steps[stepIndex]?.targetRef.current
    if (!el) return
    setRect(el.getBoundingClientRect())
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [stepIndex, steps])

  if (!rect) return null

  const isLast = stepIndex === steps.length - 1
  const padding = 8

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      {/* 하이라이트 컷아웃 */}
      <div
        className="absolute rounded pointer-events-none"
        style={{
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
        }}
      />
      {/* 팝오버 */}
      <div
        className="absolute pointer-events-auto bg-zinc-900 text-white rounded-lg shadow-xl p-4 w-72 border border-zinc-700"
        style={{ top: rect.bottom + 12, left: Math.max(8, rect.left) }}
      >
        <p className="text-xs text-blue-400 mb-1">{stepIndex + 1} / {steps.length}</p>
        <p className="text-sm font-semibold mb-1">{steps[stepIndex].title}</p>
        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
          {steps[stepIndex].description}
        </p>
        <div className="flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            건너뛰기
          </button>
          <button
            onClick={() => isLast ? onComplete() : setStepIndex(i => i + 1)}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white"
          >
            {isLast ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### page.tsx 통합 패턴

```typescript
// app/page.tsx 수정 패턴 [ASSUMED - 통합 패턴]
// 1. ref 추가
const editorRef = useRef<HTMLDivElement>(null)
const previewRef = useRef<HTMLDivElement>(null)
const clientsBarRef = useRef<HTMLDivElement>(null)

// 2. 온보딩 훅
const { visible, complete, restart } = useOnboarding()

// 3. JSX에서 ref 연결
// <div ref={editorRef} ...>   (에디터 래퍼)
// <div ref={clientsBarRef} ...>  (클라이언트 토글 바)
// <div ref={previewRef} ...>   (프리뷰 영역 래퍼)

// 4. 헤더에 "?" 버튼 추가
// <button onClick={restart}>?</button>

// 5. 오버레이 마운트
// {visible && <OnboardingOverlay steps={steps} onComplete={complete} onSkip={complete} />}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jQuery-based intro.js 초기 버전 | React 친화적 자체 구현 또는 driver.js | ~2020 | 프레임워크 통합이 자연스러워짐 |
| iframe 팝오버 | CSS `box-shadow` 컷아웃 | ~2018 | 성능 개선, 구현 단순화 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CSS `box-shadow: 0 0 0 9999px rgba(...)` 기법으로 하이라이트 컷아웃 구현 가능 | Code Examples | Tailwind v4 purge가 arbitrary box-shadow를 제거할 경우 인라인 스타일로 우회 필요 (낮은 위험) |
| A2 | `dynamic(() => import(...), { ssr: false })` 패턴이 OnboardingOverlay에도 적용 가능 | Pattern 4 | Next.js 16.2.4 dynamic import API가 동일 — package.json으로 버전 확인됨, 위험 낮음 |
| A3 | `useLayoutEffect` 없이 `useEffect`만으로 충분한 측정 타이밍 | Pitfall 2 | 플리커가 눈에 띄면 `useLayoutEffect` 전환 필요 |

## Open Questions

1. **하이라이트 대상 요소 선택**
   - What we know: 에디터(`HtmlEditor`), 클라이언트 토글 바, 프리뷰 패널이 후보
   - What's unclear: dynamic import된 `HtmlEditor`와 `PreviewPane`에 ref 전달이 가능한지 (`forwardRef` 필요 여부)
   - Recommendation: `page.tsx`의 래퍼 `<div>` 요소에 ref를 붙이는 방식이 가장 안전. 내부 컴포넌트에 ref 전달 불필요.

2. **팝오버 뷰포트 오버플로 처리**
   - What we know: 프리뷰 패널이 우측에 있을 때 팝오버가 뷰포트 오른쪽을 벗어날 수 있음
   - What's unclear: 각 스텝에서 실제 rect를 기준으로 overflow 체크가 필요한지
   - Recommendation: 플래너가 각 스텝 위치를 확정할 때 `Math.min(rect.left, window.innerWidth - 300)` 같은 클램핑 로직 포함 여부 결정

## Environment Availability

Step 2.6: SKIPPED — 이 단계는 React/Tailwind로 브라우저 클라이언트 전용 UI를 구현하며, 외부 서비스/CLI 의존성 없음.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 (`vitest.config.mts` 확인) [VERIFIED: package.json] |
| Config file | `vitest.config.mts` (project root) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-03 | `useOnboarding` 훅: 미완료 시 visible=true 반환 | unit | `pnpm test -- --reporter=verbose` | ❌ Wave 0 |
| UX-03 | `useOnboarding` 훅: 완료 후 localStorage 키 설정 | unit | `pnpm test -- --reporter=verbose` | ❌ Wave 0 |
| UX-03 | `useOnboarding` 훅: restart() 호출 시 visible=true | unit | `pnpm test -- --reporter=verbose` | ❌ Wave 0 |
| UX-03 | 브라우저 시각 검증 (오버레이 표시) | manual-only | — | manual |

**manual-only 이유:** Vitest는 DOM 렌더링 테스트를 위해 `jsdom` environment가 필요. 현재 config는 `environment: 'node'`로 설정되어 있어 React 컴포넌트 렌더 테스트는 환경 변경 없이 불가. 로직 훅만 유닛 테스트 작성.

### Sampling Rate

- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `__tests__/onboarding/useOnboarding.test.ts` — UX-03 localStorage 로직 커버

## Security Domain

이 단계는 localStorage에 boolean 값(완료 여부)만 저장하며 사용자 입력을 받지 않는다. ASVS V5(입력 검증) 적용 없음. 외부 API 호출 없음. 보안 위협 없음.

## Sources

### Primary (HIGH confidence)

- `app/page.tsx` — 기존 localStorage 패턴 (`useEnabledClients`), dynamic import 패턴, Tailwind 스타일 패턴 직접 확인 [VERIFIED: codebase]
- `package.json` — React 19.2.4, Next.js 16.2.4, Tailwind v4, Vitest 4.1.5 버전 확인 [VERIFIED: codebase]
- `app/components/SendEmailModal.tsx` — 모달 패턴, z-50 사용, fixed inset-0 오버레이 패턴 확인 [VERIFIED: codebase]
- `.planning/phases/19-onboarding-flow/19-CONTEXT.md` — 모든 locked decisions D-01~D-04 확인 [VERIFIED: context file]

### Secondary (MEDIUM confidence)

- npm registry: intro.js@8.3.2, driver.js@1.4.0 최신 버전 확인 [VERIFIED: npm registry]

### Tertiary (LOW confidence)

- CSS `box-shadow` 컷아웃 기법, `getBoundingClientRect` 기반 포지셔닝: 표준 Web API 패턴 [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package.json으로 버전 전부 확인
- Architecture: HIGH — 기존 코드베이스 패턴과 100% 일치, localStorage 패턴 직접 확인
- Pitfalls: MEDIUM — SSR/dynamic import 함정은 검증됨, box-shadow 기법은 assumed

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (안정적 스택)
