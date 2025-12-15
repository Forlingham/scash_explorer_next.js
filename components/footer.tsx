import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Globe, MessageCircle, ExternalLink } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { getServerTranslations } from '@/i18n/server-i18n'
import pkg from '../package.json'

export async function Footer() {
  const { t } = await getServerTranslations()

  return (
    <footer className="bg-background border-t py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Logo and Support Section */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="SCASH" fill className="object-contain" />
              </div>
              <span className="font-bold text-lg">SCASH Network</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t('common.support')}</p>
            <div className=" text-xs">
              <div className="mb-2">
                <span className="font-medium">SCASH：</span> scash1qy48v7frkutlthqq7uqs8lk5fam24tghjdxqtf5
              </div>
              <div className="mb-2">
                <span className="font-medium">BTC：</span> bc1qnvdrxs23t6ejuxjs6mswx7cez2rn80wrwjd0u8
              </div>

              <div className="">
                <span className="font-medium">BNB/USDT：</span> 0xD4dB57B007Ad386C2fC4d7DD146f5977c039Fefc
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="md:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Developer */}
              <div>
                <h3 className="text-sm font-semibold mb-3">{t('common.developer')}</h3>
                <div className="space-y-2">
                  <Link
                    href="https://wallet.scash.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{t('common.walletWebsite')}</span>
                  </Link>
                  <Link
                    href="https://x.com/Hysanalde"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <Twitter className="h-3 w-3" />
                    <span>Twitter</span>
                  </Link>
                  <Link
                    href="https://github.com/Forlingham"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <Github className="h-3 w-3" />
                    <span>GitHub</span>
                  </Link>
                </div>
              </div>

              {/* Community */}
              <div>
                <h3 className="text-sm font-semibold mb-3">{t('common.community')}</h3>
                <div className="space-y-2">
                  <Link
                    href="https://x.com/scashnetwork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <Twitter className="h-3 w-3" />
                    <span>Twitter</span>
                  </Link>
                  <Link
                    href="https://t.me/scashnetwork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Telegram</span>
                  </Link>
                  <Link
                    href="https://t.me/SatoshiCashNetwork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>中文群组</span>
                  </Link>
                  <Link
                    href="https://discord.com/invite/T4Jcw2c95V"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Discord</span>
                  </Link>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-sm font-semibold mb-3">{t('common.resources')}</h3>
                <div className="space-y-2">
                  <Link
                    href="https://scashnetwork.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{t('common.officialWebsite')}</span>
                  </Link>
                  <Link
                    href="https://docs.scashnetwork.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{t('common.documentation')}</span>
                  </Link>
                  <Link
                    href="https://scash.cc/tutorials.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{t('common.miningTutorials')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SCASH Network · v{pkg.version}</p>
          <p className="mt-2 md:mt-0">
            {t('common.starsIssuesPRsWelcome')}
          </p>
        </div>
      </div>
    </footer>
  )
}
