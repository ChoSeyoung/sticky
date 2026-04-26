'use client'

import { useState, useCallback, useRef, useEffect, type DragEvent, type ChangeEvent, type MouseEvent as ReactMouseEvent } from 'react'
import dynamic from 'next/dynamic'
import { getInitialVisibility, markOnboardingComplete, clearOnboardingComplete } from '@/app/components/OnboardingOverlay'
import { inlineCss } from '@/lib/engine/inlineCss'
import { naverRuleset } from '@/lib/rulesets/naver'
import { gmailRuleset } from '@/lib/rulesets/gmail'
import { daumRuleset } from '@/lib/rulesets/daum'
import { outlookClassicRuleset } from '@/lib/rulesets/outlook-classic'
import { outlookNewRuleset } from '@/lib/rulesets/outlook-new'

const HtmlEditor = dynamic(() => import('@/app/components/HtmlEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-zinc-900 text-zinc-500">
      Loading editor...
    </div>
  ),
})

const PreviewPane = dynamic(() => import('@/app/components/PreviewPane'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-white text-zinc-400">
      Loading preview...
    </div>
  ),
})

const WarningPanel = dynamic(() => import('@/app/components/WarningPanel'), {
  ssr: false,
})

const AdBanner = dynamic(() => import('@/app/components/AdBanner'), {
  ssr: false,
})

const SendEmailModal = dynamic(() => import('@/app/components/SendEmailModal'), {
  ssr: false,
})

const OnboardingOverlay = dynamic(
  () => import('@/app/components/OnboardingOverlay'),
  { ssr: false }
)

