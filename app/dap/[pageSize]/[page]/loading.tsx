import { FileText } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DapLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in-0 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           <Skeleton className="h-9 w-9" />
           <div className="flex items-center gap-2">
             <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary animate-pulse" />
             <Skeleton className="h-8 w-48" />
           </div>
        </div>
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <CardHeader className="pb-2 py-3">
               <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="py-3 space-y-2">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
