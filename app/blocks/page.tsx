import { redirect } from 'next/navigation'

export default function BlocksPage() {
  // 默认重定向到第一页，每页20条
  redirect('/blocks/20/1')
}