'use client'

import { useMemo } from 'react'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import type { ClientRuleset } from '@/lib/rulesets/types'
import { useDebounce } from './useDebounce'

interface PreviewPaneProps {
  html: string
  clientName: string
  ruleset: ClientRuleset
}

export default function PreviewPane({ html, clientName, ruleset }: PreviewPaneProps) {
  const debouncedHtml = useDebounce(html, 300)

  const simulatedHtml = useMemo(
    () => applyClientRules(debouncedHtml, ruleset),
    [debouncedHtml, ruleset]
  )

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center h-8 px-3 bg-zinc-100 border-b border-zinc-200">
        <span className="text-xs font-medium text-zinc-500">{clientName}</span>
      </div>
      <iframe
        srcDoc={simulatedHtml}
        sandbox="allow-same-origin"
        className="w-full flex-1 border-0 bg-white"
        title={`${clientName} Preview`}
      />
    </div>
  )
}
