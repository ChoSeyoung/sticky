import juice from 'juice'

/**
 * Converts <style> block CSS rules into inline style attributes.
 * Preserves media queries and @-rules that cannot be inlined.
 * Returns the transformed HTML string.
 */
export function inlineCss(html: string): string {
  return juice(html, {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    preserveKeyFrames: true,
    preservePseudos: true,
    removeStyleTags: true,
    preserveImportant: true,
  })
}
