import type { ClientRuleset } from './types'

export const gmailRuleset: ClientRuleset = {
  stripHeadStyles: true,
  allowedInlineProperties: null,
  strippedProperties: [],
  strippedElements: [],
  confidence: 'high',
  provenance: {
    source: 'Gmail webmail inspection',
    method: 'webmail-inspection',
    lastVerified: '2026-04-23',
    notes: 'Gmail <style> stripping is version/context-dependent; modeled as stripHeadStyles: true for Phase 1 — Phase 3 simulation refines behavioral nuance',
  },
} as const
