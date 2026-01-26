'use client'

import { Badge } from '@/components/ui/badge'
import { Database, HelpCircle, Info } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DapBadgeProps {
  size?: 'default' | 'sm'
  className?: string
}

export function DapBadge({ size = 'default', className = '' }: DapBadgeProps) {
  const isSmall = size === 'sm'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`inline-flex items-center outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full cursor-pointer group ${className}`}>
          <Badge className={`bg-gradient-to-r from-[#8B3FBF] to-[#A855F7] text-white border-0 font-medium shadow-md group-hover:from-[#9d4ed6] group-hover:to-[#b566ff] transition-all duration-300 ${
            isSmall 
              ? 'gap-1 px-2 py-0.5 text-[10px]' 
              : 'gap-1.5 px-3 py-1 text-sm'
          }`}>
            <Database className={isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} />
            <span>DAP Data</span>
            <HelpCircle className={`${isSmall ? "h-3 w-3" : "h-3.5 w-3.5"} opacity-80 group-hover:opacity-100 transition-opacity`} />
          </Badge>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="h-6 w-6 text-[#A855F7]" />
            DAP (Data Address Protocol)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2 text-muted-foreground">
          <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              什么是 DAP？
            </h4>
            <p className="text-sm leading-relaxed">
              DAP (Data Address Protocol) 是一种基于 Scash 网络的创新协议，旨在通过区块链实现高效、去中心化的数据存储与传输。它利用特定的地址生成规则，将数据直接编码进区块链地址中。
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground text-sm uppercase tracking-wider text-[#A855F7]">核心特性</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#A855F7] shrink-0" />
                <span>
                  <strong className="text-foreground">永久存储：</strong> 数据一旦上链，将永久保存在去中心化网络中，不可篡改。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#A855F7] shrink-0" />
                <span>
                  <strong className="text-foreground">公开透明：</strong> 任何人都可以通过区块链浏览器查看和验证数据内容。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#A855F7] shrink-0" />
                <span>
                  <strong className="text-foreground">低成本：</strong> 相比传统区块链数据存储方案，DAP 提供了更经济高效的方式。
                </span>
              </li>
            </ul>
          </div>
          
          <div className="pt-2 text-xs text-muted-foreground/70 italic border-t mt-4">
            * 本功能目前处于预览阶段，更多功能正在开发中。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
