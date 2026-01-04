import Link from 'next/link'
import dayjs from 'dayjs'
import { Wallet, Activity, Users, TrendingUp, Clock, Zap, ArrowRight, Box, Pickaxe, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PriceChange } from '@/components/ui/price-change'
import { getServerTranslations } from '@/i18n/server-i18n'
import { PriceChart } from '@/components/charts/price-chart'
import { TransactionChart } from '@/components/charts/transaction-chart'
import { HashrateChart } from '@/components/charts/hashrate-chart'
import { Transactions7DaysChart } from '@/components/charts/transactions-7days-chart'
import { NetworkDifficultyChart } from '@/components/charts/network-difficulty-chart'
import { MinerDistributionChart } from '@/components/charts/miner-distribution-chart'
import { blocksApi, feeEstimateApi, homeChartApi, homeOverviewApi, inactiveAddressesApi } from '@/lib/http-server'
import { formatAddress, formatTime, formatMarketCap } from '@/lib/serverUtils'
import { BASE_SYMBOL } from '@/lib/const'
import { satoshisToBtc } from '@/lib/currency.utils'
import Decimal from 'decimal.js'
import { FormattedAmount } from '@/components/formatted-amount'
import { InactiveStorageChart } from '@/components/charts/inactive-storage-chart'
import { MempoolTransactionsChart } from '@/components/charts/mempool-transactions-chart'
import ScashDAP from 'scash-dap'

