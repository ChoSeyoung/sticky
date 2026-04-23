import { describe, it, expect } from 'vitest'
import { naverRuleset } from '@/lib/rulesets/naver'
import { gmailRuleset } from '@/lib/rulesets/gmail'
import { daumRuleset } from '@/lib/rulesets/daum'
import type { ClientRuleset, Provenance } from '@/lib/rulesets/types'

const REQUIRED_FIELDS: (keyof ClientRuleset)[] = [
  'stripHeadStyles',
  'allowedInlineProperties',
  'strippedProperties',
  'strippedElements',
  'confidence',
  'provenance',
]

const REQUIRED_PROVENANCE_FIELDS: (keyof Provenance)[] = [
  'source',
  'method',
  'lastVerified',
]

const rulesets: { name: string; ruleset: ClientRuleset }[] = [
  { name: 'naver', ruleset: naverRuleset },
  { name: 'gmail', ruleset: gmailRuleset },
  { name: 'daum', ruleset: daumRuleset },
]

describe('ClientRuleset schema', () => {
  rulesets.forEach(({ name, ruleset }) => {
    describe(name, () => {
      REQUIRED_FIELDS.forEach((field) => {
        it(`has required field: ${field}`, () => {
          expect(ruleset).toHaveProperty(field)
        })
      })

      REQUIRED_PROVENANCE_FIELDS.forEach((field) => {
        it(`provenance has required field: ${field}`, () => {
          expect(ruleset.provenance).toHaveProperty(field)
        })
      })
    })
  })

  it('daum ruleset has confidence: estimated', () => {
    expect(daumRuleset.confidence).toBe('estimated')
  })

  it('daum ruleset provenance has notes field', () => {
    expect(daumRuleset.provenance.notes).toBeDefined()
  })
})
