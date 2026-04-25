# Phase 20: HTML 소스 복사 - Research

**Researched:** 2026-04-25
**Domain:** Clipboard API / React UI — single button addition
**Confidence:** HIGH

## Summary

Phase 20은 헤더에 "소스 복사" 버튼 하나를 추가하는 매우 작은 변경이다. `app/page.tsx`의 `html` state에 이미 직접 접근할 수 있고, 기존 버튼 패턴이 명확히 정의되어 있다. 클립보드 API는 브라우저 표준이며 모든 현대 브라우저에서 지원된다. fallback(`execCommand`)은 오래된 브라우저를 위한 한 줄 패턴이다.

구현 범위: `app/page.tsx` 단일 파일 — `useState` 1개, `useCallback` 1개, `<button>` 1개 추가.

**Primary recommendation:** `navigator.clipboard.writeText(html)` 우선, 실패 시 textarea + `execCommand('copy')` fallback. 복사 완료 상태를 `copyLabel` state로 관리하여 버튼 텍스트를 2초간 변경.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 헤더의 기존 버튼 그룹에 "소스 복사" 버튼 추가. "Inline CSS" 버튼 앞 또는 뒤에 배치.
- **D-02:** 버튼 스타일: `bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-3 py-1 text-xs rounded`
- **D-03:** 복사 완료 시 버튼 텍스트 "소스 복사" → "복사됨!" 2초 후 복원. 별도 토스트 없음.
- **D-04:** `navigator.clipboard.writeText()` 우선, 미지원 시 `document.execCommand('copy')` fallback.

### Claude's Discretion
- 복사 성공/실패 시 버튼 색상 변화 (성공: 녹색 계열 등)
- 정확한 버튼 배치 순서 (기존 버튼 사이 위치)
- fallback 구현 세부 사항 (textarea 생성 방식 등)

### Deferred Ideas (OUT OF SCOPE)
- None
</user_constraints>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 클립보드 복사 | Browser / Client | — | Clipboard API는 브라우저 API. 서버 불필요 |
| 버튼 UI 상태 | Browser / Client | — | React useState로 로컬 UI 상태 관리 |

## Standard Stack

### Core (기존 스택 그대로)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 기존 프로젝트 버전 | useState, useCallback | 프로젝트 기존 스택 |
| Tailwind CSS | 기존 프로젝트 버전 | 버튼 스타일 | 프로젝트 기존 스택 |

신규 패키지 설치 없음. 브라우저 내장 Clipboard API 사용.

## Architecture Patterns

### Recommended Change Structure

변경 대상 파일: `app/page.tsx` 단일 파일

```
Home() 함수 내:
  + const [copyLabel, setCopyLabel] = useState<string>('소스 복사')
  + const handleCopy = useCallback(...)
  
JSX header 영역:
  + <button onClick={handleCopy}>...</button>  {/* Inline CSS 버튼 앞 배치 */}
```

### Pattern 1: Clipboard API with fallback

[VERIFIED: MDN Web Docs — Clipboard API는 modern browser 표준 (HTTPS 또는 localhost 필요)]

```typescript
// Source: MDN Clipboard API pattern
const handleCopy = useCallback(async () => {
  try {
    await navigator.clipboard.writeText(html)
    setCopyLabel('복사됨!')
  } catch {
    // fallback for browsers without Clipboard API support
    const textarea = document.createElement('textarea')
    textarea.value = html
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    setCopyLabel('복사됨!')
  } finally {
    setTimeout(() => setCopyLabel('소스 복사'), 2000)
  }
}, [html])
```

### Pattern 2: 버튼 색상 피드백 (Claude's Discretion)

복사 완료 시 zinc → green으로 색상 변경하여 시각적 피드백 강화:

```typescript
// 성공 상태 색상 (discretion: 녹색 계열)
const buttonClass = copyLabel === '복사됨!'
  ? 'bg-green-700 text-white hover:bg-green-600 px-3 py-1 text-xs rounded'
  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 px-3 py-1 text-xs rounded'
```

### Pattern 3: 버튼 배치 — 기존 헤더 버튼 순서

현재 헤더 버튼 순서 (page.tsx line 367–392 확인):
1. `SizeCounter` (표시 전용)
2. `Undo Inline` (조건부 표시)
3. `Inline CSS` (blue-600)
4. `메일 발송` (green-600)
5. `파일 열기` (zinc-700)

D-01에 따라 "Inline CSS" 앞/뒤 배치. 자연스러운 위치는 `파일 열기` 뒤 (하단 위치, 복사는 최종 작업). 또는 `Inline CSS` 앞 (소스 복사 → Inline CSS 작업 흐름). Planner가 결정.

