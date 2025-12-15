import Link from 'next/link'
import { Wallet, ArrowUpRight, ArrowDownLeft, Activity, Pickaxe, Link2, Users, Tag as TagIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { FormattedAmount } from '@/components/formatted-amount'

import CopyButton from '@/components/copy-button'
import { Pagination } from '@/components/pagination'
import { getServerTranslations } from '@/i18n/server-i18n'
import { redirect } from 'next/navigation'
import { addressDetailApi, addressTransactionsApi } from '@/lib/http-server'
import TransactionCard from '@/components/transaction-card'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'
import { formatTime } from '@/lib/serverUtils'
import Decimal from 'decimal.js'
import AddAddressTagButton from '@/components/address-add-tag-button'
import AddressTransactionGraphG6 from '@/components/address-transaction-graph-g6'

export default async function AddressDetailPage({
  params
}: { params: { id: string; pageSize: string; page: string } } & { params: Promise<any> }) {
  const { t, locale } = await getServerTranslations()

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

  // 获取地址详情
  const addressDetail = await addressDetailApi(id)

  // 获取地址下的交易列表
  const addressTransactionsApiRes = await addressTransactionsApi(id, pageSize, currentPage)
  const transactions = addressTransactionsApiRes.list
  // 获取总数据量
  const totalTransactions = addressTransactionsApiRes.pagination.total
  const totalPages = addressTransactionsApiRes.pagination.totalPages

  // 分析交易函数 - 使用 Decimal.js 进行精确计算
  const analyzeTransaction = (tx: TransactionType, currentAddress: string) => {
    // 计算当前地址在所有输入中的总金额
    const totalInput = tx.senders
      .filter((sender) => sender.address === currentAddress)
      .reduce((sum, sender) => sum.plus(new Decimal(sender.amount)), new Decimal(0))

    // 计算当前地址在所有输出中的总金额
    const totalOutput = tx.receivers
      .filter((receiver) => receiver.address === currentAddress)
      .reduce((sum, receiver) => sum.plus(new Decimal(receiver.amount)), new Decimal(0))

    // 计算当前地址在找零输出中的总金额
    const totalChange = tx.changeOutputs
      .filter((change) => change.address === currentAddress)
      .reduce((sum, change) => sum.plus(new Decimal(change.amount)), new Decimal(0))

    // 判断交易类型
    const isCoinbase = tx.senders.length === 0 // 挖矿交易
    const isSender = totalInput.gt(0)
    const isReceiver = totalOutput.gt(0)

    let type: 'income' | 'expense' | 'self' | 'mining'
    let amount = new Decimal(0)
    let netAmount = new Decimal(0)

    if (isCoinbase && isReceiver) {
      // 挖矿奖励 - 只有输出没有输入
      type = 'mining'
      netAmount = totalOutput
      amount = totalOutput
    } else if (isSender && totalChange && isReceiver) {
      // 自己发给自己 - 有输入也有输出
      type = 'self'
      // 净变化 = 总输出 - 总输入（找零已经包含在总输出中）
      netAmount = totalOutput.minus(totalInput)
      amount = netAmount.abs()
    } else if (isSender) {
      // 只有输入没有输出 - 支出交易
      type = 'expense'
      // 净变化 = -总输入 - 找零
      netAmount = totalInput.minus(totalChange).negated()
      amount = totalInput.minus(totalChange)
    } else if (isReceiver) {
      // 只有输出没有输入 - 收入交易
      type = 'income'
      // 净变化 = 总输出
      netAmount = totalOutput
      amount = totalOutput
    } else {
      // 不相关交易，理论上不应该发生
      type = 'self'
      netAmount = new Decimal(0)
      amount = new Decimal(0)
    }

    return {
      type,
      amount: satoshisToBtc(amount.toString()),
      netAmount: satoshisToBtc(netAmount.abs().toString()),
      isPositive: netAmount.gte(0),
      txid: tx.txid,
      timestamp: tx.timestamp,
      confirmations: tx.confirmations
    }
  }

  // 分析所有交易
  const analyzedTransactions = transactions.map((tx) => analyzeTransaction(tx, id))

  // 使用真实API数据
  const addressData = {
    address: id,
    balance: satoshisToBtc(addressDetail.balance),
    totalReceived: satoshisToBtc(addressDetail.received),
    totalSent: satoshisToBtc(addressDetail.sent),
    txCount: addressDetail.transactionCount,
    firstSeen: formatTime(addressDetail.firstSeen, t),
    lastSeen: formatTime(addressDetail.lastSeen, t)
  }

  const addressTags = addressDetail.addressTags || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            {t('address.title')}
            <AddAddressTagButton address={addressData.address} className="ml-2" locale={locale} />
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-sm text-muted-foreground font-mono break-all">{addressData.address}</p>
            <CopyButton textToCopy={addressData.address} title={t('common.copy')} />
          </div>
          {addressTags.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {addressTags.map((tag, idx) => {
                  const type = (tag.type || '').toLowerCase()
                  const isWebsite = type === 'website'
                  const isGroup = type === 'group_chat'
                  const isText = !isWebsite && !isGroup

                  const hrefCandidate = (tag.description || '').trim() || (tag.name || '').trim()
                  const href = /^https?:\/\//i.test(hrefCandidate) ? hrefCandidate : undefined

                  const commonClasses = 'border px-2 py-0.5 text-xs rounded-md inline-flex items-center gap-1'
                  const textClasses = 'bg-muted/30 text-muted-foreground border-muted'
                  const websiteClasses =
                    'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  const groupClasses =
                    'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'

                  const classes = `${commonClasses} ${isWebsite ? websiteClasses : isGroup ? groupClasses : textClasses}`

                  const Icon = isWebsite ? Link2 : isGroup ? Users : TagIcon

                  return href && (isWebsite || isGroup) ? (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes}
                      title={tag.description || tag.name}
                    >
                      <Icon className="size-3" />
                      <span className="truncate max-w-[200px]" title={tag.name}>
                        {tag.name}
                      </span>
                    </a>
                  ) : (
                    <span key={idx} className={classes} title={tag.description || tag.name}>
                      <Icon className="size-3" />
                      <span className="truncate max-w-[200px]" title={tag.name}>
                        {tag.name}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-10">
          <div>
            {t('address.lastSeen')}:<div className="font-medium">{addressData.lastSeen}</div>
          </div>
          <div>
            {t('address.firstSeen')}:<div className="font-medium">{addressData.firstSeen}</div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('address.balance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              <FormattedAmount value={addressData.balance} symbol={BASE_SYMBOL} integerClassName="text-2xl" decimalClassName="text-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('address.received')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              <FormattedAmount
                value={addressData.totalReceived}
                symbol={BASE_SYMBOL}
                integerClassName="text-2xl"
                decimalClassName="text-lg"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('address.sent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              <FormattedAmount value={addressData.totalSent} symbol={BASE_SYMBOL} integerClassName="text-2xl" decimalClassName="text-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('address.txCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions and Graph */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="transactions">{t('address.transactions')}</TabsTrigger>
          <TabsTrigger value="graph">{t('address.graph')}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('address.transactions')}</CardTitle>
              <CardDescription>{totalTransactions.toLocaleString()} total transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyzedTransactions.map((tx) => (
                  <div
                    key={tx.txid}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full flex-shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-green-100 text-green-600'
                            : tx.type === 'expense'
                            ? 'bg-red-100 text-red-600'
                            : tx.type === 'self'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : tx.type === 'expense' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : tx.type === 'self' ? (
                          <Activity className="h-4 w-4" />
                        ) : (
                          <Pickaxe className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/tx/${tx.txid}`}
                            className="font-mono text-sm text-primary hover:underline max-w-full sm:max-w-[400px] md:max-w-[600px] truncate"
                            title={tx.txid}
                          >
                            {tx.txid}
                          </Link>
                          <CopyButton textToCopy={tx.txid} title={t('common.copy')} />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span>{formatTime(tx.timestamp, t)}</span>
                          <span>
                            {tx.confirmations} {t('tx.confirmations')}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${
                              tx.type === 'income'
                                ? 'border-green-200 text-green-700'
                                : tx.type === 'expense'
                                ? 'border-red-200 text-red-700'
                                : tx.type === 'self'
                                ? 'border-blue-200 text-blue-700'
                                : 'border-yellow-200 text-yellow-700'
                            }`}
                          >
                            {tx.type === 'income'
                              ? t('address.income')
                              : tx.type === 'expense'
                              ? t('address.expense')
                              : tx.type === 'self'
                              ? t('address.selfTransfer')
                              : t('address.mining')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:text-right">
                      <div className={`text-lg font-semibold ${tx.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        <FormattedAmount
                          value={tx.isPositive ? tx.netAmount : tx.netAmount * -1}
                          symbol={BASE_SYMBOL}
                          showPositiveSign={true}
                          integerClassName="text-lg"
                          decimalClassName="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  basePath={`/address/${id}`}
                  translations={{
                    previous: t('common.previous'),
                    next: t('common.next'),
                    pageSize: t('common.pageSize')
                  }}
                  className="mt-6"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t('address.graph')}
              </CardTitle>
              <CardDescription>Network visualization of address relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <AddressTransactionGraphG6 id={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
