'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SmtpConfig {
  host: string
  port: string
  user: string
  pass: string
  from: string
}

const COOKIE_KEY = 'sticky_smtp'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1년

const EMPTY_SMTP: SmtpConfig = { host: '', port: '587', user: '', pass: '', from: '' }

function loadSmtpConfig(): SmtpConfig {
  if (typeof document === 'undefined') return EMPTY_SMTP
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`))
    if (match) return { ...EMPTY_SMTP, ...JSON.parse(decodeURIComponent(match[1])) }
  } catch { /* ignore */ }
  return EMPTY_SMTP
}

function saveSmtpConfig(config: SmtpConfig) {
  const value = encodeURIComponent(JSON.stringify(config))
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`
}

function isSmtpReady(c: SmtpConfig) {
  return !!(c.host.trim() && c.user.trim() && c.pass.trim())
}

interface SendEmailModalProps {
  html: string
  onClose: () => void
}

type Step = 'smtp' | 'send'

export default function SendEmailModal({ html, onClose }: SendEmailModalProps) {
  const [smtp, setSmtp] = useState<SmtpConfig>(loadSmtpConfig)
  const [step, setStep] = useState<Step>(() => isSmtpReady(loadSmtpConfig()) ? 'send' : 'smtp')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const updateSmtp = useCallback((field: keyof SmtpConfig, value: string) => {
    setSmtp((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSmtpSave = () => {
    saveSmtpConfig(smtp)
    setStep('send')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'smtp' ? (
          <SmtpStep
            smtp={smtp}
            updateSmtp={updateSmtp}
            onSave={handleSmtpSave}
            onClose={onClose}
          />
        ) : (
          <SendStep
            html={html}
            smtp={smtp}
            onEditSmtp={() => setStep('smtp')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

/* ── Step 1: SMTP 설정 ── */

function SmtpStep({ smtp, updateSmtp, onSave, onClose }: {
  smtp: SmtpConfig
  updateSmtp: (field: keyof SmtpConfig, value: string) => void
  onSave: () => void
  onClose: () => void
}) {
  const hostRef = useRef<HTMLInputElement>(null)
  useEffect(() => { hostRef.current?.focus() }, [])

  const inputClass = 'w-full px-3 py-2 text-sm text-zinc-800 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const ready = isSmtpReady(smtp)

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-800">SMTP 설정</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-lg leading-none">&times;</button>
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-zinc-500 leading-relaxed">
          메일 발송을 위해 SMTP 서버 정보를 입력하세요.<br />
          입력한 정보는 <span className="font-medium text-zinc-700">브라우저 쿠키에 저장</span>되어 다음에 다시 입력할 필요가 없습니다.<br />
          서버로 전송되지 않으며, 메일 발송 시에만 사용됩니다.
        </p>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[11px] text-zinc-400 mb-0.5">SMTP 호스트</label>
            <input
              ref={hostRef}
              type="text"
              value={smtp.host}
              onChange={(e) => updateSmtp('host', e.target.value)}
              placeholder="smtp.gmail.com"
              className={inputClass}
            />
          </div>
          <div className="w-20">
            <label className="block text-[11px] text-zinc-400 mb-0.5">포트</label>
            <input
              type="text"
              value={smtp.port}
              onChange={(e) => updateSmtp('port', e.target.value)}
              placeholder="587"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-0.5">계정 (이메일)</label>
          <input
            type="email"
            value={smtp.user}
            onChange={(e) => updateSmtp('user', e.target.value)}
            placeholder="your-email@gmail.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-0.5">비밀번호 / 앱 비밀번호</label>
          <input
            type="password"
            value={smtp.pass}
            onChange={(e) => updateSmtp('pass', e.target.value)}
            placeholder="앱 비밀번호 입력"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-0.5">보내는 사람 (비워두면 계정과 동일)</label>
          <input
            type="email"
            value={smtp.from}
            onChange={(e) => updateSmtp('from', e.target.value)}
            placeholder="선택사항"
            className={inputClass}
          />
        </div>
        <div className="text-[11px] text-zinc-400 space-y-1.5">
          <p className="font-medium text-zinc-500">서비스별 설정 가이드</p>
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-500">
                <th className="py-1 pr-2 font-medium">서비스</th>
                <th className="py-1 pr-2 font-medium">호스트</th>
                <th className="py-1 pr-2 font-medium">계정</th>
                <th className="py-1 font-medium">비밀번호</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-100">
                <td className="py-1 pr-2">Gmail</td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">smtp.gmail.com</code></td>
                <td className="py-1 pr-2">이메일</td>
                <td className="py-1"><a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">앱 비밀번호</a></td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1 pr-2">Naver</td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">smtp.naver.com</code></td>
                <td className="py-1 pr-2">이메일</td>
                <td className="py-1">비밀번호</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1 pr-2">AWS SES</td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">email-smtp.&#123;region&#125;.amazonaws.com</code></td>
                <td className="py-1 pr-2"><a href="https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">SMTP 자격증명</a></td>
                <td className="py-1">SMTP 비밀번호</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1 pr-2">SendGrid</td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">smtp.sendgrid.net</code></td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">apikey</code></td>
                <td className="py-1">API Key</td>
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="py-1 pr-2">Mailgun</td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">smtp.mailgun.org</code></td>
                <td className="py-1 pr-2">SMTP 계정</td>
                <td className="py-1">SMTP 비밀번호</td>
              </tr>
              <tr>
                <td className="py-1 pr-2">Postmark</td>
                <td className="py-1 pr-2"><code className="bg-zinc-100 px-0.5 rounded">smtp.postmarkapp.com</code></td>
                <td className="py-1 pr-2">Server Token</td>
                <td className="py-1">Server Token</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-5 py-3 border-t border-zinc-200">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        >
          취소
        </button>
        <button
          onClick={onSave}
          disabled={!ready}
          className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          저장 후 계속
        </button>
      </div>
    </>
  )
}

/* ── Step 2: 메일 발송 ── */

function SendStep({ html, smtp, onEditSmtp, onClose }: {
  html: string
  smtp: SmtpConfig
  onEditSmtp: () => void
  onClose: () => void
}) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('Sticky 테스트 메일')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const toRef = useRef<HTMLInputElement>(null)

  useEffect(() => { toRef.current?.focus() }, [])

  const handleSend = async () => {
    if (!to.trim()) return
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to.trim(),
          subject,
          html,
          smtp: {
            host: smtp.host.trim(),
            port: smtp.port || '587',
            user: smtp.user.trim(),
            pass: smtp.pass,
            from: smtp.from.trim() || smtp.user.trim(),
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || '발송에 실패했습니다.')
        return
      }
      setStatus('success')
      setTimeout(onClose, 1500)
    } catch {
      setStatus('error')
      setErrorMsg('네트워크 오류가 발생했습니다.')
    }
  }

  const inputClass = 'w-full px-3 py-2 text-sm text-zinc-800 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-800">테스트 메일 발송</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-lg leading-none">&times;</button>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-md">
          <span className="text-xs text-zinc-500">
            SMTP: <span className="font-medium text-zinc-700">{smtp.user}</span>
          </span>
          <button
            onClick={onEditSmtp}
            className="text-[11px] text-blue-500 hover:text-blue-600 underline"
          >
            변경
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">받는 사람</label>
          <input
            ref={toRef}
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
            onKeyDown={(e) => { if (e.key === 'Enter' && status === 'idle') handleSend() }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">제목</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
            onKeyDown={(e) => { if (e.key === 'Enter' && status === 'idle') handleSend() }}
          />
        </div>
        <div className="text-xs text-zinc-400">
          현재 에디터의 HTML이 이메일 본문으로 발송됩니다.
        </div>

        {status === 'error' && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{errorMsg}</div>
        )}
        {status === 'success' && (
          <div className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md">발송 완료!</div>
        )}
      </div>

      <div className="flex justify-end gap-2 px-5 py-3 border-t border-zinc-200">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
        >
          취소
        </button>
        <button
          onClick={handleSend}
          disabled={!to.trim() || status === 'sending' || status === 'success'}
          className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? '발송 중...' : '발송'}
        </button>
      </div>
    </>
  )
}
