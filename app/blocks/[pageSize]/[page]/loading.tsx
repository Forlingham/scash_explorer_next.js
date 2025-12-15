import { Cable as Cube, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function BlocksLoading() {
  return (
    <div className="container mx-auto p-6 animate-in fade-in-0 duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cube className="h-8 w-8 animate-pulse" />
          <h1 className="text-3xl font-bold">区块</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Card className="animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-pulse" />
            最新区块
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64 animate-pulse" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>高度</TableHead>
                <TableHead>哈希</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>交易数</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>Gas使用</TableHead>
                <TableHead>矿工</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }, (_, i) => (
                <TableRow key={i} className="animate-in fade-in-0" style={{ animationDelay: `${i * 50}ms` }}>
                  <TableCell>
                    <Skeleton className="h-4 w-20 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12 rounded-full animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 animate-pulse" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12 animate-pulse" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 animate-pulse" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* 分页导航骨架屏 */}
          <div className="flex items-center justify-between mt-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="opacity-50">
                <Skeleton className="h-4 w-4 mr-1 animate-pulse" />
                <Skeleton className="h-4 w-12 animate-pulse" />
              </Button>
              
              <Button variant="outline" size="sm" disabled className="opacity-50">
                <Skeleton className="h-4 w-12 animate-pulse" />
                <Skeleton className="h-4 w-4 ml-1 animate-pulse" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Skeleton className="h-4 w-16 animate-pulse" />
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <Button key={i} variant="outline" size="sm" disabled className="opacity-50">
                    <Skeleton className="h-4 w-6 animate-pulse" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}