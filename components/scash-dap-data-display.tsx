import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, FileText, Coins, Activity } from 'lucide-react'
import { checkComment } from '@/lib/filter'
import { MarkdownRenderer } from './markdown-renderer'
import { ScashDAPRawDataViewer } from './scash-dap-raw-data-viewer'
import { getServerTranslations } from '@/i18n/server-i18n'
import { satoshisToBtc } from '@/lib/currency.utils'
import { Badge } from '@/components/ui/badge'
import { BASE_SYMBOL } from '@/lib/const'
import { DapMessageDisplay } from './dap-message-display'

interface ScashDAPDataDisplayProps {
  data: string
  title: string
  dapReceivers?: any[]
  depFee?: bigint
  networkFee?: number
  isShowMessageDisplay?: boolean
}

export async function ScashDAPDataDisplay({
  data,
  title,
  dapReceivers,
  depFee,
  networkFee,
  isShowMessageDisplay = false
}: ScashDAPDataDisplayProps) {
  if (!data) return null
  const { t } = await getServerTranslations()

  const isClean = checkComment(data).pass

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
      <CardContent>
        {!isClean ? (
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
        ) : isShowMessageDisplay ? (
          <DapMessageDisplay content={data} />
        ) : (
          <MarkdownRenderer>{data}</MarkdownRenderer>
        )}
      </CardContent>
    </Card>
  )
}