export default async function HomePage() {
  const { t } = await getServerTranslations()
  console.log(
    new ScashDAP({
      messagePrefix: '\x18Scash Signed Message:\n',
      bech32: 'scash',
      bip32: { public: 0x0488b21e, private: 0x0488ade4 },
      pubKeyHash: 0x3c,
      scriptHash: 0x7d,
      wif: 0x80
    }).createDapOutputs("233")
  )

  const homeOverviewApiRes = await homeOverviewApi()

  const dailyStatsChangeRes = homeOverviewApiRes.dailyStatsChange

  // 计算24小时内的变化百分比
  const marketCap = new Decimal(dailyStatsChangeRes.totalMarketCap).minus(dailyStatsChangeRes.latestStatsTotalMarketCap).toString()
  const changePercent24h = Number(new Decimal(marketCap).div(dailyStatsChangeRes.totalMarketCap).times(100).toFixed(2))
  const dailyStats = {
    totalBlocks: dailyStatsChangeRes.totalBlocks,
    totalBlocksChange: dailyStatsChangeRes.change.totalBlocks,
    totalTxs: dailyStatsChangeRes.totalTxs,
    totalTxsChange: dailyStatsChangeRes.change.totalTxs,
    totalVolume: dailyStatsChangeRes.totalVolume,
    totalVolumeChange: dailyStatsChangeRes.change.totalVolume,
    totalAddrCount: dailyStatsChangeRes.totalAddrCount,
    totalAddrCountChange: dailyStatsChangeRes.change.addrCount,
    totalMarketCap: dailyStatsChangeRes.totalMarketCap,
    totalMarketCapChange: changePercent24h
  }

  const price = {
    price: Number(homeOverviewApiRes.price.price),
    change24h: Number(homeOverviewApiRes.price.change24h),
    changePercent24h: Number(homeOverviewApiRes.price.changePercent24h),
    change7d: Number(homeOverviewApiRes.price.change7d),
    changePercent7d: Number(homeOverviewApiRes.price.changePercent7d),
    change30d: Number(homeOverviewApiRes.price.change30d),
    changePercent30d: Number(homeOverviewApiRes.price.changePercent30d)
  }
  // 2025-10-22T09:26:30.330Z
  const priceData = homeOverviewApiRes.priceChart.map((item) => ({
    time: new Date(item.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    price: Number(item.price)
  }))

  const feeEstimates = [
    { priority: t('stats.fast'), blocks: 1, rate: homeOverviewApiRes.feeEstimate1.feeRateSatPerVb || 0 },
    { priority: t('stats.medium'), blocks: 6, rate: homeOverviewApiRes.feeEstimate6.feeRateSatPerVb || 0 },
    { priority: t('stats.slow'), blocks: 144, rate: homeOverviewApiRes.feeEstimate144.feeRateSatPerVb || 0 }
  ]

  const blocksApiRes = await blocksApi(10, 1)
  const recentBlocks = blocksApiRes.list || []

  // 不活跃地址统计
  const inactiveAddressesApiRes = await inactiveAddressesApi()

  // 计算不活跃地址统计数据
  const totalInactiveCount = Object.values(inactiveAddressesApiRes.inactiveAddresses).reduce((sum, item) => sum + item.count, 0)
  const totalInactiveBalance = Object.values(inactiveAddressesApiRes.inactiveAddresses).reduce((sum, item) => sum + Number(item.balance), 0)
  const activeCount = inactiveAddressesApiRes.totalAddresses - totalInactiveCount
  const activeBalance = Number(inactiveAddressesApiRes.totalBalance) - totalInactiveBalance
  const activeCountPercentage = ((activeCount / inactiveAddressesApiRes.totalAddresses) * 100).toFixed(1)
  const activeBalancePercentage = ((activeBalance / Number(inactiveAddressesApiRes.totalBalance)) * 100).toFixed(1)

  // 预计算各时间段的百分比数据
  const inactiveStatsWithPercentages = Object.entries(inactiveAddressesApiRes.inactiveAddresses).map(([key, data]) => ({
    key,
    data,
    addressPercentage: ((data.count / inactiveAddressesApiRes.totalAddresses) * 100).toFixed(1),
    balancePercentage: ((Number(data.balance) / Number(inactiveAddressesApiRes.totalBalance)) * 100).toFixed(1)
  }))

  // 首页的图表数据
  const homeChartApiRes = await homeChartApi()

  const transactions7days = homeChartApiRes.transactionStatsLast7Days
  const networkDifficulty = homeChartApiRes.networkDifficultyStatsHourly.map((item) => ({
    hour: dayjs(item.hour).format('MM/DD HH:mm'),
    difficulty: item.difficulty
  }))
  const minerDistribution = homeChartApiRes.minerDistributionStats

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
          {t('home.title')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('home.subtitle')}</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('home.totalBlocks')}</CardTitle>
            <Box className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dailyStats.totalBlocks.toLocaleString()}</div>
            <p className="text-xs  flex items-center gap-1 mt-1">
              {/* <ArrowUpRight className="h-3 w-3" />+{dailyStats.totalBlocksChange.toLocaleString()} {t('home.last24h')} */}

              <PriceChange value={dailyStats.totalBlocksChange} textSize="text-xs" iconSize="h-3 w-3" unit=" " />
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('home.totalTransactions')}</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dailyStats.totalTxs.toLocaleString()}</div>
            <p className="text-xs  flex items-center gap-1 mt-1">
              {/* <ArrowUpRight className="h-3 w-3" />+{dailyStats.totalTxsChange.toLocaleString()} {t('home.last24h')} */}
              <PriceChange value={dailyStats.totalTxsChange} textSize="text-xs" iconSize="h-3 w-3" unit=" " />
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('stats.totalWallets')}</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dailyStats.totalAddrCount.toLocaleString()}</div>
            {/* {t('stats.activeWallets')}: */}
            <p className="text-xs text-muted-foreground mt-1">{dailyStats.totalAddrCountChange.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('home.marketCap')}</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatMarketCap(dailyStats.totalMarketCap)}</div>
            <p className="text-xs  flex items-center gap-1 mt-1">
              <PriceChange value={dailyStats.totalMarketCapChange} textSize="text-xs" iconSize="h-3 w-3" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Chart and Fee Estimator Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Price Chart */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t('home.priceChart')}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold">${price.price.toLocaleString()}</span>
                  <PriceChange value={price.changePercent7d.toFixed(2)} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PriceChart data={priceData} currentPrice={price.price} priceChange24h={price.change24h} />
          </CardContent>
        </Card>

        {/* Fee Estimator */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t('stats.feeEstimator')}
            </CardTitle>
            <CardDescription>{t('home.feeEstimatorDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {feeEstimates.map((estimate, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">{estimate.priority}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />~{estimate.blocks} {t('stats.blocks')}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">{estimate.rate} sat/vB</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Blocks and Transactions */}
      <div className="space-y-6 mb-8">
        {/* Recent Blocks - Horizontal scrollable card layout like TronScan */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                {t('home.recentBlocks')}
              </CardTitle>
              <Link href="/blocks" className="text-sm text-primary hover:underline flex items-center gap-1">
                {t('home.more')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 blocks-scroll">
                {recentBlocks.map((block) => (
                  <div
                    className="flex-shrink-0 w-[280px] p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-primary/40 hover:shadow-md"
                    key={block.height}
                  >
                    <div className="space-y-3">
                      {/* Block number and miner */}
                      <div className="flex items-start justify-between">
                        <div className="font-bold text-lg text-foreground text-ellipsis whitespace-nowrap">
                          <Link key={block.height} href={`/block/${block.height}/20/1`}>
                            #{block.height}
                          </Link>
                        </div>
                        <div className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Link
                            href={`/address/${block.minerAddress}/20/1`}
                            className="text-blue-600 hover:underline"
                            title={block.minerAddress || ''}
                          >
                            {formatAddress(block.minerAddress || '')}
                          </Link>
                          <Pickaxe className="h-3 w-3" />
                        </div>
                      </div>

                      {/* Time and transaction count */}
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">{formatTime(block.timestamp, t)}</div>
                        <div className="text-sm font-medium text-foreground">
                          {block.txCount} {t('home.transactions')}
                        </div>
                      </div>

                      {/* Metrics with icons */}
                      <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-1.5" title={t('home.blockReward')}>
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/10">
                            <span className="text-xs">💰</span>
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            {satoshisToBtc(block.reward)} {BASE_SYMBOL}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5" title={t('home.totalFees')}>
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/10">
                            <Zap className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-foreground">
                            {block.medianFee} {BASE_SYMBOL}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5" title={t('home.blockSize')}>
                          <div className="flex items-center justify-center w-5 h-5 rounded bg-primary/10">
                            <Box className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{(block.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mempool Transactions Module */}
      <div className="mb-8">
        <MempoolTransactionsChart />
      </div>

      {/* 不活跃地址统计 */}
      <div className="mb-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('inactiveAddresses.title')}
            </CardTitle>
            <CardDescription>{t('inactiveAddresses.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 总体统计 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{inactiveAddressesApiRes.totalAddresses.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{t('inactiveAddresses.totalAddresses')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    <FormattedAmount
                      value={satoshisToBtc(inactiveAddressesApiRes.totalBalance)}
                      integerClassName="text-2xl"
                      decimalClassName="text-lg"
                      className="text-primary font-bold"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">{t('inactiveAddresses.totalBalance')}</div>
                </div>
              </div>

              {/* 不活跃地址占比 - 存储风格堆叠条 */}
              <div className="space-y-4">
                {(() => {
                  // 为每个时间段选择颜色
                  const palette = [
                    '#F59E0B', // amber
                    '#3B82F6', // blue
                    '#EF4444', // red
                    '#A855F7', // violet
                    '#10B981', // emerald
                    '#FB7185', // rose
                    '#6366F1', // indigo
                    '#22D3EE' // cyan
                  ]

                  const addressSegmentsInactive = inactiveStatsWithPercentages.map(({ data, addressPercentage }, idx) => ({
                    label: t(`inactiveAddresses.${data.description}`),
                    percent: Number(addressPercentage),
                    color: palette[idx % palette.length],
                    valueText: `${data.count.toLocaleString()} ${t('inactiveAddresses.addressCount')}`
                  }))

                  const balanceSegmentsInactive = inactiveStatsWithPercentages.map(({ data, balancePercentage }, idx) => ({
                    label: t(`inactiveAddresses.${data.description}`),
                    percent: Number(balancePercentage),
                    color: palette[idx % palette.length],
                    valueText: `${satoshisToBtc(data.balance)} ${BASE_SYMBOL}`
                  }))

                  // 追加活跃地址占比作为一个分段（置于底部，颜色为绿色）
                  const activeAddressSegment = {
                    label: t('inactiveAddresses.activeAddresses'),
                    percent: Number(activeCountPercentage),
                    color: '#22C55E', // green-500
                    valueText: `${activeCount.toLocaleString()} ${t('inactiveAddresses.addressCount')}`
                  }

                  const activeBalanceSegment = {
                    label: t('inactiveAddresses.activeAddresses'),
                    percent: Number(activeBalancePercentage),
                    color: '#22C55E',
                    valueText: `${satoshisToBtc(activeBalance.toString())} ${BASE_SYMBOL}`
                  }

                  const addressSegments = [...addressSegmentsInactive, activeAddressSegment]
                  const balanceSegments = [...balanceSegmentsInactive, activeBalanceSegment]

                  return (
                    <InactiveStorageChart
                      titleLeft={t('inactiveAddresses.addressCount')}
                      titleRight={t('inactiveAddresses.balance')}
                      addressSegments={addressSegments}
                      balanceSegments={balanceSegments}
                    />
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Statistics Charts */}
      <div className="space-y-6 mb-8">
        {/* 7天交易量趋势图 */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t('home.transactionVolumeTrend')}
            </CardTitle>
            <CardDescription>{t('home.transactionVolumeTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Transactions7DaysChart
              data={transactions7days}
              text={{
                date: t('char.date'),
                transactionVolume: t('char.transactionVolume')
              }}
            />
          </CardContent>
        </Card>

        {/* 网络难度和矿工分布 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 网络难度图表 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                {t('home.networkDifficultyTrend')}
              </CardTitle>
              <CardDescription>{t('home.networkDifficultyTrendDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkDifficultyChart
                data={networkDifficulty}
                text={{
                  date: t('char.date'),
                  networkDifficulty: t('char.networkDifficulty')
                }}
              />
            </CardContent>
          </Card>

          {/* 矿工分布饼图 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pickaxe className="h-5 w-5 text-orange-500" />
                {t('home.minerDistribution')}
              </CardTitle>
              <CardDescription>{t('home.minerDistributionDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <MinerDistributionChart
                data={minerDistribution}
                text={{
                  address: t('char.address'),
                  pickedBlocks: t('char.pickedBlocks'),
                  miner: t('char.miner'),
                  percentage: t('char.percentage'),
                  miningTag1: t('char.miningTag1'),
                  miningTag2: t('char.miningTag2')
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
