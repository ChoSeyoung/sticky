'use client'

import { useMemo, useState } from 'react'
import { analyzeCssCompatibility, type CssWarning } from '@/lib/engine/analyzeCssCompatibility'
import { analyzeLinkProblems, type LinkWarning } from '@/lib/engine/analyzeLinkProblems'
import { analyzeAccessibility, type AccessibilityWarning } from '@/lib/engine/analyzeAccessibility'
import { analyzeSpamTriggers, type SpamWarning } from '@/lib/engine/analyzeSpamTriggers'
import type { ClientRuleset } from '@/lib/rulesets/types'
import { useDebounce } from './useDebounce'

interface WarningPanelProps {
  html: string
  clients: { name: string; ruleset: ClientRuleset }[]
}

const LINK_PROBLEM_LABELS: Record<LinkWarning['problem'], string> = {
  'empty-href': '빈 링크',
  'hash-placeholder': '# 링크',
  'example-domain': '테스트 URL',
  'missing-protocol': '프로토콜 누락',
}

const A11Y_TYPE_LABELS: Record<AccessibilityWarning['type'], string> = {
  'missing-alt': 'alt 누락',
  'low-contrast': '색상 대비',
  'heading-skip': '헤딩 순서',
}

const SPAM_TYPE_LABELS: Record<SpamWarning['type'], string> = {
  'excessive-caps': '대문자 남용',
  'repeated-punctuation': '특수문자 반복',
  'spam-keyword-en': '영어 스팸 키워드',
  'spam-keyword-ko': '한국어 스팸 키워드',
  'color-emphasis': '색상 강조',
  'image-ratio': '이미지 비율',
  'image-only': '이미지 전용',
}

export default function WarningPanel({ html, clients }: WarningPanelProps) {
  const debouncedHtml = useDebounce(html, 300)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedCssIdx, setExpandedCssIdx] = useState<number | null>(null)
  const [expandedLinkIdx, setExpandedLinkIdx] = useState<number | null>(null)
  const [expandedA11yIdx, setExpandedA11yIdx] = useState<number | null>(null)
  const [expandedSpamIdx, setExpandedSpamIdx] = useState<number | null>(null)

  const warnings = useMemo(
    () => analyzeCssCompatibility(debouncedHtml, clients),
    [debouncedHtml, clients]
  )

  const linkWarnings = useMemo(
    () => analyzeLinkProblems(debouncedHtml),
    [debouncedHtml]
  )

  const a11ySummary = useMemo(
    () => analyzeAccessibility(debouncedHtml),
    [debouncedHtml]
  )

  const spamSummary = useMemo(
    () => analyzeSpamTriggers(debouncedHtml),
    [debouncedHtml]
  )

  const errorCount =
    warnings.filter(w => w.severity === 'error').length +
    linkWarnings.filter(w => w.severity === 'error').length +
    a11ySummary.warnings.filter(w => w.severity === 'error').length +
    spamSummary.warnings.filter(w => w.severity === 'error').length
  const warningCount =
    warnings.filter(w => w.severity === 'warning').length +
    linkWarnings.filter(w => w.severity === 'warning').length +
    a11ySummary.warnings.filter(w => w.severity === 'warning').length +
    spamSummary.warnings.filter(w => w.severity === 'warning').length
  const totalIssues = warnings.length + linkWarnings.length + a11ySummary.warnings.length + spamSummary.warnings.length

  return (
    <div className="border-t border-zinc-700 bg-zinc-900">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full h-8 px-4 text-xs hover:bg-zinc-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">
            {collapsed ? '▶' : '▼'} 검수 패널
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
          {totalIssues === 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-900 text-green-300">
              모든 클라이언트 호환
            </span>
          )}
        </div>
        <span className="text-zinc-500 text-[10px]">
          {totalIssues} issues
        </span>
      </button>
      {!collapsed && totalIssues > 0 && (
        <div className="max-h-52 overflow-y-auto px-4 pb-2">
          {warnings.length > 0 && (
            <>
              <div className="flex items-center gap-1 pt-1.5 pb-0.5 text-[10px] text-zinc-500 font-medium">
                <span>🎨</span>
                <span>CSS 호환성</span>
              </div>
              {warnings.map((w, i) => (
                <WarningRow
                  key={i}
                  warning={w}
                  expanded={expandedCssIdx === i}
                  onToggle={() => setExpandedCssIdx(expandedCssIdx === i ? null : i)}
                />
              ))}
            </>
          )}
          {linkWarnings.length > 0 && (
            <>
              <div className="flex items-center gap-1 pt-1.5 pb-0.5 text-[10px] text-zinc-500 font-medium">
                <span>🔗</span>
                <span>링크 검증</span>
              </div>
              {linkWarnings.map((w, i) => (
                <LinkWarningRow
                  key={i}
                  warning={w}
                  expanded={expandedLinkIdx === i}
                  onToggle={() => setExpandedLinkIdx(expandedLinkIdx === i ? null : i)}
                />
              ))}
            </>
          )}
          {a11ySummary.warnings.length > 0 && (
            <>
              <div className="flex items-center gap-1 pt-1.5 pb-0.5 text-[10px] text-zinc-500 font-medium">
                <span>♿</span>
                <span>접근성</span>
                <span className="ml-auto text-zinc-600">
                  통과 {a11ySummary.passCount} / 경고 {a11ySummary.failCount}
                </span>
              </div>
              {a11ySummary.warnings.map((w, i) => (
                <A11yWarningRow
                  key={i}
                  warning={w}
                  expanded={expandedA11yIdx === i}
                  onToggle={() => setExpandedA11yIdx(expandedA11yIdx === i ? null : i)}
                />
              ))}
            </>
          )}
          {spamSummary.warnings.length > 0 && (
            <>
              <div className="flex items-center gap-1 pt-1.5 pb-0.5 text-[10px] text-zinc-500 font-medium">
                <span>📧</span>
                <span>스팸 분석</span>
                <span className={`ml-1 px-1 rounded text-[9px] ${
                  spamSummary.riskLevel === 'High' ? 'bg-red-900 text-red-300' :
                  spamSummary.riskLevel === 'Medium' ? 'bg-amber-900 text-amber-300' :
                  'bg-green-900 text-green-300'
                }`}>{spamSummary.riskLevel}</span>
                <span className="ml-auto text-zinc-600">이슈 {spamSummary.issueCount}</span>
              </div>
              {spamSummary.warnings.map((w, i) => (
                <SpamWarningRow
                  key={i}
                  warning={w}
                  expanded={expandedSpamIdx === i}
                  onToggle={() => setExpandedSpamIdx(expandedSpamIdx === i ? null : i)}
                />
              ))}
            </>
          )}
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

function LinkWarningRow({ warning, expanded, onToggle }: {
  warning: LinkWarning
  expanded: boolean
  onToggle: () => void
}) {
  const displayHref = warning.href || warning.text || '(빈 링크)'
  const problemLabel = LINK_PROBLEM_LABELS[warning.problem]

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
        <span className="text-zinc-400 flex-shrink-0 w-28">{problemLabel}</span>
        <span className="text-zinc-300 flex-1 truncate">{displayHref}</span>
        <span className="text-zinc-500 flex-shrink-0 text-[10px] mr-1">줄 {warning.lineNumber}</span>
        <span className="text-zinc-600 flex-shrink-0">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="ml-10 mb-2 pl-3 border-l-2 border-zinc-700">
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">문제:</span> {warning.message}
          </div>
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">href:</span> {warning.href || '(없음)'}
          </div>
          <div className="text-[11px] text-zinc-400">
            <span className="text-zinc-500">줄:</span> {warning.lineNumber}
          </div>
        </div>
      )}
    </div>
  )
}

