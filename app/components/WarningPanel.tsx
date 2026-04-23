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
              OK
            </span>
          )}
        </div>
        <span className="text-zinc-500 text-[10px]">
          {warnings.length} issues
        </span>
      </button>
      {!collapsed && warnings.length > 0 && (
        <div className="max-h-40 overflow-y-auto px-4 pb-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 text-left">
                <th className="py-1 pr-3 font-medium">클라이언트</th>
                <th className="py-1 pr-3 font-medium">속성</th>
                <th className="py-1 pr-3 font-medium">요소</th>
                <th className="py-1 font-medium">유형</th>
              </tr>
            </thead>
            <tbody>
              {warnings.map((w, i) => (
                <WarningRow key={i} warning={w} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function WarningRow({ warning }: { warning: CssWarning }) {
  return (
    <tr className="text-zinc-300 border-t border-zinc-800">
      <td className="py-1 pr-3">{warning.client}</td>
      <td className="py-1 pr-3 font-mono text-[11px]">{warning.property}</td>
      <td className="py-1 pr-3 font-mono text-[11px]">{warning.element}</td>
      <td className="py-1">
        <span className={`px-1 py-0.5 rounded text-[10px] ${
          warning.severity === 'error'
            ? 'bg-red-900/50 text-red-400'
            : 'bg-amber-900/50 text-amber-400'
        }`}>
          {warning.severity}
        </span>
      </td>
    </tr>
  )
}
