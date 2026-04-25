import { describe, it, expect } from 'vitest'
import { hasDarkMediaQuery, activateDarkMediaQueries, applyAutoInversion, applyDarkMode } from './darkMode'

describe('hasDarkMediaQuery', () => {
  it('returns true when HTML contains @media (prefers-color-scheme: dark)', () => {
    const html = '<style>@media (prefers-color-scheme: dark) { body { background: #000; } }</style>'
    expect(hasDarkMediaQuery(html)).toBe(true)
  })

  it('returns false when HTML has no dark media query', () => {
    const html = '<style>body { color: red; }</style>'
    expect(hasDarkMediaQuery(html)).toBe(false)
  })

  it('returns true for prefers-color-scheme: dark with extra whitespace', () => {
    const html = '<style>@media ( prefers-color-scheme : dark ) { .x { color: white; } }</style>'
    expect(hasDarkMediaQuery(html)).toBe(true)
  })

  it('returns true for uppercase variant', () => {
    const html = '<style>@media (PREFERS-COLOR-SCHEME: DARK) { body {} }</style>'
    expect(hasDarkMediaQuery(html)).toBe(true)
  })

  it('returns false for only light mode query', () => {
    const html = '<style>@media (prefers-color-scheme: light) { body { background: #fff; } }</style>'
    expect(hasDarkMediaQuery(html)).toBe(false)
  })

  it('returns false for empty HTML', () => {
    expect(hasDarkMediaQuery('')).toBe(false)
  })

  it('returns true for combined media query with screen and dark', () => {
    const html = '<style>@media screen and (prefers-color-scheme: dark) { body { color: #fff; } }</style>'
    expect(hasDarkMediaQuery(html)).toBe(true)
  })
})

describe('activateDarkMediaQueries', () => {
  it('rewrites @media (prefers-color-scheme: dark) { to @media all {', () => {
    const html = '<style>@media (prefers-color-scheme: dark) { body { background: #000; } }</style>'
    const result = activateDarkMediaQueries(html)
    expect(result).toContain('@media all {')
    expect(result).not.toContain('prefers-color-scheme: dark')
  })

  it('handles @media screen and (prefers-color-scheme: dark) { variant', () => {
    const html = '<style>@media screen and (prefers-color-scheme: dark) { .dark { color: white; } }</style>'
    const result = activateDarkMediaQueries(html)
    expect(result).toContain('@media all {')
    expect(result).not.toContain('prefers-color-scheme')
  })

  it('deactivates @media (prefers-color-scheme: light) { to @media not all {', () => {
    const html = '<style>@media (prefers-color-scheme: light) { body { background: #fff; } }</style>'
    const result = activateDarkMediaQueries(html)
    expect(result).toContain('@media not all {')
    expect(result).not.toContain('prefers-color-scheme: light')
  })

  it('handles both dark and light queries in same HTML', () => {
    const html = `<style>
      @media (prefers-color-scheme: dark) { body { background: #000; } }
      @media (prefers-color-scheme: light) { body { background: #fff; } }
    </style>`
    const result = activateDarkMediaQueries(html)
    expect(result).toContain('@media all {')
    expect(result).toContain('@media not all {')
    expect(result).not.toContain('prefers-color-scheme')
  })

  it('preserves HTML outside style blocks', () => {
    const html = '<div class="header">Hello</div><style>@media (prefers-color-scheme: dark) { body { color: white; } }</style><p>World</p>'
    const result = activateDarkMediaQueries(html)
    expect(result).toContain('Hello')
    expect(result).toContain('World')
  })

  it('is case-insensitive for the media query', () => {
    const html = '<style>@media (PREFERS-COLOR-SCHEME: DARK) { body {} }</style>'
    const result = activateDarkMediaQueries(html)
    expect(result).toContain('@media all {')
  })
})

