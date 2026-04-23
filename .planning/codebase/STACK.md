# Technology Stack

**Analysis Date:** 2026-04-23

## Languages

**Primary:**
- TypeScript 5.9.3 - Full codebase implementation (`.ts`, `.tsx` files)

**Secondary:**
- JavaScript - Configuration files (`.mjs`)

## Runtime

**Environment:**
- Node.js - Backend runtime (version managed by Next.js 16.2.4)

**Package Manager:**
- pnpm - Package management
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- Next.js 16.2.4 - React framework with App Router, API routes, and SSR support
- React 19.2.4 - UI library and component framework
- React-DOM 19.2.4 - DOM rendering for React

**Styling:**
- Tailwind CSS 4.2.4 - Utility-first CSS framework
- @tailwindcss/postcss 4.2.4 - PostCSS plugin for Tailwind
- PostCSS - CSS processing pipeline (configured in `postcss.config.mjs`)

**Linting/Code Quality:**
- ESLint 9.39.4 - JavaScript linter
- eslint-config-next 16.2.4 - Next.js ESLint configuration with core web vitals and TypeScript support
- TypeScript - Type checking and compilation

## Key Dependencies

**Critical:**
- next 16.2.4 - Full framework (App Router, image optimization, font loading from `next/font`)
- react 19.2.4 - Component library (latest version with React Server Components compatibility)
- react-dom 19.2.4 - DOM integration for React 19

**Type Definitions:**
- @types/node 20.19.39 - Node.js type definitions
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React-DOM type definitions

## Configuration

**TypeScript:**
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx
- Path aliases: `@/*` maps to project root (configured in `tsconfig.json`)
- Strict mode enabled

**Build & Dev:**
- next dev - Development server with hot reload
- next build - Production build compilation
- next start - Production server
- eslint - Linting enforcement

**Font Loading:**
- Google Fonts integration via Next.js font optimization
- Geist font family (sans and mono variants) with CSS custom properties (`--font-geist-sans`, `--font-geist-mono`)

## Platform Requirements

**Development:**
- Node.js (version compatible with pnpm and Next.js 16.2.4)
- pnpm package manager
- TypeScript 5.9.3 or compatible

**Production:**
- Node.js runtime
- Environment: Next.js supports deployment on Vercel (recommended in README), or any Node.js-capable platform
- No specific database, cache, or external service requirements in core setup

## Environment Configuration

**Environment Files:**
- `.env*` patterns supported by Next.js (listed in `.gitignore`)
- No required environment variables identified in current implementation
- Environment files are NOT committed (ignored in `.gitignore`)

**Build Configuration:**
- `next.config.ts` (currently empty, customizable for middleware, rewrites, or other options)
- `tsconfig.json` for TypeScript compilation options
- `postcss.config.mjs` for CSS processing with Tailwind
- `eslint.config.mjs` for code quality rules

---

*Stack analysis: 2026-04-23*
