import * as cheerio from 'cheerio'
import type { ClientRuleset } from '@/lib/rulesets/types'

export interface CssWarning {
  client: string
  property: string
  element: string
  context: 'inline' | 'style-block'
  severity: 'error' | 'warning'
}

export function analyzeCssCompatibility(
  html: string,
  clients: { name: string; ruleset: ClientRuleset }[]
): CssWarning[] {
  // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: CssWarning[] = []

  for (const { name, ruleset } of clients) {
    // Check inline styles for stripped properties
    if (ruleset.strippedProperties.length > 0) {
      const blocked = new Set(ruleset.strippedProperties.map(p => p.toLowerCase()))
      $('[style]').each((_, el) => {
        const tag = ('tagName' in el ? (el as { tagName: string }).tagName : 'element')
        const style = $(el).attr('style') ?? ''
        style.split(';').forEach(decl => {
          const trimmed = decl.trim()
          if (!trimmed) return
          const colonIdx = trimmed.indexOf(':')
          if (colonIdx === -1) return
          const prop = trimmed.slice(0, colonIdx).trim().toLowerCase()
          if (blocked.has(prop)) {
            warnings.push({
              client: name,
              property: prop,
              element: `<${tag}>`,
              context: 'inline',
              severity: 'error',
            })
          }
        })
      })
    }

    // Check <style> blocks
    if (ruleset.stripHeadStyles) {
      $('style').each(() => {
        warnings.push({
          client: name,
          property: '<style> block',
          element: '<style>',
          context: 'style-block',
          severity: 'error',
        })
      })
    } else if (ruleset.styleBlockBehavior) {
      const patterns = ruleset.styleBlockBehavior.disallowedPatterns.map(
        p => new RegExp(p, 'i')
      )
      $('style').each((_, el) => {
        const cssText = $(el).text()
        for (const re of patterns) {
          if (re.test(cssText)) {
            warnings.push({
              client: name,
              property: re.source.slice(0, 30),
              element: '<style>',
              context: 'style-block',
              severity: 'warning',
            })
            break
          }
        }
      })
    }

    // Check stripped elements
    for (const tag of ruleset.strippedElements) {
      $(tag).each(() => {
        warnings.push({
          client: name,
          property: `<${tag}> element`,
          element: `<${tag}>`,
          context: 'inline',
          severity: 'error',
        })
      })
    }
  }

  return warnings
}
