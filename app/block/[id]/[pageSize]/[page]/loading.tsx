'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Cable as Cube } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function Loading() {
  const [rotation, setRotation] = useState(0)
  
  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation(prev => (prev + 5) % 360)
    }, 50)
    
    return () => {
      clearInterval(rotationInterval)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with logo animation */}
      <div className="mb-8 flex items-center gap-4">
        <div 
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          <Cube className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2"></h1>
          <div className="h-6 w-96 max-w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>

      {/* Block Navigation */}
      <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
        <Skeleton className="h-6 w-24" />
        <Badge variant="outline" className="text-base px-4 py-2">
          <Skeleton className="h-6 w-32" />
        </Badge>
        <Skeleton className="h-6 w-24" />
      </div>

      {/* 左右分栏布局 - 桌面端左右分布，移动端垂直堆叠 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：区块详情 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block Details</CardTitle>
              <CardDescription>Detailed information about this block</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">
                        <Skeleton className="h-4 w-24" />
                      </span>
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <span className="text-sm font-medium text-muted-foreground block mb-1">
                        <Skeleton className="h-4 w-24" />
                      </span>
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground block mb-1">
                      <Skeleton className="h-4 w-24" />
                    </span>
                    <Skeleton className="h-6 w-full max-w-md" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：交易可视化 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <Image
                    src="/logo.png"
                    alt="Loading"
                    fill
                    priority
                    className="object-contain animate-pulse"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            <Skeleton className="h-5 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                    <Skeleton className="h-5 w-full md:w-1/3" />
                    <Skeleton className="h-5 w-full md:w-1/3" />
                    <Skeleton className="h-5 w-full md:w-1/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 分页导航 */}
          <div className="mt-6 flex justify-between items-center">
            <Skeleton className="h-10 w-24" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-10" />
              ))}
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}