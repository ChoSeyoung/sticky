'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const HtmlEditor = dynamic(() => import('@/app/components/HtmlEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center bg-zinc-900 text-zinc-500">
      Loading editor...
    </div>
  ),
})

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello Email</h1>
    <p>Edit this HTML to preview your email.</p>
  </div>
</body>
</html>`

export default function Home() {
  const [html, setHtml] = useState<string>(DEFAULT_HTML)

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center h-12 px-4 bg-zinc-900 border-b border-zinc-700">
        <h1 className="text-sm font-semibold text-zinc-300">Sticky — HTML Email Editor</h1>
      </header>
      <main className="flex flex-1 min-h-0">
        <HtmlEditor value={html} onChange={setHtml} />
      </main>
    </div>
  )
}
