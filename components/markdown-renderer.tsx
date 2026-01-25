'use client'

import dynamic from 'next/dynamic'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { useState, useMemo } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { getClientTranslations } from '@/i18n/client-i18n'

// 建议移除 ssr: false 以提升 SEO 和首屏体验，除非依赖了仅限浏览器的 API
const ReactMarkdown = dynamic(() => import('react-markdown'))

interface MarkdownRendererProps {
  children: string
  className?: string
}

export function MarkdownRenderer({ children, className }: MarkdownRendererProps) {
  const { t } = getClientTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')

  // 1. 安全增强：配置 Sanitize 规则（可选，如果需要允许特定 class 可以配置这里）
  // 这里使用 useMemo 避免每次渲染都重新计算 schema
  const sanitizeSchema = useMemo(
    () => ({
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes
        // 可以在这里放宽某些限制，例如允许 className (如果不使用自定义组件的话)
        // 但既然你全自定义了组件，保持默认严格模式最好
      }
    }),
    []
  )

  const handleLinkClick = (href: string) => {
    if (!href) return

    // 2. 安全增强：协议检查，防止 javascript: 或 data: 伪协议
    try {
      const url = new URL(href, window.location.href)
      if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
        return // 忽略非标准协议链接
      }
    } catch (e) {
      return // 忽略非法 URL
    }

    setTargetUrl(href)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  return (
    <>
      <div className={`${className || ''}`}>
        <ReactMarkdown
          rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold  mt-4 mb-2 border-b border-border pb-1 text-foreground" />,
            h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold  mt-3 mb-2 text-foreground" />,
            h3: ({ node, ...props }) => <h3 {...props} className="text-base font-bold  mt-3 mb-1 text-foreground" />,
            h4: ({ node, ...props }) => <h4 {...props} className="text-sm font-bold  mt-2 mb-1 text-foreground" />,
            h5: ({ node, ...props }) => <h5 {...props} className="text-sm font-bold  mt-2 mb-1 text-foreground" />,
            h6: ({ node, ...props }) => <h6 {...props} className="text-xs font-bold  mt-2 mb-1 text-foreground" />,
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table {...props} className="w-full text-left text-sm text-muted-foreground" />
              </div>
            ),
            thead: ({ node, ...props }) => <thead {...props} className="bg-muted text-muted-foreground" />,
            tbody: ({ node, ...props }) => <tbody {...props} className="divide-y divide-border bg-muted/50" />,
            tr: ({ node, ...props }) => <tr {...props} className="hover:bg-muted/80 transition-colors" />,
            th: ({ node, ...props }) => <th {...props} className="px-4 py-3 font-semibold whitespace-nowrap" />,
            td: ({ node, ...props }) => <td {...props} className="px-4 py-3" />,
            hr: ({ node, ...props }) => <hr {...props} className="my-4 border-border" />,
            strong: ({ node, ...props }) => <strong {...props} className="font-bold text-foreground" />,
            em: ({ node, ...props }) => <em {...props} className="italic text-muted-foreground" />,
            del: ({ node, ...props }) => <del {...props} className="line-through text-muted-foreground" />,
            p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 leading-relaxed text-muted-foreground" />,
            ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside mb-2 pl-1 space-y-1 text-muted-foreground" />,
            ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside mb-2 pl-1 space-y-1 text-muted-foreground" />,
            blockquote: ({ node, ...props }) => (
              <blockquote
                {...props}
                className="border-l-4 border-primary/50 pl-4 py-1 italic bg-muted/30 rounded-r my-2 text-muted-foreground"
              />
            ),

            // 3. 链接组件：保留你的逻辑，这很好
            a: ({ node, href, ...props }) => (
              <a
                {...props}
                href={href}
                className="text-primary hover:text-primary/80 hover:underline break-all cursor-pointer transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  if (href) handleLinkClick(href)
                }}
              />
            ),

            // 4. 改进代码块：区分 inline 和 block
            code: ({ node, className, children, ...props }: any) => {
              // ReactMarkdown 会传递 inline 属性来区分
              const isInline = !String(children).includes('\n') && !className

              if (isInline) {
                return (
                  <code
                    className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs border border-border"
                    {...props}
                  >
                    {children}
                  </code>
                )
              }

              return (
                <div className="relative group">
                  <code
                    className="block bg-muted border border-border rounded-lg p-3 font-mono text-xs text-muted-foreground overflow-x-auto my-2 shadow-inner"
                    {...props}
                  >
                    {children}
                  </code>
                </div>
              )
            },

            // pre 通常包裹 code block，可以简化 pre，把样式主要放在 code block 上
            pre: ({ node, ...props }) => <pre {...props} className="m-0 p-0 bg-transparent" />,

            // 5. 新增：图片组件 (防止大图破坏布局和隐私泄露)
            img: ({ node, src, alt, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                {...props}
                src={src}
                alt={alt || 'Blockchain content'}
                loading="lazy"
                referrerPolicy="no-referrer" // 关键：保护用户隐私，不发送 Referer
                className="max-w-full h-auto rounded-lg border border-border my-2 max-h-[500px] object-contain bg-muted"
                onError={(e) => {
                  // 可选：图片加载失败时的占位符逻辑
                  e.currentTarget.style.display = 'none'
                }}
              />
            )
          }}
        >
          {children}
        </ReactMarkdown>
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-background border-border max-w-[90vw] w-full sm:max-w-lg rounded-xl shadow-2xl">
          {/* ... 保持你原有的 AlertDialog 内容 ... */}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t('common.externalLink')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('common.externalLinkInfo')}
              <div className="mt-4 p-3 bg-muted rounded-lg border border-border break-all text-primary font-mono text-xs max-h-24 overflow-y-auto">
                {targetUrl}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:gap-0 mt-4">
            <AlertDialogCancel className="flex-1 bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground mt-0 transition-colors">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-colors"
            >
              {t('common.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