describe('applyAutoInversion', () => {
  it('returns HTML unchanged when strategy is none', () => {
    const html = '<div style="background-color: #ffffff; color: #000000;">text</div>'
    const result = applyAutoInversion(html, 'none')
    expect(result).toBe(html)
  })

  it('inverts near-white background-color with partial strategy', () => {
    const html = '<div style="background-color: #ffffff;">text</div>'
    const result = applyAutoInversion(html, 'partial')
    // #ffffff is near-white (lightness ~100%), should be darkened
    expect(result).not.toContain('background-color: #ffffff')
  })

  it('inverts near-black color with partial strategy', () => {
    const html = '<div style="color: #000000;">text</div>'
    const result = applyAutoInversion(html, 'partial')
    // #000000 is near-black (lightness 0%), should be lightened
    expect(result).not.toContain('color: #000000')
  })

  it('leaves mid-range colors unchanged with partial strategy', () => {
    const html = '<div style="color: #888888;">text</div>'
    const result = applyAutoInversion(html, 'partial')
    // #888888 has lightness ~53%, in mid-range — should not change
    expect(result).toContain('#888888')
  })

  it('inverts bgcolor HTML attribute with partial strategy', () => {
    const html = '<table><tr><td bgcolor="#ffffff">cell</td></tr></table>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).not.toContain('bgcolor="#ffffff"')
  })

  it('inverts colors in style blocks with partial strategy', () => {
    const html = '<style>body { background-color: #ffffff; color: #111111; }</style>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).not.toContain('#ffffff')
  })

  it('inverts all hex colors with full strategy', () => {
    // mid-range color that partial would leave alone
    const html = '<div style="color: #888888;">text</div>'
    const result = applyAutoInversion(html, 'full')
    // full strategy should invert 53% lightness too
    expect(result).not.toContain('#888888')
  })

  it('handles rgb() color format with partial strategy', () => {
    // rgb(255,255,255) = near-white
    const html = '<div style="background-color: rgb(255, 255, 255);">text</div>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).not.toContain('rgb(255, 255, 255)')
  })

  it('handles rgba() color format with partial strategy', () => {
    // rgba(0,0,0,1) = near-black
    const html = '<div style="color: rgba(0, 0, 0, 1);">text</div>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).not.toContain('rgba(0, 0, 0, 1)')
  })

  it('leaves named colors unchanged', () => {
    const html = '<div style="color: red;">text</div>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).toContain('color: red')
  })

  it('leaves CSS variables unchanged', () => {
    const html = '<div style="color: var(--text-color);">text</div>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).toContain('var(--text-color)')
  })

  it('inverts color HTML attribute with partial strategy', () => {
    const html = '<font color="#000000">text</font>'
    const result = applyAutoInversion(html, 'partial')
    expect(result).not.toContain('color="#000000"')
  })
})

describe('applyDarkMode', () => {
  it('routes to activateDarkMediaQueries when originalHasDarkCss is true', () => {
    const html = '<style>@media (prefers-color-scheme: dark) { body { background: #000; } }</style><body>hello</body>'
    const result = applyDarkMode(html, 'partial', true)
    expect(result).toContain('@media all {')
    expect(result).not.toContain('prefers-color-scheme: dark')
  })

  it('routes to applyAutoInversion when originalHasDarkCss is false', () => {
    const html = '<div style="background-color: #ffffff; color: #000000;">text</div>'
    const result = applyDarkMode(html, 'partial', false)
    // partial strategy should invert near-white bg and near-black color
    expect(result).not.toContain('background-color: #ffffff')
    expect(result).not.toContain('color: #000000')
  })

  it('returns unchanged HTML when strategy is none and originalHasDarkCss is false', () => {
    const html = '<div style="background-color: #ffffff;">text</div>'
    const result = applyDarkMode(html, 'none', false)
    expect(result).toBe(html)
  })

  it('injects dark background when originalHasDarkCss is true', () => {
    const html = '<html><head></head><body><style>@media (prefers-color-scheme: dark) { body { color: white; } }</style></body></html>'
    const result = applyDarkMode(html, 'partial', true)
    expect(result).toContain('background-color: #1a1a1a')
  })

  it('injects dark background when originalHasDarkCss is false with non-none strategy', () => {
    const html = '<html><head></head><body><div style="color: #000;">text</div></body></html>'
    const result = applyDarkMode(html, 'partial', false)
    expect(result).toContain('background-color: #1a1a1a')
  })
})
