import { cn } from '@/lib/utils'

interface FormattedAmountProps {
  value: number | string
  symbol?: string
  // 可选：为图片单位提供自定义 alt 文本
  symbolAlt?: string
  className?: string
  integerClassName?: string
  decimalClassName?: string
  symbolClassName?: string
  showPositiveSign?: boolean
  decimals?: number
}

export function FormattedAmount({
  value,
  symbol = '/logo.png',
  symbolAlt = 'symbol',
  className,
  integerClassName,
  decimalClassName = 'text-sm',
  symbolClassName,
  showPositiveSign = false,
  decimals = 8
}: FormattedAmountProps) {
  // 转换为数字并格式化
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const absValue = Math.abs(numValue)
  
  // 格式化为指定位数的小数，然后移除末尾的0
  const formattedValue = absValue.toFixed(decimals).replace(/\.?0+$/, '')
  
  // 分离整数部分和小数部分
  const [integerPart, decimalPart] = formattedValue.split('.')
  
  // 为整数部分添加千位分隔符
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // 确定符号
  const sign = numValue >= 0 ? (showPositiveSign ? '+' : '') : '-'
  
  return (
    <span className={cn(className)}>
      {sign}
      <span className={integerClassName}>
        {formattedInteger}
      </span>
      {decimalPart && (
        <span className={decimalClassName}>
          .{decimalPart}
        </span>
      )}
      {symbol && (
        symbol.startsWith('/') ? (
          <img
            src={symbol}
            alt={symbolAlt ?? 'symbol'}
            className={cn('ml-1 inline-block h-8 align-text-bottom', symbolClassName)}
          />
        ) : (
          <span className={cn('ml-1', symbolClassName)}>
            {symbol}
          </span>
        )
      )}
    </span>
  )
}

interface FormattedBtcAmountProps extends Omit<FormattedAmountProps, 'symbol' | 'decimals'> {
  satoshis?: number
  btcValue?: number
}

export function FormattedBtcAmount({
  value,
  satoshis,
  btcValue,
  ...props
}: FormattedBtcAmountProps) {
  // 如果提供了聪值，转换为BTC
  let finalValue: number
  if (satoshis !== undefined) {
    finalValue = satoshis / 100_000_000
  } else if (btcValue !== undefined) {
    finalValue = btcValue
  } else {
    finalValue = typeof value === 'string' ? parseFloat(value) : value
  }
  
  return (
    <FormattedAmount
      value={finalValue}
      symbol="BTC"
      decimals={8}
      {...props}
    />
  )
}