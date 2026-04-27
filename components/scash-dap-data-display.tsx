import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, FileText, Coins, Activity, Gift } from 'lucide-react'
import { checkComment } from '@/lib/filter'
import { MarkdownRenderer } from './markdown-renderer'
import { ScashDAPRawDataViewer } from './scash-dap-raw-data-viewer'
import { getServerTranslations } from '@/i18n/server-i18n'
import { satoshisToBtc } from '@/lib/currency.utils'
import { Badge } from '@/components/ui/badge'
import { BASE_SYMBOL } from '@/lib/const'
import { DapMessageDisplay } from './dap-message-display'
import { cn } from '@/lib/utils'
import { parseRedPacketData, isRedPacketLike } from '@/lib/red-packet-utils'
import { RedPacketDisplay } from './red-packet-display'

interface ScashDAPDataDisplayProps {
  data: string
  title: string | React.ReactNode
  dapReceivers?: any[]
  depFee?: bigint
  networkFee?: number
  isShowMessageDisplay?: boolean
  compact?: boolean
  dapListMode?: boolean
}

export async function ScashDAPDataDisplay({
  data,
  title,
  dapReceivers,
  depFee,
  networkFee,
  isShowMessageDisplay = false,
  compact = false,
  dapListMode = false
}: ScashDAPDataDisplayProps) {
  if (!data) return null
  const { t, locale } = await getServerTranslations()

  const redPacket = parseRedPacketData(data)
  // 红包数据（包括被后端截断的）不需要判断是否合规
  const isClean = isRedPacketLike(data) ? true : checkComment(data).pass

  const alertContent = (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t('dap.warning')}</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <p>{t('dap.warningDesc')}</p>
          <p>{t('dap.clientDesc')}</p>
          <p>
            {t('dap.downloadLink')}{' '}
            <a
              href="https://github.com/Forlingham/ScashDataAddressProtocol/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              {t('dap.githubReleases')}
            </a>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  )

  if (isShowMessageDisplay) {
    if (redPacket || (dapListMode && isRedPacketLike(data))) {
      // DAP 列表页只展示红包标识，不展开具体信息
      if (dapListMode) {
        const actionLabel = redPacket
          ? redPacket.data.action === 'CREATE'
            ? 'Red Packet'
            : redPacket.data.action === 'CLAIM'
              ? 'Red Packet Claim'
              : 'Red Packet Refund'
          : 'Red Packet'
        return (
          <div className={cn(title ? "mt-3 border-t pt-3" : "")}>
            {title && (
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{title}</span>
                </div>
                {dapReceivers && dapReceivers.length > 0 && (
                  <div className="scale-90 origin-right">
                    <ScashDAPRawDataViewer dapReceivers={dapReceivers} />
                  </div>
                )}
              </div>
            )}
            <div className="pointer-events-auto">
              <Badge
                variant="outline"
                className="gap-1.5 py-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                <Gift className="h-3.5 w-3.5 text-red-500" />
                <span className="font-medium">{actionLabel}</span>
              </Badge>
            </div>
          </div>
        )
      }

      if (redPacket) {
        return (
          <div className={cn(title ? "mt-3 border-t pt-3" : "")}>
            {title && (
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{title}</span>
                </div>
                {dapReceivers && dapReceivers.length > 0 && (
                  <div className="scale-90 origin-right">
                    <ScashDAPRawDataViewer dapReceivers={dapReceivers} />
                  </div>
                )}
              </div>
            )}
            <div className="pointer-events-auto">
              <RedPacketDisplay data={redPacket} compact={compact} locale={locale} />
            </div>
          </div>
        )
      }
    }

    return (
      <div className={cn(title ? "mt-3 border-t pt-3" : "")}>
        {title && (
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            {dapReceivers && dapReceivers.length > 0 && (
              <div className="scale-90 origin-right">
                <ScashDAPRawDataViewer dapReceivers={dapReceivers} />
              </div>
            )}
          </div>
        )}
        {!isClean ? alertContent : <DapMessageDisplay content={data} className={cn(compact && "p-2 text-xs")} />}
      </div>
    )
  }

  if (redPacket) {
    return (
      <Card className="mb-8 border-red-200/60">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-red-500" />
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              {(depFee !== undefined || networkFee !== undefined) && (
                <div className="flex items-center gap-2">
                  {depFee !== undefined && depFee > BigInt(0) && (
                    <Badge variant="outline" className="gap-1.5 py-1 bg-primary/10 border-primary/20 hover:bg-primary/20">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary">{t('dap.fee')}:</span>
                      <span className="font-mono font-medium text-primary">
                        {satoshisToBtc(depFee)} {BASE_SYMBOL}
                      </span>
                    </Badge>
                  )}
                  {networkFee !== undefined && networkFee > 0 && (
                    <Badge variant="outline" className="gap-1.5 py-1">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{t('dap.networkFee')}:</span>
                      <span className="font-mono font-medium">
                        {satoshisToBtc(networkFee)} {BASE_SYMBOL}
                      </span>
                    </Badge>
                  )}
                </div>
              )}

              {dapReceivers && dapReceivers.length > 0 && <ScashDAPRawDataViewer dapReceivers={dapReceivers} />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RedPacketDisplay data={redPacket} locale={locale} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            {(depFee !== undefined || networkFee !== undefined) && (
              <div className="flex items-center gap-2">
                {depFee !== undefined && depFee > BigInt(0) && (
                  <Badge variant="outline" className="gap-1.5 py-1 bg-primary/10 border-primary/20 hover:bg-primary/20">
                    <Coins className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary">{t('dap.fee')}:</span>
                    <span className="font-mono font-medium text-primary">
                      {satoshisToBtc(depFee)} {BASE_SYMBOL}
                    </span>
                  </Badge>
                )}
                {networkFee !== undefined && networkFee > 0 && (
                  <Badge variant="outline" className="gap-1.5 py-1">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('dap.networkFee')}:</span>
                    <span className="font-mono font-medium">
                      {satoshisToBtc(networkFee)} {BASE_SYMBOL}
                    </span>
                  </Badge>
                )}
              </div>
            )}

            {dapReceivers && dapReceivers.length > 0 && <ScashDAPRawDataViewer dapReceivers={dapReceivers} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>{!isClean ? alertContent : <MarkdownRenderer>{data}</MarkdownRenderer>}</CardContent>
    </Card>
  )
}
