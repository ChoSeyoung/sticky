'use client'

import Editor from '@monaco-editor/react'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function HtmlEditor({ value, onChange }: HtmlEditorProps) {
  return (
    <Editor
      language="html"
      theme="vs-dark"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      options={{
        wordWrap: 'on',
        minimap: { enabled: false },
        autoClosingBrackets: 'always',
        autoClosingTags: true,
        formatOnPaste: false,
        formatOnType: false,
        renderWhitespace: 'selection',
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
      }}
      className="h-full"
    />
  )
}
