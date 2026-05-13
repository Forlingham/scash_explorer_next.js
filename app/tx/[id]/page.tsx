import TransactionFlowVisualization from '@/components/charts/transaction-flow-visualization'
import { ScashDAPDataDisplay } from '@/components/scash-dap-data-display'
import TransactionCard from '@/components/transaction-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getServerTranslations } from '@/i18n/server-i18n'
import { getArrFeeAddress, getScashNetwork } from '@/lib/const'
import { transactionDetailApi } from '@/lib/http-server'
import { formatTimeDiff } from '@/lib/serverUtils'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRightLeft, CheckCircle2, Database } from 'lucide-react'
import Link from 'next/link'
import { DapUtils } from '@/lib/dapUtils'
import { DapBadge } from '@/components/dap-badge'

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { t } = await getServerTranslations()
  const dapUtils = new DapUtils()

  try {
    const transactionDetailApiRes = await transactionDetailApi(id)
    const txData = transactionDetailApiRes.tx
    const processedTransaction = transactionDetailApiRes.processedTransaction
    const confirmations = processedTransaction.confirmations
    const dapStatus = processedTransaction.dapStatus

    const { isShowDap, dapReceivers, depFee, networkFee, scashDAPData } = await dapUtils.parseContent(dapStatus, processedTransaction)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            {t('tx.title')}
            {(dapStatus.isDap || scashDAPData) && <DapBadge />}
          </h1>
          <p className="text-sm text-muted-foreground font-mono break-all mt-2">{txData.txid}</p>
        </div>

        {/* Transaction Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('tx.details')}</CardTitle>
            <CardDescription>{t('tx.detailsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  {confirmations > 5 ? <CheckCircle2 className="h-8 w-8 text-success" /> : <AlertCircle className="h-8 w-8 text-warning" />}
                  <div>
                    <div className="text-2xl font-bold">{confirmations > 5 ? t('tx.confirmed') : t('tx.pending')}</div>
                    <div className="text-sm text-muted-foreground">
                      {confirmations} {t('tx.confirmations')}
                    </div>
                  </div>
                </div>
                {txData.blockHeight >= 0 ? (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">{t('tx.blockHeight')}</span>
                    <Link href={`/block/${txData.blockHeight}/20/1`} className="text-primary hover:underline font-semibold">
                      {txData.blockHeight.toLocaleString()}
                    </Link>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">{t('tx.poolTransaction')}</span>
                    <span className="font-semibold">{t('tx.poolTransactionDesc')}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">{t('tx.weight')}</span>
                  <span className="font-semibold">{txData.weight} WU</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{t('tx.timestamp')}</div>
                    <div className="font-semibold">{new Date(txData.timestamp).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{formatTimeDiff(txData.timestamp, t)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {!isShowDap && (
          <>
            {/* Transaction Card */}
            <div className="mb-8">
              <TransactionCard dapStatus={dapStatus} tx={processedTransaction} t={t} isTx={true} />
            </div>

            {/* Transaction Flow Visualization */}
            <TransactionFlowVisualization
              inputs={processedTransaction.senders}
              outputs={[...processedTransaction.receivers, ...processedTransaction.changeOutputs]}
              flowTitle={t('tx.flow')}
              hideDiagramText={t('tx.hideDiagram')}
              showDiagramText={t('tx.showDiagram')}
              outputLabel={t('tx.output')}
            />
          </>
        )}
        {scashDAPData && (
          <ScashDAPDataDisplay
            data={scashDAPData}
            dapReceivers={dapReceivers}
            depFee={depFee}
            networkFee={networkFee}
            title={t('tx.scashDAPData')}
          />
        )}
      </div>
    )
  } catch (error) {
    console.log(error, 'error')
    if (id.length === 64) {
      // redirect(`/block/${id}/20/1`)
    }
  }
}
