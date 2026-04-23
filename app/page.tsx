'use client'

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react'
import dynamic from 'next/dynamic'
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

const CLIENTS = [
  { name: 'Naver Mail', ruleset: naverRuleset },
  { name: 'Gmail', ruleset: gmailRuleset },
  { name: 'Outlook Classic', ruleset: outlookClassicRuleset },
  { name: 'Outlook New', ruleset: outlookNewRuleset },
  { name: 'Daum/Kakao Mail', ruleset: daumRuleset },
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

export default function Home() {
  const [html, setHtml] = useState<string>(DEFAULT_HTML)
  const previousHtmlRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      <header className="flex items-center justify-between h-12 px-4 bg-zinc-900 border-b border-zinc-700">
        <h1 className="text-sm font-semibold text-zinc-300">Sticky — HTML Email Preview</h1>
        <div className="flex items-center gap-3">
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
            onClick={handleInlineCss}
            className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500"
          >
            Inline CSS
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
      <main
        className="flex flex-1 min-h-0"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex flex-col w-[45%] min-w-[400px] flex-shrink-0">
          <HtmlEditor value={html} onChange={setHtml} />
        </div>
        <div className="flex flex-row flex-1 min-w-0 overflow-x-auto border-l border-zinc-700">
          {CLIENTS.map((client) => (
            <PreviewPane
              key={client.name}
              html={html}
              clientName={client.name}
              ruleset={client.ruleset}
            />
          ))}
        </div>
      </main>
      <WarningPanel html={html} clients={[...CLIENTS]} />
    </div>
  )
}
