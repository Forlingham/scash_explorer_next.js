'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Eye, EyeOff, ZoomIn, ZoomOut } from 'lucide-react'
import { satoshisToBtc } from '@/lib/currency.utils'
import { BASE_SYMBOL } from '@/lib/const'
import * as d3 from 'd3'

interface TransactionFlowProps {
  inputs: Array<{
    address: string
    amount: number
  }>
  outputs: Array<{
    address: string
    amount: number
  }>
  flowTitle?: string
  hideDiagramText?: string
  showDiagramText?: string
  outputLabel?: string
}

export default function TransactionFlowVisualization({ 
  inputs, 
  outputs, 
  flowTitle = 'Flow', 
  hideDiagramText = 'Hide diagram', 
  showDiagramText = 'Show diagram',
  outputLabel = 'Output'
}: TransactionFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showDiagram, setShowDiagram] = useState(true)
  const [scale, setScale] = useState(1)
  const [tooltipData, setTooltipData] = useState<{x: number, y: number, content: string} | null>(null)
  
  // 下载图片为PNG格式
  const handleDownloadImage = () => {
    if (!svgRef.current) return
    
    // 创建一个克隆的SVG元素，以便我们可以修改它而不影响原始SVG
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement
    
    // 获取SVG的尺寸
    const svgWidth = svgClone.getAttribute('width') || svgRef.current.clientWidth.toString()
    const svgHeight = svgClone.getAttribute('height') || svgRef.current.clientHeight.toString()
    
    // 设置背景
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', '#0f172a') // 深蓝色背景
    svgClone.insertBefore(rect, svgClone.firstChild)
    
    // 添加网站地址到右下角
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', (parseInt(svgWidth.toString()) - 20).toString())
    text.setAttribute('y', (parseInt(svgHeight.toString()) - 10).toString())
    text.setAttribute('font-size', '12')
    text.setAttribute('fill', 'rgba(255, 255, 255, 0.7)')
    text.setAttribute('text-anchor', 'end')
    text.textContent = window.location.href
    svgClone.appendChild(text)
    
    // 将SVG转换为字符串
    const svgData = new XMLSerializer().serializeToString(svgClone)
    
    // 创建一个Canvas元素
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 设置Canvas尺寸
    canvas.width = parseInt(svgWidth.toString())
    canvas.height = parseInt(svgHeight.toString())
    
    // 创建Image对象
    const img = new Image()
    
    // 当图片加载完成后，绘制到Canvas上并下载
    img.onload = () => {
      if (!ctx) return
      
      // 绘制图片到Canvas
      ctx.drawImage(img, 0, 0)
      
      // 将Canvas转换为PNG并下载
      canvas.toBlob((blob) => {
        if (!blob) return
        
        // 创建URL
        const url = URL.createObjectURL(blob)
        
        // 创建链接并触发下载
        const link = document.createElement('a')
        link.href = url
        link.download = 'transaction-flow.png'
        document.body.appendChild(link)
        link.click()
        
        // 清理
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }
    
    // 设置Image的src为SVG数据
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  // 计算总输入和总输出
  const totalInput = inputs.reduce((sum, input) => sum + input.amount, 0)
  const totalOutput = outputs.reduce((sum, output) => sum + output.amount, 0)

  // 处理缩放
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  useEffect(() => {
    if (!svgRef.current || !showDiagram || !containerRef.current) return

    // 清除之前的内容
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    
    // 计算需要的SVG尺寸，确保能容纳所有节点
    const minHeight = Math.max(300, Math.max(inputs.length, outputs.length) * 50 + 100)
    const height = Math.max(containerHeight, minHeight)
    const width = containerWidth
    
    // 设置SVG尺寸
    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`)
       .attr("preserveAspectRatio", "xMidYMid meet")
    
    // 设置边距
    const margin = { top: 20, right: 30, bottom: 20, left: 30 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    
    // 创建主绘图区域
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top}) scale(${scale})`)
    
    // 定义颜色渐变
    const defs = svg.append("defs")
    
    // 输入流渐变
    const inputGradient = defs.append("linearGradient")
      .attr("id", "inputGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")
    
    inputGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#8b5cf6") // 紫色
    
    inputGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6") // 蓝色
    
    // 输出流渐变
    const outputGradient = defs.append("linearGradient")
      .attr("id", "outputGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")
    
    outputGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6") // 蓝色
    
    outputGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#8b5cf6") // 紫色
    
    // 设置布局参数
    const nodeWidth = innerWidth * 0.15
    const nodePadding = 10
    const inputX = 0
    const outputX = innerWidth - nodeWidth
    const centerX = innerWidth / 2
    
    // 创建Sankey图数据
    const nodes: any[] = []
    const links: any[] = []
    
    // 添加输入节点
    inputs.forEach((input, i) => {
      const nodeId = `input-${i}`
      nodes.push({
        id: nodeId,
        name: `Input #${i + 1}`,
        amount: input.amount,
        address: input.address,
        type: 'input',
        x: inputX,
        width: nodeWidth
      })
      
      // 连接到中心
      links.push({
        source: nodeId,
        target: 'center',
        value: input.amount
      })
    })
    
    // 添加中心节点
    nodes.push({
      id: 'center',
      name: 'TX',
      type: 'center',
      x: centerX - nodeWidth / 2,
      width: nodeWidth
    })
    
    // 添加输出节点
    outputs.forEach((output, i) => {
      const nodeId = `output-${i}`
      nodes.push({
        id: nodeId,
        name: `${outputLabel} #${i + 1}`,
        amount: output.amount,
        address: output.address,
        type: 'output',
        x: outputX,
        width: nodeWidth
      })
      
      // 从中心连接
      links.push({
        source: 'center',
        target: nodeId,
        value: output.amount
      })
    })
    
    // 计算节点的垂直位置
    const nodeSpacing = Math.min(50, Math.max(30, innerHeight / Math.max(inputs.length, outputs.length) - nodePadding))
    
    const inputTotalHeight = inputs.length * nodeSpacing
    const outputTotalHeight = outputs.length * nodeSpacing
    
    let inputY = (innerHeight - inputTotalHeight) / 2
    let outputY = (innerHeight - outputTotalHeight) / 2
    
    // 设置节点位置和高度
    nodes.forEach(node => {
      if (node.type === 'input') {
        // 根据金额比例调整高度
        const heightRatio = node.amount / totalInput
        const height = Math.max(20, Math.min(nodeSpacing - nodePadding, heightRatio * innerHeight * 0.5))
        node.y = inputY
        node.height = height
        inputY += nodeSpacing
      } else if (node.type === 'output') {
        // 根据金额比例调整高度
        const heightRatio = node.amount / totalOutput
        const height = Math.max(20, Math.min(nodeSpacing - nodePadding, heightRatio * innerHeight * 0.5))
        node.y = outputY
        node.height = height
        outputY += nodeSpacing
      } else if (node.type === 'center') {
        node.y = innerHeight / 2 - 40
        node.height = 80
      }
    })
    
    // 绘制连接线
    const linkGroup = g.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.6)
    
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source)
      const target = nodes.find(n => n.id === link.target)
      
      if (!source || !target) return
      
      const thickness = Math.max(2, (link.value / (source.type === 'input' ? totalInput : totalOutput)) * 40)
      
      // 创建贝塞尔曲线路径
      const sourceX = source.x + source.width
      const sourceY = source.y + source.height / 2
      const targetX = target.x
      const targetY = target.y + target.height / 2
      const controlPoint1X = sourceX + (targetX - sourceX) * 0.4
      const controlPoint2X = sourceX + (targetX - sourceX) * 0.6
      
      const path = d3.path()
      path.moveTo(sourceX, sourceY)
      path.bezierCurveTo(
        controlPoint1X, sourceY,
        controlPoint2X, targetY,
        targetX, targetY
      )
      
      linkGroup.append("path")
        .attr("d", path.toString())
        .attr("stroke", source.type === 'input' ? "url(#inputGradient)" : "url(#outputGradient)")
        .attr("stroke-width", thickness)
        .attr("fill", "none")
        .on("mouseover", function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", thickness + 2)
            
          // 显示金额信息
          const amount = source.type === 'input' ? source.amount : target.amount
          const tooltipContent = `${satoshisToBtc(amount)} ${BASE_SYMBOL}`
          
          // 使用clientX/clientY而不是pageX/pageY以获得更准确的位置
          setTooltipData({
            x: event.clientX,
            y: event.clientY,
            content: tooltipContent
          })
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", thickness)
            
          setTooltipData(null)
        })
    })
    
    // 绘制节点
    const nodeGroup = g.append("g")
    
    // 输入节点
    const inputNodes = nodeGroup.selectAll(".input-node")
      .data(nodes.filter(n => n.type === 'input'))
      .enter()
      .append("g")
      .attr("class", "input-node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
    
    // 输入节点箭头
    inputNodes.append("path")
      .attr("d", d => {
        const arrowWidth = 20
        const height = d.height
        return `M0,0 L${arrowWidth},${height/2} L0,${height} Z`
      })
      .attr("fill", "url(#inputGradient)")
    
    // 输入节点矩形
    inputNodes.append("rect")
      .attr("x", 20)
      .attr("y", 0)
      .attr("width", d => d.width - 20)
      .attr("height", d => d.height)
      .attr("fill", "url(#inputGradient)")
      .attr("rx", 4)
    
    // 输入节点文本 (金额)
    inputNodes.append("text")
      .attr("x", d => d.width / 2)
      .attr("y", d => d.height / 2 - 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => `${satoshisToBtc(d.amount)} ${BASE_SYMBOL}`)
    
    // 输入节点文本 (地址)
    inputNodes.append("text")
      .attr("x", d => d.width / 2)
      .attr("y", d => d.height / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .text(d => {
        const addr = d.address || ''
        return addr.length > 10 ? addr.substring(0, 5) + '...' + addr.substring(addr.length - 5) : addr
      })
      .append("title") // 添加完整地址的悬停提示
      .text(d => d.address)
    
    // 中心节点
    const centerNodes = nodeGroup.selectAll(".center-node")
      .data(nodes.filter(n => n.type === 'center'))
      .enter()
      .append("g")
      .attr("class", "center-node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
    
    centerNodes.append("rect")
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", "#3b82f6")
      .attr("rx", 8)
    
    centerNodes.append("text")
      .attr("x", d => d.width / 2)
      .attr("y", d => d.height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text("TX")
    
    // 输出节点
    const outputNodes = nodeGroup.selectAll(".output-node")
      .data(nodes.filter(n => n.type === 'output'))
      .enter()
      .append("g")
      .attr("class", "output-node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
    
    // 输出节点矩形
    outputNodes.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", d => d.width - 20)
      .attr("height", d => d.height)
      .attr("fill", "url(#outputGradient)")
      .attr("rx", 4)
    
    // 输出节点箭头
    outputNodes.append("path")
      .attr("d", d => {
        const arrowWidth = 20
        const height = d.height
        const startX = d.width - 20
        return `M${startX},0 L${d.width},${height/2} L${startX},${height} Z`
      })
      .attr("fill", "url(#outputGradient)")
    
    // 输出节点文本 (金额)
    outputNodes.append("text")
      .attr("x", d => (d.width - 20) / 2)
      .attr("y", d => d.height / 2 - 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text(d => `${satoshisToBtc(d.amount)} ${BASE_SYMBOL}`)
    
    // 输出节点文本 (地址)
    outputNodes.append("text")
      .attr("x", d => (d.width - 20) / 2)
      .attr("y", d => d.height / 2 + 10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .text(d => {
        const addr = d.address || ''
        return addr.length > 10 ? addr.substring(0, 5) + '...' + addr.substring(addr.length - 5) : addr
      })
      .append("title") // 添加完整地址的悬停提示
      .text(d => d.address)
    
    // 添加节点交互效果
    svg.selectAll(".input-node, .output-node")
      .on("mouseover", function(event, d) {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          
        // 显示详细信息
        setTooltipData({
          x: event.clientX,
          y: event.clientY,
          content: `${(d as any).name}<br/>${satoshisToBtc((d as any).amount)} ${BASE_SYMBOL}<br/>${(d as any).address}`
        })
      })
      .on("mouseout", function() {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("opacity", 1)
          
        setTooltipData(null)
      })
    
  }, [inputs, outputs, showDiagram, totalInput, totalOutput, outputLabel, scale])

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{flowTitle}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            title="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadImage}
            className="h-8 w-8 p-0"
            title="下载图片"
            disabled={!showDiagram}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDiagram(!showDiagram)}
            className="h-8"
          >
            {showDiagram ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                {hideDiagramText}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                {showDiagramText}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showDiagram && (
          <div 
            ref={containerRef}
            className="relative w-full bg-slate-900 dark:bg-slate-950 rounded-lg overflow-auto" 
            style={{ 
              height: `${Math.max(400, Math.max(inputs.length, outputs.length) * 60)}px` 
            }}
          >
            <svg 
              ref={svgRef} 
              className="w-full h-full"
              style={{ minWidth: '100%', minHeight: '100%' }}
            />
            {tooltipData && (
              <div 
                className="fixed bg-slate-800 text-white p-2 rounded-md text-xs z-50 pointer-events-none"
                style={{ 
                  left: `${tooltipData.x}px`, 
                  top: `${tooltipData.y - 20}px`,
                  maxWidth: '200px'
                }}
                dangerouslySetInnerHTML={{ __html: tooltipData.content }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}