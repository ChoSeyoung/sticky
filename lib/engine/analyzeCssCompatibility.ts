import * as cheerio from 'cheerio'
import type { ClientRuleset } from '@/lib/rulesets/types'

export interface CssWarning {
  client: string
  property: string
  element: string
  context: 'inline' | 'style-block'
  severity: 'error' | 'warning'
  impact: string
  fix: string
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
              impact: `${name}에서 ${prop} 속성이 제거되어 레이아웃이 깨질 수 있음`,
              fix: `${prop} 대신 다른 방법 사용 (예: table cellpadding, width 속성 등)`,
            })
          }
        })
      })
    }

    // Check <style> blocks
    if (ruleset.stripHeadStyles) {
      const styleCount = $('style').length
      if (styleCount > 0) {
        warnings.push({
          client: name,
          property: `<style> 블록 (${styleCount}개)`,
          element: '<style>',
          context: 'style-block',
          severity: 'error',
          impact: `${name}에서 모든 <style> 블록이 제거됨 — 클래스 기반 스타일이 전부 사라짐`,
          fix: '상단 "Inline CSS" 버튼으로 <style> 규칙을 inline style로 변환하세요',
        })
      }
    } else if (ruleset.styleBlockBehavior) {
      const patterns = ruleset.styleBlockBehavior.disallowedPatterns.map(
        p => ({ re: new RegExp(p, 'i'), src: p })
      )
      $('style').each((_, el) => {
        const cssText = $(el).text()
        for (const { re, src } of patterns) {
          if (re.test(cssText)) {
            const friendlyName = patternToFriendlyName(src)
            warnings.push({
              client: name,
              property: friendlyName,
              element: '<style>',
              context: 'style-block',
              severity: 'warning',
              impact: `${name}에서 이 <style> 블록 전체가 제거될 수 있음 (${friendlyName} 감지)`,
              fix: `<style> 블록에서 ${friendlyName}를 제거하거나, inline style로 변환하세요`,
            })
            break
          }
        }
      })
    }

    // Check stripped elements
    for (const tag of ruleset.strippedElements) {
      const count = $(tag).length
      if (count > 0) {
        warnings.push({
          client: name,
          property: `<${tag}> (${count}개)`,
          element: `<${tag}>`,
          context: 'inline',
          severity: 'error',
          impact: `${name}에서 <${tag}> 요소가 완전히 제거됨`,
          fix: `<${tag}> 대신 이미지나 텍스트 링크로 대체하세요`,
        })
      }
    }
  }

  return deduplicateWarnings(warnings)
}

function patternToFriendlyName(pattern: string): string {
  if (pattern.includes('background-image')) return 'background-image: url()'
  if (pattern.includes('background') && pattern.includes('url')) return 'background: url()'
  if (pattern.includes('@import')) return '@import'
  if (pattern.includes('@font-face')) return '@font-face'
  if (pattern.includes('position')) return 'position: fixed/absolute'
  if (pattern.includes('expression')) return 'expression()'
  return pattern.slice(0, 25)
}

function deduplicateWarnings(warnings: CssWarning[]): CssWarning[] {
  const seen = new Set<string>()
  return warnings.filter(w => {
    const key = `${w.client}|${w.property}|${w.context}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
