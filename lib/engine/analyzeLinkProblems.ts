import * as cheerio from 'cheerio'

export interface LinkWarning {
  href: string
  text: string
  lineNumber: number
  problem: 'empty-href' | 'hash-placeholder' | 'example-domain' | 'missing-protocol'
  severity: 'error' | 'warning'
  message: string
}

/**
 * Returns the 1-based line number of the first occurrence of `needle` in `html`.
 * Falls back to 0 if not found.
 */
function lineOf(html: string, needle: string): number {
  const idx = html.indexOf(needle)
  if (idx === -1) return 0
  return html.slice(0, idx).split('\n').length
}

/**
 * Detects whether an href value looks like a bare domain / www-prefixed URL
 * that is missing an http(s):// protocol.
 *
 * Returns true when the href:
 *   - starts with "www."  (e.g. www.google.com)
 *   - OR contains a dot after the first segment and does NOT start with a
 *     known scheme or path indicator
 */
function isMissingProtocol(href: string): boolean {
  if (!href) return false
  // Allow known safe schemes and path-relative URLs
  if (/^(https?|mailto|tel|ftp|#|\/)/i.test(href)) return false
  // www.something → clearly missing protocol
  if (/^www\./i.test(href)) return true
  // bare domain like "google.com" or "google.com/path"
  // must contain a dot and not look like a relative path segment
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|$)/.test(href)) return true
  return false
}

export function analyzeLinkProblems(html: string): LinkWarning[] {
  // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: LinkWarning[] = []

  $('a').each((_, el) => {
    const hrefAttr = $(el).attr('href')
    const text = $(el).text().trim()

    // No href attribute at all
    if (hrefAttr === undefined) {
      // Anchor-only tag (has name attr, no link intent) — skip
      if ($(el).attr('name') !== undefined) return
      // Otherwise treat as empty-href
      const needle = '<a'
      // Try to find this specific anchor in the source to get line number
      const tagHtml = $.html(el)
      const lineNumber = lineOf(html, tagHtml) || lineOf(html, needle)
      warnings.push({
        href: '',
        text,
        lineNumber,
        problem: 'empty-href',
        severity: 'error',
        message: 'href가 비어 있습니다',
      })
      return
    }

    const href = hrefAttr

    // Determine search needle for line number
    const hrefNeedle = href === '' ? 'href=""' : `href="${href}"`
    const lineNumber = lineOf(html, hrefNeedle)

    // empty href=""
    if (href === '') {
      warnings.push({
        href,
        text,
        lineNumber,
        problem: 'empty-href',
        severity: 'error',
        message: 'href가 비어 있습니다',
      })
      return
    }

    // hash placeholder
    if (href === '#') {
      warnings.push({
        href,
        text,
        lineNumber,
        problem: 'hash-placeholder',
        severity: 'warning',
        message: '# placeholder 링크입니다',
      })
      return
    }

    // example.com domain
    if (/example\.com/i.test(href)) {
      warnings.push({
        href,
        text,
        lineNumber,
        problem: 'example-domain',
        severity: 'warning',
        message: 'example.com 테스트 도메인이 포함되어 있습니다',
      })
      return
    }

    // missing protocol
    if (isMissingProtocol(href)) {
      warnings.push({
        href,
        text,
        lineNumber,
        problem: 'missing-protocol',
        severity: 'error',
        message: '프로토콜이 없습니다 (https:// 추가 필요)',
      })
      return
    }
  })

  return warnings
}
