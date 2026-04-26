import { describe, it, expect } from 'vitest'
import { analyzeLinkProblems } from './analyzeLinkProblems'

describe('analyzeLinkProblems', () => {
  // empty-href tests
  describe('empty-href detection', () => {
    it('flags href="" as empty-href with severity error', () => {
      const html = '<a href="">Click me</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('empty-href')
      expect(warnings[0].severity).toBe('error')
    })

    it('flags <a> without href attribute as empty-href with severity error', () => {
      const html = '<a>Click me</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('empty-href')
      expect(warnings[0].severity).toBe('error')
    })

    it('does NOT flag <a name="anchor"> without href (anchor, not a link)', () => {
      const html = '<a name="section1"></a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(0)
    })
  })

  // hash-placeholder tests
  describe('hash-placeholder detection', () => {
    it('flags href="#" as hash-placeholder with severity warning', () => {
      const html = '<a href="#">Click me</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('hash-placeholder')
      expect(warnings[0].severity).toBe('warning')
    })
  })

  // example-domain tests
  describe('example-domain detection', () => {
    it('flags href containing example.com as example-domain with severity warning', () => {
      const html = '<a href="https://www.example.com/page">Click me</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('example-domain')
      expect(warnings[0].severity).toBe('warning')
    })

    it('flags href with bare example.com as example-domain', () => {
      const html = '<a href="http://example.com">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('example-domain')
    })
  })

  // missing-protocol tests
  describe('missing-protocol detection', () => {
    it('flags href="www.google.com" (no protocol) as missing-protocol with severity error', () => {
      const html = '<a href="www.google.com">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('missing-protocol')
      expect(warnings[0].severity).toBe('error')
    })

    it('flags href="google.com/path" (bare domain, no protocol) as missing-protocol', () => {
      const html = '<a href="google.com/path">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].problem).toBe('missing-protocol')
    })
  })

  // false positive exclusions
  describe('false positive exclusions', () => {
    it('does NOT flag href="https://google.com" as any warning', () => {
      const html = '<a href="https://google.com">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(0)
    })

    it('does NOT flag href="mailto:user@test.com" as missing-protocol', () => {
      const html = '<a href="mailto:user@test.com">Email</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(0)
    })

    it('does NOT flag href="tel:+821012345678" as missing-protocol', () => {
      const html = '<a href="tel:+821012345678">Call</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(0)
    })

    it('does NOT flag href="/relative/path" as missing-protocol', () => {
      const html = '<a href="/relative/path">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(0)
    })

    it('does NOT flag href="http://google.com" as any warning', () => {
      const html = '<a href="http://google.com">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(0)
    })
  })

  // lineNumber tests
  describe('lineNumber', () => {
    it('returns lineNumber > 0 for empty-href warning', () => {
      const html = '<html>\n<body>\n<a href="">Link</a>\n</body>\n</html>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].lineNumber).toBeGreaterThan(0)
    })

    it('returns lineNumber > 0 for hash-placeholder warning', () => {
      const html = '<html>\n<body>\n<a href="#">Link</a>\n</body>\n</html>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].lineNumber).toBeGreaterThan(0)
    })

    it('returns lineNumber > 0 for missing-protocol warning', () => {
      const html = '<html>\n<body>\n<a href="www.bad.com">Link</a>\n</body>\n</html>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(1)
      expect(warnings[0].lineNumber).toBeGreaterThan(0)
    })
  })

  // multiple <a> tags
  describe('multiple anchor tags', () => {
    it('returns correct warnings for each problem across multiple anchors', () => {
      const html = [
        '<a href="">empty</a>',
        '<a href="#">hash</a>',
        '<a href="https://example.com">example</a>',
        '<a href="www.test.com">noprotocol</a>',
      ].join('\n')
      const warnings = analyzeLinkProblems(html)
      expect(warnings).toHaveLength(4)
      const problems = warnings.map(w => w.problem)
      expect(problems).toContain('empty-href')
      expect(problems).toContain('hash-placeholder')
      expect(problems).toContain('example-domain')
      expect(problems).toContain('missing-protocol')
    })
  })

  // href and text fields
  describe('warning fields', () => {
    it('includes href value in warning', () => {
      const html = '<a href="#">Click</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings[0].href).toBe('#')
    })

    it('includes text content in warning', () => {
      const html = '<a href="#">Click me now</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings[0].text).toBe('Click me now')
    })

    it('includes message string in warning', () => {
      const html = '<a href="#">Link</a>'
      const warnings = analyzeLinkProblems(html)
      expect(warnings[0].message).toBeTruthy()
    })
  })
})
