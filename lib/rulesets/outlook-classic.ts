import type { ClientRuleset } from './types'

export const outlookClassicRuleset: ClientRuleset = {
  stripHeadStyles: false,
  allowedInlineProperties: null,
  strippedProperties: [
    'background-image',
    'float',
    'position',
    'display',
    'opacity',
    'box-shadow',
    'border-radius',
    'text-shadow',
    'overflow',
  ],
  strippedElements: ['video', 'audio', 'canvas', 'svg'],
  confidence: 'estimated',
  provenance: {
    source: 'Microsoft documentation + community reports (campaignmonitor.com, caniemail.com)',
    method: 'community-data',
    lastVerified: '2026-04-24',
    notes: 'Outlook Classic uses Word HTML rendering engine with severe CSS limitations; property list is conservative estimate based on known Word engine restrictions',
  },
} as const
