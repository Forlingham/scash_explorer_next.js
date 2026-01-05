import { redirect } from 'next/navigation'

export default async function BlocksPage({ params }: { params: { id: string } & Promise<any> }) {
  const { id } = await params
  // 默认重定向到第一页，每页20条
  redirect(`/block/${id}/20/1`)
}
