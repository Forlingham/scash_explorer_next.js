import { clsx, type ClassValue } from 'clsx'
import Decimal from 'decimal.js'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 合并相同地址的发送方和接收方
export const mergeSendersReceivers = (senders: Sender[], receivers: Sender[]) => {
  const addressMap = new Map<string, { amount: Decimal; type: 'input' | 'output' }>()

  // 处理发送方
  senders.forEach((sender) => {
    const existing = addressMap.get(sender.address)
    if (existing) {
      existing.amount = existing.amount.plus(sender.amount)
    } else {
      addressMap.set(sender.address, { amount: new Decimal(sender.amount), type: 'input' })
    }
  })

  // 处理接收方
  receivers.forEach((receiver) => {
    const existing = addressMap.get(receiver.address)
    if (existing) {
      // 如果地址已存在，合并金额
      existing.amount = existing.amount.plus(receiver.amount)
    } else {
      addressMap.set(receiver.address, { amount: new Decimal(receiver.amount), type: 'output' })
    }
  })

  // 转换回数组格式
  const mergedSenders: Sender[] = []
  const mergedReceivers: Sender[] = []

  addressMap.forEach((data, address) => {
    if (data.type === 'input') {
      mergedSenders.push({ address, amount: data.amount.toNumber() })
    } else {
      mergedReceivers.push({ address, amount: data.amount.toNumber() })
    }
  })

  return { mergedSenders, mergedReceivers }
}
