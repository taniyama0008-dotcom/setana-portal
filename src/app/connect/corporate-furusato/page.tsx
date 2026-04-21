import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '企業版ふるさと納税｜せたな町 — 法人による地域貢献',
  description: 'せたな町への企業版ふるさと納税。法人税・住民税・事業税の税制優遇と具体的な認定事業、寄付実績企業をご案内します。',
}

const subPages = [
  {
    href: '/connect/corporate-furusato/about',
    label: '制度について',
    labelEn: 'ABOUT',
    description: '企業版ふるさと納税の仕組みと税制優遇の概要。',
    gradient: 'from-[#1a2530] via-[#3d5c6e] to-[#2a4050]',
    accent: '#3d5c6e',
  },
  {
    href: '/connect/corporate-furusato/projects',
    label: '認定対象事業',
    labelEn: 'PROJECTS',
    description: 'せたな町が推進する認定対象プロジェクト一覧。',
    gradient: 'from-[#0f1e1b] via-[#4a7c6f] to-[#2d5a50]',
    accent: '#4a7c6f',
  },
  {
    href: '/connect/corporate-furusato/simulation',
    label: '税制優遇シミュレーション',
    labelEn: 'SIMULATION',
    description: '寄付額に応じた税軽減効果をシミュレーションします。',
    gradient: 'from-[#1a2820] via-[#6b8a72] to-[#4a6b50]',
    accent: '#6b8a72',
  },
  {
    href: '/connect/corporate-furusato/cases',
    label: '寄付実績企業',
    labelEn: 'CASES',
    description: 'すでにせたな町への寄付を行った企業の実績紹介。',
    gradient: 'from-[#2a1a10] via-[#8a6b5b] to-[#5c4035]',
    accent: '#8a6b5b',
  },
  {
    href: '/connect/corporate-furusato/contact',
    label: '相談・お問い合わせ',
    labelEn: 'CONTACT',
    description: '企業版ふるさと納税についてのご相談はこちら。',
    gradient: 'from-[#2a2a2a] via-[#5a5a5a] to-[#3a3a3a]',
    accent: '#6e6e6e',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '企業版ふるさと納税 — せたな町',
  url: 'https://www.setana.life/connect/corporate-furusato',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: '企業版ふるさと納税', item: 'https://www.setana.life/connect/corporate-furusato' },
    ],
  },
}

export default function CorporateFurusatoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1520] via-[#1a2530] to-[#1a3028]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <span className="text-white/70">企業版ふるさと納税</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">CORPORATE FURUSATO NOZEI</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            企業版<span className="font-bold">ふるさと納税</span>
          </h1>
          <p className="text-white/60 text-[15px] leading-[1.8] mt-3 max-w-[480px]">
            法人による地域貢献。税制優遇と具体的な認定事業のご案内。
          </p>
        </div>
      </section>

      {/* サブページカード */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {subPages.map((page, i) => (
              <Link
                key={page.href}
                href={page.href}
                className={`group block ${i === 0 ? 'sm:col-span-2' : 'sm:col-span-1'}`}
              >
                <div className="relative overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                  <div className={`bg-gradient-to-br ${page.gradient} ${i === 0 ? 'h-40' : 'h-32'} group-hover:scale-[1.02] transition-transform duration-500`} />
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
            企業版ふるさと納税についてのご相談・お問い合わせ。
          </p>
          <Link
            href="/connect/corporate-furusato/contact"
            className="inline-flex items-center px-8 py-4 bg-[#3d5c6e] hover:bg-[#2d4455] text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px]"
          >
            相談・お問い合わせ →
          </Link>
        </div>
      </section>
    </>
  )
}
