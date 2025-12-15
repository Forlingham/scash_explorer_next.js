import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getServerTranslations } from '@/i18n/server-i18n'
import { inactiveAddressesListApi } from '@/lib/http-server'
import { BASE_SYMBOL } from '@/lib/const'
import { satoshisToBtc } from '@/lib/currency.utils'
import { FormattedAmount } from '@/components/formatted-amount'
import { formatTime } from '@/lib/serverUtils'
import { Pagination } from '@/components/pagination'

interface InactiveDetailPageProps {
  params: {
    view: 'address' | 'amount'
    index: string
  }
}

export default async function InactiveDetailPage({ params, searchParams }: InactiveDetailPageProps & { params: Promise<any> } & { searchParams?: Promise<any> }) {
  const { t } = await getServerTranslations()
  const { view, index } = params
  const sp = searchParams ? await searchParams : {}
  const page = Number(sp?.page ?? 1) || 1
  const pageSize = Number(sp?.pageSize ?? 20) || 20

  const title = view === 'address' ? t('inactiveAddresses.addressCount') : t('inactiveAddresses.balance')

  // 将图例文字/索引映射为接口所需 period 参数
  const periodFromLabel = () => {
    // if (/2\s*year|两年|2年/.test(lower)) return '2year'
    if (index === '0') return '1year'
    if (index === '1') return '6months'
    if (index === '2') return '3months'
    if (index === '3') return '1month'

    // 兜底：根据索引推断（假设 index 0 为活跃，其余依次 twoYears, oneYear, sixMonths, threeMonths, oneMonth）

    return ''
  }

  const typeParam = view === 'amount' ? 'balance' : 'address'

  let apiData: InactiveAddressesList | null = null
  let errorMsg: string | null = null

  try {
    const period = periodFromLabel()
    console.log(period)

    const res = await inactiveAddressesListApi(period, typeParam, page, pageSize)
    apiData = res
  } catch (err: any) {
    errorMsg = err?.message || t('common.loadingFailed')
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('inactiveAddresses.addressDetails')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('inactiveAddresses.view')}：
            <Badge variant="outline" className="mx-1">
              {view === 'address' ? t('common.address') : t('common.balance')}
            </Badge>
            {t('common.index')}：{index}
          </p>
        </div>
        <Link href="/" className="text-sm text-primary hover:underline">
          {t('common.returnHome')}
        </Link>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{title}</CardTitle>
          <CardDescription>
            {errorMsg ? (
              <span className="text-destructive">{errorMsg}</span>
            ) : apiData?.summary ? (
              <span>
                {t('common.totalAddresses')} {apiData.summary.totalAddresses.toLocaleString()} 
                {t('common.totalBalance')} 
                <span className="mx-1 font-mono">
                  {satoshisToBtc(apiData.summary.totalBalance)} {BASE_SYMBOL}
                </span>
                —— 
                {t('inactiveAddresses.'+apiData.summary.description)}
              </span>
            ) : (
              t('common.loadingData')
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('inactiveAddresses.address')}</TableHead>
                <TableHead className="text-right">{t('inactiveAddresses.balance')}（{BASE_SYMBOL}）</TableHead>
                <TableHead className="text-right">{t('address.lastSeen')}</TableHead>
                <TableHead className="text-right">{t('blocks.transactions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiData?.addresses?.map((row) => (
                <TableRow key={row.address}>
                  <TableCell className="font-mono break-all">
                    <Link href={`/address/${row.address}`} className="hover:underline">
                      {row.address}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {/* { `${satoshisToBtc(row.balance)} ${BASE_SYMBOL}` } */}
                    <FormattedAmount
                      value={satoshisToBtc(row.balance)}
                      decimalClassName="text-xs"
                      className="text-primary font-bold"
                      symbolClassName="h-5 "
                    />
                  </TableCell>
                  <TableCell className="text-right">{formatTime(row.lastActive,t)}</TableCell>
                  <TableCell className="text-right">{row.txCount ? row.txCount.toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
              {!errorMsg && (apiData?.addresses?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {apiData?.pagination && (
            <Pagination
              currentPage={apiData.pagination.page}
              totalPages={Math.max(1, Math.ceil(apiData.pagination.total / apiData.pagination.pageSize))}
              pageSize={apiData.pagination.pageSize}
              basePath={`/inactive-addresses/${view}/${index}`}
              linkStyle="query"
              translations={{
                previous: t('common.previous'),
                next: t('common.next'),
                pageSize: t('common.pageSize')
              }}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
