import Link from 'next/link'
import { ArrowRightLeft, Hash, Coins, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getServerTranslations } from '@/i18n/server-i18n'
import { transactionDetailApi } from '@/lib/http-server'
import TransactionCard from '@/components/transaction-card'
import TransactionFlowVisualization from '@/components/charts/transaction-flow-visualization'
import { formatTime, formatTimeDiff } from '@/lib/serverUtils'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'
import { redirect } from 'next/navigation'
import Decimal from 'decimal.js'
import { mergeSendersReceivers } from '@/lib/utils'

export default async function TransactionDetailPage({ params }: { params: { id: string } & Promise<any> }) {
  const { id } = params
  const { t } = await getServerTranslations()

  try {
    const transactionDetailApiRes = await transactionDetailApi(id)
    const txData = transactionDetailApiRes.tx
    const processedTransaction = transactionDetailApiRes.processedTransaction

    const confirmations = processedTransaction.confirmations

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            {t('tx.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-mono break-all mt-2">{txData.txid}</p>
        </div>

        {/* Overview Cards */}
        {/* <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {t('tx.totalInput')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{txData.totalInput.toFixed(8)} BTC</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4" />
              {t('tx.totalOutput')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{txData.totalOutput.toFixed(8)} BTC</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4" />
              {t('tx.fee')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{txData.fee.toFixed(8)} BTC</div>
            <div className="text-sm text-muted-foreground">{txData.feeRate.toFixed(2)} sat/vB</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('tx.size')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{txData.size} bytes</div>
            <div className="text-sm text-muted-foreground">{txData.virtualSize} vBytes</div>
          </CardContent>
        </Card>
      </div> */}

        {/* Transaction Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('tx.details')}</CardTitle>
            <CardDescription>{t('tx.detailsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  {confirmations > 5 ? <CheckCircle2 className="h-8 w-8 text-success" /> : <AlertCircle className="h-8 w-8 text-warning" />}
                  <div>
                    <div className="text-2xl font-bold">{confirmations > 5 ? t('tx.confirmed') : t('tx.pending')}</div>
                    <div className="text-sm text-muted-foreground">
                      {confirmations} {t('tx.confirmations')}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground block mb-1">{t('tx.blockHeight')}</span>
                  <Link href={`/block/${txData.blockHeight}/20/1`} className="text-primary hover:underline font-semibold">
                    {txData.blockHeight.toLocaleString()}
                  </Link>
                </div>
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
        {/* Transaction Flow Visualization */}
        <TransactionFlowVisualization
          inputs={processedTransaction.senders}
          outputs={[...processedTransaction.receivers, ...processedTransaction.changeOutputs]}
          flowTitle={t('tx.flow')}
          hideDiagramText={t('tx.hideDiagram')}
          showDiagramText={t('tx.showDiagram')}
          outputLabel={t('tx.output')}
        />

        {/* Transaction Card */}
        <div className="mb-8">
          <TransactionCard tx={processedTransaction} t={t} isTx={true} />
        </div>
      </div>
    )
  } catch (error) {
    if (id.length === 64) {
      redirect(`/block/${id}/20/1`)
    }
  }
}
