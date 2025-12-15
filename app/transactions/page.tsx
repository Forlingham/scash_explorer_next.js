import { redirect } from 'next/navigation'

export default async function TransactionsPage() {
  // 重定向到默认的分页页面
  redirect('/transactions/20/1')
}
