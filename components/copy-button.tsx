"use client"

import React from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ textToCopy, title }: { textToCopy: string; title: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 hover:bg-muted rounded-md transition-colors"
      title={title}
      type="button"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}