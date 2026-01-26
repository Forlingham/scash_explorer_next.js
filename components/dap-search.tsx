"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DapSearchProps {
  placeholder?: string
  buttonText?: string
}

export function DapSearch({ 
  placeholder = "搜索...", 
  buttonText = "搜索" 
}: DapSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState<"address" | "content">("content")

  // Sync state with URL params on load
  useEffect(() => {
    const addr = searchParams.get("address")
    const content = searchParams.get("content")
    if (addr) {
      setQuery(addr)
      setSearchType("address")
    } else if (content) {
      setQuery(content)
      setSearchType("content")
    } else {
      setQuery("")
      setSearchType("content") // Default
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    const q = query.trim()

    // Reset pagination to page 1
    // Current path format: /dap/[pageSize]/[page]
    const pathParts = pathname.split('/')
    if (pathParts.length >= 4 && pathParts[1] === 'dap') {
        pathParts[3] = '1'
    }
    const newPath = pathParts.join('/')

    params.delete("address")
    params.delete("content")

    if (q) {
      if (searchType === "address") {
        params.set("address", q)
      } else {
        params.set("content", q)
      }
    }

    const queryString = params.toString()
    router.push(queryString ? `${newPath}?${queryString}` : newPath)
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center shadow-sm rounded-md border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <Select 
        value={searchType} 
        onValueChange={(val) => setSearchType(val as "address" | "content")}
      >
        <SelectTrigger className="w-[110px] h-10 rounded-none border-0 focus:ring-0 focus:ring-offset-0 bg-muted/50 focus:bg-muted/70 transition-colors">
          <SelectValue placeholder="类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="content">内容</SelectItem>
          <SelectItem value="address">地址</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex-1 border-l h-full">
        <Input 
          type="search" 
          placeholder={searchType === "address" ? "输入地址搜索..." : "输入内容搜索..."} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 w-full border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-3"
        />
      </div>
      
      <Button type="submit" size="sm" className="h-10 px-5 rounded-none bg-primary hover:bg-primary/90 transition-colors border-l border-primary-foreground/10">
        <Search className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </form>
  )
}
