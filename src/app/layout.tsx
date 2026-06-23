import type { Metadata } from 'next'
import { Noto_Sans_JP, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { LiffProvider } from '@/context/LiffContext'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.setana.life'),
  title: {
    default: 'SETANA — 北海道せたな町の暮らし・食・自然',
    template: '%s | SETANA',
  },
  description: '北海道せたな町の暮らし・食・自然の情報が集まるポータルサイト。海と山に抱かれた町の、暮らしのすべて。',
  openGraph: {
    title: 'SETANA — 北海道せたな町の暮らし・食・自然',
    description: '北海道せたな町の暮らし・食・自然の情報が集まるポータルサイト。',
    locale: 'ja_JP',
    type: 'website',
    siteName: 'SETANA',
  },
  verification: {
    google: 'ki_QhaB4hebpgcUtGplPOKcMtdAJod_6MjcS87EItxw',
  },
}

const globalOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.setana.life/#organization',
  name: '株式会社つなぐ',
  url: 'https://www.setana.life',
  sameAs: ['https://www.setana.life/about'],
  address: {
    '@type': 'PostalAddress',
    addressRegion: '北海道',
    addressLocality: '久遠郡せたな町',
    addressCountry: 'JP',
  },
  description:
    'せたな町を拠点に「つなぐ」を事業理念とする地域会社。地域メディアSETANAの運営母体。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${inter.variable}`}
      style={{
        fontFamily: 'var(--font-noto-sans-jp), "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
      }}
    >
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalOrganizationSchema) }}
        />
        <LiffProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LiffProvider>
      </body>
    </html>
  )
}
