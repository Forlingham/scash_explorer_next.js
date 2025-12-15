'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface MinerDistributionChartProps {
  data: {
    totalBlocksScanned: number
    minerDistribution: Array<{
      address: string
      blocksMined: number
      percentage: number
    }>
  }
}

// 预定义颜色数组
const COLORS = [
  '#8B3FBF', // 主色调紫色
  '#A855F7', // 浅紫色
  '#10B981', // 绿色
  '#F59E0B', // 橙色
  '#EF4444', // 红色
  '#3B82F6', // 蓝色
  '#8B5CF6', // 紫罗兰色
  '#06B6D4', // 青色
  '#84CC16', // 柠檬绿
  '#F97316' // 橙红色
]

export function MinerDistributionChart({
  data,
  text
}: MinerDistributionChartProps & {
  text: { address: string; pickedBlocks: string; miner: string; percentage: string; miningTag1: string; miningTag2: string }
}) {
  // 安全检查：确保数据存在
  if (!data || !data.minerDistribution || data.minerDistribution.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">暂无矿工分布数据</p>
          <p className="text-sm">数据正在加载中...</p>
        </div>
      </div>
    )
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  // 准备图表数据
  const chartData = data.minerDistribution.map((miner, index) => ({
    name: formatAddress(miner.address),
    fullAddress: miner.address,
    value: miner.blocksMined,
    percentage: miner.percentage,
    color: COLORS[index % COLORS.length]
  }))

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-primary rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-semibold mb-1">
            {text.miner}: {data.name}
          </p>
          <p className="text-muted-foreground text-sm mb-1">
            {text.address}: {data.fullAddress}
          </p>
          <p className="text-primary font-medium">
            {text.pickedBlocks}: {data.value.toLocaleString()}
          </p>
          <p className="text-primary font-medium">
            {text.percentage}: {data.percentage.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  // 自定义Legend
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">
              {entry.value} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          {text.miningTag1} {data.totalBlocksScanned.toLocaleString()} {text.miningTag2}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${((percent || 0) * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
