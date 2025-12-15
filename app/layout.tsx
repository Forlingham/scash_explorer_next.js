 import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Scash Explorer | Real-time Blockchain Data & Analytics',
    template: '%s | Scash Explorer'
  },
  description:
    'Scash Explorer provides real-time blockchain data, transaction tracking, and analytics for the Scash (SCASH) network. Explore blocks, transactions, and addresses with detailed on-chain insights.',
  keywords: [
    'Scash',
    'SCASH',
    'Blockchain Explorer',
    'Crypto Analytics',
    'PoW Coin',
    'Satoshi Cash Network',
    'RandomX',
    'Mining',
    'Scash Blockchain',
    'Scash Explorer'
  ],
  authors: [{ name: 'Scash Team', url: 'https://wallet.scash.network' }],
  creator: 'Scash Developers',
  publisher: 'Scash Foundation',
  metadataBase: new URL('https://explorer.scash.network'),
  openGraph: {
    title: 'Scash Explorer – Real-time Blockchain Analytics',
    description:
      'Track Scash network blocks, transactions, and addresses in real time. Transparent blockchain analytics powered by the Scash community.',
    url: 'https://explorer.scash.network',
    siteName: 'Scash Explorer',
    images: [
      {
        url: 'https://explorer.scash.network/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scash Explorer Dashboard'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scash Explorer',
    description: 'Explore the Scash blockchain in real time — transactions, blocks, and address insights.',
    images: ['https://explorer.scash.network/og-image.png'],
    creator: '@scash_official'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  manifest: '/site.webmanifest'
}

export const viewport: Viewport = {
  themeColor: '#111827'
}

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <Header />
          <main className="flex-1 bg-background">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
