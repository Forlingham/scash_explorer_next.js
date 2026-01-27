'use client'

import { useState } from 'react'
import { Maximize2, X, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DapMessageDisplayProps {
  content: string
  showPreview?: boolean
  buttonText?: React.ReactNode
  title?: string
  className?: string
}

function stripMarkdown(markdown: string): string {
  if (!markdown) return ''
  let text = markdown

  // Remove images (must be before links)
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '')

  // Replace links with their text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, ' [Code] ')

  // Remove inline code
  text = text.replace(/`([^`]*)`/g, '$1')

  // Remove headers
  text = text.replace(/^#+\s+/gm, '')

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '')

  // Remove horizontal rules
  text = text.replace(/^---+$/gm, '')

  // Remove bold/italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')

  // Remove tables (lines starting with |)
  text = text.replace(/^\|.*$/gm, '')

  // Compact whitespace
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

function isMarkdown(text: string): boolean {
  if (!text) return false

  const patterns = [
    /!\[[^\]]*\]\([^)]*\)/, // Images
    /\[([^\]]*)\]\([^)]*\)/, // Links
    /```[\s\S]*?```/, // Code blocks
    /`([^`]*)`/, // Inline code
    /^#+\s+/m, // Headers
    /^>\s+/m, // Blockquotes
    /^---+$/m, // Horizontal rules
    /(\*\*|__)(.*?)\1/, // Bold
    /(\*|_)(.*?)\1/, // Italic
    /^\|.*$/m // Tables
  ]

  return patterns.some((pattern) => pattern.test(text))
}

export function DapMessageDisplay({ content, showPreview = true, buttonText, title, className }: DapMessageDisplayProps) {
  const isMd = isMarkdown(content)
  const isLong = content.length > 300
  const isInteractive = isMd || isLong

  if (showPreview && !isInteractive) {
    return (
      <div className={cn("rounded-lg border border-transparent bg-muted/50 p-3", className)}>
        <div className="text-sm text-muted-foreground break-all whitespace-pre-wrap">{content}</div>
      </div>
    )
  }

  // Generate preview text if showing preview
  const previewText = showPreview ? stripMarkdown(content) : ''
  const displayPreview = showPreview ? (previewText.length > 300 ? previewText.slice(0, 300) + '...' : previewText) : ''

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full text-left group relative cursor-pointer rounded-lg border border-transparent bg-muted/50 p-3 hover:bg-muted hover:border-primary/50 transition-all duration-200",
            className
          )}
        >
          <div className="text-sm text-muted-foreground break-all line-clamp-3">
            {displayPreview || <span className="text-muted-foreground/70 italic">{'dap.clickToView'}</span>}
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-70 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="h-3 w-3" />
            <span>{buttonText}</span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="max-w-[95vw] w-[95vw] sm:w-fit sm:max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-background border-border overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between bg-muted/30 shrink-0">
          <DialogTitle className="text-base font-medium text-foreground mr-8 truncate max-w-[calc(100%-3rem)]">{title}</DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-foreground transition-colors focus:outline-hidden">
            <X className="h-5 w-5" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-[300px]">
          <div className="max-w-none">
            <MarkdownRenderer>{content}</MarkdownRenderer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
