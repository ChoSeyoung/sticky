import { describe, it, expect } from 'vitest'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import { naverRuleset } from '@/lib/rulesets/naver'
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
      const input = '<td style="padding: 10px; font-size: 14px;">cell</td>'
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
