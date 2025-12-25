import { AxiosRequestConfig } from 'axios'
import axiosInstance from './request'

export const serverHttpClient = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.get<T>(url, config)
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config)
    return response.data
  }
}

/**
 * 获取区块列表
 * @param pageSize 每页数量
 * @param currentPage 当前页码
 * @returns 区块列表
 */
export function blocksApi(pageSize: number, currentPage: number) {
  return serverHttpClient.get<PageType<BlockType>>('/explorer/blocks', {
    params: {
      pageSize,
      page: currentPage
    }
  })
}

export function feeEstimateApi(target: number) {
  return serverHttpClient.get<FeeEstimateType>('/explorer/fee-estimate', {
    params: {
      target
    }
  })
}

export function homeOverviewApi() {
  return serverHttpClient.get<HomeOverviewType>('/explorer/home/overview', {})
}

export function whaleChangesApi(date?: string) {
  return serverHttpClient.get<WhaleChangesType[]>('/explorer/stats/whale-changes', {
    params: {
      date
    }
  })
}

// 不活跃地址统计
export function inactiveAddressesApi() {
  return serverHttpClient.get<InactiveAddressesType>('/explorer/stats/inactive-addresses')
}

// 获取地址余额分布统计（用于饼图）
export function balanceDistributionApi() {
  return serverHttpClient.get<BalanceDistributionType>('/explorer/stats/balance-distribution', {})
}

// 获取地址排名金额占比统计（用于饼图）
export function rankingDistributionApi() {
  return serverHttpClient.get<RankingDistributionType>('/explorer/stats/ranking-distribution', {})
}

/**
 * 获取交易列表
 * @param pageSize 每页数量
 * @param currentPage 当前页码
 * @returns 交易列表
 */
export function transactionsApi(pageSize: number, currentPage: number) {
  return serverHttpClient.get<PageType<TransactionType>>('/explorer/transactions', {
    params: {
      pageSize,
      page: currentPage
    }
  })
}

/**
 * 获取近7天交易数量按天统计（折线图数据）
 */
export function transactions7daysApi() {
  return serverHttpClient.get<Transactions7daysType[]>('/explorer/stats/chart/transactions-7days', {})
}

/**
 * 获取网络难度按小时统计（折线图数据）
 */
export function networkDifficultyApi() {
  return serverHttpClient.get<NetworkDifficultyType[]>('/explorer/stats/chart/network-difficulty', {})
}

/**
 * 获取矿工分布统计（用于饼图）
 */
export function minerDistributionApi() {
  return serverHttpClient.get<MinerDistributionType>('/explorer/stats/miner-distribution', {})
}

/**
 * 获取首页的图表数据
 */
export function homeChartApi() {
  return serverHttpClient.get<HomeChartType>('/explorer/home/chart', {})
}

/**
 * 获取区块详情
 * @param id 区块高度/区块哈希
 * @returns 区块详情
 */
export function blockDetailApi(id: string) {
  return serverHttpClient.get<BlockDetailType>(`/explorer/block-detail/${id}`, {})
}

/**
 * 获取区块下的交易列表
 * @param id 区块高度
 * @param pageSize 每页数量
 * @param currentPage 当前页码
 * @returns 交易列表
 */
export function blockTransactionsApi(id: string, pageSize: number, currentPage: number) {
  return serverHttpClient.get<PageType<TransactionType> & TransactionBlockInfoType>(`/explorer/block-transactions/${id}`, {
    params: {
      pageSize,
      page: currentPage
    }
  })
}

/**
 * 获取地址详情
 * @param id 地址
 * @returns 地址详情
 */
export function addressDetailApi(id: string) {
  return serverHttpClient.get<AddressDetailType>(`/explorer/address-detail/${id}`, {})
}

/**
 * 获取地址下的交易列表
 * @param id 地址
 * @param pageSize 每页数量
 * @param currentPage 当前页码
 * @returns 交易列表
 */
export function addressTransactionsApi(id: string, pageSize: number, currentPage: number) {
  return serverHttpClient.get<PageType<TransactionType> & AddressTransactionsType>(`/explorer/address/${id}/txs`, {
    params: {
      pageSize,
      page: currentPage
    }
  })
}

/**
 * 获取交易详情
 * @param id 交易ID
 * @returns 交易详情
 */
export function transactionDetailApi(id: string) {
  return serverHttpClient.get<{ tx: TxDetailType } & { processedTransaction: TransactionType }>(`/explorer/tx/${id}`, {})
}

/**
 * 查询指定时间段内不活跃的地址列表
 * @param period 不活跃时间段 (2year|1year|6months|3months|1month)
 * @param type 不活跃类型 (address|balance)
 * @param page 页码
 * @param pageSize 每页数量
 */
export function inactiveAddressesListApi(period: string, type: string, page: number, pageSize: number) {
  return serverHttpClient.get<InactiveAddressesList>(`/explorer/inactive-addresses`, {
    params: {
      period,
      type,
      page,
      pageSize
    }
  })
}

interface ExplorerApiInfo {
  name: string
  version: string
  description: string
  contentType: string
  rpc_auth: Rpcauth
  rpc_support_methods: string[]
}

interface Rpcauth {
  username: string
  password: string
}
export function explorerApiInfoApi() {
  return serverHttpClient.get<ExplorerApiInfo>('', {})
}


