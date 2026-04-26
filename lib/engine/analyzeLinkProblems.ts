export interface LinkWarning {
  href: string
  text: string
  lineNumber: number
  problem: 'empty-href' | 'hash-placeholder' | 'example-domain' | 'missing-protocol'
  severity: 'error' | 'warning'
  message: string
}

export function analyzeLinkProblems(_html: string): LinkWarning[] {
  return []
}
