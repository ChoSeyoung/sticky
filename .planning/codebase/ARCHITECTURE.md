# Architecture

**Analysis Date:** 2026-04-23

## Pattern Overview

**Overall:** Server-Component First Next.js App Router Pattern

**Key Characteristics:**
- Server-first architecture using Next.js 16.2.4 App Router
- React 19.2.4 with automatic Server Component rendering
- Tailwind CSS v4 for utility-first styling
- TypeScript 5.x with strict type checking enforced
- Zero backend API routes or server logic currently implemented
- Minimal initial scaffold from create-next-app

## Layers

**Presentation Layer:**
- Purpose: Render user interface with React components
- Location: `app/`
- Contains: Server and Client components, page layouts, CSS styling
- Depends on: Next.js framework, React, Tailwind CSS
- Used by: Browser requesting HTTP pages

**Layout Layer:**
- Purpose: Establish HTML document structure and global context
- Location: `app/layout.tsx`
- Contains: Root layout component, font imports, metadata, global styles
- Depends on: Next.js Metadata API, Google Fonts via next/font
- Used by: All pages as parent component

**Page Layer:**
- Purpose: Define route pages and specific route content
- Location: `app/page.tsx` (maps to `/` route)
- Contains: Home page component with Next.js Image optimization, links
- Depends on: next/image for Image component
- Used by: Route handler for `/` path

**Styling Layer:**
- Purpose: Global styles and Tailwind CSS configuration
- Location: `app/globals.css`, `postcss.config.mjs`
- Contains: CSS custom properties, color variables, Tailwind imports, dark mode
- Depends on: Tailwind CSS v4, PostCSS
- Used by: All components via className attributes

## Data Flow

**Page Request Flow:**

1. HTTP request arrives for `/` route
2. Next.js App Router matches to `app/page.tsx`
3. `RootLayout` wraps the page component (`layout.tsx`)
4. Layout imports fonts (Geist Sans, Geist Mono) from next/font/google
5. Layout applies metadata (title, description) for SEO
6. Page component (`Home`) renders with React Server Components
7. Tailwind classes resolve during build time
8. Static HTML + CSS sent to browser
9. No hydration needed for static pages

**Component Composition:**

```
app/layout.tsx (RootLayout)
  └── app/page.tsx (Home)
      ├── Image from next/image
      ├── Links (external navigation)
      └── Tailwind-styled divs
```

**State Management:**
- No global state management (Redux, Context, Zustand) currently used
- All components are Server Components by default
- No client-side interactivity beyond browser defaults

## Key Abstractions

**RootLayout:**
- Purpose: Wrap all pages with consistent HTML structure, fonts, metadata
- Examples: `app/layout.tsx`
- Pattern: Server Component exporting default RootLayout function with typed children prop

**Home Page Component:**
- Purpose: Render homepage content with marketing/informational UI
- Examples: `app/page.tsx`
- Pattern: Server Component exporting default Home function with no props

**Image Optimization:**
- Purpose: Lazy load and optimize images for performance
- Examples: next/image Image component in `app/page.tsx`
- Pattern: Next.js Image component with width/height for Static Analysis

## Entry Points

**HTTP Root (/):**
- Location: `app/page.tsx`
- Triggers: Browser navigation to `/` or domain root
- Responsibilities: Render homepage with marketing UI, navigation links

**Application Root:**
- Location: `app/layout.tsx`
- Triggers: All page loads (parent to all routes)
- Responsibilities: Load fonts, set metadata, provide HTML structure, apply global styles

**Development Server:**
- Location: Entry point controlled by Next.js (not visible in source)
- Triggers: `npm run dev` or `pnpm dev`
- Responsibilities: Start dev server on port 3000 with hot reload

**Production Server:**
- Location: Entry point controlled by Next.js
- Triggers: `npm run start` (after `npm run build`)
- Responsibilities: Start optimized production server

## Error Handling

**Strategy:** Default Next.js error handling

**Patterns:**
- No custom error boundaries currently implemented
- Next.js handles 404s automatically if no matching route found
- TypeScript strict mode catches compilation errors at build time
- ESLint with Next.js config enforces Web Vitals best practices

## Cross-Cutting Concerns

**Logging:** Not implemented - use browser console or server logs

**Validation:** TypeScript provides compile-time type safety; no runtime validation layer

**Authentication:** Not implemented - no auth provider configured

**Styling:** Tailwind CSS v4 with @tailwindcss/postcss plugin; custom CSS variables for theming

---

*Architecture analysis: 2026-04-23*
