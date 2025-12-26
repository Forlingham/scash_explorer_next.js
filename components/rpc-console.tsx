'use client'

import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getClientTranslations } from '@/i18n/client-i18n'

interface RpcConsoleProps {
  methods: string[]
  auth?: {
    username: string
    password: string
  }
  rpcUrl: string
}

export default function RpcConsole({ methods, auth, rpcUrl }: RpcConsoleProps) {
  const [method, setMethod] = useState<string>(methods[0] || '')
  const [paramsText, setParamsText] = useState<string>('[]')
  const [endpoint, setEndpoint] = useState<string>('/rpc')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>(auth?.username || '')
  const [password, setPassword] = useState<string>(auth?.password || '')

  const { t } = getClientTranslations()

  const client = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
  })

  const parseParams = () => {
    const raw = paramsText.trim()
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return parsed
    } catch {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }

  const callRpc = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: parseParams()
    }
    try {
      const config = username && password ? { auth: { username, password } } : {}
      const res = await client.post(endpoint, payload, config)
      setResult(res.data)
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e?.message
      if (status === 401) {
        setError(msg || '未认证或缺少权限（不跳转登录）')
      } else {
        setError(msg || 'RPC 请求失败')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="md:col-span-1">
          <div className="text-sm text-muted-foreground mb-1">{t('info.endpoint')}</div>
          <span>{rpcUrl}</span>
        </div>
        <div className="md:col-span-1">
          <div className="text-sm text-muted-foreground mb-1">{t('info.method')}</div>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('info.selectMethod')} />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1 flex items-end">
          <Button onClick={callRpc} disabled={!method || loading} className="w-full">
            {loading ? t('info.sendRequest') : t('info.send')}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-sm text-muted-foreground mb-1">{t('info.username')}</div>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t('info.username')} disabled={true} />
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">{t('info.password')}</div>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('info.password')} disabled={true} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-1">{t('info.params')}</div>
        <Textarea
          rows={4}
          value={paramsText}
          onChange={(e) => setParamsText(e.target.value)}
          placeholder={t('info.paramsPlaceholder')}
        />
      </div>

      <div className="mt-4">
        <div className="text-sm text-muted-foreground mb-1">{t('info.response')}</div>
        <div className="rounded-md border p-3 bg-muted/30">
          {error ? (
            <pre className="text-destructive text-sm whitespace-pre-wrap break-all">{error}</pre>
          ) : result ? (
            <pre className="text-xs md:text-sm whitespace-pre-wrap break-all">{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className="text-muted-foreground text-sm">{t('info.noResponse')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
