'use client'

import { useEffect, useMemo, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Zap, Activity } from 'lucide-react'
import Link from 'next/link'
import axiosInstance from '@/lib/request'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'
import { getClientTranslations } from '@/i18n/client-i18n'

export function MempoolTransactionsChart() {
  const [transactions, setTransactions] = useState<TransactionType[]>([])

  const { t } = getClientTranslations()
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
    mempoolTransactionsApi(500, 1).then((res) => {
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

  const stats = useMemo(() => {
    if (!data.length) return null
    const feeRates = data.map((d) => d.feeRate)
    const avgFeeRate = feeRates.reduce((a, b) => a + b, 0) / feeRates.length
    const minFeeRate = Math.min(...feeRates)
    const maxFeeRate = Math.max(...feeRates)
    const totalSize = data.reduce((a, b) => a + b.vSize, 0)

    // Calculate median
    const sortedFeeRates = [...feeRates].sort((a, b) => a - b)
    const medianFeeRate = sortedFeeRates[Math.floor(sortedFeeRates.length / 2)]

    return { avgFeeRate, minFeeRate, maxFeeRate, totalSize, medianFeeRate, count: data.length }
  }, [data])

  // Top 5 by fee rate
  const topTransactions = useMemo(() => {
    return [...data].sort((a, b) => b.feeRate - a.feeRate).slice(0, 5)
  }, [data])

  // Helper to determine color based on fee rate
  const getFeeColor = (feeRate: number) => {
    if (feeRate <= 5) return '#22c55e' // green-500
    if (feeRate <= 10) return '#84cc16' // lime-500
    if (feeRate <= 20) return '#eab308' // yellow-500
    if (feeRate <= 50) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  const formatSize = (size: number) => {
    if (size < 1000) return `${size.toFixed(0)} vB`
    if (size < 1000000) return `${(size / 1000).toFixed(2)} kvB`
    return `${(size / 1000000).toFixed(2)} MvB`
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t('mempool.title')}
            </CardTitle>
            <CardDescription>{t('mempool.description')}</CardDescription>
          </div>

          {stats && (
            <div className="flex gap-4 text-sm">
              <div className="bg-muted/50 px-3 py-1.5 rounded-md">
                <span className="text-muted-foreground mr-2">{t('mempool.medianFee')}:</span>
                <span className="font-semibold">{stats.medianFeeRate.toFixed(1)} sat/vB</span>
              </div>
              <div className="bg-muted/50 px-3 py-1.5 rounded-md">
                <span className="text-muted-foreground mr-2">{t('mempool.totalSize')}:</span>
                <span className="font-semibold">{(stats.totalSize / 1000).toFixed(2)} kvB</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis
                  type="number"
                  dataKey="vSize"
                  name="Size"
                  unit=" vB"
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickLine={false}
                  axisLine={{ stroke: '#333', opacity: 0.2 }}
                >
                  <Label value={t('mempool.size') + '(vB)'} offset={-5} position="insideBottom" style={{ fill: '#888', fontSize: 12 }} />
                </XAxis>
                <YAxis
                  type="number"
                  dataKey="feeRate"
                  name="Fee Rate"
                  unit=" sat/vB"
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickLine={false}
                  axisLine={{ stroke: '#333', opacity: 0.2 }}
                >
                  <Label
                    value={t('mempool.feeRate2') + ' (sat/vB)'}
                    angle={-90}
                    position="insideLeft"
                    style={{ textAnchor: 'middle', fill: '#888', fontSize: 12 }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl text-sm z-50 ring-1 ring-black/5">
                          <p className="font-mono text-xs text-muted-foreground mb-2 truncate max-w-[200px]">{data.txid}</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{t('mempool.feeRate2')}:</span>
                              <span className="font-bold text-primary">{data.feeRate.toFixed(2)} sat/vB</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{t('mempool.size')}:</span>
                              <span className="font-mono">{formatSize(data.vSize)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">{t('mempool.fee')}:</span>
                              <span className="font-mono">{data.fee.toLocaleString()} sats</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t pt-1.5 mt-1.5 border-border/50">
                              <span className="text-muted-foreground">{t('mempool.amount')}:</span>
                              <span className="font-mono">{(data.amount / 100000000).toFixed(8)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Transactions" data={data} shape="circle">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getFeeColor(entry.feeRate)}
                      fillOpacity={0.6}
                      stroke={getFeeColor(entry.feeRate)}
                      strokeWidth={1}
                      r={3} // Smaller radius for more points
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>&le; 5 sat/vB
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-lime-500"></div>&le; 10
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>&le; 20
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>&le; 50
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>&gt; 50
              </div>
            </div>
          </div>

          <div className="flex flex-col h-[350px]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h3 className="font-semibold text-sm">{t('mempool.highFee')}</h3>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {topTransactions.map((tx, idx) => (
                <div
                  key={tx.txid}
                  className="group flex flex-col p-3 rounded-lg bg-muted/30 hover:bg-muted transition-all text-sm border border-transparent hover:border-primary/20 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        #{idx + 1}
                      </span>
                      <Link
                        href={`/tx/${tx.txid}`}
                        className="text-foreground hover:text-primary transition-colors font-mono text-xs truncate max-w-[120px]"
                        title={tx.txid}
                      >
                        {tx.txid.substring(0, 8)}...{tx.txid.substring(tx.txid.length - 8)}
                      </Link>
                    </div>
                    <div className="font-bold text-foreground text-right">
                      {tx.feeRate.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">sat/vB</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                    <span>Size: {formatSize(tx.vSize)}</span>
                    <span>
                      Fee: {satoshisToBtc(tx.fee)} {BASE_SYMBOL}
                    </span>
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
