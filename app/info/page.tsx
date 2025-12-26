import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { explorerApiInfoApi } from '@/lib/http-server'
import RpcConsole from '@/components/rpc-console'
import { getServerTranslations } from '@/i18n/server-i18n'
import { Info } from 'lucide-react'
import { headers } from 'next/headers'

export default async function InfoPage() {
  const { t } = await getServerTranslations()
  const info = await explorerApiInfoApi()
  const methods = info?.rpc_support_methods || []

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const currentOrigin = host ? `${protocol}://${host}` : ''

  const rpcUrl = currentOrigin + '/api/rpc'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Info className="h-7 w-7 text-primary" />
          {t('info.rpcInterface')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('info.rpcMethods')}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{t('info.serviceInfo')}</CardTitle>
          <CardDescription>{t('info.serviceInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">{t('info.name')}</div>
              <div className="font-medium">{info?.name || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('info.version')}</div>
              <div className="font-medium">{info?.version || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('info.description')}</div>
              <div className="font-medium">{info?.description || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('info.contentType')}</div>
              <div className="font-medium">{info?.contentType || '-'}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">{t('info.username')}</div>
              <div className="font-medium">{info?.rpc_auth?.username || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('info.password')}</div>
              <div className="font-medium">{info?.rpc_auth?.password || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('info.url')}</div>
              <div className="font-medium">{rpcUrl}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{t('info.publicMethods')}</CardTitle>
          <CardDescription>{t('info.rpcSupportMethods')}</CardDescription>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-muted-foreground text-sm">{t('info.noPublicMethods')}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <Badge key={m} variant="secondary" className="font-mono">
                  {m}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('info.rpcTest')}</CardTitle>
          <CardDescription>{t('info.rpcTestDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RpcConsole methods={methods} auth={info?.rpc_auth} rpcUrl={rpcUrl} />
        </CardContent>
      </Card>
    </div>
  )
}
