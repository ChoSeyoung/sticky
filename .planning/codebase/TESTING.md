# Testing Patterns

**Analysis Date:** 2026-04-23

## Test Framework

**Runner:**
- Not detected - No testing framework configured
- package.json contains no test dependencies (Jest, Vitest, etc.)

**Assertion Library:**
- Not applicable - no test framework installed

**Run Commands:**
```bash
npm run lint              # Run ESLint static analysis only
npm run dev              # Development server (no test mode)
```

## Test File Organization

**Location:**
- No test files present in codebase
- `.gitignore` includes `/coverage` directory, suggesting intention to add test coverage

**Naming:**
- Pattern not established - would typically use `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx`

**Structure:**
- No test directory structure exists (no `tests/`, `__tests__/`, or `test/` directory)

## Test Structure

**Suite Organization:**
- Not implemented

**Patterns:**
- No test setup, teardown, or assertion patterns defined
- No test utilities or helpers present

## Mocking

**Framework:**
- Not configured - typical candidates would be Jest mock functions, Vitest mocking, or MSW (Mock Service Worker)

**Patterns:**
- Not established

**What to Mock:**
- Guidance for future implementation:
  - Mock `next/image` component in unit tests
  - Mock `next/font/google` font imports if testing layout logic
  - Mock `next/navigation` for client-side routing features

**What NOT to Mock:**
- Guidance for future implementation:
  - Keep React rendering layer unmocked for integration/E2E tests
  - Use real Tailwind CSS output for visual regression testing

## Fixtures and Factories

**Test Data:**
- Not implemented

**Location:**
- Pattern not established

## Coverage

**Requirements:** None enforced

**View Coverage:**
- Not configured - would typically use `jest --coverage` or `vitest run --coverage`

## Test Types

**Unit Tests:**
- Not implemented
- Candidates for future testing:
  - Component rendering: `Home` page component should render without errors
  - Component props: `RootLayout` should properly pass children through

**Integration Tests:**
- Not implemented
- Candidates for future testing:
  - Font loading with `Geist` and `Geist_Mono` from `next/font/google`
  - CSS variable application via Tailwind CSS

**E2E Tests:**
- Not implemented
- Would require: Playwright, Cypress, or similar E2E framework
- Candidates for future testing:
  - Page navigation and link rendering
  - Dark mode switching (media query prefers-color-scheme)
  - Responsive design across breakpoints

## Recommended Testing Setup

**For Next.js 16 (current version):**

**Unit/Integration Testing Option 1 - Vitest + React Testing Library:**
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
```

**Unit/Integration Testing Option 2 - Jest + React Testing Library:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest ts-node
```

**E2E Testing:**
```bash
npm install --save-dev @playwright/test
```

## Common Patterns

**Async Testing:**
- Not yet established
- Future pattern for testing async server components:
```typescript
// Example (not in codebase)
test('async component renders', async () => {
  const { getByText } = render(await AsyncComponent());
  expect(getByText('content')).toBeInTheDocument();
});
```

**Error Testing:**
- Not yet established
- No error boundaries or error UI currently tested
- Future pattern for error component testing would use Next.js `error.tsx` files

## Missing Critical Features

**Test Infrastructure Gaps:**
- Files: All source files in `app/` directory lack test coverage
- Risk: Component changes could break layout structure or styling without detection
- Priority: High - Before adding new features, establish testing foundation
- Suggestion: Start with snapshot tests for components, then add behavioral tests

---

*Testing analysis: 2026-04-23*
