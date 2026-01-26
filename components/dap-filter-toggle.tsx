"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"

export function DapFilterToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const isFiltered = searchParams.get('filterTransfer') !== 'false'

  const handleToggle = useCallback((checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      // If default is true, we can technically remove the param to keep URL clean,
      // or set it to 'true' to be explicit.
      // Let's remove it if it's true (default behavior) for cleaner URLs?
      // Or keep it consistent. The prompt implies default behavior change.
      // If I set it to 'true', it's redundant if default is true, but harmless.
      // However, if I want 'false' to be the override, I must set 'false'.
      // If checked is true (back to default), I can delete the param.
      params.delete('filterTransfer') 
    } else {
      params.set('filterTransfer', 'false')
    }
    
    // Reset to page 1 when filter changes
    // pathname format: /dap/[pageSize]/[page]
    const pathParts = pathname.split('/')
    // ['', 'dap', 'pageSize', 'page']
    // Ensure we are in the correct route structure before modifying
    if (pathParts.length >= 4 && pathParts[1] === 'dap') {
        pathParts[3] = '1'
    }
    const newPath = pathParts.join('/')
    
    // If query string is empty, don't append ?
    const queryString = params.toString()
    const fullPath = queryString ? `${newPath}?${queryString}` : newPath
    
    router.push(fullPath)
  }, [pathname, router, searchParams])

  return (
    <div className="flex items-center space-x-2">
      <Switch id="filter-transfer" checked={isFiltered} onCheckedChange={handleToggle} />
      <Label htmlFor="filter-transfer" className="cursor-pointer select-none">过滤转账备注</Label>
    </div>
  )
}
