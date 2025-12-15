'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

interface PaginationSelectProps {
  currentPageSize: number
  basePath?: string
  linkBuilder?: (page: number, pageSize: number) => string
}

export function PaginationSelect({ currentPageSize, basePath, linkBuilder }: PaginationSelectProps) {
  const router = useRouter()

  const handlePageSizeChange = (value: string) => {
    const nextUrl = linkBuilder
      ? linkBuilder(1, Number(value))
      : `${basePath}/${value}/1`
    router.push(nextUrl)
  }

  return (
    <Select value={currentPageSize.toString()} onValueChange={handlePageSizeChange}>
      <SelectTrigger className="w-20">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="20">20</SelectItem>
        <SelectItem value="50">50</SelectItem>
        <SelectItem value="100">100</SelectItem>
      </SelectContent>
    </Select>
  )
}
