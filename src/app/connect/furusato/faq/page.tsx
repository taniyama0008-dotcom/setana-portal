import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'よくある質問｜ふるさと納税 — せたな町',
  description: 'せたな町ふるさと納税に関するよくある質問と回答。申し込み方法・税控除・返礼品発送など。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: 'よくある質問 — せたな町ふるさと納税',
  url: 'https://www.setana.life/connect/furusato/faq',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: 'ふるさと納税', item: 'https://www.setana.life/connect/furusato' },
      { '@type': 'ListItem', position: 4, name: 'よくある質問', item: 'https://www.setana.life/connect/furusato/faq' },
    ],
  },
}

export default function FurusatoFaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#5a5a5a] to-[#3a3a3a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <Link href="/connect/furusato" className="hover:text-white/70 transition-colors">ふるさと納税</Link>
            <span>›</span>
            <span className="text-white/70">よくある質問</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">FAQ</p>
          <h1 className="text-white font-light text-[28px] lg:text-[40px] leading-[1.3]" style={{ fontWeight: 300 }}>
            よくある<span className="font-bold">質問</span>
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <p className="text-[15px] text-[#5c5c5c] leading-[1.9] tracking-[0.06em] mb-12">
            このページは現在準備中です。よくある質問をまもなく掲載します。
          </p>
          <Link href="/connect/furusato" className="text-[#4a7c6f] text-[14px] font-medium hover:underline">
            ← ふるさと納税トップに戻る
          </Link>
        </div>
      </section>
    </>
  )
}
