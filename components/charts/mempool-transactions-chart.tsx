'use client'

import { useEffect, useMemo, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Zap, Activity } from 'lucide-react'
import Link from 'next/link'
import axiosInstance from '@/lib/request'

export function MempoolTransactionsChart() {
  const [transactions, setTransactions] = useState<TransactionType[]>([])

  const t = (key: string) => key
  /**
   * 获取内存池中的交易数据
   * @param pageSize 每页数量
   * @param currentPage 当前页码
   * @returns 交易列表
   */
  function mempoolTransactionsApi(pageSize: number, currentPage: number) {
    return axiosInstance.get<PageType<TransactionType>>(`/explorer/mempool/transactions`, {
      params: {
        pageSize,
        page: currentPage
      }
    })
  }

  useEffect(() => {
    mempoolTransactionsApi(10, 1).then((res) => {
      setTransactions(res.data.list || [])
    })
  }, [])

  const data = useMemo(() => {
    return transactions.map((tx) => {
      // vSize estimation: weight / 4. If weight is not available, use size.
      const vSize = tx.weight ? tx.weight / 4 : tx.size
      const feeRate = tx.fee / vSize
      return {
        txid: tx.txid,
        size: tx.size,
        vSize,
        fee: tx.fee,
        feeRate,
        amount: tx.totalAmount
      }
    })
  }, [transactions])

  // Top 5 by fee rate
  const topTransactions = useMemo(() => {
    return [...data].sort((a, b) => b.feeRate - a.feeRate).slice(0, 5)
  }, [data])

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t('mempool.title') || '内存池交易分布'}
        </CardTitle>
        <CardDescription>{t('mempool.description') || '内存池中等待确认的交易费率与大小分布'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" dataKey="vSize" name="Size" unit=" vB">
                  <Label value={t('mempool.size') || '大小 (vB)'} offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis type="number" dataKey="feeRate" name="Fee Rate" unit=" sat/vB">
                  <Label
                    value={t('mempool.feeRate') || '费率 (sat/vB)'}
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: 'middle' }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border border-border rounded p-3 shadow-md text-sm z-50">
                          <p className="font-semibold mb-1">TXID: {data.txid.substring(0, 8)}...</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span className="text-muted-foreground">{t('mempool.feeRate') || '费率'}:</span>
                            <span>{data.feeRate.toFixed(2)} sat/vB</span>

                            <span className="text-muted-foreground">{t('mempool.size') || '大小'}:</span>
                            <span>{data.vSize.toFixed(0)} vB</span>

                            <span className="text-muted-foreground">{t('mempool.fee') || '手续费'}:</span>
                            <span>{data.fee.toLocaleString()} sats</span>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Transactions" data={data}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.feeRate > 50 ? '#ef4444' : entry.feeRate > 20 ? '#f59e0b' : '#3b82f6'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h3 className="font-semibold text-sm">{t('mempool.highFee') || '高费率交易 (Top 5)'}</h3>
            </div>
            <div className="space-y-2">
              {topTransactions.map((tx) => (
                <div
                  key={tx.txid}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors text-sm border border-transparent hover:border-border"
                >
                  <div className="truncate flex-1 mr-4">
                    <Link href={`/tx/${tx.txid}`} className="text-primary hover:underline font-mono">
                      {tx.txid.substring(0, 12)}...
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">{tx.vSize.toFixed(0)} vB</div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="font-bold text-foreground">
                      {tx.feeRate.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">sat/vB</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{tx.fee.toLocaleString()} sats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
