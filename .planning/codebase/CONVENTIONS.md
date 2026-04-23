# Coding Conventions

**Analysis Date:** 2026-04-23

## Naming Patterns

**Files:**
- TypeScript/TSX files use PascalCase for components: `layout.tsx`, `page.tsx`
- CSS files use lowercase with hyphens: `globals.css`
- Configuration files use lowercase with dots: `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`

**Functions:**
- Use camelCase for function names: `RootLayout`, `Home` (for React components)
- Use PascalCase for React component names (default exports): `export default function Home()`
- Font variables use camelCase: `geistSans`, `geistMono`

**Variables:**
- Use camelCase for const declarations: `nextConfig`, `metadata`
- Use camelCase for props and destructured parameters: `children`, `variable`, `subsets`
- CSS custom properties use kebab-case: `--font-geist-sans`, `--font-geist-mono`, `--background`, `--foreground`, `--color-background`

**Types:**
- Use `type` keyword for type definitions: `type Metadata`, `type NextConfig`
- Type annotations explicitly labeled with `type`: `import type { Metadata } from "next"`
- Props passed as inline type objects with `Readonly` wrapper: `Readonly<{ children: React.ReactNode }>`

## Code Style

**Formatting:**
- ESLint 9 with Next.js core-web-vitals and TypeScript config
- Files auto-ignored: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- ESLint enabled in flat config format (`eslint.config.mjs`)
- No Prettier configuration explicitly set (relies on ESLint defaults)

**Linting:**
- Config: `eslint.config.mjs` using flat ESLint config
- Rules: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Target: ES2017 with modern JavaScript features
- Strict TypeScript: enabled (`"strict": true` in tsconfig.json)

## Import Organization

**Order:**
1. Next.js type imports: `import type { Metadata } from "next"`
2. Next.js component imports: `import Image from "next/image"`
3. Framework imports: `import { Geist, Geist_Mono } from "next/font/google"`
4. Local styles: `import "./globals.css"`

**Path Aliases:**
- Configured in tsconfig.json: `"@/*": ["./*"]`
- Allows importing from project root using `@/` prefix (not used in current files)

## Error Handling

**Patterns:**
- No explicit error handling patterns in current codebase (minimal implementation)
- React components rely on Next.js error boundaries and server-side error handling
- TypeScript strict mode prevents null/undefined errors at compile time

## Logging

**Framework:** Not implemented - only console available (not used in current files)

**Patterns:**
- No logging implemented in user code
- Relies on Next.js development server output and browser console

## Comments

**When to Comment:**
- Minimal commenting in current codebase
- Self-documenting code preferred (e.g., `const metadata: Metadata = {...}` clearly indicates purpose)

**JSDoc/TSDoc:**
- Metadata export uses TypeScript type annotation instead of JSDoc: `export const metadata: Metadata = {...}`
- No JSDoc comments present in current implementation

## Function Design

**Size:** Functions kept minimal and focused
- `RootLayout`: Returns single JSX element with font setup (20 lines)
- `Home`: Single responsibility rendering landing page (62 lines)

**Parameters:** 
- Destructure props inline with type annotation: `{ children }: Readonly<{ children: React.ReactNode }>`
- Font configuration passed as objects to Next.js font functions

**Return Values:**
- React Server Components return JSX.Element implicitly
- TypeScript infers return type from component structure

## Module Design

**Exports:**
- `export default function` for page/layout components (Next.js convention)
- `export const` for metadata configuration
- Clean barrel pattern not needed (minimal modules)

**Barrel Files:**
- Not used in current structure (too few files)
- `app/` directory structure follows Next.js App Router convention

## Component Organization

**Location Patterns:**
- Layout components: `app/layout.tsx` (root layout)
- Page components: `app/page.tsx` (home page)
- Styles: `app/globals.css` (global stylesheet)
- Configuration: project root (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`)

**Tailwind CSS:**
- Used via class utility functions: `className="flex flex-col flex-1 items-center justify-center"`
- Responsive modifiers: `sm:items-start`, `md:w-[158px]`, `dark:bg-black`
- Custom theme colors via CSS variables: `--background`, `--foreground`

---

*Convention analysis: 2026-04-23*
