---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.5 |
| **Config file** | `vitest.config.mts` (Wave 0 installs) |
| **Quick run command** | `pnpm vitest run __tests__/rulesets/schema.test.ts` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm tsc --noEmit`
- **After every plan wave:** Run `pnpm vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | SC-1 | — | N/A | compile | `pnpm tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | SC-2 | — | N/A | unit | `pnpm vitest run __tests__/rulesets/schema.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | SC-3 | — | N/A | unit | `pnpm vitest run __tests__/rulesets/schema.test.ts` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | SC-4 | — | N/A | unit | `pnpm vitest run __tests__/rulesets/schema.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.mts` — Vitest configuration with vite-tsconfig-paths plugin
- [ ] `__tests__/rulesets/schema.test.ts` — schema completeness assertions for all 3 clients
- [ ] `pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths` — install test framework

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
