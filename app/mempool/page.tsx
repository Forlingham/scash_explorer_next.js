"use client"

import { Activity, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getTranslation } from "@/i18n/i18n-provider"

export default function MempoolPage() {
  const t = getTranslation()

  // Mock data - replace with real API calls
  const mempoolTxs = Array.from({ length: 50 }, (_, i) => ({
    txid: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    feeRate: Math.floor(Math.random() * 50 + 1),
    size: Math.floor(Math.random() * 1000 + 200),
    time: Date.now() - Math.floor(Math.random() * 3600000),
  })).sort((a, b) => b.feeRate - a.feeRate)

  const totalTxs = mempoolTxs.length

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          {t("mempool.title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("mempool.subtitle")}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t("mempool.total")}</p>
              <p className="text-3xl font-bold text-primary">{totalTxs.toLocaleString()}</p>
            </div>
            <Activity className="h-12 w-12 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("mempool.title")}</CardTitle>
          <CardDescription>Real-time pending transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("mempool.txid")}</TableHead>
                  <TableHead className="text-right">{t("mempool.feeRate")}</TableHead>
                  <TableHead className="text-right">{t("mempool.size")}</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mempoolTxs.map((tx) => (
                  <TableRow key={tx.txid}>
                    <TableCell className="font-mono text-sm">{tx.txid.substring(0, 16)}...</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={tx.feeRate > 30 ? "default" : "secondary"}>{tx.feeRate} sat/vB</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{tx.size} bytes</TableCell>
                    <TableCell className="text-right text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(tx.time)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
