import { describe, it, expect } from 'vitest'
import { analyzeAccessibility } from './analyzeAccessibility'

describe('analyzeAccessibility', () => {
  // ─── missing-alt detection (D-01.1) ────────────────────────────────────────

  describe('missing-alt detection', () => {
    it('flags <img> without alt attribute', () => {
      const result = analyzeAccessibility('<img src="x.jpg">')
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('missing-alt')
      expect(result.warnings[0].severity).toBe('error')
    })

    it('does NOT flag alt="" (decorative image per D-01)', () => {
      const result = analyzeAccessibility('<img src="x.jpg" alt="">')
      expect(result.warnings).toHaveLength(0)
    })

    it('does NOT flag img with alt text', () => {
      const result = analyzeAccessibility('<img src="x.jpg" alt="photo">')
      expect(result.warnings).toHaveLength(0)
    })

    it('produces one warning per img missing alt', () => {
      const html = '<img src="a.jpg"><img src="b.jpg" alt=""><img src="c.jpg">'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(2)
      result.warnings.forEach(w => expect(w.type).toBe('missing-alt'))
    })

    it('includes correct lineNumber for missing-alt warning', () => {
      const html = '<div>\n  <img src="x.jpg">\n</div>'
      const result = analyzeAccessibility(html)
      expect(result.warnings[0].lineNumber).toBe(2)
    })
  })

  // ─── low-contrast detection (D-01.2) ───────────────────────────────────────

  describe('low-contrast detection', () => {
    it('does NOT flag black-on-white (ratio 21:1)', () => {
      const html = '<p style="color:#000000;background-color:#ffffff">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('flags low-contrast color pair (#777 on #888)', () => {
      const html = '<p style="color:#777777;background-color:#888888">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('low-contrast')
      expect(result.warnings[0].severity).toBe('warning')
    })

    it('includes fg, bg, ratio, required in detail', () => {
      const html = '<p style="color:#777777;background-color:#888888">text</p>'
      const result = analyzeAccessibility(html)
      const w = result.warnings[0]
      expect(w.detail?.fg).toBeDefined()
      expect(w.detail?.bg).toBeDefined()
      expect(w.detail?.ratio).toBeDefined()
      expect(w.detail?.required).toBe(4.5)
    })

    it('skips element with only color but no background-color', () => {
      const html = '<p style="color:#777777">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('skips element with unparseable color format (named color)', () => {
      const html = '<p style="color:red;background-color:blue">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('supports #RGB shorthand', () => {
      // #fff = white, #000 = black => ratio 21:1 => no warning
      const html = '<p style="color:#000;background-color:#fff">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('supports rgb() format', () => {
      // rgb(0,0,0) on rgb(255,255,255) => 21:1 => no warning
      const html = '<p style="color:rgb(0,0,0);background-color:rgb(255,255,255)">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })
  })

  // ─── heading-skip detection (D-01.3) ───────────────────────────────────────

  describe('heading-skip detection', () => {
    it('flags h1->h3 skip', () => {
      const html = '<h1>A</h1><h3>B</h3>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('heading-skip')
      expect(result.warnings[0].severity).toBe('warning')
    })

    it('does NOT flag h1->h2 (sequential)', () => {
      const html = '<h1>A</h1><h2>B</h2>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('flags h2->h4 skip', () => {
      const html = '<h2>A</h2><h4>B</h4>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('heading-skip')
    })

    it('does NOT flag going back up (h3->h2)', () => {
      const html = '<h3>A</h3><h2>B</h2>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('does NOT flag first heading being h2 (no h1) per Research pitfall 5', () => {
      const html = '<h2>A</h2><h3>B</h3>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(0)
    })

    it('includes lineNumber for heading-skip warning', () => {
      const html = '<h1>A</h1>\n<h3>B</h3>'
      const result = analyzeAccessibility(html)
      expect(result.warnings[0].lineNumber).toBeGreaterThan(0)
    })
  })

  // ─── WCAG luminance formula correctness ────────────────────────────────────

  describe('WCAG formula correctness', () => {
    it('white-on-black produces ratio of 21', () => {
      const html = '<p style="color:#ffffff;background-color:#000000">text</p>'
      const result = analyzeAccessibility(html)
      // No warning (21:1 >> 4.5:1)
      expect(result.warnings).toHaveLength(0)
    })

    it('very similar dark grays produce low-contrast warning', () => {
      // #444 on #555 — close values, low contrast
      const html = '<p style="color:#444444;background-color:#555555">text</p>'
      const result = analyzeAccessibility(html)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('low-contrast')
    })
  })

  // ─── AccessibilitySummary (D-05) ───────────────────────────────────────────

  describe('AccessibilitySummary passCount and failCount', () => {
    it('returns passCount and failCount in result', () => {
      const result = analyzeAccessibility('<img src="x.jpg">')
      expect(typeof result.passCount).toBe('number')
      expect(typeof result.failCount).toBe('number')
    })

    it('failCount equals warnings.length', () => {
      const html = '<img src="a.jpg"><img src="b.jpg">'
      const result = analyzeAccessibility(html)
      expect(result.failCount).toBe(result.warnings.length)
    })

    it('passCount is total checked items minus failCount', () => {
      // 2 images, no warnings => passCount=2, failCount=0
      const html = '<img src="a.jpg" alt="a"><img src="b.jpg" alt="b">'
      const result = analyzeAccessibility(html)
      expect(result.failCount).toBe(0)
      expect(result.passCount).toBe(2)
    })

    it('mixed scenario: some pass some fail', () => {
      // 1 img without alt (fail), 1 img with alt (pass) => passCount=1, failCount=1
      const html = '<img src="a.jpg"><img src="b.jpg" alt="b">'
      const result = analyzeAccessibility(html)
      expect(result.failCount).toBe(1)
      expect(result.passCount).toBe(1)
    })

    it('returns empty warnings array when no issues', () => {
      const result = analyzeAccessibility('<p>Hello</p>')
      expect(result.warnings).toHaveLength(0)
      expect(result.failCount).toBe(0)
    })
  })
})
