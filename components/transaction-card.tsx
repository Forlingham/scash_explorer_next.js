import Link from 'next/link'
import { ArrowRightLeft, Clock, ArrowDown, ArrowUp, Hash, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/serverUtils'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL, getScashNetwork } from '@/lib/const'
import { mergeSendersReceivers } from '@/lib/utils'
import { DapUtils } from '@/lib/dapUtils'
import { ScashDAPDataDisplay } from './scash-dap-data-display'
import { DapBadge } from './dap-badge'

// 地址方块组件
function AddressBlock({
  address,
  amount,
  type,
  isHighlighted = false
}: {
  address: string
  amount: number
  type: 'input' | 'output' | 'change'
  isHighlighted?: boolean
}) {
  const bgColor = isHighlighted
    ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
    : type === 'input'
      ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      : type === 'change'
        ? 'bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        : 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'

  // 使用条件渲染来避免类型错误
  return isHighlighted ? (
    <div className={`block p-2 rounded-lg border ${bgColor} cursor-default`}>
      <div className="text-xs font-mono text-center">
        <div
          className={`font-semibold w-16 mx-auto overflow-hidden whitespace-nowrap text-gray-500 dark:text-gray-400`}
          style={{
            direction: 'rtl',
            textAlign: 'left',
            textOverflow: 'ellipsis'
          }}
          title={address}
        >
          {address}
        </div>
        <div className="text-xs mt-1">{satoshisToBtc(amount)}</div>
      </div>
    </div>
  ) : (
    <Link href={`/address/${address}/20/1`} className={`block p-2 rounded-lg border ${bgColor} hover:opacity-80 transition-opacity`}>
      <div className="text-xs font-mono text-center">
        <div
          className="font-semibold w-16 mx-auto overflow-hidden whitespace-nowrap"
          style={{
            direction: 'rtl',
            textAlign: 'left',
            textOverflow: 'ellipsis'
          }}
          title={address}
        >
          {address}
        </div>
        <div className="text-xs mt-1">{satoshisToBtc(amount)}</div>
      </div>
    </Link>
  )
}

interface TransactionCardProps {
  dapStatus: DapStatus
  tx: TransactionType
  t: (key: string) => string
  highlightAddress?: string // 需要突出显示的地址
  isTx?: boolean // 是否要显示交易地址
}

export default function TransactionCard({ dapStatus, tx, t, highlightAddress, isTx = false }: TransactionCardProps) {
  const dapUtils = new DapUtils()
  const { isShowDap, dapReceivers, depFee, networkFee, scashDAPData, totalAmount, processedTransaction } = dapUtils.parseContent(
    dapStatus,
    tx
  )

  const { mergedSenders, mergedReceivers } = mergeSendersReceivers(processedTransaction.senders, processedTransaction.receivers)
  return (
    <Card key={tx.txid} className="overflow-hidden">
      {/* 交易ID头部 */}
      <CardHeader className="pb-2 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {isTx ? (
              ''
            ) : (
              <div className="flex flex-col gap-1 min-w-0 w-full">
                <div className="flex items-start gap-2 w-full">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  <Link href={`/tx/${tx.txid}`} className="text-blue-600 hover:underline font-mono text-sm break-all">
                    {tx.txid}
                  </Link>
                </div>
                {(dapStatus.isDap || scashDAPData) && (
                  <div className="flex items-center gap-2 pl-6">
                    <DapBadge size="sm" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-10 text-sm text-foreground">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">{t('tx.totalAmount')}</span>
                <span className="font-semibold text-sm">
                  {satoshisToBtc(totalAmount)} {BASE_SYMBOL}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs">{t('tx.fee')}</span>
                <span className="font-semibold text-sm">
                  {satoshisToBtc(networkFee)} {BASE_SYMBOL}
                </span>
              </div>
              {(dapStatus.isDap || scashDAPData) && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">{t('dap.fee')}</span>
                  <span className="font-semibold text-sm">
                    {satoshisToBtc(depFee)} {BASE_SYMBOL}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0 border-t md:border-t-0 pt-2 md:pt-0">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(tx.timestamp, t)}
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {tx.confirmations} {t('tx.confirmations')}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 py-3">
        {/* 输入输出区域 */}
        {(dapStatus.isDap || scashDAPData) && !dapStatus.isMessageDap ? (
          <></>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 输入 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                <ArrowDown className="h-4 w-4" />
                {t('tx.inputs')} ({mergedSenders.length})
              </div>
              {mergedSenders.length === 0 ? (
                // 挖矿奖励交易
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                    <Activity className="h-4 w-4" />
                    {t('tx.miningReward')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('tx.coinbaseTransaction')}</div>
                </div>
              ) : mergedSenders.length <= 3 ? (
                <div className="space-y-1">
                  {mergedSenders.map((sender, index) => {
                    const isHighlighted = highlightAddress && sender.address === highlightAddress
                    return (
                      <div
                        key={index}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg border gap-1 sm:gap-2 ${
                          isHighlighted
                            ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          {isHighlighted ? (
                            <span className="font-mono text-xs block truncate text-gray-500 dark:text-gray-400">{sender.address}</span>
                          ) : (
                            <Link
                              href={`/address/${sender.address}/20/1`}
                              className="text-blue-600 hover:underline font-mono text-xs block truncate"
                            >
                              {sender.address}
                            </Link>
                          )}
                        </div>
                        <div className="text-right sm:ml-2 flex items-center justify-between sm:block">
                          <span className="text-[10px] text-muted-foreground sm:hidden">{t('tx.amount')}:</span>
                          <div className="font-semibold text-sm">
                            {satoshisToBtc(sender.amount)} {BASE_SYMBOL}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mergedSenders.map((sender, index) => (
                    <AddressBlock
                      key={index}
                      address={sender.address}
                      amount={sender.amount}
                      type="input"
                      isHighlighted={highlightAddress === sender.address}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 箭头 */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-1 p-2">
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground text-center">
                  {tx.blockHeight >= 0 ? (
                    <>
                      <div>#{tx.blockHeight}</div>
                      <div className="mt-1">
                        <Link href={`/block/${tx.blockHeight}/20/1`} className="text-blue-600 hover:underline">
                          {t('nav.blocks')}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div>{t('tx.poolTransactionDesc')}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 输出 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                <ArrowUp className="h-4 w-4" />
                {t('tx.outputs')} ({mergedReceivers.length + processedTransaction.changeOutputs.length})
              </div>
              {mergedReceivers.length + processedTransaction.changeOutputs.length <= 3 ? (
                <div className="space-y-1">
                  {mergedReceivers.map((receiver, index) => {
                    const isHighlighted = highlightAddress && receiver.address === highlightAddress
                    return (
                      <div
                        key={index}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg border gap-1 sm:gap-2 ${
                          isHighlighted
                            ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                            : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          {isHighlighted ? (
                            <span className="font-mono text-xs block truncate text-gray-500 dark:text-gray-400">{receiver.address}</span>
                          ) : (
                            <Link
                              href={`/address/${receiver.address}/20/1`}
                              className="text-blue-600 hover:underline font-mono text-xs block truncate"
                            >
                              {receiver.address}
                            </Link>
                          )}
                        </div>
                        <div className="text-right sm:ml-2 flex items-center justify-between sm:block">
                          <span className="text-[10px] text-muted-foreground sm:hidden">{t('tx.amount')}:</span>
                          <div className="font-semibold text-sm">
                            {satoshisToBtc(receiver.amount)} {BASE_SYMBOL}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {processedTransaction.changeOutputs.map((change, index) => {
                    const isHighlighted = highlightAddress && change.address === highlightAddress
                    return (
                      <div
                        key={`change-${index}`}
                        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded-lg border gap-1 sm:gap-2 ${
                          isHighlighted
                            ? 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                            : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          {isHighlighted ? (
                            <span className="font-mono text-xs block truncate text-gray-500 dark:text-gray-400">{change.address}</span>
                          ) : (
                            <Link
                              href={`/address/${change.address}/20/1`}
                              className="text-blue-600 hover:underline font-mono text-xs block truncate"
                            >
                              {change.address}
                            </Link>
                          )}
                          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">{t('tx.changeOutput')}</div>
                        </div>
                        <div className="text-right sm:ml-2 flex items-center justify-between sm:block">
                          <span className="text-[10px] text-muted-foreground sm:hidden">{t('tx.amount')}:</span>
                          <div className="font-semibold text-sm text-orange-600 dark:text-orange-400">
                            {satoshisToBtc(change.amount)} {BASE_SYMBOL}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mergedReceivers.map((receiver, index) => (
                    <AddressBlock
                      key={index}
                      address={receiver.address}
                      amount={receiver.amount}
                      type="output"
                      isHighlighted={highlightAddress === receiver.address}
                    />
                  ))}
                  {processedTransaction.changeOutputs.map((change, index) => (
                    <AddressBlock
                      key={`change-${index}`}
                      address={change.address}
                      amount={change.amount}
                      type="change"
                      isHighlighted={highlightAddress === change.address}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {scashDAPData && (
          <ScashDAPDataDisplay
            data={scashDAPData}
            dapReceivers={dapReceivers}
            depFee={depFee}
            networkFee={networkFee}
            title={dapStatus.isMessageDap ? t('dap.transferMessage') : t('tx.scashDAPData')}
            isShowMessageDisplay={true}
          />
        )}
      </CardContent>
    </Card>
  )
}
