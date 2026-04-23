---
phase: 2
slug: naver-simulation-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.5 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SIM-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | SIM-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | SIM-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | SIM-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | SIM-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/engine/applyClientRules.test.ts` — stubs for SIM-01 behaviors
- [ ] `lib/engine/applyClientRules.ts` — engine implementation file

*Existing infrastructure covers test framework and configuration.*

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
