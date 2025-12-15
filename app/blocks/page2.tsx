import Link from 'next/link'
import { Cable as Cube, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getServerTranslations } from '@/i18n/server-i18n'

export default async function BlocksPage() {
  const { t } = await getServerTranslations()

  // Mock data with fixed values to prevent hydration mismatch
  const baseTime = 1700000000000 // Fixed timestamp
  const blocks = Array.from({ length: 50 }, (_, i) => {
    const height = 800000 - i
    // Use deterministic values based on index to ensure consistency
    const hashSeed = (height * 123456789) % 1000000
    return {
      height,
      hash: `000000000000000${hashSeed.toString(16).padStart(8, '0')}`,
      time: baseTime - i * 600000, // ~10 minutes per block
      txCount: 500 + (height % 2000), // Deterministic based on height
      size: 800 + (height % 500), // Deterministic based on height
      miner: `Pool ${String.fromCharCode(65 + (height % 5))}` // Deterministic pool selection
    }
  })

  const formatTime = (timestamp: number) => {
    // Use fixed current time to prevent hydration mismatch
    const currentTime = baseTime
    const seconds = Math.floor((currentTime - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Cube className="h-8 w-8 text-primary" />
          {t('nav.blocks')}
        </h1>
        <p className="text-lg text-muted-foreground">Latest blocks on the blockchain</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('nav.blocks')}</CardTitle>
          <CardDescription>Most recent blocks mined</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Height</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Size (KB)</TableHead>
                  <TableHead>Miner</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block.height}>
                    <TableCell>
                      <Link href={`/block/${block.height}/20/1`} className="font-semibold text-primary hover:underline">
                        {block.height.toLocaleString()}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{block.hash.substring(0, 16)}...</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{block.txCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{block.size} KB</TableCell>
                    <TableCell>
                      <Badge variant="outline">{block.miner}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(block.time)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
