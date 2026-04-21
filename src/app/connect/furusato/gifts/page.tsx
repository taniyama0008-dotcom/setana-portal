import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '返礼品を探す｜ふるさと納税 — せたな町',
  description: 'せたな町ふるさと納税の返礼品一覧。日本海の海産物・山の恵み・加工品など、せたならではの品々。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '返礼品を探す — せたな町ふるさと納税',
  url: 'https://www.setana.life/connect/furusato/gifts',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: 'ふるさと納税', item: 'https://www.setana.life/connect/furusato' },
      { '@type': 'ListItem', position: 4, name: '返礼品を探す', item: 'https://www.setana.life/connect/furusato/gifts' },
    ],
  },
}

export default function FurusatoGiftsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e1b] via-[#4a7c6f] to-[#2d5a50]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <Link href="/connect/furusato" className="hover:text-white/70 transition-colors">ふるさと納税</Link>
            <span>›</span>
            <span className="text-white/70">返礼品を探す</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">GIFTS</p>
          <h1 className="text-white font-light text-[28px] lg:text-[40px] leading-[1.3]" style={{ fontWeight: 300 }}>
            返礼品を<span className="font-bold">探す</span>
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <p className="text-[15px] text-[#5c5c5c] leading-[1.9] tracking-[0.06em] mb-12">
            このページは現在準備中です。せたな町の豊かな返礼品情報をまもなくお届けします。
          </p>
          <Link href="/connect/furusato" className="text-[#4a7c6f] text-[14px] font-medium hover:underline">
            ← ふるさと納税トップに戻る
          </Link>
        </div>
      </section>
    </>
  )
}
