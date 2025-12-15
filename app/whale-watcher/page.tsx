import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

export default function WhaleWatcherRootPage() {
  // 获取今天的日期，格式为 YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // 重定向到今天的日期页面
  redirect(`/whale-watcher/${today}`)
}
