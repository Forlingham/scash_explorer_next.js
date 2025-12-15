'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Moon, Sun, Monitor, Globe, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface HeaderClientProps {
  navItems: Array<{ href: string; label: string }>
  searchPlaceholder: string
  currentLocale: string
  searchText: string
}

export function HeaderClient({ navItems, searchPlaceholder, currentLocale, searchText }: HeaderClientProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [query, setQuery] = useState('')

  // 处理语言切换并刷新页面
  const handleLanguageChange = (newLocale: string) => {
    // 设置cookie以便服务端检测
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`
    // 刷新页面以应用新语言
    window.location.reload()
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const navigateByQuery = (raw: string) => {
    const q = raw.trim()
    if (!q) return
    if (/^\d+$/.test(q)) {
      router.push(`/block/${q}/20/1`)
      return
    }
    if (/^[0-9a-fA-F]{64}$/.test(q)) {
      router.push(`/tx/${q}`)
      return
    }
    router.push(`/address/${q}/20/1`)
  }

  const onSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    navigateByQuery(query)
  }

  return (
    <>
      <nav className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors relative',
              isActive(item.href)
                ? 'text-primary font-semibold after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-foreground/80 hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <form className="relative w-full flex items-center gap-2" onSubmit={onSearchSubmit}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="w-full pl-10 bg-muted/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search by block height, txid, or address"
          />
          <Button type="submit" className="shrink-0">
            {searchText}
          </Button>
        </form>
      </div>

      {/* Actions */}
      <div className="items-center gap-2 ">
        {/* Language Selector */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={currentLocale === 'en' ? 'bg-accent' : ''}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('zh')} className={currentLocale === 'zh' ? 'bg-accent' : ''}>
                中文
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLanguageChange('ru')} className={currentLocale === 'ru' ? 'bg-accent' : ''}>
                Русский
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'system' && <Monitor className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-accent' : ''}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-accent' : ''}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className={theme === 'system' ? 'bg-accent' : ''}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="md:hidden">
          <SheetHeader className="p-0">
            <SheetTitle className="text-lg px-4 pt-4">菜单</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4">
              <form
                className="relative w-full flex items-center gap-2 mt-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  navigateByQuery(query)
                  setMobileMenuOpen(false)
                }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 bg-muted/50"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search by block height, txid, or address"
                />
                <Button type="submit" className="shrink-0">
                  {searchText}
                </Button>
              </form>
            </div>
            <div className="mt-4">
              <nav className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium transition-colors border-b',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          <div className="px-4 py-4 mt-auto">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">语言</div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLanguageChange('zh')}
                  className={currentLocale === 'zh' ? 'bg-primary/20' : ''}
                >
                  中文
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLanguageChange('en')}
                  className={currentLocale === 'en' ? 'bg-primary/20' : ''}
                >
                  EN
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLanguageChange('ru')}
                  className={currentLocale === 'ru' ? 'bg-primary/20' : ''}
                >
                  RU
                </Button>
              </div>
            </div>
            <br />
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">主题</div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTheme('light')}
                  className={theme === 'light' ? 'bg-primary/20' : ''}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-primary/20' : ''}>
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTheme('system')}
                  className={theme === 'system' ? 'bg-primary/20' : ''}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
