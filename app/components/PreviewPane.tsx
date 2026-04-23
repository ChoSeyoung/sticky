'use client'

import { useMemo, useState } from 'react'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import type { ClientRuleset } from '@/lib/rulesets/types'
import { useDebounce } from './useDebounce'

type Viewport = 'desktop' | 'mobile'

interface PreviewPaneProps {
  html: string
  clientName: string
  ruleset: ClientRuleset
}

export default function PreviewPane({ html, clientName, ruleset }: PreviewPaneProps) {
  const debouncedHtml = useDebounce(html, 300)
  const [viewport, setViewport] = useState<Viewport>('desktop')

  const simulatedHtml = useMemo(
    () => applyClientRules(debouncedHtml, ruleset),
    [debouncedHtml, ruleset]
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between h-8 px-3 bg-zinc-100 border-b border-zinc-200">
        <span className="text-xs font-medium text-zinc-500">{clientName}</span>
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
      </div>
      <div className="flex-1 overflow-auto bg-zinc-50 flex justify-center">
        <iframe
          srcDoc={simulatedHtml}
          sandbox="allow-same-origin"
          className="border-0 bg-white h-full"
          style={{ width: viewport === 'desktop' ? '600px' : '375px' }}
          title={`${clientName} Preview`}
        />
      </div>
    </div>
  )
}
