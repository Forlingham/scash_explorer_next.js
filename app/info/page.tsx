import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { explorerApiInfoApi } from '@/lib/http-server'
import RpcConsole from '@/components/rpc-console'
import { getServerTranslations } from '@/i18n/server-i18n'
import { Info } from 'lucide-react'

export default async function InfoPage() {
  const { t } = await getServerTranslations()
  const info = await explorerApiInfoApi()
  const methods = info?.rpc_support_methods || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Info className="h-7 w-7 text-primary" />
          RPC 接口信息
        </h1>
        <p className="text-sm text-muted-foreground mt-1">当前公开的 RPC 方法列表与测试工具</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">服务信息</CardTitle>
          <CardDescription>名称、版本、描述与内容类型</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">名称</div>
              <div className="font-medium">{info?.name || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">版本</div>
              <div className="font-medium">{info?.version || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">描述</div>
              <div className="font-medium">{info?.description || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">内容类型</div>
              <div className="font-medium">{info?.contentType || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">登录信息</CardTitle>
          <CardDescription>用于访问 RPC 接口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">用户名</div>
              <div className="font-mono">{info?.rpc_auth?.username || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">密码</div>
              <div className="font-mono">{info?.rpc_auth?.password || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">公开方法</CardTitle>
          <CardDescription>来自接口返回的 rpc_support_methods</CardDescription>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-muted-foreground text-sm">暂无公开方法</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {methods.map((m) => (
                <Badge key={m} variant="secondary" className="font-mono">{m}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">RPC 测试</CardTitle>
          <CardDescription>选择方法，填写参数并发送请求</CardDescription>
        </CardHeader>
        <CardContent>
          <RpcConsole methods={methods} auth={info?.rpc_auth} />
        </CardContent>
      </Card>
    </div>
  )
}
