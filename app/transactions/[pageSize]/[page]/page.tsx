import { Pagination } from '@/components/pagination'
import TransactionCard from '@/components/transaction-card'
import { getServerTranslations } from '@/i18n/server-i18n'
import { transactionsApi } from '@/lib/http-server'
import { ArrowRightLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

interface TransactionsPageProps {
  params: {
    pageSize: string
    page: string
  }
}

export default async function TransactionsPage({ params }: TransactionsPageProps & { params: Promise<any> }) {
  const { t } = await getServerTranslations()
  
  // 解析参数 - 在Next.js 15中需要await params
  const { pageSize: pageSizeStr, page: pageStr } = await params
  const pageSize = parseInt(pageSizeStr)
  const currentPage = parseInt(pageStr)

  // 验证参数
  if (isNaN(pageSize) || isNaN(currentPage) || pageSize <= 0 || currentPage <= 0) {
    redirect('/transactions/20/1')
  }

  // 限制每页最大数量
  if (pageSize > 100) {
    redirect('/transactions/100/1')
  }

  const res = await transactionsApi(pageSize, currentPage)

  // 获取总数据量
  const totalTransactions = res.pagination.total
  const totalPages = res.pagination.totalPages

  // 确保页码不超过总页数
  if (currentPage > totalPages) {
    redirect(`/transactions/${pageSize}/${totalPages}`)
  }

  const transactions = res.list

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{t('nav.transactions')}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('home.totalTransactions')}: {totalTransactions.toLocaleString()}
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <TransactionCard tx={tx} t={t}  key={tx.txid} />
        ))}
      </div>

      {/* 分页导航 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        basePath="/transactions"
        translations={{
          previous: t('common.previous'),
          next: t('common.next'),
          pageSize: t('common.pageSize')
        }}
        className="mt-8"
      />
    </div>
  )
}
