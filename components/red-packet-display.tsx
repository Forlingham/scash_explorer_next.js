'use client'

import { Gift, User, Coins, MessageSquare, Hash, Clock, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { RedPacketData } from '@/lib/red-packet-utils'

interface RedPacketDisplayProps {
  data: RedPacketData
  compact?: boolean
  locale?: string
}

const translations: Record<string, Record<string, string>> = {
  en: {
    create: 'Red Packet Created',
    claim: 'Red Packet Claimed',
    refund: 'Red Packet Refunded',
    sender: 'Sender',
    claimer: 'Claimer',
    amount: 'Amount',
    count: 'Count',
    strategy: 'Strategy',
    blessMessage: 'Message',
    timestamp: 'Time',
    fundingTx: 'Funding Tx'
  },
  zh: {
    create: '发红包',
    claim: '领红包',
    refund: '红包退款',
    sender: '发送者',
    claimer: '领取者',
    amount: '金额',
    count: '数量',
    strategy: '策略',
    blessMessage: '祝福语',
    timestamp: '时间',
    fundingTx: 'Funding Tx'
  },
  ru: {
    create: 'Red Packet Created',
    claim: 'Red Packet Claimed',
    refund: 'Red Packet Refunded',
    sender: 'Sender',
    claimer: 'Claimer',
    amount: 'Amount',
    count: 'Count',
    strategy: 'Strategy',
    blessMessage: 'Message',
    timestamp: 'Time',
    fundingTx: 'Funding Tx'
  }
}

export function RedPacketDisplay({ data, compact, locale = 'en' }: RedPacketDisplayProps) {
  const router = useRouter()
  const t = translations[locale] || translations.en
  const d = data.data

  const actionConfig = {
    CREATE: { label: t.create, color: 'bg-red-500', borderColor: 'border-red-200' },
    CLAIM: { label: t.claim, color: 'bg-red-600', borderColor: 'border-red-300' },
    REFUND: { label: t.refund, color: 'bg-orange-500', borderColor: 'border-orange-200' }
  }
  const config = actionConfig[d.action] || actionConfig.CREATE

  const senderLabel = d.senderTelegramUsername || d.senderAddress || '-'

  if (compact) {
    return (
      <div className={cn('rounded-lg border bg-gradient-to-br from-red-50 to-orange-50 p-2', config.borderColor)}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn('text-white rounded-md p-0.5', config.color)}>
            <Gift className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold text-red-700">{config.label}</span>
          {d.packetHashShort && (
            <span className="text-[10px] text-red-400 font-mono ml-auto">#{d.packetHashShort}</span>
          )}
        </div>
        <div className="space-y-0.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1 min-w-0">
            <User className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{senderLabel}</span>
          </div>
          {d.action === 'CLAIM' && d.claimerTelegramUsername && (
            <div className="flex items-center gap-1 min-w-0">
              <User className="h-2.5 w-2.5 shrink-0 text-red-500" />
              <span className="truncate text-red-600">{d.claimerTelegramUsername}</span>
            </div>
          )}
          {d.amount && (
            <div className="flex items-center gap-1">
              <Coins className="h-2.5 w-2.5 shrink-0" />
              <span className="font-medium text-red-700">{d.amount}</span>
              {d.count !== undefined && <span className="text-[10px]">x{d.count}</span>}
            </div>
          )}
          {d.blessMessage && (
            <div className="flex items-center gap-1 text-red-500 truncate">
              <MessageSquare className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{d.blessMessage}</span>
            </div>
          )}
          {d.fundingTxid && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/tx/${d.fundingTxid}`)
              }}
              className="flex items-center gap-1 text-primary hover:underline truncate text-left bg-transparent border-0 p-0 cursor-pointer"
            >
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{d.fundingTxid.slice(0, 16)}...</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const timeString = d.timestamp
    ? (() => {
        try {
          return new Date(d.timestamp).toLocaleString()
        } catch {
          return d.timestamp
        }
      })()
    : null

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 shadow-sm',
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('text-white rounded-xl p-2 shadow-md', config.color)}>
          <Gift className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-red-800">{config.label}</div>
          {d.packetHashShort && (
            <div className="text-xs text-red-400 font-mono">Packet #{d.packetHashShort}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 text-red-400 shrink-0" />
          <span className="text-muted-foreground shrink-0">{t.sender}:</span>
          <span className="font-medium text-red-700 truncate">{senderLabel}</span>
        </div>

        {d.action === 'CLAIM' && d.claimerTelegramUsername && (
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.claimer}:</span>
            <span className="font-medium text-red-700 truncate">{d.claimerTelegramUsername}</span>
          </div>
        )}

        {d.amount && (
          <div className="flex items-center gap-2 min-w-0">
            <Coins className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.amount}:</span>
            <span className="font-medium text-red-700 truncate">{d.amount}</span>
          </div>
        )}

        {d.count !== undefined && (
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.count}:</span>
            <span className="font-medium text-red-700">{d.count}</span>
          </div>
        )}

        {d.strategy && (
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.strategy}:</span>
            <span className="font-medium text-red-700">{d.strategy}</span>
          </div>
        )}

        {d.blessMessage && (
          <div className="flex items-center gap-2 sm:col-span-2 min-w-0">
            <MessageSquare className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.blessMessage}:</span>
            <span className="font-medium text-red-700 truncate">{d.blessMessage}</span>
          </div>
        )}

        {timeString && (
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.timestamp}:</span>
            <span className="font-medium text-red-700 truncate">{timeString}</span>
          </div>
        )}

        {d.fundingTxid && (
          <div className="flex items-center gap-2 sm:col-span-2 min-w-0">
            <ExternalLink className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-muted-foreground shrink-0">{t.fundingTx}:</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                router.push(`/tx/${d.fundingTxid}`)
              }}
              className="font-medium text-primary hover:underline truncate text-left bg-transparent border-0 p-0 cursor-pointer"
            >
              {d.fundingTxid}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
