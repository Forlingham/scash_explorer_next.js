import Link from 'next/link'
import { Cable as Cube, Clock, Hash, Coins, Zap, ArrowRight, User, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Pagination } from '@/components/pagination'
import { BlockTransactionVisualization } from '@/components/charts/block-transaction-visualization'
import { getServerTranslations } from '@/i18n/server-i18n'
import { redirect } from 'next/navigation'
import { blockDetailApi, blockTransactionsApi } from '@/lib/http-server'
import TransactionCard from '@/components/transaction-card'
import { formatTime, formatTimeDiff } from '@/lib/serverUtils'
import { BASE_SYMBOL } from '@/lib/const'
import { satoshisToBtc } from '@/lib/currency.utils'

export default async function BlockDetailPage({ params }: { params: { id: string; pageSize: string; page: string } & Promise<any> }) {
  const { t } = await getServerTranslations()
  const { id, pageSize: pageSizeStr, page: pageStr } = params
  const pageSize = parseInt(pageSizeStr)
  const currentPage = parseInt(pageStr)

  // 验证参数
  if (isNaN(pageSize) || isNaN(currentPage) || pageSize <= 0 || currentPage <= 0) {
    redirect(`/block/${id}/20/1`)
  }
  // 限制每页最大数量
  if (pageSize > 100) {
    redirect(`/block/${id}/100/1`)
  }
  try {
    const blockDetailApiRes = await blockDetailApi(id)
    const blockTransactionsApiRes = await blockTransactionsApi(blockDetailApiRes.height.toString(), pageSize, currentPage)

    const blockData = blockDetailApiRes

    // 获取总数据量
    const totalTransactions = blockTransactionsApiRes.pagination.total
    const totalPages = blockTransactionsApiRes.pagination.totalPages

    // 确保页码不超过总页数
    if (currentPage > totalPages) {
      redirect(`/block/${id}/${pageSize}/${totalPages}`)
    }

    const transactions = blockTransactionsApiRes.list

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Cube className="h-8 w-8 text-primary" />
            {t('block.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('block.hash')}: <span className="font-semibold text-foreground">{blockData.hash}</span>
          </p>
        </div>

        {/* Block Navigation */}
        <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
          <Link
            href={`/block/${blockData.height + 1}/${pageSize}/${currentPage}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />

            {t('block.next')}
          </Link>

          <Badge variant="outline" className="text-base px-4 py-2">
            {t('block.height')}: {blockData.height.toLocaleString()}
          </Badge>
          <Link
            href={`/block/${blockData.height - 1}/${pageSize}/${currentPage}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            {t('block.previous')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 左右分栏布局 - 桌面端左右分布，移动端垂直堆叠 */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：区块详情 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('block.details')}</CardTitle>
                <CardDescription>{t('block.detailsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">{t('block.timestamp')}</span>
                      <div className="flex flex-col">
                        <span className="font-semibold">{new Date(blockData.timestamp).toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">{formatTimeDiff(blockData.timestamp, t)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1"> {t('block.transactions')}</span>
                      <span className="font-semibold">{blockData.txCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1"> {t('block.totalFees')}</span>
                      <span className="font-semibold">
                        {satoshisToBtc(blockData.totalFees)} {BASE_SYMBOL}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1"> {t('block.reward')}</span>
                      <span className="font-semibold">
                        {satoshisToBtc(blockData.reward)} {BASE_SYMBOL}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">{t('block.difficulty')}</span>
                      <span className="font-semibold">{blockData.difficulty.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">{t('block.nonce')}</span>
                      <span className="font-semibold">{blockData.nonce.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">{t('block.size')}</span>
                      <span className="font-semibold">{(blockData.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">{t('block.weight')}</span>
                      <span className="font-semibold">{(blockData.weight / 1000).toFixed(2)} KWU</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">{t('block.miner')}</span>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <Link href={`/address/${blockData.minerAddress}/20/1`} className="text-sm text-primary hover:underline font-mono">
                          {blockData.minerAddress}
                        </Link>
                        {/* <span className="font-semibold">{blockData.minerAddress}</span> */}
                      </div>
                    </div>
                    {/* <Link href={`/address/${blockData.minerAddress}`} className="text-sm text-primary hover:underline font-mono">
                    {blockData.minerAddress.substring(0, 20)}...
                  </Link> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：交易可视化 */}
          <div className="space-y-6">
            <BlockTransactionVisualization
              blockHeight={blockData.height}
              t={{
                'block.visualization': t('block.visualization'),
                'block.height': t('block.height'),
                'block.visualization.description': t('block.visualization.description'),
                'block.visualization.transactionCount': t('block.visualization.transactionCount'),
                'block.visualization.maxTransactionSize': t('block.visualization.maxTransactionSize'),
                'block.visualization.minTransactionSize': t('block.visualization.minTransactionSize'),
                'block.visualization.averageTransactionSize': t('block.visualization.averageTransactionSize'),
                'block.visualization.transactionSize': t('block.visualization.transactionSize'),
                'block.visualization.fee': t('block.visualization.fee'),
                'block.visualization.value': t('block.visualization.value')
              }}
            />
          </div>
        </div>
        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('block.transactions')}</CardTitle>
            <CardDescription>
              {blockData.txCount.toLocaleString()} {t('block.transactionsInBlock')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <TransactionCard tx={tx} t={t} key={tx.txid} />
              ))}
            </div>

            {/* 分页导航 */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              basePath={`/block/${id}`}
              translations={{
                previous: t('common.previous'),
                next: t('common.next'),
                pageSize: t('common.pageSize')
              }}
              className="mt-6"
            />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>查询失败 {id}</AlertTitle>
          <AlertDescription>输入的hash值未查询到相关数据，请检查或者稍后重试。</AlertDescription>
        </Alert>
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }
}
