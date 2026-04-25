export type Confidence = 'high' | 'medium' | 'estimated'

export type DarkModeStrategy = 'none' | 'partial' | 'full'

export type ProvenanceMethod =
  | 'official-docs'
  | 'webmail-inspection'
  | 'community-data'
  | 'inferred'

export interface Provenance {
  source: string
  method: ProvenanceMethod
  lastVerified: string
  notes?: string
}

export interface StyleBlockBehavior {
  disallowedPatterns: string[]
}

export interface ClientRuleset {
  stripHeadStyles: boolean
  styleBlockBehavior?: StyleBlockBehavior
  allowedInlineProperties: string[] | null
  strippedProperties: string[]
  strippedElements: string[]
  confidence: Confidence
  provenance: Provenance
  darkModeStrategy: DarkModeStrategy
}
