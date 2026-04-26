---
phase: 24-spam-trigger-analysis
plan: "01"
subsystem: engine
tags: [spam-analysis, tdd, pure-function, cheerio, korean]
dependency_graph:
  requires: []
  provides: [analyzeSpamTriggers, SpamWarning, SpamSummary, SPAM_KEYWORDS_EN, SPAM_KEYWORDS_KO]
  affects: []
tech_stack:
  added: []
  patterns: [pure-function-engine, cheerio-html-parsing, tdd-red-green-refactor]
key_files:
  created:
    - lib/engine/spamKeywords.ts
    - lib/engine/analyzeSpamTriggers.ts
    - lib/engine/analyzeSpamTriggers.test.ts
  modified: []
decisions:
  - "Used 5+ letter word threshold for excessive-caps detection to exclude common 4-letter acronyms (HTML, URLs) from spam flagging — plan spec had ambiguity between '4+ letters' detection rule and '2-3 letter excluded' negative example"
metrics:
  duration: "3 min 27 sec"
  completed_date: "2026-04-26"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 24 Plan 01: analyzeSpamTriggers Spam Detection Engine Summary

**One-liner:** Pure TDD-built spam trigger engine detecting caps abuse, punctuation spam, Korean/English keywords, color emphasis, and image/text ratio in HTML email with Korean fix guidance.

## What Was Built

`analyzeSpamTriggers(html: string): SpamSummary` — a pure function following the `analyzeAccessibility.ts` pattern exactly. Given raw HTML email content, returns structured warnings with Korean fix guidance and a 3-level risk score (Low/Medium/High).

**Detection categories implemented:**
1. **Excessive caps** — 5+ letter English words with 70%+ uppercase ratio (e.g., AMAZING, WINNER)
2. **Repeated punctuation** — 3+ consecutive `!`, `?`, or `$` characters
3. **English spam keywords** — 31 keywords from `SPAM_KEYWORDS_EN`, case-insensitive text-node matching
4. **Korean spam keywords** — 23 keywords from `SPAM_KEYWORDS_KO`, substring matching in text nodes
5. **Color emphasis** — red foreground color + font-size >= 16px in inline styles
6. **Image/text ratio** — warning at 60%+, error at 80%+ (using IMAGE_WEIGHT=200 weighted formula)
7. **Image-only** — error when images present but zero text content

**Risk level:** Low (0-1 warnings, 0 errors) / Medium (2-4 warnings) / High (1+ errors OR 5+ warnings)

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | cb668a7 | test(24-01): add failing tests for analyzeSpamTriggers |
| GREEN (feat) | 31a2255 | feat(24-01): implement analyzeSpamTriggers engine |
| REFACTOR | N/A | Not needed — code clean after GREEN |

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 — RED phase | cb668a7 | spamKeywords.ts + failing test file (44 tests) |
| 2 — GREEN phase | 31a2255 | analyzeSpamTriggers.ts implementation |

## Test Results

- **44 tests** across 8 describe blocks — all passing
- **192 total project tests** — all passing, zero regressions
- Test coverage: all 7 detection types + riskLevel combinations + SpamSummary structure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Adjusted excessive-caps word length threshold from 4 to 5 letters**
- **Found during:** Task 2 GREEN phase
- **Issue:** Plan spec said "4+ letter words" for detection, but the behavior's negative example explicitly showed `<p>HTML is OK</p>` should produce no warning. "HTML" is exactly 4 letters and 100% uppercase — a direct contradiction. The plan comment said "2-3 letter uppercase words excluded" but then listed HTML (4 letters) as an excluded example.
- **Fix:** Changed regex from `/[a-zA-Z]{4,}/g` to `/[a-zA-Z]{5,}/g` to exclude 4-letter acronyms (HTML, URLs, CSS, etc.) that are common technical terms, not spam indicators. This matches the intent of the negative example.
- **Files modified:** lib/engine/analyzeSpamTriggers.ts
- **Commit:** 31a2255 (inline fix during implementation)

## Known Stubs

None.

## Threat Flags

None. The implementation follows the plan's threat model:
- T-24-01 (DoS): cheerio.load with default limits; regex uses bounded `{3,}` quantifiers
- T-24-02 (Info Disclosure): keyword lists are public industry-standard spam triggers
- T-24-03 (Tampering): pure function with no side effects

## Self-Check: PASSED

- `lib/engine/spamKeywords.ts` exists: confirmed
- `lib/engine/analyzeSpamTriggers.ts` exists: confirmed
- `lib/engine/analyzeSpamTriggers.test.ts` exists: confirmed
- Commit cb668a7 exists: confirmed (RED gate)
- Commit 31a2255 exists: confirmed (GREEN gate)
- All 44 tests pass: confirmed
- Full suite (192 tests) passes: confirmed
