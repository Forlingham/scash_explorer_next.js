'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import useHttpClient from '@/lib/http-client'
import axiosInstance from '@/lib/request'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'

interface Transaction {
  txid: string
  size: number
  fee: number
  value: number
}

interface BlockTransactionVisualizationProps {
  blockHeight?: number
  className?: string
  t: Record<string, string>
}

export function BlockTransactionVisualization({ blockHeight, className = '', t }: BlockTransactionVisualizationProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  function searchTransactions(blockHeight: number) {
    return axiosInstance.get<Transaction[]>(`/explorer/block-transactions-visualization/${blockHeight}`, {})
  }

  useEffect(() => {
    if (!blockHeight) return
    searchTransactions(blockHeight).then((res) => {
      setTransactions(
        res.data.map((item) => ({
          txid: item.txid,
          size: item.size,
          fee: satoshisToBtc(item.fee),
          value: satoshisToBtc(item.value)
        }))
      )
    })
  }, [blockHeight])

  const visualizationData = useMemo(() => {
    if (!transactions.length) return { blocks: [], maxSize: 0, minSize: 0 }

    const sizes = transactions.map((tx) => tx.size)
    const maxSize = Math.max(...sizes)
    const minSize = Math.min(...sizes)

    // 将交易按大小分组，创建可视化块
    const blocks = transactions.map((tx, index) => {
      // 根据交易大小计算块的大小（相对于最大值的比例）
      const sizeRatio = tx.size / maxSize
      const blockSize = Math.max(8, Math.min(40, sizeRatio * 40)) // 最小8px，最大40px

      // 根据手续费计算颜色强度
      const feeRatio = tx.fee / Math.max(...transactions.map((t) => t.fee))
      const colorIntensity = Math.max(0.3, feeRatio) // 最小透明度0.3

      return {
        id: tx.txid,
        size: blockSize,
        originalSize: tx.size,
        fee: tx.fee,
        value: tx.value,
        colorIntensity,
        x: (index % 20) * 45 + 10, // 20列布局
        y: Math.floor(index / 20) * 45 + 10
      }
    })

    return { blocks, maxSize, minSize }
  }, [transactions])

  const { blocks, maxSize, minSize } = visualizationData

  if (!transactions.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>区块交易可视化</CardTitle>
          <CardDescription>暂无交易数据</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const svgHeight = Math.ceil(blocks.length / 20) * 45 + 20
  const svgWidth = Math.min(20, blocks.length) * 45 + 20

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {t['block.visualization']}
          {blockHeight && <Badge variant="outline">{t['block.height']} #{blockHeight}</Badge>}
        </CardTitle>
        <CardDescription>
          {t['block.visualization.description']}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 图例 */}
          {/* <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/30 rounded-sm"></div>
              <span>低手续费</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/60 rounded-sm"></div>
              <span>中等手续费</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/90 rounded-sm"></div>
              <span>高手续费</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
              <span>小交易</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span>大交易</span>
            </div>
          </div> */}

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">{t['block.transactions']}</div>
              <div className="text-lg font-semibold">{transactions.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t['block.visualization.maxTransactionSize']}</div>
              <div className="text-lg font-semibold">{maxSize} bytes</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t['block.visualization.minTransactionSize']}</div>
              <div className="text-lg font-semibold">{minSize} bytes</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t['block.visualization.averageTransactionSize']}</div>
              <div className="text-lg font-semibold">
                {Math.round(transactions.reduce((sum, tx) => sum + tx.size, 0) / transactions.length)} bytes
              </div>
            </div>
          </div>

          {/* 可视化图表 */}
          <div className="border rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-auto">
            <TooltipProvider>
              <svg width={svgWidth} height={svgHeight} className="w-full" style={{ minHeight: '200px' }}>
                {blocks.map((block) => (
                  <Tooltip key={block.id}>
                    <TooltipTrigger asChild>
                      <rect
                        x={block.x}
                        y={block.y}
                        width={block.size}
                        height={block.size}
                        rx={2}
                        className="cursor-pointer transition-all duration-200 hover:stroke-primary hover:stroke-2"
                        fill={`rgba(59, 130, 246, ${block.colorIntensity})`}
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth={1}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-mono text-xs">{block.id.substring(0, 16)}...</div>
                        <div className="text-sm">
                          <div>{t['block.visualization.transactionSize']}: {block.originalSize} bytes</div>
                          <div>
                            {t['block.visualization.fee']}: {block.fee.toFixed(8)} {BASE_SYMBOL}
                          </div>
                          <div>
                            {t['block.visualization.value']}: {block.value.toFixed(4)} {BASE_SYMBOL}
                          </div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </svg>
            </TooltipProvider>
          </div>

          {/* 大小分布统计 */}
          {/* <div className="space-y-2">
            <h4 className="text-sm font-medium">交易大小分布</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {(() => {
                const small = transactions.filter((tx) => tx.size < 300).length
                const medium = transactions.filter((tx) => tx.size >= 300 && tx.size < 600).length
                const large = transactions.filter((tx) => tx.size >= 600).length

                return (
                  <>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>小交易 (&lt;300 bytes)</span>
                      <Badge variant="secondary">{small}</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>中等交易 (300-600 bytes)</span>
                      <Badge variant="secondary">{medium}</Badge>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span>大交易 (&gt;600 bytes)</span>
                      <Badge variant="secondary">{large}</Badge>
                    </div>
                  </>
                )
              })()}
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  )
}