const CLIENTS = [
  { name: 'Naver', ruleset: naverRuleset },
  { name: 'Gmail', ruleset: gmailRuleset },
  { name: 'Outlook Classic', ruleset: outlookClassicRuleset },
  { name: 'Outlook New', ruleset: outlookNewRuleset },
  { name: 'Daum/Kakao', ruleset: daumRuleset },
] as const

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #2c3e50; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header p { color: #bdc3c7; margin: 5px 0 0; font-size: 14px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #2c3e50; font-size: 20px; margin-top: 0; }
    .content p { color: #555555; font-size: 14px; line-height: 1.6; }
    .highlight { background-color: #f9f9f9; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 14px; }
    .features { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .features td { padding: 12px 15px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: #333333; }
    .features td:first-child { font-weight: bold; width: 40%; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold; }
    .badge-new { background-color: #e8f5e9; color: #2e7d32; }
    .badge-beta { background-color: #fff3e0; color: #e65100; }
    .footer { background-color: #ecf0f1; padding: 20px; text-align: center; }
    .footer p { color: #95a5a6; font-size: 12px; margin: 0; line-height: 1.5; }
    .footer a { color: #3498db; text-decoration: underline; }
    .social-links { margin: 10px 0; }
    .social-links a { display: inline-block; margin: 0 8px; color: #7f8c8d; text-decoration: none; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <h1>Sticky Newsletter</h1>
      <p>HTML Email Preview Tool &mdash; Monthly Update</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <h2>What&rsquo;s New This Month</h2>
      <p>안녕하세요! Sticky의 새로운 기능을 소개합니다. 이메일 클라이언트별 렌더링 차이를 한눈에 확인해보세요.</p>

      <div class="highlight">
        <strong>Pro Tip:</strong> 네이버 메일은 &lt;style&gt; 블록을 완전히 제거합니다. 중요한 스타일은 반드시 inline으로 작성하세요.
      </div>

      <p style="margin: 10px 0; padding: 5px; font-family: Georgia, serif;">
        이 문단은 <code>margin</code>, <code>padding</code>, <code>font-family</code>가 inline으로 설정되어 있습니다.
        네이버에서는 이 속성들이 제거됩니다.
      </p>

      <!-- Feature Table -->
      <table class="features">
        <tr>
          <td>네이버 메일</td>
          <td>&lt;style&gt; 블록 제거, margin/padding/font-family 차단 <span class="badge badge-new">HIGH</span></td>
        </tr>
        <tr>
          <td>Gmail</td>
          <td>조건부 &lt;style&gt; 제거 (background-image url, @import 등 감지 시) <span class="badge badge-new">HIGH</span></td>
        </tr>
        <tr>
          <td>다음/카카오</td>
          <td>script, iframe, object, embed 요소 제거 <span class="badge badge-beta">ESTIMATED</span></td>
        </tr>
      </table>

      <p>아래 버튼을 클릭하면 더 자세한 정보를 확인할 수 있습니다:</p>
      <p style="text-align: center;">
        <a href="https://example.com" class="btn">자세히 보기</a>
      </p>

      <!-- Image placeholder -->
      <p style="text-align: center; margin: 20px 0;">
        <img src="https://via.placeholder.com/560x200/3498db/ffffff?text=Email+Banner+Image" alt="배너 이미지" style="max-width: 100%; height: auto; border-radius: 4px;" />
      </p>

      <h2>코드 샘플</h2>
      <p>다양한 HTML 요소를 테스트해보세요:</p>
      <ul style="color: #555; font-size: 14px; line-height: 1.8;">
        <li><strong>Bold 텍스트</strong>와 <em>Italic 텍스트</em></li>
        <li><a href="https://example.com" style="color: #3498db;">링크 스타일</a></li>
        <li>HTML 엔티티: &amp; &lt; &gt; &quot; &nbsp; &copy; &mdash;</li>
        <li>한글 특수문자: ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ</li>
      </ul>

      <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

      <p style="font-size: 12px; color: #999;">
        이 이메일은 <strong>Sticky</strong>에서 테스트용으로 생성한 예시입니다.<br />
        각 클라이언트별 프리뷰를 비교해보세요.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="social-links">
        <a href="#">GitHub</a>
        <a href="#">Twitter</a>
        <a href="#">Blog</a>
      </div>
      <p>
        &copy; 2026 Sticky &mdash; Korean Email Client Preview Tool<br />
        <a href="#">구독 취소</a> | <a href="#">설정 변경</a>
      </p>
    </div>
  </div>
</body>
</html>`

const GMAIL_LIMIT_KB = 102

function SizeCounter({ html }: { html: string }) {
  const bytes = new TextEncoder().encode(html).length
  const kb = bytes / 1024
  const overLimit = kb > GMAIL_LIMIT_KB
  return (
    <span className={`text-xs font-mono ${overLimit ? 'text-red-400' : 'text-zinc-400'}`}>
      {kb.toFixed(1)}KB{overLimit ? ' ⚠ Gmail 102KB 초과' : ''}
    </span>
  )
}

type LayoutMode = 'split' | 'html' | 'preview'

const ALL_CLIENT_NAMES: string[] = CLIENTS.map((c) => c.name)

function useEnabledClients() {
  const [enabled, setEnabled] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set(ALL_CLIENT_NAMES)
    try {
      const stored = localStorage.getItem('sticky:enabledClients')
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        const valid = parsed.filter((n) => ALL_CLIENT_NAMES.includes(n))
        if (valid.length > 0) return new Set(valid)
      }
    } catch { /* ignore */ }
    return new Set(ALL_CLIENT_NAMES)
  })

  const toggle = useCallback((name: string) => {
    setEnabled((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        if (next.size === 1) return prev
        next.delete(name)
      } else {
        next.add(name)
      }
      localStorage.setItem('sticky:enabledClients', JSON.stringify([...next]))
      return next
    })
  }, [])

  return { enabled, toggle }
}

function useOnboarding() {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return getInitialVisibility()
  })

  const complete = useCallback(() => {
    markOnboardingComplete()
    setVisible(false)
  }, [])

  // skip hides the overlay for this session only — does not persist to localStorage
  const skip = useCallback(() => {
    setVisible(false)
  }, [])

  const restart = useCallback(() => {
    clearOnboardingComplete()  // clear persistence so reload also shows overlay
    setVisible(true)
  }, [])

  return { visible, complete, skip, restart }
}

export default function Home() {
  const [html, setHtml] = useState<string>(DEFAULT_HTML)
  const previousHtmlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split')
  const [splitPercent, setSplitPercent] = useState(45)
  const isDragging = useRef(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const { enabled: enabledClients, toggle: toggleClient } = useEnabledClients()
  const [showSendModal, setShowSendModal] = useState(false)
  const [copyLabel, setCopyLabel] = useState<string>('소스 복사')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorWrapperRef = useRef<HTMLDivElement>(null)
  const previewAreaRef = useRef<HTMLDivElement>(null)
  const clientsBarRef = useRef<HTMLDivElement>(null)
  const { visible: onboardingVisible, complete: onboardingComplete, skip: onboardingSkip, restart: onboardingRestart } = useOnboarding()

  const onboardingSteps = [
    {
      targetRef: editorWrapperRef,
      title: 'HTML 이메일 에디터',
      description: '이곳에 HTML 이메일 코드를 붙여넣거나 직접 작성하세요. 기본으로 예시 템플릿이 로드되어 있습니다.',
      placement: 'bottom' as const,
    },
    {
      targetRef: previewAreaRef,
      title: '클라이언트별 실시간 프리뷰',
      description: '에디터를 수정하면 오른쪽 프리뷰가 즉시 갱신됩니다. 네이버, Gmail, Outlook 등 각 클라이언트의 CSS 제한사항이 다르게 적용됩니다.',
      placement: 'bottom' as const,
    },
    {
      targetRef: clientsBarRef,
      title: '프리뷰할 클라이언트 선택',
      description: '네이버는 style 블록을 제거하고, Gmail은 조건부로 제거하며, Outlook Classic은 Word 엔진을 사용합니다. 원하는 클라이언트만 선택해 비교하세요.',
      placement: 'bottom' as const,
    },
  ]

  const handleDragStart = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    isDragging.current = true
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging.current || !mainRef.current) return
      const rect = mainRef.current.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      setSplitPercent(Math.max(20, Math.min(80, percent)))
    }
    const handleMouseUp = () => { isDragging.current = false }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // WR-04: ensure split layout when onboarding starts so all target refs are mounted
  useEffect(() => {
    if (onboardingVisible && layoutMode !== 'split') setLayoutMode('split')
  }, [onboardingVisible, layoutMode])

  const loadFile = useCallback((file: File) => {
    if (!file.name.match(/\.html?$/i)) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') setHtml(content)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }, [loadFile])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    e.target.value = ''
  }, [loadFile])

  const handleCopyHtml = useCallback(async () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    try {
      await navigator.clipboard.writeText(html)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = html
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyLabel('복사됨!')
    copyTimerRef.current = setTimeout(() => setCopyLabel('소스 복사'), 2000)
  }, [html])

  const handleInlineCss = useCallback(() => {
    previousHtmlRef.current = html
    try {
      const inlined = inlineCss(html)
      setHtml(inlined)
    } catch {
      // juice may fail on malformed HTML — keep original
    }
  }, [html])

  const handleUndoInline = useCallback(() => {
    if (previousHtmlRef.current !== null) {
      setHtml(previousHtmlRef.current)
      previousHtmlRef.current = null
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="sr-only">
        <h1>Sticky — 한국 이메일 클라이언트 프리뷰</h1>
        <p>
          Sticky는 HTML 이메일 코드를 붙여넣으면 네이버 메일, Gmail, 다음/카카오 메일,
          Outlook Classic, Outlook New에서 어떻게 렌더링되는지 실시간으로 확인할 수 있는
          무료 웹 도구입니다. 각 이메일 클라이언트의 고유한 CSS 제한사항을 정확히 시뮬레이션하며,
          한국 이메일 클라이언트(네이버, 다음/카카오)는 caniemail.com에 데이터가 없어
          직접 조사한 규칙셋을 사용합니다.
        </p>
      </div>
      <header className="flex items-center justify-between h-12 px-4 bg-zinc-900 border-b border-zinc-700">
        <h1 className="text-sm font-semibold text-zinc-300">Sticky - HTML Email Preview</h1>
        <div className="flex items-center gap-3">
          {!onboardingVisible && (
            <button
              onClick={onboardingRestart}
              className="px-3 py-1 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              title="온보딩 가이드 다시 보기"
            >
              ?
            </button>
          )}
          <div className="flex items-center gap-1 mr-2 border-r border-zinc-700 pr-3">
            {(['html', 'split', 'preview'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={`px-2 py-0.5 text-xs rounded ${
                  layoutMode === mode
                    ? 'bg-zinc-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'html' ? 'HTML' : mode === 'split' ? 'Split' : 'Preview'}
              </button>
            ))}
          </div>
          <SizeCounter html={html} />
          {previousHtmlRef.current !== null && (
            <button
              onClick={handleUndoInline}
              className="px-3 py-1 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            >
              Undo Inline
            </button>
          )}
          <button
            onClick={handleCopyHtml}
            className={`px-3 py-1 text-xs rounded ${
              copyLabel === '복사됨!'
                ? 'bg-green-700 text-white hover:bg-green-600'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {copyLabel}
          </button>
          <button
            onClick={handleInlineCss}
            className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500"
          >
            Inline CSS
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-500"
          >
            메일 발송
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-xs rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          >
            파일 열기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </header>
      <AdBanner slot="1234567890" />
      <main
        ref={mainRef}
        className="flex flex-1 min-h-0"
        aria-label="이메일 클라이언트 프리뷰 도구"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {layoutMode !== 'preview' && (
          <div
            ref={editorWrapperRef}
            className="flex flex-col flex-shrink-0"
            style={{ width: layoutMode === 'html' ? '100%' : `${splitPercent}%` }}
          >
            <HtmlEditor value={html} onChange={setHtml} />
          </div>
        )}
        {layoutMode === 'split' && (
          <div
            className="w-1 flex-shrink-0 bg-zinc-700 hover:bg-blue-500 cursor-col-resize active:bg-blue-400 transition-colors"
            onMouseDown={handleDragStart}
          />
        )}
        {layoutMode !== 'html' && (
          <div
            ref={previewAreaRef}
            className="flex flex-col flex-1 min-w-0"
            style={{ width: layoutMode === 'preview' ? '100%' : undefined }}
          >
            <div ref={clientsBarRef} className="flex items-center gap-2 h-9 px-3 bg-zinc-50 border-b border-zinc-200 flex-shrink-0">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mr-1">Clients</span>
              {CLIENTS.map((client) => (
                <label
                  key={client.name}
                  className="flex items-center gap-1 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={enabledClients.has(client.name)}
                    onChange={() => toggleClient(client.name)}
                    className="w-3 h-3 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 focus:ring-1 accent-blue-600"
                  />
                  <span className={`text-xs ${enabledClients.has(client.name) ? 'text-zinc-700 font-medium' : 'text-zinc-400'}`}>
                    {client.name}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex flex-row flex-1 min-h-0 overflow-x-auto">
              {CLIENTS.filter((client) => enabledClients.has(client.name)).map((client) => (
                <PreviewPane
                  key={client.name}
                  html={html}
                  clientName={client.name}
                  ruleset={client.ruleset}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <WarningPanel html={html} clients={CLIENTS.filter((c) => enabledClients.has(c.name))} />
      {showSendModal && <SendEmailModal html={html} onClose={() => setShowSendModal(false)} />}
      {onboardingVisible && (
        <OnboardingOverlay
          steps={onboardingSteps}
          onComplete={onboardingComplete}
          onSkip={onboardingSkip}
        />
      )}
      <section className="sr-only" aria-label="자주 묻는 질문">
        <h2>자주 묻는 질문 (FAQ)</h2>

        <article>
          <h3>한국 이메일 클라이언트 미리보기 도구가 있나요?</h3>
          <p>
            Sticky(https://sticky-kappa.vercel.app)는 네이버 메일, 다음/카카오 메일,
            Gmail, Outlook에서 HTML 이메일이 어떻게 보이는지 무료로 미리볼 수 있는
            온라인 도구입니다.
          </p>
        </article>

        <article>
          <h3>네이버 메일에서 HTML 이메일을 테스트하려면 어떻게 하나요?</h3>
          <p>
            Sticky에 HTML 이메일 코드를 붙여넣고 &apos;Naver&apos; 탭을 선택하면 네이버 메일의
            CSS 제한사항이 적용된 실제 렌더링 결과를 확인할 수 있습니다.
          </p>
        </article>

        <article>
          <h3>다음/카카오 메일 이메일 렌더링 테스트 방법은?</h3>
          <p>
            Sticky의 &apos;Daum/Kakao&apos; 탭에서 다음 메일과 카카오 메일의 CSS 렌더링을
            시뮬레이션할 수 있습니다. 한국 이메일 클라이언트 전용 규칙셋이 적용됩니다.
          </p>
        </article>

        <article>
          <h3>이메일 HTML CSS 인라이닝을 자동으로 처리해주나요?</h3>
          <p>
            네. Sticky는 HTML 이메일의 &lt;style&gt; 블록을 자동으로 인라인 스타일로
            변환하여 이메일 클라이언트 호환성을 높입니다.
          </p>
        </article>

        <article>
          <h3>무료로 사용할 수 있나요?</h3>
          <p>
            Sticky는 완전 무료입니다. 회원가입 없이 브라우저에서 바로 사용할 수 있으며,
            모든 처리는 클라이언트 측에서 이루어집니다.
          </p>
        </article>

        <article>
          <h3>Outlook 이메일 렌더링도 테스트할 수 있나요?</h3>
          <p>
            Sticky는 Outlook Classic과 Outlook New 두 버전의 렌더링을 모두 지원합니다.
            각각의 CSS 제한사항과 지원 속성 차이를 시뮬레이션합니다.
          </p>
        </article>
      </section>
    </div>
  )
}
