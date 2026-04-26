import * as cheerio from 'cheerio'
import { SPAM_KEYWORDS_EN, SPAM_KEYWORDS_KO } from './spamKeywords'

export interface SpamWarning {
  type:
    | 'excessive-caps'
    | 'repeated-punctuation'
    | 'spam-keyword-en'
    | 'spam-keyword-ko'
    | 'color-emphasis'
    | 'image-ratio'
    | 'image-only'
  severity: 'error' | 'warning'
  message: string
  lineNumber: number
  detail?: {
    matched?: string
    capsRatio?: number
    imageRatio?: number
  }
  fix: string
}

export interface SpamSummary {
  warnings: SpamWarning[]
  riskLevel: 'Low' | 'Medium' | 'High'
  issueCount: number
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
 * Extract a single CSS property value from an inline style string.
 * E.g. extractCssValue("color: red; font-size: 20px", "color") => "red"
 * Returns null if property not found.
 */
function extractCssValue(style: string, prop: string): string | null {
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
 * Returns true if the CSS color value is red or a red-ish variant.
 * Supports: named "red", hex variants like #ff0000, #f00, #FF0000,
 * and rgb() format with high red and low green/blue.
 */
function isRedColor(value: string): boolean {
  const v = value.trim().toLowerCase()

  // Named red
  if (v === 'red') return true

  // #RGB shorthand where R is f and G/B are 0
  const hex3 = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i)
  if (hex3) {
    const r = parseInt(hex3[1] + hex3[1], 16)
    const g = parseInt(hex3[2] + hex3[2], 16)
    const b = parseInt(hex3[3] + hex3[3], 16)
    return r >= 200 && g < 80 && b < 80
  }

  // #RRGGBB — high red, low green and blue
  const hex6 = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (hex6) {
    const r = parseInt(hex6[1], 16)
    const g = parseInt(hex6[2], 16)
    const b = parseInt(hex6[3], 16)
    return r >= 200 && g < 80 && b < 80
  }

  // rgb(r, g, b) — high red, low green and blue
  const rgb = v.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgb) {
    const r = parseInt(rgb[1], 10)
    const g = parseInt(rgb[2], 10)
    const b = parseInt(rgb[3], 10)
    return r >= 200 && g < 80 && b < 80
  }

  return false
}

/**
 * Analyzes HTML email content for spam trigger patterns.
 *
 * Detects:
 * 1. Excessive caps — 4+ letter English words with 70%+ uppercase
 * 2. Repeated punctuation — 3+ consecutive !?$
 * 3. English spam keywords from SPAM_KEYWORDS_EN
 * 4. Korean spam keywords from SPAM_KEYWORDS_KO
 * 5. Color emphasis — red foreground color + font-size >= 16px
 * 6. Image/text ratio — warning at 60%+, error at 80%+
 * 7. Image-only emails with no text
 *
 * Returns SpamSummary with warnings, riskLevel (Low/Medium/High), and issueCount.
 */
