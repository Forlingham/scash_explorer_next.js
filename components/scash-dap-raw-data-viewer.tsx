'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Database, Copy, Check, Download } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { getClientTranslations } from '@/i18n/client-i18n'

interface ScashDAPRawDataViewerProps {
  dapReceivers: any[]
}

export function ScashDAPRawDataViewer({ dapReceivers }: ScashDAPRawDataViewerProps) {
  const [copied, setCopied] = useState(false)
  const { t } = getClientTranslations()

  if (!dapReceivers || dapReceivers.length === 0) {
    return null
  }

  const jsonData = JSON.stringify(dapReceivers, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonData)
    setCopied(true)
    toast({
      title: t('dap.copiedToClipboard'),
      description: t('dap.clipboardDesc')
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scash-dap-data-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: t('dap.downloadStarted'),
      description: t('dap.downloadDesc')
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9">
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">{t('dap.viewRawData')}</span>
          <span className="sm:hidden">{t('dap.rawData')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-full sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-lg">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {t('dap.rawData')}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Download JSON"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Copy JSON"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">{t('dap.rawDataDesc')}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 relative bg-muted/30 overflow-y-auto">
          <div className="p-6 pt-4">
            <div className="relative rounded-md border bg-card text-card-foreground shadow-sm">
              <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
                <code className="language-json block">{jsonData}</code>
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
