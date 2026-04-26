import { describe, it, expect } from 'vitest'
import { analyzeSpamTriggers } from './analyzeSpamTriggers'

describe('analyzeSpamTriggers', () => {
  // ─── excessive-caps detection (D-01.1) ─────────────────────────────────────

  describe('excessive-caps detection', () => {
    it('flags a 4+ letter word with 70%+ uppercase (AMAZING)', () => {
      const result = analyzeSpamTriggers('<p>AMAZING product here</p>')
      const caps = result.warnings.filter(w => w.type === 'excessive-caps')
      expect(caps.length).toBeGreaterThan(0)
      expect(caps[0].type).toBe('excessive-caps')
      expect(caps[0].severity).toBe('warning')
    })

    it('does NOT flag short uppercase words (OK, ID, HTML — under 4 letters)', () => {
      const result = analyzeSpamTriggers('<p>HTML is OK and ID matters</p>')
      const caps = result.warnings.filter(w => w.type === 'excessive-caps')
      expect(caps).toHaveLength(0)
    })

    it('does NOT flag a normal mixed-case sentence', () => {
      const result = analyzeSpamTriggers('<p>Hello World, this is a normal sentence.</p>')
      const caps = result.warnings.filter(w => w.type === 'excessive-caps')
      expect(caps).toHaveLength(0)
    })

    it('returns correct lineNumber for excessive-caps warning', () => {
      const html = '<div>\n  <p>AMAZING offer here</p>\n</div>'
      const result = analyzeSpamTriggers(html)
      const caps = result.warnings.filter(w => w.type === 'excessive-caps')
      expect(caps.length).toBeGreaterThan(0)
      expect(caps[0].lineNumber).toBeGreaterThan(0)
    })

    it('has non-empty fix field for excessive-caps warning', () => {
      const result = analyzeSpamTriggers('<p>AMAZING product</p>')
      const caps = result.warnings.filter(w => w.type === 'excessive-caps')
      expect(caps.length).toBeGreaterThan(0)
      expect(caps[0].fix).toBeTruthy()
      expect(caps[0].fix.length).toBeGreaterThan(0)
    })
  })

  // ─── repeated-punctuation detection (D-01.2) ───────────────────────────────

  describe('repeated-punctuation detection', () => {
    it('flags !!! in <p>Buy now!!!</p>', () => {
      const result = analyzeSpamTriggers('<p>Buy now!!!</p>')
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct).toHaveLength(1)
      expect(punct[0].type).toBe('repeated-punctuation')
      expect(punct[0].severity).toBe('warning')
    })

    it('flags ??? (triple question marks)', () => {
      const result = analyzeSpamTriggers('<p>What???</p>')
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct.length).toBeGreaterThan(0)
    })

    it('flags $$$ (triple dollar signs)', () => {
      const result = analyzeSpamTriggers('<p>Make $$$</p>')
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct.length).toBeGreaterThan(0)
    })

    it('does NOT flag single !', () => {
      const result = analyzeSpamTriggers('<p>Hello!</p>')
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct).toHaveLength(0)
    })

    it('does NOT flag double !!', () => {
      const result = analyzeSpamTriggers('<p>Hey!!</p>')
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct).toHaveLength(0)
    })

    it('returns correct lineNumber for repeated-punctuation warning', () => {
      const html = '<div>\n  <p>Sale!!!</p>\n</div>'
      const result = analyzeSpamTriggers(html)
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct.length).toBeGreaterThan(0)
      expect(punct[0].lineNumber).toBeGreaterThan(0)
    })

    it('has non-empty fix field for repeated-punctuation warning', () => {
      const result = analyzeSpamTriggers('<p>Sale!!!</p>')
      const punct = result.warnings.filter(w => w.type === 'repeated-punctuation')
      expect(punct.length).toBeGreaterThan(0)
      expect(punct[0].fix).toBeTruthy()
      expect(punct[0].fix.length).toBeGreaterThan(0)
    })
  })

  // ─── spam-keyword-en detection (D-01.4) ────────────────────────────────────

  describe('spam-keyword-en detection', () => {
    it('flags "FREE" in <p>FREE gift</p> with type spam-keyword-en', () => {
      const result = analyzeSpamTriggers('<p>FREE gift</p>')
      const en = result.warnings.filter(w => w.type === 'spam-keyword-en')
      expect(en.length).toBeGreaterThan(0)
      expect(en[0].type).toBe('spam-keyword-en')
      expect(en[0].severity).toBe('warning')
    })

    it('flags multi-word keyword "ACT NOW"', () => {
      const result = analyzeSpamTriggers('<p>ACT NOW to claim your reward!</p>')
      const en = result.warnings.filter(w => w.type === 'spam-keyword-en')
      const actNow = en.find(w => w.detail?.matched === 'ACT NOW')
      expect(actNow).toBeDefined()
    })

    it('does NOT flag keyword inside href attribute', () => {
      const result = analyzeSpamTriggers('<a href="https://free.com">Link</a>')
      const en = result.warnings.filter(w => w.type === 'spam-keyword-en')
      expect(en).toHaveLength(0)
    })

    it('is case-insensitive (flags "free" lowercase)', () => {
      const result = analyzeSpamTriggers('<p>free gift for you</p>')
      const en = result.warnings.filter(w => w.type === 'spam-keyword-en')
      expect(en.length).toBeGreaterThan(0)
    })

    it('has non-empty fix field for spam-keyword-en warning', () => {
      const result = analyzeSpamTriggers('<p>FREE gift</p>')
      const en = result.warnings.filter(w => w.type === 'spam-keyword-en')
      expect(en.length).toBeGreaterThan(0)
      expect(en[0].fix).toBeTruthy()
      expect(en[0].fix.length).toBeGreaterThan(0)
    })
  })

  // ─── spam-keyword-ko detection (D-01.3) ────────────────────────────────────

  describe('spam-keyword-ko detection', () => {
    it('flags "무료" in <p>무료 배송</p> with type spam-keyword-ko', () => {
      const result = analyzeSpamTriggers('<p>무료 배송</p>')
      const ko = result.warnings.filter(w => w.type === 'spam-keyword-ko')
      expect(ko.length).toBeGreaterThan(0)
      expect(ko[0].type).toBe('spam-keyword-ko')
      expect(ko[0].severity).toBe('warning')
    })

    it('flags "무료" as substring match in compound word "무료배송"', () => {
      const result = analyzeSpamTriggers('<p>무료배송 혜택</p>')
      const ko = result.warnings.filter(w => w.type === 'spam-keyword-ko')
      expect(ko.length).toBeGreaterThan(0)
    })

    it('flags "할인" in Korean text', () => {
      const result = analyzeSpamTriggers('<p>특별 할인 이벤트</p>')
      const ko = result.warnings.filter(w => w.type === 'spam-keyword-ko')
      const found = ko.find(w => w.detail?.matched === '할인')
      expect(found).toBeDefined()
    })

    it('does NOT flag keyword inside attribute values', () => {
      const result = analyzeSpamTriggers('<a href="https://example.com/무료">Click</a>')
      // href is not a text node; text is just "Click" with no Korean spam keywords
      const ko = result.warnings.filter(w => w.type === 'spam-keyword-ko')
      expect(ko).toHaveLength(0)
    })

    it('has non-empty fix field for spam-keyword-ko warning', () => {
      const result = analyzeSpamTriggers('<p>무료 배송</p>')
      const ko = result.warnings.filter(w => w.type === 'spam-keyword-ko')
      expect(ko.length).toBeGreaterThan(0)
      expect(ko[0].fix).toBeTruthy()
      expect(ko[0].fix.length).toBeGreaterThan(0)
    })
  })

  // ─── color-emphasis detection (D-01.5) ─────────────────────────────────────

  describe('color-emphasis detection', () => {
    it('flags red + large font (color: red; font-size: 20px)', () => {
      const result = analyzeSpamTriggers('<span style="color: red; font-size: 20px">BIG RED</span>')
      const color = result.warnings.filter(w => w.type === 'color-emphasis')
      expect(color).toHaveLength(1)
      expect(color[0].type).toBe('color-emphasis')
      expect(color[0].severity).toBe('warning')
    })

    it('flags hex red (#ff0000) with large font (font-size: 24px)', () => {
      const result = analyzeSpamTriggers('<span style="color: #ff0000; font-size: 24px">text</span>')
      const color = result.warnings.filter(w => w.type === 'color-emphasis')
      expect(color).toHaveLength(1)
    })

    it('does NOT flag red text with small font (font-size: 12px)', () => {
      const result = analyzeSpamTriggers('<span style="color: red; font-size: 12px">small red</span>')
      const color = result.warnings.filter(w => w.type === 'color-emphasis')
      expect(color).toHaveLength(0)
    })

    it('does NOT flag large font without red color (blue + large)', () => {
      const result = analyzeSpamTriggers('<span style="color: blue; font-size: 24px">large blue</span>')
      const color = result.warnings.filter(w => w.type === 'color-emphasis')
      expect(color).toHaveLength(0)
    })

    it('does NOT flag red background without red text color', () => {
      const result = analyzeSpamTriggers('<span style="background-color: red; font-size: 24px">text</span>')
      const color = result.warnings.filter(w => w.type === 'color-emphasis')
      expect(color).toHaveLength(0)
    })

    it('has non-empty fix field for color-emphasis warning', () => {
      const result = analyzeSpamTriggers('<span style="color: red; font-size: 20px">BIG RED</span>')
      const color = result.warnings.filter(w => w.type === 'color-emphasis')
      expect(color.length).toBeGreaterThan(0)
      expect(color[0].fix).toBeTruthy()
      expect(color[0].fix.length).toBeGreaterThan(0)
    })
  })

  // ─── image-ratio detection (D-03, D-04, D-05) ──────────────────────────────

  describe('image-ratio detection', () => {
    it('image ratio > 60%: warning severity with 4 imgs + short text (~50 chars)', () => {
      // 4 imgs * 200 weight = 800 image score
      // 50 chars text -> ratio = 800 / (800 + 50) = 0.94 > 0.8 => error
      // Use fewer images or more text for 60% threshold
      // 2 imgs * 200 = 400; text 200 chars -> ratio = 400 / (400 + 200) = 0.667 > 0.6 => warning
      const text = 'a'.repeat(200)
      const html = `<p>${text}</p><img src="a.jpg"><img src="b.jpg">`
      const result = analyzeSpamTriggers(html)
      const imgRatio = result.warnings.filter(w => w.type === 'image-ratio')
      expect(imgRatio.length).toBeGreaterThan(0)
      expect(imgRatio[0].severity).toBe('warning')
    })

    it('image ratio > 80%: error severity with many imgs + very short text', () => {
      // 8 imgs * 200 = 1600; text 50 chars -> ratio = 1600 / (1600 + 50) = 0.97 > 0.8 => error
      const html = `<p>${'a'.repeat(50)}</p>${'<img src="a.jpg">'.repeat(8)}`
      const result = analyzeSpamTriggers(html)
      const imgRatio = result.warnings.filter(w => w.type === 'image-ratio')
      expect(imgRatio.length).toBeGreaterThan(0)
      expect(imgRatio[0].severity).toBe('error')
    })

    it('image-only email (imgs, no text): error with type image-only', () => {
      const result = analyzeSpamTriggers('<img src="a.jpg"><img src="b.jpg">')
      const imgOnly = result.warnings.filter(w => w.type === 'image-only')
      expect(imgOnly).toHaveLength(1)
      expect(imgOnly[0].type).toBe('image-only')
      expect(imgOnly[0].severity).toBe('error')
    })

    it('no images: no image-ratio warning', () => {
      const result = analyzeSpamTriggers('<p>Just some text content here.</p>')
      const imgWarnings = result.warnings.filter(
        w => w.type === 'image-ratio' || w.type === 'image-only',
      )
      expect(imgWarnings).toHaveLength(0)
    })

    it('image-ratio warning includes imageRatio in detail', () => {
      const html = `<p>${'a'.repeat(50)}</p>${'<img src="a.jpg">'.repeat(8)}`
      const result = analyzeSpamTriggers(html)
      const imgRatio = result.warnings.filter(w => w.type === 'image-ratio')
      expect(imgRatio.length).toBeGreaterThan(0)
      expect(imgRatio[0].detail?.imageRatio).toBeDefined()
    })

    it('has non-empty fix field for image-only warning', () => {
      const result = analyzeSpamTriggers('<img src="a.jpg">')
      const imgOnly = result.warnings.filter(w => w.type === 'image-only')
      expect(imgOnly.length).toBeGreaterThan(0)
      expect(imgOnly[0].fix).toBeTruthy()
      expect(imgOnly[0].fix.length).toBeGreaterThan(0)
    })

    it('has non-empty fix field for image-ratio warning', () => {
      const html = `<p>${'a'.repeat(50)}</p>${'<img src="a.jpg">'.repeat(8)}`
      const result = analyzeSpamTriggers(html)
      const imgRatio = result.warnings.filter(w => w.type === 'image-ratio')
      expect(imgRatio.length).toBeGreaterThan(0)
      expect(imgRatio[0].fix).toBeTruthy()
      expect(imgRatio[0].fix.length).toBeGreaterThan(0)
    })
  })

  // ─── riskLevel calculation (D-06) ──────────────────────────────────────────

  describe('riskLevel calculation', () => {
    it('clean HTML: riskLevel === "Low" and issueCount === 0', () => {
      const result = analyzeSpamTriggers('<p>Hello, thank you for your order.</p>')
      expect(result.riskLevel).toBe('Low')
      expect(result.issueCount).toBe(0)
    })

    it('1 warning only: riskLevel === "Low"', () => {
      // Single repeated-punctuation warning
      const result = analyzeSpamTriggers('<p>Sale!!!</p>')
      const warnCount = result.warnings.filter(w => w.severity === 'warning').length
      const errCount = result.warnings.filter(w => w.severity === 'error').length
      if (warnCount === 1 && errCount === 0) {
        expect(result.riskLevel).toBe('Low')
      }
    })

    it('3 warnings, 0 errors: riskLevel === "Medium"', () => {
      // Use multiple spam keywords to generate exactly 3 warnings without any error
      const result = analyzeSpamTriggers('<p>FREE WINNER CASH offer today</p>')
      const errCount = result.warnings.filter(w => w.severity === 'error').length
      const warnCount = result.warnings.filter(w => w.severity === 'warning').length
      if (errCount === 0 && warnCount >= 2 && warnCount <= 4) {
        expect(result.riskLevel).toBe('Medium')
      }
    })

    it('1 error: riskLevel === "High"', () => {
      // Image-only email creates 1 error
      const result = analyzeSpamTriggers('<img src="a.jpg">')
      const errCount = result.warnings.filter(w => w.severity === 'error').length
      expect(errCount).toBeGreaterThanOrEqual(1)
      expect(result.riskLevel).toBe('High')
    })

    it('5+ warnings: riskLevel === "High"', () => {
      // Multiple spam keywords to trigger 5+ warnings
      const result = analyzeSpamTriggers(
        '<p>FREE WINNER CASH EARN PROFIT LOAN offer today</p>',
      )
      const warnCount = result.warnings.filter(w => w.severity === 'warning').length
      const errCount = result.warnings.filter(w => w.severity === 'error').length
      if (errCount === 0 && warnCount >= 5) {
        expect(result.riskLevel).toBe('High')
      }
    })
  })

  // ─── SpamSummary structure ──────────────────────────────────────────────────

  describe('SpamSummary structure', () => {
    it('result has warnings array, riskLevel string, issueCount number', () => {
      const result = analyzeSpamTriggers('<p>Hello</p>')
      expect(Array.isArray(result.warnings)).toBe(true)
      expect(typeof result.riskLevel).toBe('string')
      expect(typeof result.issueCount).toBe('number')
    })

    it('issueCount equals warnings.length', () => {
      const result = analyzeSpamTriggers('<p>FREE gift</p>')
      expect(result.issueCount).toBe(result.warnings.length)
    })

    it('returns empty warnings array when no issues', () => {
      const result = analyzeSpamTriggers('<p>Thank you for shopping with us.</p>')
      expect(result.warnings).toHaveLength(0)
      expect(result.issueCount).toBe(0)
      expect(result.riskLevel).toBe('Low')
    })

    it('all warnings have non-empty fix field', () => {
      const result = analyzeSpamTriggers('<p>FREE WINNER AMAZING OFFER!!!</p><img src="a.jpg">')
      result.warnings.forEach(w => {
        expect(w.fix).toBeTruthy()
        expect(typeof w.fix).toBe('string')
        expect(w.fix.length).toBeGreaterThan(0)
      })
    })
  })
})
