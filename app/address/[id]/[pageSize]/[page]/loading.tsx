'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Wallet, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { BASE_SYMBOL } from '@/lib/const'

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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <div 
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            Address
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div>
            Last Seen:<div className="font-medium"><Skeleton className="h-6 w-32" /></div>
          </div>
          <div>
            First Seen:<div className="font-medium"><Skeleton className="h-6 w-32" /></div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Transactions and Graph */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {/* <TabsTrigger value="graph">Graph</TabsTrigger> */}
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription><Skeleton className="h-5 w-48" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

              {/* Pagination Component */}
              <div className="mt-4">
                <div className="mt-6 flex justify-between items-center">
                  <Skeleton className="h-10 w-24" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-10" />
                    ))}
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Graph
              </CardTitle>
              <CardDescription>Network visualization of address relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[500px] bg-muted/20 rounded-lg border-2 border-dashed border-muted">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}