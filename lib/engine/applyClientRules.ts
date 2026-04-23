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
  // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
  const $ = cheerio.load(html, { decodeEntities: false })

  // Conditional <style> block processing
  if (ruleset.styleBlockBehavior) {
    const patterns = ruleset.styleBlockBehavior.disallowedPatterns.map(
      p => new RegExp(p, 'i')
    )
    const toRemove: ReturnType<typeof $>[] = []
    $('style').each((_, el) => {
      const cssText = $(el).text()
      if (patterns.some(re => re.test(cssText))) {
        toRemove.push($(el))
      }
    })
    toRemove.forEach(el => el.remove())
  } else if (ruleset.stripHeadStyles) {
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
