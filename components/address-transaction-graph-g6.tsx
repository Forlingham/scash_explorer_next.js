"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Graph } from '@antv/g6'
import axiosInstance from '@/lib/request'
import { satoshisToBtc } from '@/lib/currency.utils'
import { Button } from '@/components/ui/button'

interface GraphType {
  center: string
  centerTags: { name: string }[]
  incoming: { address: string; txid: string; amount: number; timestamp: string; tags: { name: string }[] }[]
  outgoing: { address: string; txid: string; amount: number; timestamp: string; tags: { name: string }[] }[]
}

type Props = {
  id: string
  height?: number
}

function truncateMiddle(text: string, keep = 10) {
  if (!text) return ''
  if (text.length <= keep * 2 + 3) return text
  return `${text.slice(0, keep)}...${text.slice(-keep)}`
}

function formatAmountToBtc(value: bigint | number | string): string {
  try {
    const btc = satoshisToBtc(value)
    return btc.toFixed(8).replace(/\.0+$/, '').replace(/\.(\d*?)0+$/, (_, g) => (g ? `.${g}` : ''))
  } catch {
    return String(value ?? '')
  }
}

export default function AddressTransactionGraphG6({ id, height = 560 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<Graph | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const expandedRef = useRef<Set<string>>(new Set())
  const inFlightRef = useRef<Set<string>>(new Set())
  const hoverTargetRef = useRef<{ id: string; addr: string; ts: number } | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      // 全屏切换时同步调整图尺寸
      const g = graphRef.current
      const container = containerRef.current
      if (g && container) {
        const w = container.clientWidth || window.innerWidth
        const h = fs ? window.innerHeight : (container.clientHeight || (typeof height === 'number' ? height : 560))
        try {
          g.resize(w, h)
          g.fitView()
        } catch {}
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    let destroyed = false
    async function init() {
      try {
        setLoading(true)
        setError(null)
        const { data } = await axiosInstance.get<GraphType>(`/explorer/address/${id}/graph`)

        if (destroyed) return

        const container = containerRef.current
        if (!container) return

        const width = container.clientWidth || 960

        const nodes: any[] = []
        const edges: any[] = []
        const combos: any[] = []

        const centerId = data.center
        const centerLabel = data.centerTags?.[0]?.name ? `${data.centerTags[0].name}` : truncateMiddle(centerId, 12)

        nodes.push({
          id: centerId,
          type: 'rect',
          style: {
            width: 220,
            height: 42,
            radius: 8,
            stroke: '#1f2937',
            lineWidth: 1.5,
            fill: '#ffffff',
            labelText: centerLabel,
            labelFill: '#0f172a',
            labelFontSize: 13,
            labelFontWeight: 500,
          },
          data: { address: centerId },
        })

        const incomingGroupPrefix = 'in-'
        const incomingByTx: Record<string, { address: string; amount: number; tags: any[]; txid: string }[]> = {}
        for (const item of data.incoming || []) {
          if (!incomingByTx[item.txid]) incomingByTx[item.txid] = []
          incomingByTx[item.txid].push({ address: item.address, amount: item.amount, tags: item.tags, txid: item.txid })
        }
        Object.entries(incomingByTx).forEach(([txid, list]) => {
          const comboId = `${incomingGroupPrefix}${txid}`
          combos.push({
            id: comboId,
            style: { padding: 16, stroke: '#9ca3af', lineDash: [6, 6], radius: 12, labelText: `TX ${truncateMiddle(txid, 6)}`, labelFill: '#64748b' },
          })

          const inputNodeIds: string[] = []
          let totalAmount = 0
          list.forEach((n, i) => {
            const nodeId = `${incomingGroupPrefix}${txid}-${n.address}-${i}`
            inputNodeIds.push(nodeId)
            totalAmount += Number(n.amount || 0)
            const nodeLabel = n.tags?.[0]?.name ? `${n.tags[0].name}` : truncateMiddle(n.address, 12)
            nodes.push({
              id: nodeId,
              type: 'rect',
              combo: comboId,
              style: {
                width: 240,
                height: 54,
                radius: 6,
                stroke: '#7c3aed',
                lineWidth: 1.5,
                fill: '#ffffff',
                labelText: nodeLabel,
                labelFill: '#0f172a',
                labelFontSize: 12,
              },
              data: { address: n.address, txid: n.txid, amount: n.amount },
            })
          })

          // 交易锚点：用于从交易到中心仅连一条边（显示总金额）
          const txAnchorId = `${incomingGroupPrefix}${txid}-tx-anchor`
          nodes.push({
            id: txAnchorId,
            type: 'rect',
            combo: comboId,
            style: {
              width: 20,
              height: 20,
              radius: 4,
              stroke: '#7c3aed',
              lineWidth: 1,
              fill: '#ffffff',
              labelText: '',
            },
            data: { txid, amount: totalAmount },
          })

          // 地址连到交易锚点（不显示金额）
          inputNodeIds.forEach((nid) => {
            edges.push({ id: `${nid}->${txAnchorId}`, source: nid, target: txAnchorId, style: { endArrow: true } })
          })

          // 由交易锚点到中心，仅一条边，显示总金额
          edges.push({
            id: `${txAnchorId}->${centerId}`,
            source: txAnchorId,
            target: centerId,
            style: { endArrow: true, labelText: formatAmountToBtc(totalAmount), labelFill: '#0f172a', labelBackground: true },
          })
        })

        const outgoingGroupPrefix = 'out-'
        const outgoingByTx: Record<string, { address: string; amount: number; tags: any[]; txid: string }[]> = {}
        for (const item of data.outgoing || []) {
          if (!outgoingByTx[item.txid]) outgoingByTx[item.txid] = []
          outgoingByTx[item.txid].push({ address: item.address, amount: item.amount, tags: item.tags, txid: item.txid })
        }
        Object.entries(outgoingByTx).forEach(([txid, list]) => {
          const comboId = `${outgoingGroupPrefix}${txid}`
          combos.push({
            id: comboId,
            style: { padding: 16, stroke: '#9ca3af', lineDash: [6, 6], radius: 12, labelText: `TX ${truncateMiddle(txid, 6)}`, labelFill: '#64748b' },
          })

          list.forEach((n, i) => {
            const nodeId = `${outgoingGroupPrefix}${txid}-${n.address}-${i}`
            const nodeLabel = n.tags?.[0]?.name ? `${n.tags[0].name}` : truncateMiddle(n.address, 12)
            nodes.push({
              id: nodeId,
              type: 'rect',
              combo: comboId,
              style: {
                width: 240,
                height: 54,
                radius: 6,
                stroke: '#059669',
                lineWidth: 1.5,
                fill: '#ffffff',
                labelText: nodeLabel,
                labelFill: '#0f172a',
                labelFontSize: 12,
              },
              data: { address: n.address, txid: n.txid, amount: n.amount },
            })
            edges.push({
              id: `${centerId}->${nodeId}`,
              source: centerId,
              target: nodeId,
              style: { endArrow: true, labelText: formatAmountToBtc(n.amount), labelFill: '#0f172a', labelBackground: true },
            })
          })
        })

        if (!graphRef.current) {
          graphRef.current = new Graph({
            container,
            width,
            height,
            layout: {
              type: 'dagre',
              rankdir: 'TB',
              nodesep: 24,
              ranksep: 80,
            },
            behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element'],
            edge: { style: { stroke: '#334155', lineWidth: 1.5, endArrow: true } },
            combo: { style: { stroke: '#94a3b8', lineDash: [6, 6], radius: 12 } },
          })
        }

        const graph = graphRef.current!
        graph.setData({ nodes, edges, combos })
        graph.render()
        graph.fitView()

        // 覆盖点击层：为每个地址节点创建透明 HTML 点击区域，确保点击可触发扩展
        let overlayRoot: HTMLDivElement | null = null
        const ensureOverlayRoot = () => {
          if (!overlayRoot) {
            overlayRoot = document.createElement('div')
            overlayRoot.style.position = 'absolute'
            overlayRoot.style.left = '0'
            overlayRoot.style.top = '0'
            overlayRoot.style.width = '100%'
            overlayRoot.style.height = '100%'
            overlayRoot.style.pointerEvents = 'none'
            overlayRoot.style.zIndex = '5'
            // 确保容器是定位元素，使覆盖层相对容器定位
            try { (container as HTMLElement).style.position = 'relative' } catch {}
            container.appendChild(overlayRoot)
          }
        }
        const overlayByNode = new Map<string, HTMLDivElement>()
        const refreshOverlay = () => {
          ensureOverlayRoot()
          const items = (graph as any)?.getNodes?.() || []
          for (const it of items) {
            const model = it?.getModel?.() || it?._cfg?.model
            const data = model?.data || {}
            if (!data.address) continue
            const id = model?.id ?? it?.getID?.() ?? it?._cfg?.id
            if (!id) continue
            let el = overlayByNode.get(id)
            if (!el) {
              el = document.createElement('div')
              el.style.position = 'absolute'
              el.style.pointerEvents = 'auto'
              el.style.background = 'transparent'
              el.style.cursor = 'pointer'
              el.setAttribute('data-node-id', id)
              el.addEventListener('click', (ev) => {
                ev.stopPropagation()
                ev.preventDefault()
                expandAddressNode(data.address, id)
              })
              overlayRoot!.appendChild(el)
              overlayByNode.set(id, el)
            }
            // 优先使用真实渲染后的边界框
            let bbox: any = null
            try { bbox = it?.getBBox?.() } catch {}
            if (bbox && typeof bbox.minX === 'number') {
              const tl = (graph as any)?.getViewportByCanvas?.(bbox.minX, bbox.minY) || { x: bbox.minX, y: bbox.minY }
              const br = (graph as any)?.getViewportByCanvas?.(bbox.maxX, bbox.maxY) || { x: bbox.maxX, y: bbox.maxY }
              const left = Math.min(tl.x, br.x)
              const top = Math.min(tl.y, br.y)
              const widthPx = Math.abs(br.x - tl.x)
              const heightPx = Math.abs(br.y - tl.y)
              el.style.transform = `translate(${left}px, ${top}px)`
              el.style.width = `${widthPx}px`
              el.style.height = `${heightPx}px`
            } else {
              // 退化到模型尺寸
              const w = model?.style?.width ?? (Array.isArray(model?.size) ? model.size[0] : model?.size) ?? 0
              const h = model?.style?.height ?? (Array.isArray(model?.size) ? model.size[1] : model?.size) ?? 0
              const x = model?.x
              const y = model?.y
              if (typeof x === 'number' && typeof y === 'number' && w && h) {
                const tl = (graph as any)?.getViewportByCanvas?.(x - w / 2, y - h / 2) || { x: x - w / 2, y: y - h / 2 }
                const br = (graph as any)?.getViewportByCanvas?.(x + w / 2, y + h / 2) || { x: x + w / 2, y: y + h / 2 }
                const left = Math.min(tl.x, br.x)
                const top = Math.min(tl.y, br.y)
                const widthPx = Math.abs(br.x - tl.x)
                const heightPx = Math.abs(br.y - tl.y)
                el.style.transform = `translate(${left}px, ${top}px)`
                el.style.width = `${widthPx}px`
                el.style.height = `${heightPx}px`
              }
            }
          }
        }
        refreshOverlay()
        graph.on('afterlayout', refreshOverlay)
        graph.on('viewportchange', refreshOverlay as any)

        // 简易悬浮提示，展示地址/交易ID/金额
        let tooltip: HTMLDivElement | null = null
        const ensureTooltip = () => {
          if (!tooltip) {
            tooltip = document.createElement('div')
            tooltip.style.position = 'absolute'
            tooltip.style.pointerEvents = 'none'
            tooltip.style.padding = '8px 10px'
            tooltip.style.background = '#ffffff'
            tooltip.style.border = '1px solid #cbd5e1'
            tooltip.style.borderRadius = '8px'
            tooltip.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06)'
            tooltip.style.fontSize = '12px'
            tooltip.style.color = '#0f172a'
            tooltip.style.display = 'none'
            container.appendChild(tooltip)
          }
        }

        const showTooltip = (evt: any) => {
          ensureTooltip()
          const item = evt?.item
          const model = item?.getModel?.() || item?._cfg?.model
          const d = model?.data || {}
          const lines: string[] = []
          if (d.address) lines.push(`地址: ${d.address}`)
          if (d.txid) lines.push(`交易ID: ${d.txid}`)
          if (typeof d.amount !== 'undefined') lines.push(`金额: ${formatAmountToBtc(d.amount)}`)
          tooltip!.innerHTML = lines.join('<br/>')
          const rect = container.getBoundingClientRect()
          const x = (evt?.clientX ?? 0) - rect.left + 12
          const y = (evt?.clientY ?? 0) - rect.top + 12
          tooltip!.style.transform = `translate(${x}px, ${y}px)`
          tooltip!.style.display = lines.length ? 'block' : 'none'

          // 记录最近悬停的地址节点，用于点击兜底
          try {
            const type = item?.getType?.() ?? item?.type
            const nodeId = model?.id ?? item?.getID?.() ?? item?._cfg?.id
            const addr = d?.address
            if (type === 'node' && nodeId && addr) {
              hoverTargetRef.current = { id: nodeId, addr, ts: Date.now() }
            }
          } catch {}
        }

        const hideTooltip = () => {
          if (tooltip) tooltip.style.display = 'none'
          hoverTargetRef.current = null
        }

        graph.on('element:mousemove', showTooltip)
        graph.on('element:mouseleave', hideTooltip)
        // 调试：监听多种点击事件以确认是否触发
        graph.on('canvas:click', (e: any) => console.log('[graph] canvas:click', e))
        graph.on('edge:click', (e: any) => console.log('[graph] edge:click', e))
        graph.on('combo:click', (e: any) => console.log('[graph] combo:click', e))

        // 抽取：根据地址和节点ID执行扩展
        const expandAddressNode = async (addr: string, nodeId?: string) => {
          try {
            if (!addr) return
            if (expandedRef.current.has(addr)) {
              console.log('[graph] skip expand, already expanded:', addr)
              return
            }
            if (inFlightRef.current.has(addr)) {
              console.log('[graph] skip expand, in-flight:', addr)
              return
            }
            inFlightRef.current.add(addr)
            console.log('[graph] expand start:', { addr, nodeId })

            if (nodeId) {
              try {
                graph.updateData({
                  nodes: [{ id: nodeId, style: { stroke: '#2563eb' } }]
                })
              } catch {}
            }

            const { data: more } = await axiosInstance.get<GraphType>(`/explorer/address/${addr}/graph`)
            console.log('[graph] expand fetched:', { addr, more })

            const d = graph.getData()
            const newNodes = [...d.nodes]
            const newEdges = [...d.edges]
            const newCombos = [...(d as any).combos || []]

            const inPrefix = `exp-in-${addr}-`
            const outPrefix = `exp-out-${addr}-`

            const groupIncoming: Record<string, GraphType['incoming']> = {}
            more.incoming?.forEach((m) => { (groupIncoming[m.txid] ||= []).push(m) })
            Object.entries(groupIncoming).forEach(([txid, list]) => {
              const comboId = `${inPrefix}${txid}`
              newCombos.push({ id: comboId, style: { padding: 16, stroke: '#9ca3af', lineDash: [6, 6], radius: 12, labelText: `TX ${truncateMiddle(txid, 6)}`, labelFill: '#64748b' } })

              const inputIds: string[] = []
              let total = 0
              list.forEach((n, i) => {
                const nid = `${inPrefix}${txid}-${n.address}-${i}`
                inputIds.push(nid)
                total += Number(n.amount || 0)
                if (!newNodes.some((x) => x.id === nid)) {
                  const nodeLabel = n.tags?.[0]?.name ? `${n.tags[0].name}` : truncateMiddle(n.address, 12)
                  newNodes.push({ id: nid, type: 'rect', combo: comboId, style: { width: 240, height: 54, radius: 6, stroke: '#7c3aed', lineWidth: 1.5, fill: '#ffffff', labelText: nodeLabel, labelFill: '#0f172a', labelFontSize: 12 }, data: { address: n.address, txid: n.txid, amount: n.amount } })
                }
              })

              const txNid = `${inPrefix}${txid}-tx-anchor`
              if (!newNodes.some((x) => x.id === txNid)) {
                newNodes.push({ id: txNid, type: 'rect', combo: comboId, style: { width: 20, height: 20, radius: 4, stroke: '#7c3aed', lineWidth: 1, fill: '#ffffff', labelText: '' }, data: { txid, amount: total } })
              }
              inputIds.forEach((id2) => { newEdges.push({ id: `${id2}->${txNid}`, source: id2, target: txNid, style: { endArrow: true } }) })
              if (nodeId) { newEdges.push({ id: `${txNid}->${nodeId}`, source: txNid, target: nodeId, style: { endArrow: true, labelText: formatAmountToBtc(total), labelFill: '#0f172a', labelBackground: true } }) }
            })

            const groupOutgoing: Record<string, GraphType['outgoing']> = {}
            more.outgoing?.forEach((m) => { (groupOutgoing[m.txid] ||= []).push(m) })
            Object.entries(groupOutgoing).forEach(([txid, list]) => {
              const comboId = `${outPrefix}${txid}`
              newCombos.push({ id: comboId, style: { padding: 16, stroke: '#9ca3af', lineDash: [6, 6], radius: 12, labelText: `TX ${truncateMiddle(txid, 6)}`, labelFill: '#64748b' } })
              list.forEach((n, i) => {
                const nid = `${outPrefix}${txid}-${n.address}-${i}`
                if (!newNodes.some((x) => x.id === nid)) {
                  const nodeLabel = n.tags?.[0]?.name ? `${n.tags[0].name}` : truncateMiddle(n.address, 12)
                  newNodes.push({ id: nid, type: 'rect', combo: comboId, style: { width: 240, height: 54, radius: 6, stroke: '#059669', lineWidth: 1.5, fill: '#ffffff', labelText: nodeLabel, labelFill: '#0f172a', labelFontSize: 12 }, data: { address: n.address, txid: n.txid, amount: n.amount } })
                }
                if (nodeId) { newEdges.push({ id: `${nodeId}->${nid}`, source: nodeId, target: nid, style: { endArrow: true, labelText: formatAmountToBtc(n.amount), labelFill: '#0f172a', labelBackground: true } }) }
              })
            })

            graph.setData({ nodes: newNodes, edges: newEdges, combos: newCombos })
            graph.render()
            graph.fitView()
            expandedRef.current.add(addr)
            inFlightRef.current.delete(addr)
          } catch (e) {
            console.error('[graph] expand error:', e)
            inFlightRef.current.delete(addr)
          }
        }

        // 点击事件（优先使用 G6 事件）
        const handleClick = async (evt: any) => {
          const item = evt?.item
          if (!item) return
          const type = item?.getType?.() ?? item?.type
          console.log('[graph] click event type=', type, 'raw evt=', evt)
          if (type !== 'node') return
          const model = item?.getModel?.() || item?._cfg?.model || {}
          const nodeId = model?.id ?? item?.getID?.() ?? item?._cfg?.id
          console.log('[graph] node clicked id=', nodeId, 'model=', model)
          if (!nodeId) return
          let addr = (model as any)?.data?.address as string | undefined
          if (!addr) {
            const d = graph.getData()
            const clicked = d.nodes.find((n: any) => n.id === nodeId)
            addr = clicked?.data?.address as string | undefined
          }
          console.log('[graph] resolved address to expand=', addr)
          if (!addr) return
          await expandAddressNode(addr, nodeId)
        }
        graph.on('node:click', handleClick)
        graph.on('element:click', handleClick)

        // DOM 层面的兜底：直接在 canvas 上做命中检测
        const canvasEl = container.querySelector('canvas') as HTMLCanvasElement | null
        const onCanvasClick = (e: any) => {
          // 使用 G6 提供的坐标转换，获取点击点的视口坐标
          const clientX = e.clientX ?? 0
          const clientY = e.clientY ?? 0
          const vpPoint = (graph as any)?.getPointByClient?.(clientX, clientY) || { x: clientX, y: clientY }
          const zoom = (graph as any)?.getZoom?.() ?? 1
          const canvasPoint = (graph as any)?.getCanvasByPoint?.(vpPoint.x, vpPoint.y) || { x: vpPoint.x, y: vpPoint.y }
          const d = graph.getData()

          // 直接尝试使用图的点选 API 获取元素
          let directItem: any = null
          try {
            directItem = (graph as any)?.getElementByPoint?.(vpPoint.x, vpPoint.y) || (graph as any)?.getElementByPoint?.(canvasPoint.x, canvasPoint.y) || null
            if (directItem) {
              console.log('[graph] direct element by point:', {
                type: directItem?.getType?.() ?? directItem?.type,
                id: directItem?.getID?.() ?? directItem?._cfg?.id,
                model: directItem?.getModel?.() ?? directItem?._cfg?.model,
              })
            }
          } catch (err) {
            console.log('[graph] direct getElementByPoint error', err)
          }

          // 基于实际渲染项进行命中（考虑缩放）
          let hit: any = null
          try {
            const items = (graph as any)?.getNodes?.() || []
            for (const it of items) {
              const model = it?.getModel?.() || it?._cfg?.model
              const ddata = model?.data || {}
              if (!ddata.address) continue
              const cx = model?.x
              const cy = model?.y
              const w = model?.style?.width ?? (Array.isArray(model?.size) ? model.size[0] : model?.size) ?? 0
              const h = model?.style?.height ?? (Array.isArray(model?.size) ? model.size[1] : model?.size) ?? 0
              if (cx == null || cy == null || !w || !h) continue
              const vp = (graph as any)?.getViewportByCanvas?.(cx, cy) || { x: cx, y: cy }
              const pad = 6
              const halfW = (w / 2)
              const halfH = (h / 2)
              // 视口空间比较（考虑缩放）
              const withinViewport = vpPoint.x >= vp.x - halfW * zoom - pad && vpPoint.x <= vp.x + halfW * zoom + pad && vpPoint.y >= vp.y - halfH * zoom - pad && vpPoint.y <= vp.y + halfH * zoom + pad
              // 画布空间比较（不考虑缩放）
              const withinCanvas = canvasPoint.x >= cx - halfW - pad && canvasPoint.x <= cx + halfW + pad && canvasPoint.y >= cy - halfH - pad && canvasPoint.y <= cy + halfH + pad
              const within = withinViewport || withinCanvas
              if (within) { hit = model; break }
            }
          } catch (err) {
            console.log('[graph] item hit detection error', err)
          }
          console.log('[graph] fallback container:click', { clientX, clientY, vpPoint, canvasPoint, zoom, hit, directItem: !!directItem })
          try {
            const sample = (d.nodes || []).filter((n: any) => n?.data?.address).slice(0, 2).map((n: any) => {
              const vp = (graph as any)?.getViewportByCanvas?.(n.x, n.y) || { x: n.x, y: n.y }
              return { id: n.id, addr: n?.data?.address, vp, canvas: { x: n.x, y: n.y } }
            })
            if (sample.length) console.log('[graph] sample address node viewport centers:', sample)
          } catch {}
          let addr = (hit as any)?.data?.address as string | undefined
          let nodeId = (hit as any)?.id as string | undefined
          // 如果直接命中到元素，优先使用它
          if (!addr && directItem && (directItem?.getType?.() ?? directItem?.type) === 'node') {
            const model = directItem?.getModel?.() ?? directItem?._cfg?.model
            addr = model?.data?.address
            nodeId = model?.id
            if (addr) console.log('[graph] using directItem node:', { addr, nodeId })
          }
          if (!addr && hoverTargetRef.current && Date.now() - hoverTargetRef.current.ts < 800) {
            console.log('[graph] using hover target fallback:', hoverTargetRef.current)
            addr = hoverTargetRef.current.addr
            nodeId = hoverTargetRef.current.id
          }
          // 兜底：未命中且无悬停目标时，基于视口坐标寻找最近地址节点中心
          if (!addr) {
            try {
              const nodes = (graph as any)?.getNodes?.() || []
              let best: { addr: string; id: string; dist: number } | null = null
              for (const item of nodes) {
                const model = item?.getModel?.() || item?._cfg?.model
                const d = model?.data || {}
                if (!d.address) continue
                const x = model?.x
                const y = model?.y
                if (typeof x !== 'number' || typeof y !== 'number') continue
                const vpCenter = (graph as any)?.getViewportByCanvas?.(x, y) || { x, y }
                const dxV = vpPoint.x - vpCenter.x
                const dyV = vpPoint.y - vpCenter.y
                const distV = Math.sqrt(dxV * dxV + dyV * dyV)
                const dxC = canvasPoint.x - x
                const dyC = canvasPoint.y - y
                const distC = Math.sqrt(dxC * dxC + dyC * dyC)
                const dist = Math.min(distV, distC)
                const id = model?.id ?? item?.getID?.() ?? item?._cfg?.id
                if (!best || dist < best.dist) best = { addr: d.address, id, dist }
              }
              if (best && best.dist <= 80) {
                console.log('[graph] nearest candidate picked:', best)
                addr = best.addr
                nodeId = best.id
              } else {
                console.log('[graph] no nearest candidate found or too far', best)
              }
            } catch (err) {
              console.log('[graph] nearest candidate error', err)
            }
          }
          if (addr) {
            expandAddressNode(addr, nodeId)
          }
        }
        if (canvasEl) {
          canvasEl.addEventListener('click', onCanvasClick)
        } else {
          // 一些环境下可能存在多层 canvas 或渲染延迟，兜底挂在容器上
          container.addEventListener('click', onCanvasClick)
        }

        // 渲染后打点：观察布局后节点坐标
        try {
          const after = graph.getData()
          console.log('[graph] after render sample nodes=', (after.nodes || []).slice(0, 3))
        } catch {}

        const onResize = () => {
          const w = container.clientWidth || width
          const h = document.fullscreenElement ? window.innerHeight : (container.clientHeight || height)
          graph.resize(w, h)
          graph.fitView()
        }
        window.addEventListener('resize', onResize)

        return () => {
          window.removeEventListener('resize', onResize)
          graph.off('element:mousemove', showTooltip)
          graph.off('element:mouseleave', hideTooltip)
          graph.off('node:click', handleClick)
          graph.off('element:click', handleClick)
          graph.off('afterlayout', refreshOverlay)
          graph.off('viewportchange', refreshOverlay as any)
          if (canvasEl) canvasEl.removeEventListener('click', onCanvasClick)
          else container.removeEventListener('click', onCanvasClick)
          try {
            overlayByNode.forEach((el) => el.remove())
            overlayByNode.clear()
            if (overlayRoot && container.contains(overlayRoot)) container.removeChild(overlayRoot)
          } catch {}
          if (tooltip && container.contains(tooltip)) container.removeChild(tooltip)
        }
      } catch (e: any) {
        console.error(e)
        setError(e?.message || '加载图数据失败')
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => {
      destroyed = true
      if (graphRef.current) {
        graphRef.current.destroy()
        graphRef.current = null
      }
    }
  }, [id, height])

  if (loading) return <div className="p-4 text-sm text-gray-500">图谱加载中…</div>
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>
  const handleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const handleAutoLayout = () => {
    const g = graphRef.current
    if (!g) return
    try {
      g.layout()
      g.fitView()
    } catch {
      // 兼容：若当前布局不支持 layout()，回退重渲染
      const d = g.getData()
      g.setData(d)
      g.render()
      g.fitView()
    }
  }

  const handleDownloadPNG = () => {
    const container = containerRef.current
    if (!container) return
    const canvases = container.querySelectorAll('canvas')
    if (!canvases || canvases.length === 0) return

    const width = (graphRef.current as any)?.getWidth?.() ?? container.clientWidth
    const heightPx = (graphRef.current as any)?.getHeight?.() ?? height
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = Math.max(width, container.clientWidth)
    exportCanvas.height = Math.max(Number(heightPx), container.clientHeight)
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    canvases.forEach((c) => {
      try { ctx.drawImage(c as HTMLCanvasElement, 0, 0) } catch {}
    })
    const url = exportCanvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `address-graph-${id}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="relative" style={{ width: '100%', height: isFullscreen ? '100vh' : height }}>
      <div ref={containerRef} style={{ width: '100%', height: isFullscreen ? '100vh' : height, background: '#ffffff' }} />
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button size="sm" variant="outline" onClick={handleAutoLayout}>自动布局</Button>
        <Button size="sm" variant="outline" onClick={handleFullscreen}>{isFullscreen ? '退出全屏' : '全屏'}</Button>
        <Button size="sm" variant="outline" onClick={handleDownloadPNG}>下载</Button>
      </div>
    </div>
  )
}

