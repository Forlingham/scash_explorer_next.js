import { ArrowRightLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TransactionsLoading() {
  return (
    <div className="container mx-auto p-6 animate-in fade-in-0 duration-300">
      {/* 头部区域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-8 w-8 animate-pulse text-primary" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>

      {/* 交易卡片列表 */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            {/* 交易ID头部 */}
            <CardHeader className="pb-2 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 py-3">
              {/* 输入输出区域 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 输入区域 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 中间箭头区域 */}
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1 p-2">
                    <Skeleton className="h-5 w-5" />
                    <div className="text-center space-y-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                </div>

                {/* 输出区域 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg border">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 分页区域 */}
      <div className="mt-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-8" />
          <Skeleton className="h-9 w-8" />
          <Skeleton className="h-9 w-8" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  )
}