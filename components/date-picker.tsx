'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRouter } from 'next/navigation'

interface DatePickerProps {
  /** 当前选中的日期 */
  selectedDate: string
  /** 基础路由路径 */
  basePath: string
  /** 自定义样式类名 */
  className?: string
  /** 按钮文本 */
  placeholder?: string
}

export function DatePicker({
  selectedDate,
  basePath,
  className,
  placeholder = "选择日期"
}: DatePickerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  // 将字符串日期转换为Date对象
  const currentDate = selectedDate ? new Date(selectedDate) : new Date()
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd')
      router.push(`${basePath}/${dateString}`)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-start text-left font-normal hover:bg-accent/50 transition-colors",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {selectedDate ? (
            <span className="font-medium">
              {format(currentDate, "yyyy年MM月dd日", { locale: zhCN })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleDateSelect}
          initialFocus
          locale={zhCN}
          className="rounded-md border-0"
        />
      </PopoverContent>
    </Popover>
  )
}