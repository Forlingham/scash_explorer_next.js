import Link from 'next/link'
import { Users, TrendingUp, TrendingDown, PieChart, Crown, Medal, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getServerTranslations } from '@/i18n/server-i18n'
import { DatePicker } from '@/components/date-picker'
import { balanceDistributionApi, rankingDistributionApi, whaleChangesApi } from '@/lib/http-server'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'
import { PriceChange } from '@/components/ui/price-change'
import { PieChartComponent } from '@/components/pie-chart'
import { AddressTags } from '@/components/address-tags'

interface WhaleWatcherPageProps {
  params: {
    date?: string
  }
}

export default async function WhaleWatcherPage({ params }: WhaleWatcherPageProps & { params: Promise<any> }) {
  const { t } = await getServerTranslations()
  // 获取当前日期
  const currentDate = new Date().toISOString().split('T')[0]

  let { date } = params
  date = date || currentDate

  const whaleChangesApiRes = await whaleChangesApi(date === currentDate ? '' : date)
  const whaleData = whaleChangesApiRes.map((item) => {
    const balance = satoshisToBtc(item.currentBalance || 0)
    return {
      address: item.address,
      currentRank: item.currentRank,
      rankChange: item.rankChange || 0,
      balance: balance,
      balanceChange: satoshisToBtc(item.balanceChange || 0),
      isNew: item.rankChange === null,
      tags: item.tags || []
    }
  })

  // 获取地址余额分布统计（用于饼图）
  const balanceDistributionApiRes = await balanceDistributionApi()
  const balanceDistribution = balanceDistributionApiRes.distribution

  // 获取地址排名金额占比统计（用于饼图）
  const rankingDistributionApiRes = await rankingDistributionApi()
  const rankingDistribution = rankingDistributionApiRes.distribution

  // 为饼图数据添加颜色和name字段
  const balanceChartData = balanceDistribution.map((item, index) => ({
    name: item.range + ` ${BASE_SYMBOL}`,
    range: item.range + ` ${BASE_SYMBOL}`,
    count: item.count,
    percentage: item.percentage
  }))

  const rankingChartData = rankingDistribution.map((item, index) => ({
    name: item.range,
    range: item.range,
    count: item.count,
    percentage: parseFloat(item.percentage)
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              {t('richList.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* 饼图统计区域 */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* 地址余额分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              {t('whale.addressBalanceDistribution')}
            </CardTitle>
            <CardDescription>{t('whale.addressBalanceDistributionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={balanceChartData}
              dataKey="count"
              valueLabel={t('whale.addressCount')}
              title={t('whale.addressBalanceDistributionTitle')}
            />
          </CardContent>
        </Card>

        {/* 地址排名金额占比饼图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              {t('whale.rankingDistribution')}
            </CardTitle>
            <CardDescription>{t('whale.rankingDistributionDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={rankingChartData}
              dataKey="percentage"
              valueLabel={t('whale.rankingDistribution')}
              isPercentage={true}
              title={t('whale.rankingDistributionTitle')}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">{t('whale.title')}</CardTitle>
            <CardDescription>{t('whale.subtitle')}</CardDescription>
            <div className="text-sm text-muted-foreground">
              {t('whale.viewDate')}:{' '}
              {new Date(date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DatePicker selectedDate={date} basePath="/whale-watcher" placeholder={t('common.selectDate')} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('whale.address')}</TableHead>
                  <TableHead className="text-center">{t('whale.currentRank')}</TableHead>
                  <TableHead className="text-center">{t('whale.rankChange')}</TableHead>
                  <TableHead className="text-right">{t('whale.balance')}</TableHead>
                  <TableHead className="text-right">{t('whale.balanceChange')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whaleData.map((whale) => (
                  <TableRow key={whale.address}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Link href={`/address/${whale.address}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                          {whale.address}
                        </Link>
                        <AddressTags tags={whale.tags} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {whale.currentRank === 1 ? (
                        <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-200">
                          <Crown className="w-3 h-3 mr-1" /> #{whale.currentRank}
                        </Badge>
                      ) : whale.currentRank === 2 ? (
                        <Badge className="bg-slate-300 hover:bg-slate-400 text-slate-800 border-slate-200">
                          <Medal className="w-3 h-3 mr-1" /> #{whale.currentRank}
                        </Badge>
                      ) : whale.currentRank === 3 ? (
                        <Badge className="bg-orange-300 hover:bg-orange-400 text-orange-900 border-orange-200">
                          <Award className="w-3 h-3 mr-1" /> #{whale.currentRank}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-mono">
                          #{whale.currentRank}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {whale.isNew ? (
                        <Badge variant="default" className="bg-success">
                          {t('whale.new')}
                        </Badge>
                      ) : whale.rankChange == 0 ? (
                        ' '
                      ) : (
                        <PriceChange value={whale.rankChange} unit=" " />
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {whale.balance.toLocaleString()} {BASE_SYMBOL}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          whale.balanceChange > 0
                            ? 'text-success font-semibold'
                            : whale.balanceChange < 0
                            ? 'text-destructive font-semibold'
                            : 'text-muted-foreground'
                        }
                      >
                        {whale.balanceChange > 0 ? '+' : ''}
                        {whale.balanceChange.toLocaleString()} {BASE_SYMBOL}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="md:hidden space-y-3">
            {whaleData.map((whale) => (
              <div key={whale.address} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/address/${whale.address}`} className="font-mono text-sm text-primary hover:underline break-all">
                    {whale.address}
                  </Link>

                  {whale.currentRank === 1 ? (
                    <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-200">
                      <Crown className="w-3 h-3 mr-1" /> #{whale.currentRank}
                    </Badge>
                  ) : whale.currentRank === 2 ? (
                    <Badge className="bg-slate-300 hover:bg-slate-400 text-slate-800 border-slate-200">
                      <Medal className="w-3 h-3 mr-1" /> #{whale.currentRank}
                    </Badge>
                  ) : whale.currentRank === 3 ? (
                    <Badge className="bg-orange-300 hover:bg-orange-400 text-orange-900 border-orange-200">
                      <Award className="w-3 h-3 mr-1" /> #{whale.currentRank}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-mono">
                      #{whale.currentRank}
                    </Badge>
                  )}
                </div>
                <div>
                  <AddressTags tags={whale.tags} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('whale.balance')}</div>
                  <div className="text-right font-semibold">
                    {whale.balance.toLocaleString()} {BASE_SYMBOL}
                  </div>
                  <div className="text-muted-foreground">{t('whale.balanceChange')}</div>
                  <div className="text-right">
                    <span
                      className={
                        whale.balanceChange > 0
                          ? 'text-success font-semibold'
                          : whale.balanceChange < 0
                          ? 'text-destructive font-semibold'
                          : 'text-muted-foreground'
                      }
                    >
                      {whale.balanceChange > 0 ? '+' : ''}
                      {whale.balanceChange.toLocaleString()} {BASE_SYMBOL}
                    </span>
                  </div>
                  <div className="text-muted-foreground">{t('whale.rankChange')}</div>
                  <div className="text-right">
                    {whale.isNew ? (
                      <Badge variant="default" className="bg-success">
                        {t('whale.new')}
                      </Badge>
                    ) : whale.rankChange == 0 ? (
                      '-'
                    ) : (
                      <PriceChange value={whale.rankChange} unit=" " />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
