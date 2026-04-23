import * as cheerio from 'cheerio'
import type { ClientRuleset } from '@/lib/rulesets/types'

function filterInlineStyle(styleValue: string, blocked: ReadonlyArray<string>): string {
  const blockedSet = new Set(blocked.map(p => p.toLowerCase()))
  return styleValue
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(decl => {
      const colonIdx = decl.indexOf(':')
      if (colonIdx === -1) return false
      const prop = decl.slice(0, colonIdx).trim().toLowerCase()
      return !blockedSet.has(prop)
    })
    .join('; ')
}

export function applyClientRules(html: string, ruleset: ClientRuleset): string {
  const $ = cheerio.load(html, { decodeEntities: false })

  // Strip <style> elements
  if (ruleset.stripHeadStyles) {
    $('style').remove()
  }

  // Remove blocked elements
  for (const tag of ruleset.strippedElements) {
    $(tag).remove()
  }

  // Filter blocked inline properties
  if (ruleset.strippedProperties.length > 0) {
    $('[style]').each((_, el) => {
      const original = $(el).attr('style') ?? ''
      const filtered = filterInlineStyle(original, ruleset.strippedProperties)
      if (filtered) {
        $(el).attr('style', filtered)
      } else {
        $(el).removeAttr('style')
      }
    })
  }

  return $.html()
}
