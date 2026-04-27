export interface RedPacketData {
  type: 'RED_PACKET'
  data: {
    action: 'CREATE' | 'CLAIM' | 'REFUND'
    packetHashShort: string
    senderAddress: string
    senderTelegramUsername: string | null
    amount: string
    count?: number
    strategy: string
    blessMessage: string | null
    timestamp: string
    fundingTxid?: string
    claimerTelegramUsername?: string | null
    claimerAddress?: string | null
  }
}

function extractString(data: string, key: string): string | undefined {
  // Match "key": "value" (value without escaped quotes)
  const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`)
  const m = data.match(regex)
  return m?.[1]
}

function extractNumber(data: string, key: string): number | undefined {
  const regex = new RegExp(`"${key}"\\s*:\\s*(\\d+)`)
  const m = data.match(regex)
  return m ? parseInt(m[1], 10) : undefined
}

/** Detect whether raw data looks like a red-packet JSON, even if truncated. */
export function isRedPacketLike(data: string): boolean {
  if (!data) return false
  const trimmed = data.trimStart()
  return trimmed.startsWith('{"type":"RED_PACKET"')
}

export function parseRedPacketData(data: string): RedPacketData | null {
  try {
    const parsed = JSON.parse(data)
    if (
      parsed.type === 'RED_PACKET' &&
      parsed.data?.action &&
      ['CREATE', 'CLAIM', 'REFUND'].includes(parsed.data.action)
    ) {
      return parsed as RedPacketData
    }
  } catch {
    // Not valid JSON — may be truncated by the backend
  }

  // Fallback: extract fields with regex for truncated JSON
  if (!isRedPacketLike(data)) return null

  const action = extractString(data, 'action') as RedPacketData['data']['action'] | undefined
  if (!action || !['CREATE', 'CLAIM', 'REFUND'].includes(action)) return null

  return {
    type: 'RED_PACKET',
    data: {
      action,
      packetHashShort: extractString(data, 'packetHashShort') || extractString(data, 'packetHash') || '',
      senderAddress: extractString(data, 'senderAddress') || '',
      senderTelegramUsername: extractString(data, 'senderTelegramUsername') || null,
      amount: extractString(data, 'amount') || '',
      count: extractNumber(data, 'count'),
      strategy: extractString(data, 'strategy') || '',
      blessMessage: extractString(data, 'blessMessage') || null,
      timestamp: extractString(data, 'timestamp') || '',
      fundingTxid: extractString(data, 'fundingTxid'),
      claimerTelegramUsername: extractString(data, 'claimerTelegramUsername') || null,
      claimerAddress: extractString(data, 'claimerAddress') || null,
    }
  }
}
