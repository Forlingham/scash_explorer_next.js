import { Cable as Cube } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function BlocksRootLoading() {
  return (
    <div className="container mx-auto p-6 animate-in fade-in-0 duration-300">
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
          <Cube className="h-12 w-12 animate-pulse text-primary" />
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-32 mx-auto animate-pulse" />
            <Skeleton className="h-4 w-48 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}