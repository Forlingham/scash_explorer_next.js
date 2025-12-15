'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import axiosInstance from '@/lib/request'
import { getClientTranslations } from '@/i18n/client-i18n'
import type { Locale } from '@/i18n/i18n-provider'

type AddAddressTagButtonProps = {
  address: string
  className?: string
  locale?: Locale
}

export default function AddAddressTagButton({ address, className, locale }: AddAddressTagButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'website' | 'group_chat'>('text')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  async function addTagApi(address: string, name: string, type: string, description: string) {
    return axiosInstance.post(`/explorer/address/addTag`, { address, name, type, description })
  }
  // 使用服务端传入的 locale，避免 SSR 与客户端首次渲染不一致导致的 hydration 报错
  const { t } = getClientTranslations(locale)

  async function handleSubmit() {
    if (!name.trim()) return
    try {
      setLoading(true)
      await addTagApi(address, name, type, description)
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setType('text')
    setDescription('')
    setSubmitted(false)
  }

  const onClose = () => {
    setOpen(false)
    resetForm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {t('common.addAddressTagButton')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.addAddressTagButton')}</DialogTitle>
          <DialogDescription>{t('common.tagDescription')}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('common.tagSubmitSuccess')}</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm">{t('common.tagName')}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('common.tagNamePlaceholder')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('common.tagType')}</label>
              <Select value={type} onValueChange={(v) => setType(v as 'text' | 'website' | 'group_chat')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('common.tagTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{t('common.tagTypeText')}</SelectItem>
                  <SelectItem value="website">{t('common.tagTypeWebsite')}</SelectItem>
                  <SelectItem value="group_chat">{t('common.tagTypeGroupChat')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('common.tagDescription2')}</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('common.tagDescriptionPlaceholder')} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t('common.close')}
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
                {loading ? t('common.submitting') : t('common.submit')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
