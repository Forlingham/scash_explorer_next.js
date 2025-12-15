'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

type Segment = {
  label: string
  percent: number // 0-100
  color: string // tailwind color or hex
  valueText?: string // optional value for legend
}

interface InactiveStorageChartProps {
  titleLeft?: string
  titleRight?: string
  addressSegments: Segment[]
  balanceSegments: Segment[]
  className?: string
}

function clampPercent(p: number) {
  return Math.max(0, Math.min(100, Number.isFinite(p) ? p : 0))
}

// 将文本中的金额数字做千分位切分（仅当数值>=100时），保留小数
function formatAmountText(text?: string) {
  if (!text) return ''
  const match = text.match(/(\d+(?:\.\d+)?)/)
  if (!match) return text
  const numStr = match[1]
  const numVal = Number(numStr)
  if (!Number.isFinite(numVal) || numVal < 100) return text
  const [intPart, decPart] = numStr.split('.')
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = decPart ? `${intFormatted}.${decPart}` : intFormatted
  return text.replace(numStr, formatted)
}

function StackBar({
  segments,
  onHover,
  onHoverOut,
  onChartReady
}: {
  segments: Segment[]
  onHover?: (segIndex: number, params?: any) => void
  onHoverOut?: () => void
  onChartReady?: (chart: any) => void
}) {
  if (!segments?.length) return null

  // 计算总占比与余量（用于顶部灰色区，营造满载感）
  const total = segments.reduce((sum, s) => sum + clampPercent(s.percent), 0)
  const remainder = Math.max(0, 100 - total)

  const keys = [...segments.map((_, i) => `s${i}`), ...(remainder > 0 ? ['s_rem'] : [])]

  const data = [
    Object.fromEntries([
      ['category', 'stack'],
      ...segments.map((seg, i) => [`s${i}`, clampPercent(seg.percent)]),
      ...(remainder > 0 ? [['s_rem', remainder]] : [])
    ]) as Record<string, number | string>
  ]

  const allPercents = [...segments.map((s) => clampPercent(s.percent)), ...(remainder > 0 ? [remainder] : [])]
  const topIndex = allPercents.findIndex((p) => p > 0)
  const lastIndex = allPercents.length - 1 - [...allPercents].reverse().findIndex((p) => p > 0)

  const series = [
    ...segments.map((seg, idx) => ({
      type: 'bar',
      stack: 'total',
      name: seg.label,
      data: [clampPercent(seg.percent)],
      barWidth: '90%',
      itemStyle: {
        color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: seg.color },
          { offset: 1, color: seg.color }
        ]),
        borderRadius: 0,
        shadowBlur: 6,
        shadowColor: 'rgba(0,0,0,0.15)'
      },
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        fontSize: 10,
        formatter: (p: any) => (Number(p.value) >= 8 ? `${Number(p.value).toFixed(1)}%` : '')
      },
      emphasis: { focus: 'series' },
      animationDuration: 600
    })),
    ...(remainder > 0
      ? [
          {
            type: 'bar',
            stack: 'total',
            name: 'remainder',
            data: [remainder],
            barWidth: '90%',
            itemStyle: {
              color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#9CA3AF' },
                { offset: 1, color: '#6B7280' }
              ]),
              borderRadius: 0,
              shadowBlur: 6,
              shadowColor: 'rgba(0,0,0,0.15)'
            },
            label: {
              show: true,
              position: 'inside',
              color: '#fff',
              fontSize: 10,
              formatter: (p: any) => (Number(p.value) >= 8 ? `${Number(p.value).toFixed(1)}%` : '')
            },
            emphasis: { focus: 'series' },
            animationDuration: 600
          }
        ]
      : [])
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.seriesName}: ${Number(p.value).toFixed(2)}%`
    },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: {
      type: 'category',
      data: ['stack'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    series
  }

  return (
    <div className="relative h-[30rem] w-28 sm:w-32 chart-cylinder" data-role="chart-cylinder">
      {/* 玻璃圆柱外观 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-black/5 via-white/5 to-black/10 border border-muted/40" />
      <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/10 via-transparent to-black/10" />
      {/* 顶部高光与底部阴影，增强立体感 */}
      <div className="absolute top-1 left-1 right-1 h-6 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-1 left-1 right-1 h-6 rounded-full bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
      {/* 侧面光泽 */}
      <div className="absolute inset-y-2 left-2 right-2 rounded-full bg-gradient-to-r from-white/10 via-transparent to-transparent pointer-events-none" />
      {/* 直观刻度线 */}
      <div className="absolute left-2 right-2 top-[25%] h-px bg-white/20" />
      <div className="absolute left-2 right-2 top-[50%] h-px bg-white/20" />
      <div className="absolute left-2 right-2 top-[75%] h-px bg-white/20" />

      <div className="absolute inset-2">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          onEvents={{
            mouseover: (p: any) => {
              if (p?.componentType === 'series' && p?.seriesName !== 'remainder') {
                onHover?.(p.seriesIndex, p)
              }
            },
            mouseout: () => {
              onHoverOut?.()
            }
          }}
          onChartReady={(chart) => onChartReady?.(chart)}
        />
      </div>
    </div>
  )
}

export function InactiveStorageChart({
  titleLeft = '地址占比',
  titleRight = '余额占比',
  addressSegments,
  balanceSegments,
  className
}: InactiveStorageChartProps) {
  // 单个分区组件：一根圆柱 + 右侧图例；双向悬停高亮，无连线
  const Section = ({ title, segments, viewType }: { title: string; segments: Segment[]; viewType: 'address' | 'amount' }) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const chartRef = React.useRef<HTMLDivElement>(null)
    const chartInstanceRef = React.useRef<any>(null)
    const legendItemRefs = React.useRef<(HTMLDivElement | null)[]>([])
    const router = require('next/navigation').useRouter()

    const [hoverIndex, setHoverIndex] = React.useState<number | null>(null)

    const displayed = React.useMemo(() => segments.filter((s) => clampPercent(s.percent) > 0), [segments])

    const handleChartHover = (seriesIndex: number) => {
      // 改为使用系列名称映射，避免索引错位
      // 获取当前图表实例的系列名称数组
      const nameIdx = (chartInstanceRef.current?.getOption()?.series || []).map((s: any) => s.name)
      const targetName = nameIdx[seriesIndex]
      const displayIdx = displayed.findIndex((s) => s.label === targetName)
      if (displayIdx >= 0) setHoverIndex(displayIdx)
    }

    return (
      <div ref={containerRef} className="relative grid grid-cols-1 grid-cols-[auto_220px] gap-4 items-start">
        <div ref={chartRef} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{title}</span>
          <StackBar
            segments={segments}
            onHover={handleChartHover}
            onHoverOut={() => setHoverIndex(null)}
            onChartReady={(chart) => (chartInstanceRef.current = chart)}
          />
        </div>

        <div className="space-y-2 max-w-[220px]">
          {displayed.map((_, i) => displayed.length - 1 - i).map((origIdx) => {
            const seg = displayed[origIdx]
            return (
              <div
                key={origIdx}
                ref={(el) => {
                  legendItemRefs.current[origIdx] = el
                }}
                className={cn(
                  'flex items-center rounded-md hover:bg-muted/30 cursor-pointer py-2',
                  hoverIndex === origIdx ? 'bg-muted/40' : ''
                )}
                onMouseEnter={() => {
                  setHoverIndex(origIdx)
                  chartInstanceRef.current?.dispatchAction({ type: 'highlight', seriesName: seg.label })
                }}
                onMouseLeave={() => {
                  setHoverIndex(null)
                  chartInstanceRef.current?.dispatchAction({ type: 'downplay', seriesName: seg.label })
                }}
                onClick={() => {
                  // 跳转到未活跃地址详情页，携带视图类型（地址/金额）与分段索引
                  const idx = origIdx
                  const label = encodeURIComponent(seg.label)
                  router.push(`/inactive-addresses/${viewType}/${idx}`)
                }}
              >
                <div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs truncate font-medium" title={seg.label}>
                      {seg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" title={seg.valueText || `${clampPercent(seg.percent).toFixed(2)}%`}>
                      {seg.valueText ? formatAmountText(seg.valueText) : `${clampPercent(seg.percent).toFixed(2)}%`}
                    </span>
                  </div>
                </div>
                <span className="text-grey-500 px-2">&gt;</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      <Section title={titleLeft} segments={addressSegments} viewType="address" />
      <Section title={titleRight} segments={balanceSegments} viewType="amount" />
    </div>
  )
}
