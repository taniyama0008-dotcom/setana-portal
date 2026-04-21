import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'せたなに関わる｜ふるさと納税・企業版ふるさと納税・ファミマッチ・関係人口',
  description: '北海道せたな町への関わり方。ふるさと納税・企業版ふるさと納税・ファミマッチ・関係人口として、旅でも移住でもない新しいつながりを。',
}

const sections = [
  {
    href: '/connect/furusato',
    label: 'ふるさと納税',
    labelEn: 'FURUSATO',
    description: '返礼品と寄付金の使いみち、生産者の顔が見えるせたなのふるさと納税。特産品を楽しみながら町を応援できます。',
    gradient: 'from-[#1a3028] via-[#4a7c6f] to-[#2d5a50]',
    accent: '#4a7c6f',
    large: true,
  },
  {
    href: '/connect/corporate-furusato',
    label: '企業版ふるさと納税',
    labelEn: 'CORPORATE',
    description: '法人として地域に貢献する制度。税制優遇と具体的な認定事業をご案内します。',
    gradient: 'from-[#1a2530] via-[#3d5c6e] to-[#2a4050]',
    accent: '#3d5c6e',
    large: false,
  },
  {
    href: '/connect/famimatch',
    label: 'ファミマッチ',
    labelEn: 'MATCH',
    description: '町内外の出会いをつなぐ、せたな町公認のマッチングサービス。',
    gradient: 'from-[#301a10] via-[#8a6b5b] to-[#5c4035]',
    accent: '#8a6b5b',
    large: false,
  },
  {
    href: '/connect/relation',
    label: '関係人口',
    labelEn: 'RELATION',
    description: '移住の前に、せたなと関わるもう一つの選択肢。二拠点・ワーケーション・ボランティア。',
    gradient: 'from-[#1a2820] via-[#6b8a72] to-[#4a6b50]',
    accent: '#6b8a72',
    large: false,
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'せたなに関わる',
  description: '北海道せたな町への関わり方ガイド',
  url: 'https://www.setana.life/connect',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
    ],
  },
}

export default function ConnectPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1e1b] via-[#1a3028] to-[#1a2030]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <span className="text-white/70">関わる</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">CONNECT WITH SETANA</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            せたなに<span className="font-bold">関わる</span>
          </h1>
          <p className="text-white/60 text-[15px] leading-[1.8] mt-3 max-w-[480px]">
            寄付で、法人で、出会いで、もうひとつの関わり方で。
          </p>
        </div>
      </section>

      {/* 4セクションカード */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {sections.map((sec) => (
              <Link
                key={sec.href}
                href={sec.href}
                className={`group block ${sec.large ? 'sm:col-span-2' : 'sm:col-span-1'}`}
              >
                <div className="relative overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                  <div className={`bg-gradient-to-br ${sec.gradient} ${sec.large ? 'h-52 lg:h-60' : 'h-40'}`} />
                  <div className="p-6">
                    <p className="text-[10px] font-medium tracking-[0.2em] nav-label mb-2" style={{ color: sec.accent }}>
                      {sec.labelEn}
                    </p>
                    <h2 className={`font-bold text-[#1a1a1a] tracking-[0.02em] mb-2 ${sec.large ? 'text-[20px]' : 'text-[17px]'}`}>
                      {sec.label}
                    </h2>
                    <p className="text-[13px] text-[#5c5c5c] leading-[1.8]">{sec.description}</p>
                    <p className="mt-4 text-[12px] font-medium nav-label transition-colors" style={{ color: sec.accent }}>
                      くわしく見る →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* なぜ関わる？ */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">WHY CONNECT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6 tracking-[0.02em]">なぜ「関わる」のか</h2>
          <div className="space-y-4 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em]">
            <p>
              人口減少が進むせたな町では、住民以外の関わりが町の未来を支えます。ふるさと納税で特産品を楽しむこと、企業として地域貢献すること、二拠点で暮らすこと、すべてが町の力になります。
            </p>
            <p>
              移住という大きな決断の前に、まず「関わる」という選択肢があります。寄付、法人連携、マッチング、ワーケーション——それぞれの形で、せたなとつながる方法を用意しています。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 lg:px-8 bg-[#faf8f5] border-t border-[#efefef]">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[#5c5c5c] text-[14px] leading-[1.8] mb-6">
            関わり方についてご不明な点があれば、お気軽にお問い合わせください。
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
