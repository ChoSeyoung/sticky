'use client'

import { useState, useEffect, useLayoutEffect, RefObject } from 'react'

// ── localStorage helpers (exported for unit testing) ──────────────────────

export const ONBOARDING_KEY = 'sticky:onboardingCompleted'

export function getInitialVisibility(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true'
  } catch {
    return true
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  } catch {
    /* ignore — best-effort persistence */
  }
}

// ── Types ────────────────────────────────────────────────────────────────

export interface OnboardingStep {
  targetRef: RefObject<HTMLElement | null>
  title: string
  description: string
  placement: 'bottom' | 'right' | 'top'
}

export interface OnboardingOverlayProps {
  steps: OnboardingStep[]
  onComplete: () => void
  onSkip: () => void
}

// ── Component ─────────────────────────────────────────────────────────────

export default function OnboardingOverlay({ steps, onComplete, onSkip }: OnboardingOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const isLast = stepIndex === steps.length - 1

  // Escape key dismisses overlay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onSkip])

  // Measure target element position (sync to avoid flicker)
  useLayoutEffect(() => {
    const target = steps[stepIndex]?.targetRef.current
    if (!target) {
      setRect(null)
      return
    }
    setRect(target.getBoundingClientRect())
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [stepIndex, steps])

  // Re-measure on resize
  useEffect(() => {
    const handleResize = () => {
      const target = steps[stepIndex]?.targetRef.current
      if (target) setRect(target.getBoundingClientRect())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [stepIndex, steps])

  if (!rect) return null

  const popoverLeft = typeof window !== 'undefined'
    ? Math.min(Math.max(8, rect.left), window.innerWidth - 296)
    : rect.left

  return (
    <div
      className="fixed inset-0 z-[60] pointer-events-none"
      role="dialog"
      aria-label="온보딩 가이드"
    >
      {/* Highlight cutout — box-shadow creates dimmed backdrop with transparent cutout */}
      <div
        className="absolute rounded pointer-events-none"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
        }}
      />

      {/* Popover card */}
      <div
        className="absolute pointer-events-auto bg-zinc-900 text-white rounded-lg shadow-xl p-4 w-72 border border-zinc-700"
        style={{
          top: rect.bottom + 12,
          left: popoverLeft,
        }}
      >
        <p className="text-xs text-blue-400 mb-1">{stepIndex + 1} / {steps.length}</p>
        <p className="text-sm font-semibold mb-1">{steps[stepIndex].title}</p>
        <p className="text-xs text-zinc-300 leading-relaxed mb-3">{steps[stepIndex].description}</p>

        <div className="flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            건너뛰기
          </button>
          <button
            onClick={() => isLast ? onComplete() : setStepIndex(i => i + 1)}
            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white"
          >
            {isLast ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
