import type { ClientRuleset } from './types'

export const daumRuleset: ClientRuleset = {
  stripHeadStyles: true,
  allowedInlineProperties: null,
  strippedProperties: [],
  strippedElements: ['script', 'iframe', 'object', 'embed'],
  confidence: 'estimated',
  provenance: {
    source: 'Daum/Kakao Mail community reports',
    method: 'community-data',
    lastVerified: '2026-04-23',
    notes: 'No official documentation available; caniemail.com has zero Korean client data; conservative baseline from community inspection',
  },
  darkModeStrategy: 'none',
}
