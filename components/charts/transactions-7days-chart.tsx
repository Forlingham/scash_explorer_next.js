'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Transactions7DaysChartProps {
  data: Array<{ date: string; txCount: number }>
}

export function Transactions7DaysChart({
  data,
  text
}: Transactions7DaysChartProps & { text: { date: string; transactionVolume: string } }) {
  // 安全检查：确保数据存在
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">暂无交易数据</p>
          <p className="text-sm">数据正在加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="transactions7daysGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B3FBF" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8B3FBF" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--primary))',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(139, 63, 191, 0.15)',
            padding: '12px'
          }}
          labelStyle={{
            color: 'hsl(var(--foreground))',
            fontWeight: 600,
            marginBottom: '4px'
          }}
          itemStyle={{
            color: '#8B3FBF',
            fontWeight: 500
          }}
          formatter={(value: any) => [value.toLocaleString(), text.transactionVolume]}
          labelFormatter={(label: string) => `${text.date}: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="txCount"
          stroke="#8B3FBF"
          fill="url(#transactions7daysGradient)"
          strokeWidth={3}
          dot={{ fill: '#8B3FBF', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#8B3FBF', strokeWidth: 2, fill: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
