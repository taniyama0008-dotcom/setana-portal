import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '税制優遇シミュレーション｜企業版ふるさと納税 — せたな町',
  description: '企業版ふるさと納税の税制優遇シミュレーション。寄付額に応じた法人税・住民税・事業税の軽減効果を確認できます。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '税制優遇シミュレーション — 企業版ふるさと納税 せたな町',
  url: 'https://www.setana.life/connect/corporate-furusato/simulation',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: '企業版ふるさと納税', item: 'https://www.setana.life/connect/corporate-furusato' },
      { '@type': 'ListItem', position: 4, name: '税制優遇シミュレーション', item: 'https://www.setana.life/connect/corporate-furusato/simulation' },
    ],
  },
}

export default function CorporateSimulationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2820] via-[#6b8a72] to-[#4a6b50]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <Link href="/connect/corporate-furusato" className="hover:text-white/70 transition-colors">企業版ふるさと納税</Link>
            <span>›</span>
            <span className="text-white/70">税制優遇シミュレーション</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">TAX SIMULATION</p>
          <h1 className="text-white font-light text-[28px] lg:text-[40px] leading-[1.3]" style={{ fontWeight: 300 }}>
            税制優遇<span className="font-bold">シミュレーション</span>
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <p className="text-[15px] text-[#5c5c5c] leading-[1.9] tracking-[0.06em] mb-12">
            このページは現在準備中です。税制優遇シミュレーターをまもなく公開します。
          </p>
          <Link href="/connect/corporate-furusato" className="text-[#3d5c6e] text-[14px] font-medium hover:underline">
            ← 企業版ふるさと納税トップに戻る
          </Link>
        </div>
      </section>
    </>
  )
}
