# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 01-foundation
**Areas discussed:** Ruleset granularity, Provenance model

---

## Ruleset Granularity

### Question 1: How expansive should the ClientRuleset type be?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal (6 axes) (Recommended) | Stick to the 6 axes from success criteria. Add more fields later when Phases 2-4 actually need them. | ✓ |
| Moderate (10-12 axes) | Add attribute stripping, link rewriting, image blocking, max size limit, and conditional block-kill behavior. | |
| Extensible with extras map | Keep 6 core axes as required, add optional Record<string, unknown> extras field. | |

**User's choice:** Minimal (6 axes)
**Notes:** None — straightforward preference for lean type, extend later.

### Question 2: Should strippedProperties and allowedInlineProperties use an allowlist or blocklist model?

| Option | Description | Selected |
|--------|-------------|----------|
| Per-client choice (Recommended) | Each client picks the model that fits: Naver blocklist, Gmail conditional flag. Type supports both via optional fields. | ✓ |
| Always blocklist | Every client defines which properties to strip. Simpler but awkward for Gmail. | |
| Always allowlist | Every client defines which properties are allowed. Safer but verbose. | |

**User's choice:** Per-client choice
**Notes:** None.

---

## Provenance Model

### Question 1: How structured should the provenance field be?

| Option | Description | Selected |
|--------|-------------|----------|
| Typed object (Recommended) | Structured type with source, method enum, lastVerified date, and optional notes. | ✓ |
| Simple string | Human-readable note. Minimal effort but not machine-readable. | |
| Structured with evidence links | Like typed object plus array of evidence URLs. Most rigorous but heavier. | |

**User's choice:** Typed object
**Notes:** None.

### Question 2: Should confidence be a fixed enum or a numeric score?

| Option | Description | Selected |
|--------|-------------|----------|
| String enum (Recommended) | 'high' | 'medium' | 'estimated' — maps directly to Phase 10 UI badges. | ✓ |
| Numeric 0-100 | Percentage confidence score. More granular but harder to interpret. | |
| Tiered with sub-score | Enum for display plus optional numeric detail score. Best of both but adds complexity. | |

**User's choice:** String enum
**Notes:** None.

---

## Claude's Discretion

- File organization (where types and rulesets live)
- Testing framework choice and structure
- Exact field/file naming
- Export patterns

## Deferred Ideas

None — discussion stayed within phase scope.
