'use client'

import { useMemo } from 'react'
import { applyClientRules } from '@/lib/engine/applyClientRules'
import { naverRuleset } from '@/lib/rulesets/naver'
import { useDebounce } from './useDebounce'

interface PreviewPaneProps {
  html: string
}

export default function PreviewPane({ html }: PreviewPaneProps) {
  const debouncedHtml = useDebounce(html, 300)

  const simulatedHtml = useMemo(
    () => applyClientRules(debouncedHtml, naverRuleset),
    [debouncedHtml]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-8 px-3 bg-zinc-100 border-b border-zinc-200">
        <span className="text-xs font-medium text-zinc-500">Naver Mail Preview</span>
      </div>
      <iframe
        srcDoc={simulatedHtml}
        sandbox="allow-same-origin"
        className="w-full flex-1 border-0 bg-white"
        title="Naver Mail Preview"
      />
    </div>
  )
}
