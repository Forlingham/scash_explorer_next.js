import Link from 'next/link'
import Image from 'next/image'
import { HeaderClient } from '@/components/header-client'
import { getServerTranslations } from '@/i18n/server-i18n'

export async function Header() {
  const { locale, t } = await getServerTranslations()

  const today = new Date().toISOString().split('T')[0]

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/blocks/20/1', label: t('nav.blocks') },
    { href: '/transactions/20/1', label: t('nav.transactions') },
    // { href: '/mempool', label: t('nav.mempool') },
    { href: `/whale-watcher/${today}`, label: t('nav.richList') }
    // { href: '/charts', label: t('nav.charts') }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              {t('home.title')}
            </span>
          </Link>

          <HeaderClient navItems={navItems} searchPlaceholder={t('nav.search')} currentLocale={locale} searchText={t('nav.searchText')} />
        </div>
      </div>
    </header>
  )
}
