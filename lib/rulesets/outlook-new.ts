import type { ClientRuleset } from './types'

export const outlookNewRuleset: ClientRuleset = {
  stripHeadStyles: false,
  styleBlockBehavior: {
    disallowedPatterns: [
      '@import',
      'position\\s*:\\s*fixed',
      'expression\\s*\\(',
    ],
  },
  allowedInlineProperties: null,
  strippedProperties: [],
  strippedElements: ['script', 'iframe'],
  confidence: 'medium',
  provenance: {
    source: 'Outlook New (Chromium-based) webmail inspection + community reports',
    method: 'webmail-inspection',
    lastVerified: '2026-04-24',
    notes: 'Outlook New uses Chromium rendering — much better CSS support than Classic. Strips script/iframe for security, conditionally strips <style> blocks with dangerous patterns',
  },
} as const
