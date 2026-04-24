'use client'

import { useMemo, useState } from 'react'
import { analyzeCssCompatibility, type CssWarning } from '@/lib/engine/analyzeCssCompatibility'
import type { ClientRuleset } from '@/lib/rulesets/types'
import { useDebounce } from './useDebounce'

interface WarningPanelProps {
  html: string
  clients: { name: string; ruleset: ClientRuleset }[]
}

export default function WarningPanel({ html, clients }: WarningPanelProps) {
  const debouncedHtml = useDebounce(html, 300)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const warnings = useMemo(
    () => analyzeCssCompatibility(debouncedHtml, clients),
    [debouncedHtml, clients]
  )

  const errorCount = warnings.filter(w => w.severity === 'error').length
  const warningCount = warnings.filter(w => w.severity === 'warning').length

  return (
    <div className="border-t border-zinc-700 bg-zinc-900">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full h-8 px-4 text-xs hover:bg-zinc-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">
            {collapsed ? '▶' : '▼'} CSS 호환성
          </span>
          {errorCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-900 text-red-300">
              {errorCount} errors
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-900 text-amber-300">
              {warningCount} warnings
            </span>
          )}
          {warnings.length === 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-900 text-green-300">
              모든 클라이언트 호환
            </span>
          )}
        </div>
        <span className="text-zinc-500 text-[10px]">
          {warnings.length} issues
        </span>
      </button>
      {!collapsed && warnings.length > 0 && (
        <div className="max-h-52 overflow-y-auto px-4 pb-2">
          {warnings.map((w, i) => (
            <WarningRow
              key={i}
              warning={w}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function WarningRow({ warning, expanded, onToggle }: {
  warning: CssWarning
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-t border-zinc-800">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 w-full py-1.5 text-xs text-left hover:bg-zinc-800/50"
      >
        <span className={`px-1 py-0.5 rounded text-[10px] flex-shrink-0 ${
          warning.severity === 'error'
            ? 'bg-red-900/50 text-red-400'
            : 'bg-amber-900/50 text-amber-400'
        }`}>
          {warning.severity === 'error' ? '✕' : '⚠'}
        </span>
        <span className="text-zinc-400 flex-shrink-0 w-28">{warning.client}</span>
        <span className="text-zinc-300 flex-1 truncate">{warning.impact}</span>
        <span className="text-zinc-600 flex-shrink-0">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="ml-10 mb-2 pl-3 border-l-2 border-zinc-700">
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">영향:</span> {warning.impact}
          </div>
          <div className="text-[11px] text-green-400">
            <span className="text-zinc-500">해결:</span> {warning.fix}
          </div>
        </div>
      )}
    </div>
  )
}
