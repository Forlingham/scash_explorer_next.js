'use client'

import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface PieChartComponentProps {
  data: Array<{
    name: string
    color?: string  // 将color属性设为可选
    [key: string]: any
  }>
  dataKey: string
  valueLabel: string
  isPercentage?: boolean
  title?: string
}

// 现代化渐变色彩方案
const GRADIENT_COLORS = [
  { start: '#667eea', end: '#764ba2' }, // 蓝紫渐变
  { start: '#f093fb', end: '#f5576c' }, // 粉红渐变
  { start: '#4facfe', end: '#00f2fe' }, // 蓝青渐变
  { start: '#43e97b', end: '#38f9d7' }, // 绿青渐变
  { start: '#fa709a', end: '#fee140' }, // 粉黄渐变
  { start: '#a8edea', end: '#fed6e3' }, // 青粉渐变
  { start: '#ffecd2', end: '#fcb69f' }, // 橙桃渐变
  { start: '#ff8a80', end: '#ea4c89' }, // 红粉渐变
  { start: '#8fd3f4', end: '#84fab0' }, // 蓝绿渐变
  { start: '#d299c2', end: '#fef9d7' }  // 紫黄渐变
]

export function PieChartComponent({ data, dataKey, valueLabel, isPercentage = false, title }: PieChartComponentProps) {
  const formatValue = (value: number) => {
    if (isPercentage) {
      return `${value.toFixed(2)}%`
    }
    return value.toLocaleString()
  }

  // 创建渐变定义
  const createGradientDefs = () => {
    return (
      <defs>
        {GRADIENT_COLORS.map((gradient, index) => (
          <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient.start} />
            <stop offset="100%" stopColor={gradient.end} />
          </linearGradient>
        ))}
      </defs>
    )
  }

  // 保持原始数据顺序，使用渐变色
  const enhancedData = data.map((item, index) => {
    const gradientIndex = index % GRADIENT_COLORS.length
    return {
      ...item,
      // 如果数据已经有color属性，保持原有颜色，否则使用渐变色的实色版本
      color: item.color || GRADIENT_COLORS[gradientIndex].start,
      gradientIndex: gradientIndex,
      gradientColor: `url(#gradient-${gradientIndex})`
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{data.payload.name}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {valueLabel}: <span className="font-medium">{formatValue(data.value)}</span>
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-center mb-4 text-gray-900 dark:text-gray-100">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <RePieChart>
          {createGradientDefs()}
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={130}
            innerRadius={50}
            dataKey={dataKey}
            label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
              // 显示所有扇形的百分比，但对于很小的扇形使用更小的字体
              const RADIAN = Math.PI / 180;
              const radius = outerRadius + 30; // 将标签放在饼图外面
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              
              // 对于小于2%的扇形使用更小的字体
              const fontSize = percent < 0.02 ? 'text-xs' : 'text-sm';
              
              return (
                <text 
                  x={x} 
                  y={y} 
                  fill="#374151" 
                  textAnchor={x > cx ? 'start' : 'end'} 
                  dominantBaseline="central"
                  className={`font-bold ${fontSize} dark:fill-gray-300`}
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {`${(percent * 100).toFixed(1)}%`}
                </text>
              );
            }}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={3}
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.gradientColor || entry.color}
                className="hover:opacity-90 transition-opacity duration-300 drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={80}
            content={(props) => {
              // 使用原始数据顺序而不是 Recharts 自动排序的 payload
              return (
                <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-full px-4">
                  {enhancedData.map((entry, index) => {
                    const gradientIndex = entry.gradientIndex || 0
                    const gradient = GRADIENT_COLORS[gradientIndex]
                    return (
                      <div key={`legend-${index}`} className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80 min-w-0 flex-shrink-0">
                        <div 
                          className="w-4 h-4 rounded-full shadow-md flex-shrink-0" 
                          style={{ 
                            background: `linear-gradient(135deg, ${gradient.start}, ${gradient.end})` 
                          }} 
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{entry.name}</span>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  )
}
