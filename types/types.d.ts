interface PageType<T> {
  list: T[]
  pagination: Pagination
}

interface BlockType {
  height: number
  hash: string
  timestamp: string
  txCount: number
  size: number
  weight: number
  medianFee: number
  difficulty: number
  minerAddress: string | null
  version: number
  reward: string
}

interface Pagination {
  total: number
  totalPages: number
  currentPage: number
  take: number
}

interface FeeEstimateType {
  targetBlocks: number
  feeRateSatPerVb: number
  estimatedInBlocks: number
}

interface DailyStatsChangeType {
  totalBlocks: number
  totalTxs: number
  totalAddrCount: number
  totalVolume: string
  totalMarketCap: string
  latestStatsTotalMarketCap: string
  change: Change
}

interface Change {
  totalBlocks: number
  totalTxs: number
  totalVolume: string
  addrCount: number
}

interface PriceType {
  price: string
  timestamp: string
  change24h: string
  changePercent24h: string
  change7d: string
  changePercent7d: string
  change30d: string
  changePercent30d: string
}

interface PriceChartType {
  timestamp: string
  price: string
}

interface HomeOverviewType {
  dailyStatsChange: DailyStatsChangeType
  feeEstimate1: FeeEstimateType
  feeEstimate6: FeeEstimateType
  feeEstimate144: FeeEstimateType
  price: PriceType
  priceChart: PriceChartType[]
}

interface WhaleChangesType {
  address: string
  currentRank: number
  currentBalance: string
  rankChange: null | number
  balanceChange: null | string
  tags: AddressTagType[]
}

interface BalanceDistribution {
  range: string
  count: number
  percentage: string
}

interface BalanceDistributionType {
  totalAddresses: number
  distribution: BalanceDistribution[]
}

interface RankingDistributionType {
  totalBalance: number
  totalBalanceSatoshis: string
  distribution: RankingDistribution[]
}

interface RankingDistribution {
  range: string
  balance: number
  balanceSatoshis: string
  count: number | string
  percentage: string
}

interface TransactionType {
  txid: string
  blockHeight: number
  size: number
  weight: number
  senders: Sender[]
  receivers: Sender[]
  changeOutputs: any[]
  totalAmount: number
  fee: number
  timestamp: string
  confirmations: number
}

interface Sender {
  address: string
  amount: number
}

interface InactiveAddressesType {
  totalAddresses: number
  totalBalance: string
  inactiveAddresses: InactiveAddresses
}

interface InactiveAddresses {
  twoYears: TwoYears
  oneYear: TwoYears
  sixMonths: TwoYears
  threeMonths: TwoYears
  oneMonth: TwoYears
}

interface TwoYears {
  count: number
  balance: string
  description: string
}

interface Transactions7daysType {
  date: string
  txCount: number
}

interface NetworkDifficultyType {
  hour: string
  difficulty: number
}

interface MinerDistributionType {
  totalBlocksScanned: number
  minerDistribution: MinerDistribution[]
}

interface MinerDistribution {
  address: string
  blocksMined: number
  percentage: number
}

//首页的图表数据
interface HomeChartType {
  transactionStatsLast7Days: Transactions7daysType[]
  networkDifficultyStatsHourly: NetworkDifficultyType[]
  minerDistributionStats: MinerDistributionType
}

//区块详情
interface BlockDetailType {
  height: number
  hash: string
  timestamp: string
  txCount: number
  size: number
  weight: number
  difficulty: string
  minerAddress: string
  version: number
  nonce: string
  reward: string
  feeSpanMin: string
  feeSpanMax: string
  medianFee: string
  totalFees: string
}

// 区块下的交易列表,的区块信息
interface TransactionBlockInfoType {
  height: number
  hash: string
  timestamp: string
  txCount: number
  confirmations: number
}

interface AddressDetailType {
  address: string
  balance: string
  transactionCount: number
  received: string
  sent: string
  firstSeen: string
  lastSeen: string
  addressTags: AddressTagType[]
}

interface AddressTagType {
  name: string
  type: 'text' | 'website' | 'group_chat'
  description: string
  source: null
  sortOrder?: number
}

interface AddressTransactionsType {
  address: string
}

interface TxDetailType {
  txid: string
  hash: string
  timestamp: string
  blockHeight: number
  size: number
  weight: number
  io: Io[]
}

interface Io {
  id: string
  txid: string
  address: string
  amount: string
  spentTxid: null | string
  spentIndex: null | number
  voutIndex: null | number
}

interface InactiveAddressesList {
  addresses: Address[]
  pagination: Pagination2
  summary: Summary
}

interface Summary {
  totalAddresses: number
  totalBalance: string
  description: string
}
interface Pagination2 {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
interface Address {
  address: string
  balance: string
  lastActive: string
  txCount: number
  received: string
  sent: string
  inactiveDays: number
}

interface GraphType {
  center: string
  centerTags: AddressTagType[]
  incoming: Incoming[]
  outgoing: Incoming[]
}

interface Incoming {
  address: string
  txid: string
  amount: number
  timestamp: string
  tags: AddressTagType[]
}
