"use client"

import { TrendingUp, Activity, HardDrive, DollarSign, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { getTranslation } from "@/i18n/i18n-provider"

export default function ChartsPage() {
  const t = getTranslation()

  // Mock data - replace with real API calls
  const difficultyData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    difficulty: Math.floor(Math.random() * 10000000 + 50000000),
  }))

  const transactionData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    count: Math.floor(Math.random() * 50000 + 200000),
  }))

  const blockSizeData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    size: Math.floor(Math.random() * 500 + 800),
  }))

  const feeRateData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    rate: Math.floor(Math.random() * 30 + 5),
  }))

  const minerData = [
    { name: "Pool A", value: 250, color: "#8B3FBF" },
    { name: "Pool B", value: 200, color: "#A855F7" },
    { name: "Pool C", value: 180, color: "#C084FC" },
    { name: "Pool D", value: 150, color: "#D8B4FE" },
    { name: "Others", value: 220, color: "#E9D5FF" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          {t("charts.title")}
        </h1>
        <p className="text-lg text-muted-foreground">Comprehensive blockchain analytics and trends</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mining Difficulty Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              {t("charts.difficulty")}
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={difficultyData}>
                <defs>
                  <linearGradient id="difficultyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B3FBF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B3FBF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                  formatter={(value: number) => [value.toLocaleString(), "Difficulty"]}
                />
                <Line
                  type="monotone"
                  dataKey="difficulty"
                  stroke="#8B3FBF"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#8B3FBF", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Transactions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {t("charts.transactions")}
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transactionData}>
                <defs>
                  <linearGradient id="txBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B3FBF" stopOpacity={1} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                  formatter={(value: number) => [value.toLocaleString(), "Transactions"]}
                />
                <Bar dataKey="count" fill="url(#txBarGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Miner Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              {t("charts.minerDistribution")}
            </CardTitle>
            <CardDescription>{t("charts.last1000Blocks")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={minerData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent as any) * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 }}
                >
                  {minerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
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
                  formatter={(value: number) => [value, "Blocks"]}
                />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Block Size Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-primary" />
              {t("charts.blockSize")}
            </CardTitle>
            <CardDescription>Last 30 days (KB)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={blockSizeData}>
                <defs>
                  <linearGradient id="blockSizeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                    color: "#A855F7",
                    fontWeight: 500,
                  }}
                  formatter={(value: number) => [`${value} KB`, "Block Size"]}
                />
                <Line
                  type="monotone"
                  dataKey="size"
                  stroke="#A855F7"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#A855F7", stroke: "#fff", strokeWidth: 2 }}
                  fill="url(#blockSizeGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Fee Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {t("charts.feeRate")}
            </CardTitle>
            <CardDescription>Last 30 days (sat/vB)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feeRateData}>
                <defs>
                  <linearGradient id="feeBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity={1} />
                    <stop offset="100%" stopColor="#D8B4FE" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
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
                    color: "#C084FC",
                    fontWeight: 500,
                  }}
                  formatter={(value: number) => [`${value} sat/vB`, "Fee Rate"]}
                />
                <Bar dataKey="rate" fill="url(#feeBarGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
