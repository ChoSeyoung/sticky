import * as cheerio from 'cheerio'
import type { DarkModeStrategy } from '@/lib/rulesets/types'

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/**
 * Returns true if the HTML contains a @media (prefers-color-scheme: dark)
 * query anywhere in the markup (style blocks or inline style attributes).
 */
export function hasDarkMediaQuery(html: string): boolean {
  return /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/i.test(html)
}

// ---------------------------------------------------------------------------
// Media query rewriting
// ---------------------------------------------------------------------------

/**
 * Rewrites dark-mode media queries to be unconditionally active and
 * suppresses light-mode media queries — simulating the view a dark-mode
 * email client renders.
 *
 * - @media (...prefers-color-scheme: dark...) { → @media all {
 * - @media (...prefers-color-scheme: light...) { → @media not all {
 */
export function activateDarkMediaQueries(html: string): string {
  // Activate dark queries → @media all {
  let result = html.replace(
    /@media\b([^{]*)\(prefers-color-scheme\s*:\s*dark\)([^{]*)\{/gi,
    '@media all {'
  )
  // Suppress light queries → @media not all {
  result = result.replace(
    /@media\b([^{]*)\(prefers-color-scheme\s*:\s*light\)([^{]*)\{/gi,
    '@media not all {'
  )
  return result
}

// ---------------------------------------------------------------------------
// Color utilities (internal)
// ---------------------------------------------------------------------------

function hexToHsl(hex: string): [number, number, number] | null {
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
  }
  if (clean.length !== 6) return null
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return rgbToHsl(r, g, b)
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number): string => {
    const k = (n + h / 30) % 12
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Partial inversion: only invert near-white (L > 85) or near-black (L < 15).
 * Mid-range colors are returned unchanged.
 */
function invertColorPartial(value: string): string {
  const hsl = parseColorToHsl(value)
  if (!hsl) return value
  const [h, s, l] = hsl
  if (l > 85 || l < 15) {
    return hslToHex(h, s, 100 - l)
  }
  return value
}

/**
 * Full inversion: always inverts lightness (L → 100 - L).
 */
function invertColorFull(value: string): string {
  const hsl = parseColorToHsl(value)
  if (!hsl) return value
  const [h, s, l] = hsl
  return hslToHex(h, s, 100 - l)
}

/**
 * Parse a CSS color value (hex or rgb/rgba) to HSL.
 * Returns null for named colors, CSS variables, or unparseable values.
 */
function parseColorToHsl(cssValue: string): [number, number, number] | null {
  const trimmed = cssValue.trim()

  // Skip CSS variables
  if (trimmed.startsWith('var(')) return null

  // Skip named colors (no # and no rgb/rgba prefix)
  if (!trimmed.startsWith('#') && !/^rgba?\s*\(/i.test(trimmed)) return null

  // Hex colors
  if (trimmed.startsWith('#')) {
    return hexToHsl(trimmed)
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbaMatch = trimmed.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbaMatch) {
    return rgbToHsl(
      parseInt(rgbaMatch[1], 10),
      parseInt(rgbaMatch[2], 10),
      parseInt(rgbaMatch[3], 10)
    )
  }

  return null
}

/**
 * Apply an inversion function to a CSS color value string.
 * Preserves non-color parts (named colors, variables, other values).
 */
function transformCssColorValue(
  cssValue: string,
  invert: (v: string) => string
): string {
  const trimmed = cssValue.trim()
  // Only transform if it looks like a color we can handle
  if (
    trimmed.startsWith('#') ||
    /^rgba?\s*\(/i.test(trimmed)
  ) {
    return invert(trimmed)
  }
  return cssValue
}

/**
 * Parse an inline style string, apply color inversion to color/background-color/background
 * declarations, and return the updated style string.
 */
function transformInlineStyle(
  styleStr: string,
  invert: (v: string) => string
): string {
  return styleStr
    .split(';')
    .map(decl => {
      const colonIdx = decl.indexOf(':')
      if (colonIdx === -1) return decl
      const prop = decl.slice(0, colonIdx).trim().toLowerCase()
      const val = decl.slice(colonIdx + 1).trim()
      if (prop === 'color' || prop === 'background-color' || prop === 'background') {
        const transformed = transformCssColorValue(val, invert)
        return `${decl.slice(0, colonIdx + 1)} ${transformed}`
      }
      return decl
    })
    .join(';')
}

/**
 * Apply color inversion to CSS text (style block content).
 * Handles color and background-color property values.
 */
function transformCssText(
  cssText: string,
  invert: (v: string) => string
): string {
  // Replace color values in CSS declarations: color: <value>; or background-color: <value>;
  return cssText.replace(
    /((?:background-color|background|color)\s*:\s*)(#[0-9a-fA-F]{3,8}|rgba?\s*\([^)]+\))/g,
    (_match, prop, colorVal) => {
      const transformed = invert(colorVal.trim())
      return `${prop}${transformed}`
    }
  )
}

// ---------------------------------------------------------------------------
// Auto-inversion
// ---------------------------------------------------------------------------

/**
 * Applies color inversion to HTML based on the given strategy:
 * - 'none': return HTML unchanged
 * - 'partial': invert only near-white (L>85) and near-black (L<15) colors
 * - 'full': invert all colors (L → 100-L)
 *
 * Also injects a dark background wrapper into <head> to simulate
 * the dark UI chrome that email clients show around the email.
 */
export function applyAutoInversion(html: string, strategy: DarkModeStrategy): string {
  if (strategy === 'none') return html

  const invert = strategy === 'full' ? invertColorFull : invertColorPartial

  // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
  const $ = cheerio.load(html, { decodeEntities: false })

  // Walk elements with inline style attribute
  $('[style]').each((_, el) => {
    const styleVal = $(el).attr('style') ?? ''
    const updated = transformInlineStyle(styleVal, invert)
    $(el).attr('style', updated)
  })

  // Walk elements with bgcolor attribute (legacy HTML tables)
  $('[bgcolor]').each((_, el) => {
    const val = $(el).attr('bgcolor') ?? ''
    const transformed = transformCssColorValue(val, invert)
    $(el).attr('bgcolor', transformed)
  })

  // Walk elements with color HTML attribute (e.g. <font color="...">)
  $('[color]').each((_, el) => {
    const val = $(el).attr('color') ?? ''
    const transformed = transformCssColorValue(val, invert)
    $(el).attr('color', transformed)
  })

  // Walk style blocks
  $('style').each((_, el) => {
    const cssText = $(el).text()
    const updated = transformCssText(cssText, invert)
    $(el).text(updated)
  })

  // Inject dark background to simulate email client dark chrome
  injectDarkBackground($)

  return $.html()
}

// ---------------------------------------------------------------------------
// Dark background injection helper
// ---------------------------------------------------------------------------

function injectDarkBackground($: ReturnType<typeof cheerio.load>): void {
  const darkBgStyle = '<style>body { background-color: #1a1a1a !important; }</style>'
  const head = $('head')
  if (head.length > 0) {
    head.prepend(darkBgStyle)
  } else {
    // No head element — prepend to document
    $.root().prepend(darkBgStyle)
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

/**
 * Apply dark mode simulation to email HTML.
 *
 * @param html - The email HTML to transform
 * @param strategy - The client's dark mode strategy
 * @param originalHasDarkCss - Whether the original email already contains
 *   @media (prefers-color-scheme: dark) queries
 *
 * If the email already has dark CSS: activate those queries and inject dark chrome.
 * If not: use auto-inversion per the client strategy.
 */
export function applyDarkMode(
  html: string,
  strategy: DarkModeStrategy,
  originalHasDarkCss: boolean
): string {
  if (originalHasDarkCss) {
    // The email has its own dark mode CSS — activate it
    let result = activateDarkMediaQueries(html)
    // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
    const $ = cheerio.load(result, { decodeEntities: false })
    injectDarkBackground($)
    return $.html()
  }

  // No dark CSS in email — use client auto-inversion strategy
  return applyAutoInversion(html, strategy)
}
