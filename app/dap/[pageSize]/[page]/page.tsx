import { ScashDAPDataDisplay } from '@/components/scash-dap-data-display'
import { Pagination } from '@/components/pagination'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { getDapListApi } from '@/lib/http-server'
import { redirect } from 'next/navigation'
import { getServerTranslations } from '@/i18n/server-i18n'
import { DapFilterToggle } from '@/components/dap-filter-toggle'
import { DapSearch } from '@/components/dap-search'
import { Badge } from '@/components/ui/badge'

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

  const response = await getDapListApi(isFilterTransfer, address as string, undefined, content as string, currentPage, pageSize)

  const list = response.list || []
  const totalPages = response.pagination.totalPages || 1
  const total = response.pagination.total || 0

  if (currentPage > totalPages && totalPages > 0) {
    // Keep the filter param when redirecting
    const qp = new URLSearchParams()
    if (isFilterTransfer) qp.set('filterTransfer', 'true')
    // If user explicitly disabled it, we might want to keep it false, but for simplicity
    // let's stick to standard behavior. If default is true, we don't strictly need to put it in URL if we want clean URLs,
    // but preserving state is safer.
    // Actually, if we want to support 'false' state persistence, we should handle it.
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
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Title Area */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start">
            <div className="p-2 bg-primary/10 rounded-lg shadow-sm">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground/90 whitespace-nowrap">DAP 数据列表</h1>
          </div>

          {/* Search Area - Centered */}
          <div className="flex-1 w-full flex justify-center max-w-2xl px-4">
            <DapSearch placeholder={t('nav.search') || 'Search...'} buttonText={t('nav.searchText')} />
          </div>

          {/* Filter Area - Right aligned, same row */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <DapFilterToggle />
            <div className="text-sm text-muted-foreground whitespace-nowrap min-w-[80px] text-right">
              {t('blocks.total')}: {total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {list.map((item) => (
          <Link
            key={item.id}
            href={`/tx/${item.txid}`}
            className="block group transition-all duration-200 hover:bg-accent hover:shadow-md hover:-translate-y-0.5 rounded-xl -mx-3 px-3 py-3 border border-transparent hover:border-primary/20"
          >
            <div className="pointer-events-none">
              <ScashDAPDataDisplay
                data={item.dataContent}
                title={
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono break-all text-sm md:text-base text-primary group-hover:underline transition-colors">
                      {item.txid}
                    </span>
                    {item.isMessageDap && (
                      <Badge variant="secondary" className="text-xs font-normal">
                        {t('dap.message')}
                      </Badge>
                    )}
                  </div>
                }
                depFee={BigInt(item.totalFee || 0)}
                isShowMessageDisplay={true}
              />
            </div>
          </Link>
        ))}

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
