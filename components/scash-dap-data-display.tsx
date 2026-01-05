import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, FileText } from 'lucide-react'
import { checkComment } from '@/lib/filter'

interface ScashDAPDataDisplayProps {
  data: string
  title: string
}

export function ScashDAPDataDisplay({ data, title }: ScashDAPDataDisplayProps) {
  if (!data) return null

  const isClean = checkComment(data).pass

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isClean ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>警告：包含敏感词</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <p>如果你确实需要查看包含敏感词的内容，请下载 Scash-DAP 客户端查看。</p>
                <p>Scash-DAP 客户端是一个独立的应用程序，用于查看和发布信息到 Scash 网络上工具。</p>
                <p>
                  下载地址：{' '}
                  <a
                    href="https://github.com/Forlingham/ScashDataAddressProtocol/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    GitHub Releases
                  </a>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all">{data}</div>
        )}
      </CardContent>
    </Card>
  )
}
