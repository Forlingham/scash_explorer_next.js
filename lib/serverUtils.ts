import Decimal from 'decimal.js'

export const formatTime = (timestamp: string, t: (key: string) => string) => {
  const date = new Date(timestamp)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) return `${minutes} ${t('minutes_ago')}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${t('hours_ago')}`

  // 大于1天的直接显示具体时间
  return date.toLocaleString()
}

// 传入一个时间，返回这个时间离当前时间的时间差
export const formatTimeDiff = (timestamp: string, t: (key: string) => string) => {
  const date = new Date(timestamp)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 60) return `${minutes} ${t('minutes_ago')}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${t('hours_ago')}`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${t('days_ago')}`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ${t('months_ago')}`

  const years = Math.floor(months / 12)
  return `${years} ${t('years_ago')}`
}

/**
 * 格式化哈希值，显示前面和后面的部分，中间用省略号连接
 * @param hash 完整的哈希值
 * @param startLength 前面显示的字符数，默认10
 * @param endLength 后面显示的字符数，默认8
 * @returns 格式化后的哈希值，如：1234567890...abcdefgh
 */
export const formatHash = (hash: string, startLength: number = 10, endLength: number = 8): string => {
  if (!hash || hash.length <= startLength + endLength) {
    return hash
  }

  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`
}

/**
 * 格式化地址，显示前面和后面的部分，中间用省略号连接
 * @param address 完整的地址
 * @param startLength 前面显示的字符数，默认6
 * @param endLength 后面显示的字符数，默认4
 * @returns 格式化后的地址，如：0x1234...abcd
 */
export const formatAddress = (address: string, startLength: number = 6, endLength: number = 4): string => {
  if (!address || address.length <= startLength + endLength) {
    return address
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * 格式化市值，使用紧凑单位显示：1k、1M、1B、1T
 * 示例：
 * - 950 -> "950"
 * - 1_200 -> "1.2k"
 * - 5_000_000 -> "5M"
 * - 1_250_000_000 -> "1.25B"
 */
export const formatMarketCap = (
  value: number | string,
  decimals: number = 3
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return String(value)

  const sign = num < 0 ? '-' : ''
  const abs = Math.abs(num)

  if (abs < 1000) {
    // 小于千不缩写，保留整数字符串显示
    return `${sign}${abs.toString()}`
  }

  const units = [
    { v: 1e12, s: 'T' },
    { v: 1e9, s: 'B' },
    { v: 1e6, s: 'M' },
    { v: 1e3, s: 'k' }
  ]

  for (const u of units) {
    if (abs >= u.v) {
      // 使用 Decimal 进行缩放并向下截断到指定位数，不进行四舍五入
      const scaledDec = new Decimal(abs).div(u.v).toDecimalPlaces(decimals, Decimal.ROUND_DOWN)
      const str = scaledDec.toString().replace(/\.0+$/, '').replace(/\.?0+$/, '')
      return `${sign}${str}${u.s}`
    }
  }

  // 兜底（理应不会走到这里）
  return `${sign}${abs}`
}
