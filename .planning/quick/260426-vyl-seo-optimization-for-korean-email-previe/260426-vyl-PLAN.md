---
phase: quick
plan: 260426-vyl
type: execute
wave: 1
depends_on: []
files_modified:
  - app/layout.tsx
  - app/robots.ts
  - app/sitemap.ts
autonomous: true
requirements: [SEO-01]

must_haves:
  truths:
    - "Open Graph 태그가 SNS 공유 시 올바른 제목/설명/이미지로 표시된다"
    - "Twitter Card 태그가 트위터 공유 시 올바르게 표시된다"
    - "검색엔진 크롤러가 robots.txt를 통해 접근 허용 여부를 확인할 수 있다"
    - "sitemap.xml이 배포 URL 기준으로 올바르게 생성된다"
    - "lang=ko HTML 속성이 이미 설정되어 있다 (변경 불필요)"
  artifacts:
    - path: "app/layout.tsx"
      provides: "Metadata with og/twitter tags"
    - path: "app/robots.ts"
      provides: "robots.txt route"
    - path: "app/sitemap.ts"
      provides: "sitemap.xml route"
  key_links:
    - from: "app/robots.ts"
      to: "https://sticky-kappa.vercel.app/sitemap.xml"
      via: "sitemap URL reference in robots"
    - from: "app/sitemap.ts"
      to: "https://sticky-kappa.vercel.app/"
      via: "deployed base URL"
---

<objective>
Next.js Metadata API를 사용하여 한국어 이메일 프리뷰 도구(https://sticky-kappa.vercel.app/)에 맞는 완전한 SEO 설정을 적용한다.

Purpose: 검색엔진 노출 및 SNS 공유 시 올바른 미리보기 표시
Output: og/twitter 메타태그 포함 layout.tsx, robots.ts, sitemap.ts
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@app/layout.tsx

<interfaces>
<!-- Next.js App Router metadata API (relevant patterns) -->
```typescript
// app/layout.tsx — metadata export
export const metadata: Metadata = {
  title: string | { default; template; absolute },
  description: string,
  metadataBase: URL,
  openGraph: { title, description, url, siteName, images, locale, type },
  twitter: { card, title, description, images },
  robots: { index, follow, ... },
  alternates: { canonical },
}

// app/robots.ts — MetadataRoute.Robots
import type { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots { ... }

// app/sitemap.ts — MetadataRoute.Sitemap
import type { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap { ... }
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: layout.tsx 메타데이터 확장 (og/twitter/canonical)</name>
  <files>app/layout.tsx</files>
  <action>
기존 metadata 객체를 아래 내용으로 교체한다. 기존 title/description은 유지하고 필드를 추가한다.

배포 URL: https://sticky-kappa.vercel.app/

추가할 필드:
- `metadataBase`: new URL('https://sticky-kappa.vercel.app')
- `openGraph`:
  - title: "Sticky - 한국어 이메일 클라이언트 프리뷰"
  - description: "HTML 이메일을 입력하면 네이버, Gmail, 다음/카카오 메일에서 어떻게 보이는지 실시간으로 시뮬레이션합니다."
  - url: 'https://sticky-kappa.vercel.app'
  - siteName: 'Sticky'
  - locale: 'ko_KR'
  - type: 'website'
- `twitter`:
  - card: 'summary'
  - title: "Sticky - 한국어 이메일 클라이언트 프리뷰"
  - description: og.description과 동일
- `alternates`: { canonical: 'https://sticky-kappa.vercel.app' }
- `robots`: { index: true, follow: true }

og:image는 별도 이미지 에셋이 없으므로 생략한다. 기존 AdSense script 태그는 그대로 유지한다.
  </action>
  <verify>
    <automated>cd /Users/sy/XcodeProject/sticky && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>layout.tsx가 타입 에러 없이 컴파일되고 og/twitter/canonical 메타데이터 필드가 모두 포함된다</done>
</task>

<task type="auto">
  <name>Task 2: robots.ts 및 sitemap.ts 생성</name>
  <files>app/robots.ts, app/sitemap.ts</files>
  <action>
**app/robots.ts** 신규 생성:
```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://sticky-kappa.vercel.app/sitemap.xml',
  }
}
```

**app/sitemap.ts** 신규 생성:
```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://sticky-kappa.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
```

현재 앱은 단일 페이지(/)이므로 sitemap 항목 하나로 충분하다.
  </action>
  <verify>
    <automated>cd /Users/sy/XcodeProject/sticky && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>robots.ts, sitemap.ts 두 파일이 생성되고 타입 에러 없이 컴파일된다. 빌드 후 /robots.txt, /sitemap.xml 경로로 접근 가능한 상태</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| 정적 메타데이터 | 외부 입력 없음 — 하드코딩된 문자열만 사용 |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-seo-01 | Information Disclosure | og:url/canonical | accept | 퍼블릭 배포 URL이므로 노출 의도적 |
| T-seo-02 | Tampering | robots.txt | accept | 정적 라우트, 공격 표면 없음 |
</threat_model>

<verification>
1. `npx tsc --noEmit` — 타입 에러 없음
2. `pnpm build` 성공 시 빌드 출력에서 `/robots` `/sitemap` 라우트 확인
3. 로컬 `pnpm dev` 후 http://localhost:3000/robots.txt, http://localhost:3000/sitemap.xml 접근 확인
</verification>

<success_criteria>
- layout.tsx에 metadataBase, openGraph, twitter, alternates, robots 필드 추가됨
- app/robots.ts 생성 — userAgent: '*', allow: '/', sitemap URL 포함
- app/sitemap.ts 생성 — 배포 URL 단일 항목
- TypeScript 컴파일 에러 없음
</success_criteria>

<output>
After completion, create `.planning/quick/260426-vyl-seo-optimization-for-korean-email-previe/260426-vyl-SUMMARY.md`
</output>
