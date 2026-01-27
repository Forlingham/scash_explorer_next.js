import { ScashDAPDataDisplay } from '@/components/scash-dap-data-display'
import { Pagination } from '@/components/pagination'
import { FileText, Pin, Activity, Users, Coins } from 'lucide-react'
import Link from 'next/link'
import { getDapListApi, getDapStatsApi } from '@/lib/http-server'
import { redirect } from 'next/navigation'
import { getServerTranslations } from '@/i18n/server-i18n'
import { DapFilterToggle } from '@/components/dap-filter-toggle'
import { DapSearch } from '@/components/dap-search'
import { Badge } from '@/components/ui/badge'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'

interface DapListPageProps {
  params: {
    pageSize: string
    page: string
  }
}

export default async function DapListPage({
  params,
  searchParams
}: DapListPageProps & { params: Promise<any>; searchParams: Promise<any> }) {
  const { t } = await getServerTranslations()
  const { pageSize: pageSizeStr, page: pageStr } = await params
  const { filterTransfer, address, content } = await searchParams

  const pageSize = parseInt(pageSizeStr)
  const currentPage = parseInt(pageStr)
  // Default to filtering transfer messages if param is missing or explicitly 'true'
  // Only disable if explicitly set to 'false'
  const isFilterTransfer = filterTransfer !== 'false'

  if (isNaN(pageSize) || isNaN(currentPage) || pageSize <= 0 || currentPage <= 0) {
    redirect('/dap/20/1')
  }

  if (pageSize > 100) {
    redirect('/dap/100/1')
  }

  const [response, pinnedResponse, stats] = await Promise.all([
    getDapListApi(isFilterTransfer, address as string, undefined, content as string, currentPage, pageSize),
    // Fetch pinned data (limit 5)
    getDapListApi(false, undefined, undefined, undefined, 1, 5, undefined, undefined, true),
    getDapStatsApi().catch(() => ({ totalAmount: '0', totalAddrs: 0, totalTxs: 0 }))
  ])

  const pinnedList = pinnedResponse.list || []

  const list = response.list || []
  const totalPages = response.pagination.totalPages || 1
  const total = response.pagination.total || 0

  if (currentPage > totalPages && totalPages > 0) {
    const qp = new URLSearchParams()
    if (isFilterTransfer) qp.set('filterTransfer', 'true')
    if (!isFilterTransfer) qp.set('filterTransfer', 'false')

    if (address) qp.set('address', address as string)
    if (content) qp.set('content', content as string)

    const qs = qp.toString()
    redirect(`/dap/${pageSize}/${totalPages}${qs ? '?' + qs : ''}`)
  }

  const extraParams: Record<string, string> = {}
  if (!isFilterTransfer) extraParams.filterTransfer = 'false'
  if (address) extraParams.address = address as string
  if (content) extraParams.content = content as string

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Section */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-2 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 shadow-sm transition-all duration-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Title Area */}
          <div className=" hidden sm:flex items-center gap-2.5 w-full md:w-auto justify-start">
            <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <div className=" gap-2">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground/90 whitespace-nowrap">
                  DAP <span className="text-primary font-mono">Data</span> List
                </h1>
            
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase pt-0.5">
                  Decentralized Asset Protocol
                </p>
              </div>
            </div>
          </div>

          {/* Search Area - Centered */}
          <div className="flex-1 w-full flex flex-col items-center justify-center max-w-xl px-2 gap-1.5">
            <div className="w-full scale-95 origin-center">
              <DapSearch placeholder={t('nav.search') || 'Search...'} buttonText={t('nav.searchText')} />
            </div>
          </div>

          {/* Filter Area - Right aligned, same row */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <DapFilterToggle />
            <div className="text-xs font-mono text-muted-foreground whitespace-nowrap min-w-[70px] text-right bg-muted/50 px-2 py-1 rounded-md border border-border/50">
              {t('blocks.total')}: <span className="text-foreground font-semibold">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {/* Compact Stats */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-1 text-[10px] sm:text-xs text-muted-foreground/80 font-mono">
          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
            <Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-500/80" />
            <span className="opacity-70">{t('dap.totalTxs')}:</span>
            <span className="font-medium text-foreground/90">{stats.totalTxs.toLocaleString()}</span>
          </div>
          <div className="hidden sm:block w-px h-3 bg-border/60" />
          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
            <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-purple-500/80" />
            <span className=" opacity-70">{t('dap.totalAddrs')}:</span>
            <span className="font-medium text-foreground/90">{stats.totalAddrs.toLocaleString()}</span>
          </div>
          <div className="hidden sm:block w-px h-3 bg-border/60" />
          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
            <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500/80" />
            <span className=" opacity-70">{t('dap.totalAmount')}:</span>
            <span className="font-medium text-foreground/90">
              {satoshisToBtc(stats.totalAmount).toLocaleString()}{' '}
              <span className="text-[9px] sm:text-[10px] opacity-70 font-normal">{BASE_SYMBOL}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section Removed - Moved to Header */}

      <div className="space-y-6">
        {/* Pinned Section */}
        {pinnedList.length > 0 && (
          <div className="space-y-5">
            <div className="flex gap-5 overflow-x-auto pt-2 snap-x scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent -mx-4 px-2">
              {pinnedList.map((item) => (
                <Link
                  key={item.id}
                  href={`/tx/${item.txid}`}
                  className="min-w-[280px] max-w-[320px] flex-shrink-0 snap-start group relative flex flex-col justify-between rounded-xl border border-primary/40 bg-gradient-to-br from-card to-primary/10 hover:to-primary/20 transition-all duration-300 hover:shadow-[0_8px_30px_-10px_hsl(var(--primary)/0.3)] hover:-translate-y-1 hover:border-primary/70 overflow-hidden"
                >
                  {/* Top decoration line */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  <div className="p-3 space-y-2">
                    {/* Header with TXID */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge
                            variant="default"
                            className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0 h-4 font-mono uppercase tracking-wider shadow-sm"
                          >
                            <Pin className="h-5 w-5 rotate-45 fill-primary/20" />
                            <span className="tracking-wide">{t('dap.pinned')}</span>
                          </Badge>
                          {item.isMessageDap && (
                            <Badge
                              variant="secondary"
                              className="rounded-md text-[10px] px-1.5 py-0 h-4 font-mono uppercase tracking-wider text-muted-foreground border border-border"
                            >
                              MSG
                            </Badge>
                          )}
                        </div>
                        <div className="font-mono text-xs font-bold text-primary/90 truncate group-hover:text-primary transition-colors mt-1">
                          {item.txid}
                        </div>
                      </div>
                    </div>

                    {/* Content Display */}
                    <div className="bg-background/50 rounded-lg border border-border/50 p-2 group-hover:border-primary/20 transition-colors pointer-events-none">
                      <ScashDAPDataDisplay
                        data={item.dataContent}
                        title={null} // Title handled separately above
                        depFee={BigInt(item.totalFee || 0)}
                        isShowMessageDisplay={true}
                        compact={true}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main List */}
        <div className="grid gap-3">
          {list.map((item) => (
            <Link
              key={item.id}
              href={`/tx/${item.txid}`}
              className="group relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 hover:shadow-sm overflow-hidden min-w-0"
            >
              {/* Left Accent Bar */}
              <div className="absolute left-0 top-4 bottom-4 w-1 bg-primary/0 group-hover:bg-primary/60 rounded-r-full transition-all duration-200" />

              <div className="flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm md:text-base text-primary font-medium group-hover:underline decoration-primary/30 underline-offset-4 truncate min-w-0">
                    {item.txid}
                  </span>
                  {item.isMessageDap && (
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono font-normal bg-muted text-muted-foreground border-border/50 shrink-0"
                    >
                      MSG
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground/90 pl-1 pointer-events-none">
                  <ScashDAPDataDisplay
                    data={item.dataContent}
                    title={null}
                    depFee={BigInt(item.totalFee || 0)}
                    isShowMessageDisplay={true}
                  />
                </div>
              </div>

        
            </Link>
          ))}
        </div>

        {list.length === 0 && <div className="text-center py-20 text-muted-foreground">{t('common.noData')}</div>}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          basePath="/dap"
          translations={{
            previous: t('common.previous'),
            next: t('common.next'),
            pageSize: t('common.pageSize')
          }}
          extraParams={extraParams}
        />
      </div>
    </div>
  )
}
