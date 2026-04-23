import { describe, it, expect } from 'vitest'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import { naverRuleset } from '@/lib/rulesets/naver'
import { gmailRuleset } from '@/lib/rulesets/gmail'
import { daumRuleset } from '@/lib/rulesets/daum'
import type { ClientRuleset } from '@/lib/rulesets/types'

describe('applyClientRules — naverRuleset', () => {
  describe('SIM-01: <style> stripping', () => {
    it('removes <style> blocks from <head>', () => {
      const input = '<html><head><style>body{color:red}</style></head><body>hi</body></html>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('<style>')
      expect(result).toContain('hi')
    })

    it('removes <style> blocks from <body>', () => {
      const input = '<html><body><style>.foo{color:red}</style><p>hi</p></body></html>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('<style>')
      expect(result).toContain('<p>hi</p>')
    })

    it('removes multiple <style> blocks', () => {
      const input = '<html><head><style>a{}</style><style>b{}</style></head><body>ok</body></html>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('<style>')
    })
  })

  describe('SIM-01: inline property filtering', () => {
    it('strips margin from inline style', () => {
      const input = '<p style="margin: 10px; color: red;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('margin')
      expect(result).toContain('color: red')
    })

    it('strips padding from inline style', () => {
      const input = '<table><tr><td style="padding: 10px; font-size: 14px;">cell</td></tr></table>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('padding')
      expect(result).toContain('font-size: 14px')
    })

    it('strips font-family from inline style', () => {
      const input = '<div style="font-family: Arial; color: blue;">x</div>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('font-family')
      expect(result).toContain('color: blue')
    })

    it('handles case-insensitive property names', () => {
      const input = '<p style="MARGIN: 0; COLOR: red;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result.toLowerCase()).not.toContain('margin')
      expect(result.toLowerCase()).toContain('color')
    })

    it('removes style attr when all properties stripped', () => {
      const input = '<p style="margin: 0; padding: 0;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('style=')
    })
  })

  describe('SIM-01: passthrough (identity cases)', () => {
    it('does not alter inline-safe CSS properties', () => {
      const input = '<p style="color: red; font-size: 14px;">text</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).toContain('color: red')
      expect(result).toContain('font-size: 14px')
    })

    it('preserves HTML entities like &nbsp;', () => {
      const input = '<p>Hello&nbsp;World</p>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).toContain('&nbsp;')
      expect(result).not.toContain('&amp;nbsp;')
    })

    it('is a pure function — same input produces same output', () => {
      const input = '<p style="margin: 10px; color: red;">text</p>'
      const result1 = applyClientRules(input, naverRuleset)
      const result2 = applyClientRules(input, naverRuleset)
      expect(result1).toBe(result2)
    })
  })

  describe('data-driven ruleset (per D-04)', () => {
    it('uses ruleset data, not hardcoded property names', () => {
      const customRuleset: ClientRuleset = {
        stripHeadStyles: false,
        allowedInlineProperties: null,
        strippedProperties: ['background'],
        strippedElements: [],
        confidence: 'high',
        provenance: { source: 'test', method: 'inferred', lastVerified: '2026-01-01' },
      }
      const input = '<p style="margin: 0; background: red;">text</p>'
      const result = applyClientRules(input, customRuleset)
      expect(result).not.toContain('background')
      expect(result).toContain('margin')
    })

    it('respects stripHeadStyles: false', () => {
      const customRuleset: ClientRuleset = {
        stripHeadStyles: false,
        allowedInlineProperties: null,
        strippedProperties: [],
        strippedElements: [],
        confidence: 'high',
        provenance: { source: 'test', method: 'inferred', lastVerified: '2026-01-01' },
      }
      const input = '<html><head><style>body{color:red}</style></head><body>hi</body></html>'
      const result = applyClientRules(input, customRuleset)
      expect(result).toContain('<style>')
    })

    it('removes strippedElements when specified', () => {
      const customRuleset: ClientRuleset = {
        stripHeadStyles: false,
        allowedInlineProperties: null,
        strippedProperties: [],
        strippedElements: ['script'],
        confidence: 'high',
        provenance: { source: 'test', method: 'inferred', lastVerified: '2026-01-01' },
      }
      const input = '<html><body><script>alert(1)</script><p>hi</p></body></html>'
      const result = applyClientRules(input, customRuleset)
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>hi</p>')
    })
  })
})

