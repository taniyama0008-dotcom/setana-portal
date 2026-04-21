import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ファミマッチ｜せたな町 — 町内外のマッチングサービス',
  description: 'せたな町公認のマッチングサービス「ファミマッチ」。町内の独身と町外の方をつなぐ出会いの広場。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'ファミマッチ — せたな町',
  url: 'https://www.setana.life/connect/famimatch',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: 'ファミマッチ', item: 'https://www.setana.life/connect/famimatch' },
    ],
  },
}

export default function FamimatchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#301a10] via-[#8a6b5b] to-[#5c4035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <span className="text-white/70">ファミマッチ</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">FAMIMATCH</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            <span className="font-bold">ファミマッチ</span>
          </h1>
          <p className="text-white/60 text-[15px] leading-[1.8] mt-3 max-w-[480px]">
            町内外の出会いをつなぐ、せたな町公認のマッチングサービス。
          </p>
        </div>
      </section>

      {/* コンテンツ */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">ABOUT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6 tracking-[0.02em]">ファミマッチとは</h2>
          <div className="space-y-4 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em] mb-12">
            <p>
              ファミマッチは、せたな町が推進する婚活・出会い支援サービスです。町内に暮らす独身の方と、町外の方とをつなぐ場として運営しています。
            </p>
            <p>
              詳細情報・登録方法については、現在準備中です。まもなく情報を公開します。
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#8a6b5b] hover:bg-[#6e5045] text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px]"
          >
            お問い合わせ →
          </Link>
        </div>
      </section>
    </>
  )
}
