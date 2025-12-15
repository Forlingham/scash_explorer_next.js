import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceChangeProps {
  /** 变化值 */
  value: number | string
  /** 单位，默认为 % */
  unit?: string
  /** 自定义样式类名 */
  className?: string
  /** 图标大小，默认为 h-4 w-4 */
  iconSize?: string
  /** 文字大小，默认为 text-sm */
  textSize?: string
  /** 是否显示绝对值，默认为 true */
  showAbsolute?: boolean
}

export function PriceChange({
  value,
  unit = '%',
  className,
  iconSize = 'h-4 w-4',
  textSize = 'text-sm',
  showAbsolute = true
}: PriceChangeProps) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  const isPositive = numValue >= 0
  const displayValue = showAbsolute ? Math.abs(numValue) : numValue
  
  return (
    <span 
      className={cn(
        `${textSize} flex items-center gap-1`,
        isPositive ? 'text-success' : 'text-destructive',
        className
      )}
    >
      {isPositive ? (
        <ArrowUpRight className={iconSize} />
      ) : (
        <ArrowDownRight className={iconSize} />
      )}
      {displayValue}{unit}
    </span>
  )
}