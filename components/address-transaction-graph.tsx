'use client'

import React, { useEffect, useMemo, useState } from 'react'
import axiosInstance from '@/lib/request'
import ReactFlow, { Background, Controls, Edge, MarkerType, Node, BackgroundVariant } from 'reactflow'
import 'reactflow/dist/style.css'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

interface GraphType {
  center: string
  incoming: Incoming[]
  outgoing: Incoming[]
}

interface Incoming {
  address: string
  txid: string
  amount: number
  timestamp: string
}

interface AddressTransactionGraphProps {
  address: string
}

export default function AddressTransactionGraph({ address }: AddressTransactionGraphProps) {
  const [data, setData] = useState<GraphType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [centerTag, setCenterTag] = useState<null | { name: string; type: 'text' | 'website' | 'group_chat' }>(null)

  useEffect(() => {
    let canceled = false
    setLoading(true)
    setError(null)

    axiosInstance
      .get(`/explorer/address/${address}/graph`)
      .then((res) => {
        if (canceled) return
        setData(res.data as GraphType)
      })
      .catch((err) => {
        if (canceled) return
        setError(err?.message || '加载失败')
      })
      .finally(() => {
        if (canceled) return
        setLoading(false)
      })

    // 获取中心地址的标签（仅取第一个）
    axiosInstance
      .get(`/explorer/address-detail/${address}`)
      .then((res) => {
        const tags = (res.data?.addressTags || []) as Array<{ name: string; type: 'text' | 'website' | 'group_chat' }>
        if (tags?.length) {
          setCenterTag(tags[0])
        } else {
          setCenterTag(null)
        }
      })
      .catch(() => {
        // 标签获取失败不影响主图加载
        setCenterTag(null)
      })

    return () => {
      canceled = true
    }
  }, [address])

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    if (!data) return { nodes, edges }

    // 布局与分组参数（垂直布局：上方为收到、下方为支出）
    const itemGapY = 56
    const groupPaddingY = 16
    const groupGapY = 20
    const groupWidth = 360
    const groupX = -groupWidth / 2
    const childOffsetX = 12

    // 中心节点
    nodes.push({
      id: 'center',
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div className="flex items-center gap-2">
            <span className="font-mono">{data.center}</span>
            {centerTag && (
              <Badge
                variant={centerTag.type === 'text' ? 'secondary' : centerTag.type === 'website' ? 'default' : 'outline'}
                className={centerTag.type === 'group_chat' ? 'border-primary text-primary' : ''}
              >
                {centerTag.name}
              </Badge>
            )}
          </div>
        )
      },
      type: 'default'
    })

    // 入向（收到）节点：按 txid 分组，并用框表示同一交易，放在上方
    const inGroupsMap = new Map<string, Incoming[]>()
    data.incoming.forEach((inc) => {
      const list = inGroupsMap.get(inc.txid) || []
      list.push(inc)
      inGroupsMap.set(inc.txid, list)
    })

    const inGroups = Array.from(inGroupsMap.entries())
    const inHeights = inGroups.map(([_, list]) => list.length * itemGapY + groupPaddingY * 2)
    const totalInHeight = inHeights.reduce((a, b) => a + b, 0) + (inGroups.length > 0 ? (inGroups.length - 1) * groupGapY : 0)
    // 顶部起点（上方）
    let inCursorY = -totalInHeight - 40

    inGroups.forEach(([txid, list], gIdx) => {
      const gHeight = inHeights[gIdx]
      const groupId = `in-group-${txid}`
      nodes.push({
        id: groupId,
        position: { x: groupX, y: inCursorY },
        data: { label: `TX ${txid.slice(0, 8)}` },
        type: 'default',
        style: {
          width: groupWidth,
          height: gHeight,
          border: '1px dashed var(--muted-foreground)',
          borderRadius: 8,
          background: 'transparent',
          padding: 8
        }
      })

      list.forEach((inc, idx) => {
        const nodeId = `in-${txid}-${idx}`
        nodes.push({
          id: nodeId,
          position: { x: childOffsetX, y: groupPaddingY + idx * itemGapY },
          data: {
            label: (
              <div
                className="truncate font-mono"
                style={{ maxWidth: groupWidth - 2 * (childOffsetX + 8), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={inc.address}
              >
                {inc.address}
              </div>
            )
          },
          type: 'default',
          parentNode: groupId,
          extent: 'parent'
        })
        edges.push({
          id: `e-${nodeId}-center`,
          source: nodeId,
          target: 'center',
          label: `${inc.amount}`,
          animated: false,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed }
        })
      })

      inCursorY += gHeight + groupGapY
    })

    // 出向（支出）节点：按 txid 分组，并用框表示同一交易，放在下方
    const outGroupsMap = new Map<string, Incoming[]>()
    data.outgoing.forEach((out) => {
      const list = outGroupsMap.get(out.txid) || []
      list.push(out)
      outGroupsMap.set(out.txid, list)
    })

    const outGroups = Array.from(outGroupsMap.entries())
    const outHeights = outGroups.map(([_, list]) => list.length * itemGapY + groupPaddingY * 2)
    const totalOutHeight = outHeights.reduce((a, b) => a + b, 0) + (outGroups.length > 0 ? (outGroups.length - 1) * groupGapY : 0)
    // 底部起点（下方）
    let outCursorY = 40

    outGroups.forEach(([txid, list], gIdx) => {
      const gHeight = outHeights[gIdx]
      const groupId = `out-group-${txid}`
      nodes.push({
        id: groupId,
        position: { x: groupX, y: outCursorY },
        data: { label: `TX ${txid.slice(0, 8)}` },
        type: 'default',
        style: {
          width: groupWidth,
          height: gHeight,
          border: '1px dashed var(--muted-foreground)',
          borderRadius: 8,
          background: 'transparent',
          padding: 8
        }
      })

      list.forEach((out, idx) => {
        const nodeId = `out-${txid}-${idx}`
        nodes.push({
          id: nodeId,
          position: { x: childOffsetX, y: groupPaddingY + idx * itemGapY },
          data: {
            label: (
              <div
                className="truncate font-mono"
                style={{ maxWidth: groupWidth - 2 * (childOffsetX + 8), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                title={out.address}
              >
                {out.address}
              </div>
            )
          },
          type: 'default',
          parentNode: groupId,
          extent: 'parent'
        })
        edges.push({
          id: `e-center-${nodeId}`,
          source: 'center',
          target: nodeId,
          label: `${out.amount}`,
          animated: false,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed }
        })
      })

      outCursorY += gHeight + groupGapY
    })

    return { nodes, edges }
  }, [data, centerTag])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Spinner className="h-6 w-6 mr-2" />
        <span className="text-muted-foreground">正在加载交易关系图…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] text-destructive">
        加载失败：{error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
        暂无数据
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-[500px]">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </Card>
  )
}
