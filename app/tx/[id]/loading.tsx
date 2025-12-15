'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ArrowRightLeft, Hash, Coins, FileText, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function Loading() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 5) % 360)
    }, 50)

    return () => {
      clearInterval(rotationInterval)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <div
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <ArrowRightLeft className="h-8 w-8 text-primary" />
          </div>
          Transaction
        </h1>
        <Skeleton className="h-6 w-full max-w-2xl mt-2" />
      </div>

      {/* Transaction Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-muted" />
                <div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  <Skeleton className="h-6 w-24" />
                </span>
                <Skeleton className="h-6 w-24" />
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground block mb-1">
                  <Skeleton className="h-6 w-24" />
                </span>
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-40 ml-auto" />
                  <Skeleton className="h-4 w-24 ml-auto mt-1" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Flow Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-32" />
          </CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>
              <Skeleton className="h-6 w-24" />
            </CardDescription>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted/30 rounded-md flex items-center justify-center">
            <div className="relative w-16 h-16">
              <Image src="/logo.png" alt="Loading" fill priority className="object-contain animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Card */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Inputs</h3>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={`input-${i}`} className="p-3 border rounded-lg">
                        <Skeleton className="h-5 w-full" />
                        <div className="flex justify-between mt-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outputs */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Outputs</h3>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={`output-${i}`} className="p-3 border rounded-lg">
                        <Skeleton className="h-5 w-full" />
                        <div className="flex justify-between mt-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