export function analyzeSpamTriggers(html: string): SpamSummary {
  // @ts-expect-error — decodeEntities is a valid htmlparser2 option but not in CheerioOptions type
  const $ = cheerio.load(html, { decodeEntities: false })
  const warnings: SpamWarning[] = []

  // Extract body text (avoids matching keywords in attributes/URLs)
  const bodyText = $('body').text()

  // ─── 1. Excessive caps detection (D-01.1) ────────────────────────────────
  // Match words with 5+ alpha letters to exclude short acronyms (HTML, URL, CSS, OK, ID, etc.)
  // Plan behavior: "HTML is OK" -> no warning (2-3 letter uppercase words excluded — HTML at 4 is borderline, use 5+ to be safe)
  const words = bodyText.match(/[a-zA-Z]{5,}/g) ?? []
  const seenCapsWords = new Set<string>()
  for (const word of words) {
    if (seenCapsWords.has(word)) continue
    const alphaChars = word.replace(/[^a-zA-Z]/g, '')
    const upperCount = (alphaChars.match(/[A-Z]/g) ?? []).length
    const ratio = upperCount / alphaChars.length
    if (ratio >= 0.7) {
      seenCapsWords.add(word)
      warnings.push({
        type: 'excessive-caps',
        severity: 'warning',
        message: `과도한 대문자 사용이 감지되었습니다: "${word}"`,
        lineNumber: lineOf(html, word),
        detail: { capsRatio: Math.round(ratio * 100) / 100 },
        fix: '대문자 사용을 줄이세요. 제목이나 강조에만 대문자를 사용하는 것이 좋습니다.',
      })
    }
  }

  // ─── 2. Repeated punctuation detection (D-01.2) ──────────────────────────
  const punctMatches = bodyText.match(/([!?$]{3,})/g) ?? []
  const seenPunct = new Set<string>()
  for (const match of punctMatches) {
    if (seenPunct.has(match)) continue
    seenPunct.add(match)
    warnings.push({
      type: 'repeated-punctuation',
      severity: 'warning',
      message: `반복된 특수문자가 감지되었습니다: "${match}"`,
      lineNumber: lineOf(html, match),
      fix: '반복된 특수문자를 줄이세요. 감탄부호는 하나만 사용하는 것이 좋습니다.',
    })
  }

  // ─── 3. English spam keywords detection (D-01.4) ─────────────────────────
  const bodyTextUpper = bodyText.toUpperCase()
  for (const keyword of SPAM_KEYWORDS_EN) {
    if (bodyTextUpper.includes(keyword)) {
      warnings.push({
        type: 'spam-keyword-en',
        severity: 'warning',
        message: `스팸 키워드가 감지되었습니다: "${keyword}"`,
        lineNumber: lineOf(html, keyword) || lineOf(html, keyword.toLowerCase()),
        detail: { matched: keyword },
        fix: `스팸 필터에 걸릴 수 있는 단어입니다. "${keyword}" 대신 다른 표현을 사용해 보세요.`,
      })
    }
  }

  // ─── 4. Korean spam keywords detection (D-01.3) ──────────────────────────
  for (const keyword of SPAM_KEYWORDS_KO) {
    if (bodyText.includes(keyword)) {
      warnings.push({
        type: 'spam-keyword-ko',
        severity: 'warning',
        message: `스팸 키워드가 감지되었습니다: "${keyword}"`,
        lineNumber: lineOf(html, keyword),
        detail: { matched: keyword },
        fix: `스팸 필터에 걸릴 수 있는 단어입니다. "${keyword}" 사용을 줄이거나 다른 표현으로 바꿔 보세요.`,
      })
    }
  }

  // ─── 5. Color emphasis detection (D-01.5) ────────────────────────────────
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const colorValue = extractCssValue(style, 'color')
    const fontSizeValue = extractCssValue(style, 'font-size')

    if (!colorValue || !fontSizeValue) return

    const isRed = isRedColor(colorValue)
    const fontSizeMatch = fontSizeValue.match(/^(\d+(?:\.\d+)?)px$/i)
    const fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 0

    if (isRed && fontSize >= 16) {
      const tagHtml = $.html(el)
      warnings.push({
        type: 'color-emphasis',
        severity: 'warning',
        message: '빨간색 대형 텍스트는 스팸으로 인식될 수 있습니다',
        lineNumber: lineOf(html, tagHtml),
        fix: '빨간 대형 텍스트는 스팸으로 인식될 수 있습니다. 색상이나 크기를 조절해 보세요.',
      })
    }
  })

  // ─── 6 & 7. Image/text ratio detection (D-03, D-04, D-05) ───────────────
  const imgCount = $('img').length
  const textLength = bodyText.replace(/\s+/g, ' ').trim().length

  if (imgCount > 0) {
    if (textLength === 0) {
      // Image-only email — no text at all (D-05)
      warnings.push({
        type: 'image-only',
        severity: 'error',
        message: '이미지만으로 구성된 이메일입니다. 텍스트 콘텐츠가 없습니다.',
        lineNumber: lineOf(html, '<img'),
        fix: '이미지만으로 구성된 이메일은 스팸으로 분류될 가능성이 높습니다. 텍스트 콘텐츠를 추가하세요.',
      })
    } else {
      // Calculate image/text ratio using weighted formula
      const IMAGE_WEIGHT = 200
      const imageScore = imgCount * IMAGE_WEIGHT
      const ratio = imageScore / (imageScore + textLength)

      if (ratio >= 0.8) {
        warnings.push({
          type: 'image-ratio',
          severity: 'error',
          message: `이미지 비율이 너무 높습니다 (${Math.round(ratio * 100)}%)`,
          lineNumber: lineOf(html, '<img'),
          detail: { imageRatio: Math.round(ratio * 100) / 100 },
          fix: '이미지 비율이 너무 높습니다. 텍스트 콘텐츠를 추가하여 이미지:텍스트 비율을 40:60으로 맞추세요.',
        })
      } else if (ratio >= 0.6) {
        warnings.push({
          type: 'image-ratio',
          severity: 'warning',
          message: `이미지 비율이 높습니다 (${Math.round(ratio * 100)}%)`,
          lineNumber: lineOf(html, '<img'),
          detail: { imageRatio: Math.round(ratio * 100) / 100 },
          fix: '이미지 비율이 높습니다. 텍스트 콘텐츠를 추가하여 이미지:텍스트 비율을 40:60으로 맞추세요.',
        })
      }
    }
  }

  // ─── Risk level calculation (D-06) ───────────────────────────────────────
  const errorCount = warnings.filter(w => w.severity === 'error').length
  const warningCount = warnings.filter(w => w.severity === 'warning').length
  const riskLevel: 'Low' | 'Medium' | 'High' =
    errorCount >= 1 || warningCount >= 5 ? 'High' : warningCount >= 2 ? 'Medium' : 'Low'

  return { warnings, riskLevel, issueCount: warnings.length }
}
