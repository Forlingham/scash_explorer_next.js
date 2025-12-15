'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface HashrateChartProps {
  data: Array<{ time: string; rate: number }>
}

export function HashrateChart({ data }: HashrateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
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
          formatter={(value: number) => [`${value} EH/s`, "Hash Rate"]}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#8B3FBF"
          strokeWidth={3}
          dot={{ fill: "#8B3FBF", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#8B3FBF", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}