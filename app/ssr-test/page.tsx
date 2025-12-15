import { headers, cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type Locale } from '@/i18n/i18n-provider'
import { getServerTranslations } from '@/i18n/server-i18n'
import { Globe, Server } from 'lucide-react'

export default async function SSRTestPage() {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  const { t } = await getServerTranslations()

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('locale')?.value as Locale

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SSR 测试页面</h1>
        <p className="text-muted-foreground">纯服务端渲染实现，基于 Accept-Language 头自动检测语言</p>
      </div>

      {/* 服务端渲染信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            服务端渲染信息
          </CardTitle>
          <CardDescription>基于 Accept-Language 头的自动语言检测</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">检测结果</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>配置的语言:</span>
                  <Badge variant="default">{cookieLocale}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Accept-Language:</span>
                  <code className="text-xs bg-muted px-1 rounded">{acceptLanguage}</code>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">服务端翻译</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>标题:</strong> {t('home.title')}
                </p>
                <p>
                  <strong>副标题:</strong> {t('home.subtitle')}
                </p>
                <p>
                  <strong>导航:</strong> {t('nav.blocks')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 技术说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SSR 实现说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">✅ 服务端渲染特性</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 自动检测浏览器语言偏好</li>
                <li>• SEO 友好的初始内容</li>
                <li>• 快速首屏加载</li>
                <li>• 服务端预渲染翻译</li>
                <li>• 无水合错误</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">🔧 技术实现</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 基于 Accept-Language 头检测</li>
                <li>• 服务端翻译函数调用</li>
                <li>• 静态内容渲染</li>
                <li>• 无客户端状态管理</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">测试方法：</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. 使用上方的语言切换器选择不同语言</li>
              <li>2. 页面会自动刷新并显示新语言的内容</li>
              <li>3. 查看页面源代码，确认内容已在服务端渲染</li>
              <li>4. 检查控制台，确认无水合错误</li>
              <li>5. 刷新页面，语言偏好会被保持</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
