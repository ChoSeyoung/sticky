import * as cheerio from 'cheerio'

export interface AccessibilityWarning {
  type: 'missing-alt' | 'low-contrast' | 'heading-skip'
  severity: 'error' | 'warning'
  message: string
  lineNumber: number
  detail?: {
    // low-contrast fields
    fg?: string
    bg?: string
    ratio?: number
    required?: number
    // heading-skip fields
    fromLevel?: number
    toLevel?: number
  }
}

export interface AccessibilitySummary {
  warnings: AccessibilityWarning[]
  passCount: number
  failCount: number
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
 * WCAG 2.1 relative luminance linearization.
 * Uses 0.04045 threshold (WCAG 2.1, NOT the older 0.03928 from WCAG 2.0 draft).
 */
function linearize(c: number): number {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

/**
 * WCAG 2.1 relative luminance.
 * Coefficients: 0.2126R + 0.7152G + 0.0722B
 */
function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/**
 * WCAG contrast ratio: (lighter + 0.05) / (darker + 0.05)
 */
function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Parse a CSS color value into [r, g, b].
 * Supports: #RGB, #RRGGBB, rgb(r,g,b)
 * Returns null for unsupported formats (named colors, hsl, rgba, etc.)
 */
function parseColor(value: string): [number, number, number] | null {
  const v = value.trim()

  // #RRGGBB
  const hex6 = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (hex6) {
    return [parseInt(hex6[1], 16), parseInt(hex6[2], 16), parseInt(hex6[3], 16)]
  }

  // #RGB
  const hex3 = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (hex3) {
    return [
      parseInt(hex3[1] + hex3[1], 16),
      parseInt(hex3[2] + hex3[2], 16),
      parseInt(hex3[3] + hex3[3], 16),
    ]
  }

  // rgb(r, g, b)
  const rgb = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgb) {
    return [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)]
  }

  return null
}

/**
 * Extract a single CSS property value from an inline style string.
 * E.g. extractCssProperty("color:#000;background-color:#fff", "background-color") => "#fff"
 * Returns null if property not found.
 */
function extractCssProperty(style: string, prop: string): string | null {
  // Split on semicolons and look for the property
  const parts = style.split(';')
  for (const part of parts) {
    const colonIdx = part.indexOf(':')
    if (colonIdx === -1) continue
    const key = part.slice(0, colonIdx).trim().toLowerCase()
    if (key === prop.toLowerCase()) {
      return part.slice(colonIdx + 1).trim()
    }
  }
  return null
}

/**
 * Analyzes HTML for accessibility issues:
 * 1. Missing img alt attributes (missing-alt)
 * 2. Low color contrast per WCAG AA (low-contrast)
 * 3. Heading level skips (heading-skip)
 *
 * Returns AccessibilitySummary with warnings, passCount, and failCount.
 */
export function analyzeAccessibility(html: string): AccessibilitySummary {
  // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: AccessibilityWarning[] = []

  // Track total checked items for passCount calculation
  let totalChecked = 0

  // ─── 1. Missing img alt detection ──────────────────────────────────────────
  $('img').each((_, el) => {
    totalChecked++
    const alt = $(el).attr('alt')
    if (alt === undefined) {
      // alt attribute is completely absent — flag as error
      const tagHtml = $.html(el)
      warnings.push({
        type: 'missing-alt',
        severity: 'error',
        message: 'img 태그에 alt 속성이 없습니다',
        lineNumber: lineOf(html, tagHtml),
      })
    }
    // alt="" is intentional (decorative image per D-01) — no warning
  })

  // ─── 2. Heading skip detection ─────────────────────────────────────────────
  const headings: { level: number; lineNumber: number }[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const level = parseInt((el as cheerio.Element & { tagName: string }).tagName[1], 10)
    const tagHtml = $.html(el)
    headings.push({ level, lineNumber: lineOf(html, tagHtml) })
  })

  for (let i = 1; i < headings.length; i++) {
    totalChecked++ // each consecutive heading pair is a checked item
    const diff = headings[i].level - headings[i - 1].level
    if (diff > 1) {
      warnings.push({
        type: 'heading-skip',
        severity: 'warning',
        message: `h${headings[i - 1].level}에서 h${headings[i].level}로 헤딩 레벨을 건너뛰었습니다`,
        lineNumber: headings[i].lineNumber,
        detail: {
          fromLevel: headings[i - 1].level,
          toLevel: headings[i].level,
        },
      })
    }
  }

  // ─── 3. Low contrast detection ─────────────────────────────────────────────
  const THRESHOLD = 4.5 // WCAG AA for normal text (simplified: apply to all per Research open Q1)

  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const fg = extractCssProperty(style, 'color')
    const bg = extractCssProperty(style, 'background-color')

    // Need both color and background-color in same element
    if (!fg || !bg) return

    const fgRgb = parseColor(fg)
    const bgRgb = parseColor(bg)

    // Skip silently if color format not supported (named colors, hsl, rgba, etc.)
    if (!fgRgb || !bgRgb) return

    totalChecked++ // this color pair is a checked item
    const ratio = contrastRatio(
      relativeLuminance(...fgRgb),
      relativeLuminance(...bgRgb),
    )

    if (ratio < THRESHOLD) {
      const tagHtml = $.html(el)
      warnings.push({
        type: 'low-contrast',
        severity: 'warning',
        message: `색상 대비가 WCAG AA 기준(${THRESHOLD}:1)을 충족하지 않습니다 (현재 ${ratio.toFixed(2)}:1)`,
        lineNumber: lineOf(html, tagHtml),
        detail: {
          fg,
          bg,
          ratio: Math.round(ratio * 100) / 100,
          required: THRESHOLD,
        },
      })
    }
  })

  const failCount = warnings.length
  const passCount = totalChecked - failCount

  return {
    warnings,
    passCount,
    failCount,
  }
}
