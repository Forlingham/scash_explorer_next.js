'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaginationSelect } from '@/components/pagination-select'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  basePath: string
  linkStyle?: 'path' | 'query'
  queryParamKeys?: { page: string; pageSize: string }
  translations: {
    previous: string
    next: string
    pageSize: string
  }
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  basePath,
  linkStyle = 'path',
  queryParamKeys = { page: 'page', pageSize: 'pageSize' },
  translations,
  className
}: PaginationProps) {
  const isMobile = useIsMobile()

  const buildHref = (page: number, pz: number) => {
    if (linkStyle === 'query') {
      const qp = new URLSearchParams({ [queryParamKeys.page]: String(page), [queryParamKeys.pageSize]: String(pz) })
      return `${basePath}?${qp.toString()}`
    }
    return `${basePath}/${pz}/${page}`
  }

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = isMobile ? 3 : 5
    const sidePages = Math.floor(maxVisiblePages / 2)

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 复杂分页逻辑
      let startPage = Math.max(1, currentPage - sidePages)
      let endPage = Math.min(totalPages, currentPage + sidePages)

      // 调整范围以确保显示足够的页码
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }
      }

      // 添加第一页和省略号
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('ellipsis')
        }
      }

      // 添加中间页码
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // 添加省略号和最后一页
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  if (isMobile) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {/* 移动端：简化的分页控件 */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage <= 1} 
            asChild={currentPage > 1}
          >
            {currentPage > 1 ? (
              <Link href={buildHref(currentPage - 1, pageSize)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {translations.previous}
              </Link>
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {translations.previous}
              </>
            )}
          </Button>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{currentPage}</span>
            <span>/</span>
            <span>{totalPages}</span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage >= totalPages} 
            asChild={currentPage < totalPages}
          >
            {currentPage < totalPages ? (
              <Link href={buildHref(currentPage + 1, pageSize)}>
                {translations.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            ) : (
              <>
                {translations.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* 移动端：页面大小选择器 */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>{translations.pageSize}:</span>
          <PaginationSelect currentPageSize={pageSize} basePath={basePath} linkBuilder={buildHref} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage <= 1} 
          asChild={currentPage > 1}
        >
          {currentPage > 1 ? (
            <Link href={buildHref(currentPage - 1, pageSize)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {translations.previous}
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {translations.previous}
          </>
        )}
      </Button>

      {/* 桌面端：完整的页码导航 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          return (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              asChild={pageNum !== currentPage}
            >
              {pageNum === currentPage ? (
                <span>{pageNum}</span>
              ) : (
                <Link href={buildHref(pageNum as number, pageSize)}>{pageNum}</Link>
              )}
            </Button>
          )
        })}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage >= totalPages} 
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildHref(currentPage + 1, pageSize)}>
            {translations.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        ) : (
          <>
            {translations.next}
            <ChevronRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </div>

    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{translations.pageSize}:</span>
        <PaginationSelect currentPageSize={pageSize} basePath={basePath} linkBuilder={buildHref} />
      </div>
    </div>
  )
}
