import Link from 'next/link'
import { Cable as Cube, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/pagination'
import { getServerTranslations } from '@/i18n/server-i18n'
import { redirect } from 'next/navigation'
import { blocksApi, serverHttpClient } from '@/lib/http-server'
import { formatTime, formatHash, formatAddress } from '@/lib/serverUtils'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'

interface BlocksPageProps {
  params: {
    pageSize: string
    page: string
  }
}

export default async function BlocksPage({ params }: BlocksPageProps & { params: Promise<any> }) {
  const { t } = await getServerTranslations()

  // 解析参数 - 在Next.js 15中需要await params
  const { pageSize: pageSizeStr, page: pageStr } = params
  const pageSize = parseInt(pageSizeStr)
  const currentPage = parseInt(pageStr)

  // 验证参数
  if (isNaN(pageSize) || isNaN(currentPage) || pageSize <= 0 || currentPage <= 0) {
    redirect('/blocks/20/1')
  }

  // 限制每页最大数量
  if (pageSize > 100) {
    redirect('/blocks/100/1')
  }

  const res = await blocksApi(pageSize, currentPage)

  // 模拟总数据量
  const totalBlocks = res.pagination.total
  const totalPages = res.pagination.totalPages

  // 确保页码不超过总页数
  if (currentPage > totalPages) {
    redirect(`/blocks/${pageSize}/${totalPages}`)
  }

  const blocks = res.list

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cube className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('blocks.title')}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('blocks.totalBlocks')}: {totalBlocks.toLocaleString()}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('blocks.latestBlocks')}
          </CardTitle>
          <CardDescription>
            {t('blocks.page')} {currentPage} / {totalPages.toLocaleString()}({t('blocks.showing')} {blocks.length} {t('blocks.of')}{' '}
            {pageSize} {t('blocks.perPage')})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>{t('blocks.height')}</TableHead>
                <TableHead>{t('blocks.hash')}</TableHead>
                <TableHead>{t('blocks.time')}</TableHead>
                <TableHead>{t('blocks.transactions')}</TableHead>
                <TableHead>{t('blocks.size')}</TableHead>
                <TableHead>{t('blocks.gasUsed')}</TableHead>
                <TableHead>{t('blocks.miner')}</TableHead>
                <TableHead>{t('reward')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.height}>
                  <TableCell className="font-mono">
                    <Link href={`/block/${block.height}/20/1`} className="text-blue-600 hover:underline">
                      {block.height.toLocaleString()}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <Link href={`/block/${block.hash}/20/1`} className="text-blue-600 hover:underline" title={block.hash}>
                      {formatHash(block.hash)}
                    </Link>
                  </TableCell>
                  <TableCell>{formatTime(block.timestamp, t)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{block.txCount}</Badge>
                  </TableCell>
                  <TableCell>{(block.size / 1024).toFixed(1)} KB</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{block.medianFee} sat/vB</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <Link
                      href={`/address/${block.minerAddress}`}
                      className="text-blue-600 hover:underline"
                      title={block.minerAddress || ''}
                    >
                      {formatAddress(block.minerAddress || '')}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {satoshisToBtc(block.reward).toFixed(8)} {BASE_SYMBOL}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="md:hidden space-y-3">
            {blocks.map((block) => (
              <div key={block.height} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/block/${block.height}/20/1`} className="font-mono text-sm text-blue-600 hover:underline">
                    #{block.height.toLocaleString()}
                  </Link>
                  <Badge variant="secondary">{(block.size / 1024).toFixed(1)} KB</Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{formatTime(block.timestamp, t)}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('blocks.hash')}</div>
                  <div className="text-right font-mono break-all col-span-2">
                    <Link href={`/block/${block.hash}/20/1`} className="text-blue-600 hover:underline" title={block.hash}>
                      {formatHash(block.hash)}
                    </Link>
                  </div>
                  <div className="text-muted-foreground">{t('blocks.transactions')}</div>
                  <div className="text-right col-span-2">
                    <Badge variant="secondary">{block.txCount}</Badge>
                  </div>
                  <div className="text-muted-foreground">{t('blocks.gasUsed')}</div>
                  <div className="text-right col-span-2">{block.medianFee} sat/vB</div>
                  <div className="text-muted-foreground">{t('blocks.miner')}</div>
                  <div className="text-right font-mono break-all col-span-2">
                    <Link href={`/address/${block.minerAddress}`} className="text-blue-600 hover:underline" title={block.minerAddress || ''}>
                      {formatAddress(block.minerAddress || '')}
                    </Link>
                  </div>
                  <div className="text-muted-foreground">{t('reward')}</div>
                  <div className="text-right col-span-2">
                    {satoshisToBtc(block.reward).toFixed(8)} {BASE_SYMBOL}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页导航 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            basePath="/blocks"
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
}