function A11yWarningRow({ warning, expanded, onToggle }: {
  warning: AccessibilityWarning
  expanded: boolean
  onToggle: () => void
}) {
  const typeLabel = A11Y_TYPE_LABELS[warning.type]

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
        <span className="text-zinc-400 flex-shrink-0 w-28">{typeLabel}</span>
        <span className="text-zinc-300 flex-1 truncate">{warning.message}</span>
        <span className="text-zinc-500 flex-shrink-0 text-[10px] mr-1">줄 {warning.lineNumber}</span>
        <span className="text-zinc-600 flex-shrink-0">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="ml-10 mb-2 pl-3 border-l-2 border-zinc-700">
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">유형:</span> {typeLabel}
          </div>
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">메시지:</span> {warning.message}
          </div>
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">줄:</span> {warning.lineNumber}
          </div>
          {warning.type === 'low-contrast' && warning.detail && (
            <>
              {warning.detail.fg && (
                <div className="text-[11px] text-zinc-400 mb-1">
                  <span className="text-zinc-500">전경색:</span> {warning.detail.fg}
                </div>
              )}
              {warning.detail.bg && (
                <div className="text-[11px] text-zinc-400 mb-1">
                  <span className="text-zinc-500">배경색:</span> {warning.detail.bg}
                </div>
              )}
              {warning.detail.ratio !== undefined && (
                <div className="text-[11px] text-zinc-400 mb-1">
                  <span className="text-zinc-500">대비비:</span> {warning.detail.ratio}:1 (기준: {warning.detail.required}:1)
                </div>
              )}
            </>
          )}
          {warning.type === 'heading-skip' && warning.detail && (
            <>
              {warning.detail.fromLevel !== undefined && warning.detail.toLevel !== undefined && (
                <div className="text-[11px] text-zinc-400 mb-1">
                  <span className="text-zinc-500">레벨 변화:</span> h{warning.detail.fromLevel} → h{warning.detail.toLevel}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SpamWarningRow({ warning, expanded, onToggle }: {
  warning: SpamWarning
  expanded: boolean
  onToggle: () => void
}) {
  const typeLabel = SPAM_TYPE_LABELS[warning.type]

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
        <span className="text-zinc-400 flex-shrink-0 w-28">{typeLabel}</span>
        <span className="text-zinc-300 flex-1 truncate">{warning.message}</span>
        <span className="text-zinc-500 flex-shrink-0 text-[10px] mr-1">줄 {warning.lineNumber}</span>
        <span className="text-zinc-600 flex-shrink-0">{expanded ? '▼' : '▶'}</span>
      </button>
      {expanded && (
        <div className="ml-10 mb-2 pl-3 border-l-2 border-zinc-700">
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">유형:</span> {typeLabel}
          </div>
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">메시지:</span> {warning.message}
          </div>
          <div className="text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-500">줄:</span> {warning.lineNumber}
          </div>
          {warning.detail?.matched && (
            <div className="text-[11px] text-zinc-400 mb-1">
              <span className="text-zinc-500">탐지:</span> {warning.detail.matched}
            </div>
          )}
          {warning.detail?.imageRatio !== undefined && (
            <div className="text-[11px] text-zinc-400 mb-1">
              <span className="text-zinc-500">이미지 비율:</span> {Math.round(warning.detail.imageRatio * 100)}%
            </div>
          )}
          <div className="text-[11px] text-green-400">
            <span className="text-zinc-500">개선:</span> {warning.fix}
          </div>
        </div>
      )}
    </div>
  )
}