### Anti-Patterns to Avoid
- **`execCommand` 단독 사용:** Deprecated. 항상 Clipboard API 우선 시도 후 fallback으로만 사용.
- **`setTimeout` 미정리:** 컴포넌트 언마운트 시 leak 방지 위해 cleanup 고려. 단, 이 앱은 SPA이므로 Home 컴포넌트는 언마운트되지 않아 실질적 문제 없음.
- **별도 토스트 컴포넌트 추가:** D-03에서 명시적으로 금지. 버튼 텍스트 변경만.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 클립보드 복사 | 커스텀 복사 로직 | `navigator.clipboard.writeText()` | 브라우저 표준 API |
| fallback | 복잡한 polyfill | textarea + `execCommand` 단순 패턴 | 충분함 |

## Common Pitfalls

### Pitfall 1: Clipboard API HTTPS 요구
**What goes wrong:** `navigator.clipboard`는 HTTPS 또는 localhost에서만 동작. HTTP 환경에서는 `undefined`.
**Why it happens:** 보안 정책 (Secure Context).
**How to avoid:** fallback 분기가 이를 자동 처리. 개발 환경(localhost)에서는 정상 동작.
**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'writeText')`

### Pitfall 2: execCommand 실행 조건
**What goes wrong:** `document.execCommand('copy')`는 textarea가 document에 attach된 후 `select()`가 호출되어야 동작.
**How to avoid:** `document.body.appendChild` → `select()` → `execCommand` → `removeChild` 순서 준수.

### Pitfall 3: setTimeout과 state 업데이트
**What goes wrong:** `setCopyLabel` 콜백 내에서 2초 타이머 후 상태 복원. React StrictMode에서 이중 실행 가능.
**How to avoid:** 실용적 해결: `useRef`로 타이머 ID를 관리하고 새 복사 시 이전 타이머 clear. 단순 구현에서는 허용 범위.

## Code Examples

### 완성 패턴 (통합)

```typescript
// app/page.tsx에 추가할 내용

// state 추가 (Home 함수 상단)
const [copyLabel, setCopyLabel] = useState<string>('소스 복사')
const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

// handler 추가
const handleCopyHtml = useCallback(async () => {
  if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
  try {
    await navigator.clipboard.writeText(html)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = html
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  setCopyLabel('복사됨!')
  copyTimerRef.current = setTimeout(() => setCopyLabel('소스 복사'), 2000)
}, [html])

// JSX 버튼 (헤더 내 배치)
<button
  onClick={handleCopyHtml}
  className={`px-3 py-1 text-xs rounded ${
    copyLabel === '복사됨!'
      ? 'bg-green-700 text-white hover:bg-green-600'
      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
  }`}
>
  {copyLabel}
</button>
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Next.js + 프로젝트 기존 설정 |
| Config file | 없음 (기존 test 인프라 없음) |
| Quick run command | 수동 확인 (브라우저에서 버튼 클릭) |
| Full suite command | 수동 확인 |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-04 | 버튼 클릭 시 clipboard에 html 복사 | manual-only | 브라우저 수동 확인 | N/A |
| UX-04 | 복사 후 버튼 텍스트 "복사됨!" 2초 표시 | manual-only | 브라우저 수동 확인 | N/A |
| UX-04 | 2초 후 "소스 복사"로 복원 | manual-only | 브라우저 수동 확인 | N/A |

**Manual-only 정당성:** Clipboard API는 브라우저 보안 정책으로 Jest/jsdom에서 테스트 불가. E2E(Playwright)로 가능하나 이 규모 변경에 과도함.

### Wave 0 Gaps
None — 기존 test 인프라 없음, 수동 검증으로 충분.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `copyTimerRef` cleanup으로 중복 타이머 방지 패턴이 이 앱에서 필요 | Code Examples | 낮음 — 없어도 동작하지만 UX 개선 |
| A2 | 버튼을 `파일 열기` 뒤보다 `Inline CSS` 앞에 배치하는 것이 더 자연스러운 워크플로우 | Architecture | 낮음 — Planner가 최종 결정 |

## Sources

### Primary (HIGH confidence)
- `app/page.tsx` lines 337–392 — [VERIFIED: 직접 코드 확인] 현재 헤더 구조 및 버튼 패턴
- `app/page.tsx` lines 236–249 — [VERIFIED: 직접 코드 확인] 기존 state/ref 패턴
- MDN Clipboard API — [ASSUMED from training, standard browser API] `navigator.clipboard.writeText`
- MDN execCommand — [ASSUMED from training] Deprecated but functional fallback

### Tertiary (LOW confidence)
- execCommand fallback 패턴 (textarea 방식) — [ASSUMED] 널리 사용되는 패턴이나 이 세션에서 문서 확인 안 함

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 신규 패키지 없음, 기존 코드 직접 확인
- Architecture: HIGH — 단일 파일 변경, 기존 패턴 명확
- Pitfalls: MEDIUM — Clipboard API 동작은 ASSUMED, 기본 동작은 표준

**Research date:** 2026-04-25
**Valid until:** 안정적 (브라우저 API — 6개월 이상)
