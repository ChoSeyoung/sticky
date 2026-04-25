import type { ClientRuleset } from './types'

export const naverRuleset: ClientRuleset = {
  stripHeadStyles: true,
  allowedInlineProperties: null,
  strippedProperties: ['margin', 'padding', 'font-family'],
  strippedElements: [],
  confidence: 'high',
  provenance: {
    source: 'Naver Mail webmail inspection + community reports',
    method: 'webmail-inspection',
    lastVerified: '2026-04-23',
    notes: 'Naver strips <style> blocks and blocks certain inline properties; strippedProperties list is approximate — Phase 2 simulation will refine',
  },
  darkModeStrategy: 'none',
}
