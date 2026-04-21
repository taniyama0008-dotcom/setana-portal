import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ふるさと納税｜せたな町 — 返礼品・生産者・寄付金の使いみち',
  description: 'せたな町のふるさと納税。日本海の幸や山の恵みの返礼品、寄付金の使いみち、生産者のストーリーをご紹介します。',
}

const subPages = [
  {
    href: '/connect/furusato/gifts',
    label: '返礼品を探す',
    labelEn: 'GIFTS',
    description: '日本海の海産物・山の恵み・加工品など、せたなならではの返礼品一覧。',
    gradient: 'from-[#4a7c6f] to-[#2d5a50]',
    accent: '#4a7c6f',
  },
  {
    href: '/connect/furusato/stories',
    label: '生産者ストーリー',
    labelEn: 'STORIES',
    description: 'あなたの寄付を支える生産者たちの顔と物語。',
    gradient: 'from-[#6b8a72] to-[#4a6b50]',
    accent: '#6b8a72',
  },
  {
    href: '/connect/furusato/usage',
    label: '寄付金の使いみち',
    labelEn: 'USAGE',
    description: '頂いた寄付金がどのように町に活かされているかをご報告します。',
    gradient: 'from-[#3d5c6e] to-[#2a4050]',
    accent: '#3d5c6e',
  },
  {
    href: '/connect/furusato/faq',
    label: 'よくある質問',
    labelEn: 'FAQ',
    description: 'ふるさと納税の手続き・申し込み方法についてのQ&A。',
    gradient: 'from-[#6e6e6e] to-[#3a3a3a]',
    accent: '#6e6e6e',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'ふるさと納税 — せたな町',
  url: 'https://www.setana.life/connect/furusato',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: 'ふるさと納税', item: 'https://www.setana.life/connect/furusato' },
    ],
  },
}

export default function FurusatoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e1b] via-[#1a3028] to-[#1a2820]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <span className="text-white/70">ふるさと納税</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">FURUSATO NOZEI</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            せたなの<span className="font-bold">ふるさと納税</span>
          </h1>
          <p className="text-white/60 text-[15px] leading-[1.8] mt-3 max-w-[480px]">
            返礼品と寄付金の使いみち、生産者の顔が見える。せたなを応援する寄付。
          </p>
        </div>
      </section>

      {/* サブページカード */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {subPages.map((page) => (
              <Link key={page.href} href={page.href} className="group block">
                <div className="relative overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                  <div className={`bg-gradient-to-br ${page.gradient} h-32 group-hover:scale-[1.02] transition-transform duration-500`} />
                  <div className="p-6">
                    <p className="text-[10px] font-medium tracking-[0.2em] nav-label mb-2" style={{ color: page.accent }}>
                      {page.labelEn}
                    </p>
                    <h2 className="text-[17px] font-bold text-[#1a1a1a] tracking-[0.02em] mb-2">{page.label}</h2>
                    <p className="text-[13px] text-[#5c5c5c] leading-[1.8]">{page.description}</p>
                    <p className="mt-4 text-[12px] font-medium nav-label" style={{ color: page.accent }}>
                      くわしく見る →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 lg:px-8 bg-white border-t border-[#efefef]">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[#5c5c5c] text-[14px] leading-[1.8] mb-6">
            ふるさと納税についてのご質問はお気軽にどうぞ。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#4a7c6f] hover:bg-[#3a6258] text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px]"
          >
            お問い合わせ →
          </Link>
        </div>
      </section>
    </>
  )
}
