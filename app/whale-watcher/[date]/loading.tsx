import { Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export default function WhaleWatcherLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in-0 duration-300">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary animate-pulse" />
          <Skeleton className="h-10 w-48 animate-pulse" />
        </div>
        <Skeleton className="h-6 w-96 animate-pulse" />
      </div>

      <Card className="animate-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32 animate-pulse" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64 animate-pulse" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Skeleton className="h-4 w-16 animate-pulse" />
                  </TableHead>
                  <TableHead className="text-center">
                    <Skeleton className="h-4 w-20 mx-auto animate-pulse" />
                  </TableHead>
                  <TableHead className="text-center">
                    <Skeleton className="h-4 w-24 mx-auto animate-pulse" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="h-4 w-16 ml-auto animate-pulse" />
                  </TableHead>
                  <TableHead className="text-right">
                    <Skeleton className="h-4 w-24 ml-auto animate-pulse" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 10 }, (_, i) => (
                  <TableRow key={i} className="animate-in fade-in-0" style={{ animationDelay: `${i * 50}ms` }}>
                    <TableCell>
                      <Skeleton className="h-4 w-64 animate-pulse" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-12 mx-auto animate-pulse" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-16 mx-auto animate-pulse" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto animate-pulse" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* 加载指示器 */}
          <div className="flex justify-center items-center mt-6 animate-in zoom-in-95 duration-700">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm">Loading whale data...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}