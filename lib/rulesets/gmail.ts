import type { ClientRuleset } from './types'

export const gmailRuleset: ClientRuleset = {
  stripHeadStyles: false,
  styleBlockBehavior: {
    disallowedPatterns: [
      'background-image\\s*:\\s*url\\s*\\(',
      'background\\s*:[^;]*url\\s*\\(',
      '@import',
      '@font-face',
      'position\\s*:\\s*(fixed|absolute)',
      'expression\\s*\\(',
    ],
  },
  allowedInlineProperties: null,
  strippedProperties: [],
  strippedElements: [],
  confidence: 'high',
  provenance: {
    source: 'Gmail webmail inspection + community reports',
    method: 'webmail-inspection',
    lastVerified: '2026-04-24',
    notes: 'Gmail conditionally strips <style> blocks containing disallowed patterns; pattern list based on known block-kill triggers from freshinbox.com and emailonacid.com',
  },
  darkModeStrategy: 'partial',
}
