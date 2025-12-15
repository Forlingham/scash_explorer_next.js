'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface NetworkDifficultyChartProps {
  data: Array<{ hour: string; difficulty: number }>
}

export function NetworkDifficultyChart({
  data,
  text
}: NetworkDifficultyChartProps & { text: { date: string; networkDifficulty: string } }) {
  // 安全检查：确保数据存在
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">暂无网络难度数据</p>
          <p className="text-sm">数据正在加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <defs>
          <linearGradient id="difficultyLineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="hour"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          tickFormatter={(value) => {
            if (value >= 1e12) {
              return `${(value / 1e12).toFixed(1)}T`
            } else if (value >= 1e9) {
              return `${(value / 1e9).toFixed(1)}B`
            } else if (value >= 1e6) {
              return `${(value / 1e6).toFixed(1)}M`
            }
            return value.toString()
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid #10B981',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            padding: '12px'
          }}
          labelStyle={{
            color: 'hsl(var(--foreground))',
            fontWeight: 600,
            marginBottom: '4px'
          }}
          itemStyle={{
            color: '#10B981',
            fontWeight: 500
          }}
          formatter={(value: number) => [value.toLocaleString(), text.networkDifficulty]}
          labelFormatter={(label: string) => `${text.date}: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="difficulty"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
          activeDot={{
            r: 6,
            stroke: '#10B981',
            strokeWidth: 2,
            fill: '#fff',
            filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
