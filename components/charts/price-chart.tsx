'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface PriceChartProps {
  data: Array<{ time: string; price: number }>
  currentPrice: number
  priceChange24h: number
}

export function PriceChart({ data, currentPrice, priceChange24h }: PriceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B3FBF" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8B3FBF" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--primary))",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(139, 63, 191, 0.15)",
            padding: "12px",
          }}
          labelStyle={{
            color: "hsl(var(--foreground))",
            fontWeight: 600,
            marginBottom: "4px",
          }}
          itemStyle={{
            color: "#8B3FBF",
            fontWeight: 500,
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#8B3FBF"
          fill="url(#priceGradient)"
          strokeWidth={3}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}