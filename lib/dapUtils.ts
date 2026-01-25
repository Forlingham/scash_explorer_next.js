import ScashDAP from 'scash-dap'
import { getArrFeeAddress, getScashNetwork } from './const'

export class DapUtils {
  private scashDAP: ScashDAP
  private appFeeAddress: string

  constructor() {
    this.scashDAP = new ScashDAP(getScashNetwork())
    this.appFeeAddress = getArrFeeAddress()
  }

  // 解析内容
  parseContent(dapStatus: DapStatus, processedTransaction: TransactionType, txData: TxDetailType) {
    const _processedTransaction: TransactionType = { ...processedTransaction }
    let isShowDap = false
    let dapReceivers: TransactionType['receivers'] = []
    let depFee = BigInt(0)
    let networkFee = processedTransaction.fee
    let scashDAPData: string | null = null
    let totalAmount = BigInt(0)

    // 计算平台手续费
    const appFeeTx = processedTransaction.receivers.find((item) => this.appFeeAddress === item.address)
    if (appFeeTx) {
      let appFee = appFeeTx.amount
      networkFee = appFee + networkFee
    }
    _processedTransaction.receivers = processedTransaction.receivers.filter((item) => item.address !== this.appFeeAddress)

    if (dapStatus.isDap) {
      if (dapStatus.isMessageDap === false) {
        isShowDap = true
      }

      scashDAPData = this.scashDAP.parseDapTransaction(txData.io)
      dapReceivers = _processedTransaction.receivers.filter((item) => {
        return this.scashDAP.isScashDAPAddress(item.address)
      })
      depFee = dapReceivers.reduce((acc, cur) => acc + BigInt(cur.amount), BigInt(0))

      if (dapReceivers) {
        _processedTransaction.receivers = _processedTransaction.receivers.filter((item) => {
          return !dapReceivers.some((dapItem) => dapItem.address === item.address)
        })
      }
    }

    _processedTransaction.receivers.forEach((item) => {
      totalAmount += BigInt(item.amount)
    })

    return { isShowDap, dapReceivers, depFee, networkFee, scashDAPData, totalAmount, processedTransaction: _processedTransaction }
  }
}
