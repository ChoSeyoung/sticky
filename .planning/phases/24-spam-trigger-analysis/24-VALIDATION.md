---
phase: 24
slug: spam-trigger-analysis
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-26
---

# Phase 24 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run lib/engine/analyzeSpamTriggers.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run lib/engine/analyzeSpamTriggers.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 24-01-01 | 01 | 1 | SC-1 (키워드 탐지) | — | N/A | unit | `npx vitest run lib/engine/analyzeSpamTriggers.test.ts` | ❌ W0 | ⬜ pending |
| 24-01-02 | 01 | 1 | SC-2 (이미지/텍스트 비율) | — | N/A | unit | `npx vitest run lib/engine/analyzeSpamTriggers.test.ts` | ❌ W0 | ⬜ pending |
| 24-01-03 | 01 | 1 | SC-3 (위험도 점수) | — | N/A | unit | `npx vitest run lib/engine/analyzeSpamTriggers.test.ts` | ❌ W0 | ⬜ pending |
| 24-02-01 | 02 | 2 | SC-4 (개선 안내) | — | N/A | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `lib/engine/analyzeSpamTriggers.test.ts` — stubs for spam trigger analysis tests
- [ ] Existing vitest infrastructure covers framework needs

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| WarningPanel 📧 섹션 표시 | SC-3, SC-4 | UI rendering requires browser | Dev server에서 스팸 키워드 포함 HTML 입력 후 패널 확인 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
