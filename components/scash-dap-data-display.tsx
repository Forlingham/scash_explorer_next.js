import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
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
          <div className="text-red-500 text-sm mb-2">警告：包含敏感词</div>
        ) : (
          <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre-wrap break-all">{data}</div>
        )}
      </CardContent>
    </Card>
  )
}
