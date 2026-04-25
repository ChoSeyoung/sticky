'use client'

import { useMemo, useState } from 'react'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import type { ClientRuleset } from '@/lib/rulesets/types'
import { useDebounce } from './useDebounce'
import { hasDarkMediaQuery, applyDarkMode } from '@/lib/engine/darkMode'

const CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data: https:;">'
const BASE_TARGET = '<base target="_blank">'

function wrapWithSecurityHeaders(html: string): string {
  const headClose = html.indexOf('</head>')
  if (headClose !== -1) {
    return html.slice(0, headClose) + CSP_META + BASE_TARGET + html.slice(headClose)
  }
  return `<head>${CSP_META}${BASE_TARGET}</head>${html}`
}

type Viewport = 'desktop' | 'mobile'
type ColorMode = 'light' | 'dark'

interface PreviewPaneProps {
  html: string
  clientName: string
  ruleset: ClientRuleset
}

export default function PreviewPane({ html, clientName, ruleset }: PreviewPaneProps) {
  const debouncedHtml = useDebounce(html, 300)
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [colorMode, setColorMode] = useState<ColorMode>('light')

  const simulatedHtml = useMemo(() => {
    const originalHasDarkCss = hasDarkMediaQuery(debouncedHtml)
    const transformed = applyClientRules(debouncedHtml, ruleset)
    const withDark = colorMode === 'dark'
      ? applyDarkMode(transformed, ruleset.darkModeStrategy, originalHasDarkCss)
      : transformed
    return wrapWithSecurityHeaders(withDark)
  }, [debouncedHtml, ruleset, colorMode])

  return (
    <div className="flex flex-col min-w-[420px] h-full flex-shrink-0 border-r border-zinc-200">
      <div className="flex items-center justify-between h-8 px-3 bg-zinc-100 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">{clientName}</span>
          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
            ruleset.confidence === 'estimated'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {ruleset.confidence === 'estimated' ? 'Estimated' : 'High'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 italic">Simulation</span>
          <div className="flex gap-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-2 py-0.5 text-xs rounded ${
              viewport === 'desktop'
                ? 'bg-zinc-300 text-zinc-700'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
            title="Desktop (600px)"
          >
            Desktop
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-2 py-0.5 text-xs rounded ${
              viewport === 'mobile'
                ? 'bg-zinc-300 text-zinc-700'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
            title="Mobile (375px)"
          >
            Mobile
          </button>
          </div>
          <div className="w-px h-4 bg-zinc-300 mx-1" />
          <div className="flex gap-1">
            <button
              onClick={() => setColorMode('light')}
              className={`px-2 py-0.5 text-xs rounded ${
                colorMode === 'light'
                  ? 'bg-zinc-300 text-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
              title="Light mode"
            >
              Light
            </button>
            <button
              onClick={() => setColorMode('dark')}
              className={`px-2 py-0.5 text-xs rounded ${
                colorMode === 'dark'
                  ? 'bg-zinc-700 text-zinc-200'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
              title="Dark mode"
            >
              Dark
            </button>
          </div>
        </div>
      </div>
      <div className={`flex-1 overflow-auto ${colorMode === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'} flex justify-center`}>
        <iframe
          srcDoc={simulatedHtml}
          sandbox="allow-same-origin"
          className={`border-0 h-full ${colorMode === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}
          style={{ width: viewport === 'desktop' ? '600px' : '375px' }}
          title={`${clientName} Preview`}
        />
      </div>
    </div>
  )
}
