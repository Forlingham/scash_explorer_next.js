import { redirect } from 'next/navigation'

export default async function DapPage() {
  // Redirect to default pagination page
  redirect('/dap/20/1')
}