describe('applyClientRules -- gmailRuleset', () => {
  describe('SIM-03: block-kill path (disallowed CSS triggers full <style> removal)', () => {
    it('strips entire <style> block when background-image url() is present', () => {
      const input = '<html><head><style>.hero { background-image: url("bg.jpg"); color: red; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
      expect(result).not.toContain('color: red')
      expect(result).toContain('hi')
    })

    it('strips block with @import rule', () => {
      const input = '<html><head><style>@import url("fonts.css"); .text { color: red; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('strips block with position: fixed', () => {
      const input = '<html><head><style>.overlay { position: fixed; top: 0; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('strips block with position: absolute', () => {
      const input = '<html><head><style>.popup { position: absolute; left: 0; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('strips block with background shorthand containing url()', () => {
      const input = '<html><head><style>.bg { background: #fff url("bg.jpg") no-repeat; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('strips block with expression()', () => {
      const input = '<html><head><style>.x { width: expression(document.body.clientWidth); }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })

    it('strips block with @font-face', () => {
      const input = '<html><head><style>@font-face { font-family: "Custom"; src: url("font.woff2"); }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })
  })

  describe('SIM-03: block-retain path (only allowed CSS, block survives)', () => {
    it('retains <style> block when only allowed properties are used', () => {
      const input = '<html><head><style>.text { color: red; font-size: 14px; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).toContain('<style>')
      expect(result).toContain('color: red')
      expect(result).toContain('font-size: 14px')
    })

    it('retains block with simple text-decoration', () => {
      const input = '<html><head><style>.link { text-decoration: underline; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).toContain('<style>')
      expect(result).toContain('text-decoration: underline')
    })
  })

  describe('SIM-03: multiple <style> blocks (independent evaluation)', () => {
    it('retains safe block and removes block with disallowed CSS', () => {
      const input = '<html><head><style>.safe { color: red; }</style><style>.bad { background-image: url("x"); }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).toContain('color: red')
      expect(result).not.toContain('background-image')
    })
  })

  describe('SIM-03: case insensitivity', () => {
    it('matches disallowed patterns case-insensitively', () => {
      const input = '<html><head><style>.x { BACKGROUND-IMAGE: URL("x.jpg"); }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, gmailRuleset)
      expect(result).not.toContain('<style>')
    })
  })

  describe('SIM-03: backward compatibility with Naver', () => {
    it('naverRuleset still strips ALL <style> blocks unconditionally', () => {
      const input = '<html><head><style>.safe { color: red; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, naverRuleset)
      expect(result).not.toContain('<style>')
      expect(result).not.toContain('color: red')
    })
  })

  describe('SIM-03: purity', () => {
    it('is a pure function -- same Gmail input produces same output', () => {
      const input = '<html><head><style>.safe { color: red; }</style></head><body>hi</body></html>'
      const result1 = applyClientRules(input, gmailRuleset)
      const result2 = applyClientRules(input, gmailRuleset)
      expect(result1).toBe(result2)
    })
  })
})

describe('applyClientRules -- daumRuleset', () => {
  describe('SIM-02: <style> stripping', () => {
    it('removes <style> blocks from HTML', () => {
      const input = '<html><head><style>body { color: red; }</style></head><body>hi</body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('<style>')
      expect(result).toContain('hi')
    })

    it('removes multiple <style> blocks', () => {
      const input = '<html><head><style>a{}</style><style>b{}</style></head><body>ok</body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('<style>')
    })
  })

  describe('SIM-02: element stripping (strippedElements)', () => {
    it('removes <script> elements', () => {
      const input = '<html><body><script>alert(1)</script><p>hi</p></body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('<p>hi</p>')
    })

    it('removes <iframe> elements', () => {
      const input = '<html><body><iframe src="https://example.com"></iframe><p>hi</p></body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('<iframe>')
      expect(result).toContain('<p>hi</p>')
    })

    it('removes <object> elements', () => {
      const input = '<html><body><object data="flash.swf"></object><p>hi</p></body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('<object>')
      expect(result).toContain('<p>hi</p>')
    })

    it('removes <embed> elements', () => {
      const input = '<html><body><embed src="video.mp4"><p>hi</p></body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('<embed>')
      expect(result).toContain('<p>hi</p>')
    })

    it('removes script element and its content entirely', () => {
      const input = '<html><body><script type="text/javascript">var x = 1; console.log(x);</script><p>hi</p></body></html>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).not.toContain('console.log')
      expect(result).not.toContain('var x')
    })
  })

  describe('SIM-02: inline style passthrough (no strippedProperties)', () => {
    it('preserves all inline styles including margin and padding', () => {
      const input = '<p style="margin: 10px; padding: 5px; color: red;">text</p>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).toContain('margin: 10px')
      expect(result).toContain('padding: 5px')
      expect(result).toContain('color: red')
    })

    it('preserves font-family inline style (unlike Naver)', () => {
      const input = '<p style="font-family: Arial; font-size: 14px;">text</p>'
      const result = applyClientRules(input, daumRuleset)
      expect(result).toContain('font-family: Arial')
      expect(result).toContain('font-size: 14px')
    })
  })

  describe('SIM-02: confidence metadata', () => {
    it('has estimated confidence level', () => {
      expect(daumRuleset.confidence).toBe('estimated')
    })

    it('has provenance notes documenting inference basis', () => {
      expect(daumRuleset.provenance.notes).toBeDefined()
      expect(daumRuleset.provenance.notes).toContain('No official documentation')
    })
  })

  describe('SIM-02: purity', () => {
    it('is a pure function -- same Daum input produces same output', () => {
      const input = '<html><body><script>x</script><p style="color: red;">hi</p></body></html>'
      const result1 = applyClientRules(input, daumRuleset)
      const result2 = applyClientRules(input, daumRuleset)
      expect(result1).toBe(result2)
    })
  })
})
