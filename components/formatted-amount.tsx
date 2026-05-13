import { cn } from '@/lib/utils'
import { formatMarketCap } from '@/lib/serverUtils'

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
  compact?: boolean
  // 可选：手机端显示的小数位数，通过 CSS 响应式切换
  mobileDecimals?: number
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
  decimals = 8,
  compact = false,
  mobileDecimals
}: FormattedAmountProps) {
  // 转换为数字并格式化
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const absValue = Math.abs(numValue)

  // 确定符号
  const sign = numValue >= 0 ? (showPositiveSign ? '+' : '') : '-'

  // compact 模式：整数部分 >= 1000 时使用缩写格式
  if (compact && absValue >= 1000) {
    const compactValue = formatMarketCap(absValue, 2)
    return (
      <span className={cn(className)}>
        {sign}
        <span className={integerClassName}>
          {compactValue}
        </span>
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
  
  // 格式化为指定位数的小数，然后移除末尾的0
  const formattedValue = absValue.toFixed(decimals).replace(/\.?0+$/, '')
  
  // 分离整数部分和小数部分
  const [integerPart, decimalPart] = formattedValue.split('.')
  
  // 为整数部分添加千位分隔符
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 如果设置了 mobileDecimals，生成手机端显示的短小数部分
  const mobileDecimalPart = mobileDecimals !== undefined && decimalPart
    ? decimalPart.slice(0, mobileDecimals)
    : null

  // 渲染符号部分
  const symbolElement = symbol && (
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
  )

  // 如果有 mobileDecimals，使用响应式双渲染模式
  if (mobileDecimals !== undefined && decimalPart) {
    return (
      <span className={cn(className)}>
        {sign}
        <span className={integerClassName}>
          {formattedInteger}
        </span>
        {/* 手机端：显示较少小数位 */}
        <span className={cn('inline sm:hidden', decimalClassName)}>
          {mobileDecimalPart ? `.${mobileDecimalPart}` : ''}
        </span>
        {/* 桌面端：显示完整小数位 */}
        <span className={cn('hidden sm:inline', decimalClassName)}>
          .{decimalPart}
        </span>
        {symbolElement}
      </span>
    )
  }
  
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
      {symbolElement}
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