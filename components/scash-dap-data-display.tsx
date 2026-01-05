
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface ScashDAPDataDisplayProps {
  data: string
  title: string
}

export function ScashDAPDataDisplay({ data, title }: ScashDAPDataDisplayProps) {
  if (!data) return null

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all"
          // 安全警告：scash-dap 返回的数据可能包含恶意代码，但我们将其作为文本显示
          // 为了确保安全性，我们只显示文本内容，不进行 HTML 渲染
        >
          {data}
        </div>
      </CardContent>
    </Card>
  )
}
