'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slot: string
  format?: 'horizontal' | 'auto'
}

export default function AdBanner({ slot, format = 'horizontal' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    try {
      const w = window as typeof window & { adsbygoogle?: unknown[] }
      if (w.adsbygoogle) {
        w.adsbygoogle.push({})
      }
    } catch {
      // AdSense not loaded — graceful degradation
    }
  }, [])

  return (
    <div ref={adRef} className="flex items-center justify-center bg-zinc-800 border-b border-zinc-700 min-h-[50px]">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '50px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="false"
      />
      <noscript>
        <span className="text-xs text-zinc-600">Ad Space</span>
      </noscript>
    </div>
  )
}
