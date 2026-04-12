import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'せたな町に暮らす｜移住・仕事・生活情報',
  description: '北海道せたな町の移住・生活情報。求人・しごと、暮らしのリアル、移住支援制度まとめ。',
}

const sections = [
  {
    href: '/life/work',
    label: 'しごと・求人',
    labelEn: 'WORK',
    description: '正規雇用から季節労働、地域おこし協力隊まで。せたなで働くすべての情報をまとめています。',
    gradient: 'from-[#5c3320] via-[#c47e4f] to-[#8a5535]',
    accent: '#c47e4f',
    large: true,
    note: '移住検討者が最も求める情報',
  },
  {
    href: '/life/living',
    label: '暮らしのリアル',
    labelEn: 'LIVING',
    description: '冬の生活環境・医療・スーパー・学校情報。移住前に知っておきたい生活情報。',
    gradient: 'from-[#1a2a35] via-[#5b7e95] to-[#3d5a6e]',
    accent: '#5b7e95',
    large: false,
    note: null,
  },
  {
    href: '/life/migration',
    label: '移住支援',
    labelEn: 'MIGRATION',
    description: '補助金・体験住宅・移住相談窓口。せたな町の移住支援制度一覧。',
    gradient: 'from-[#1a3020] via-[#6b8f71] to-[#4a6b50]',
    accent: '#6b8f71',
    large: false,
    note: null,
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'せたな町に暮らす',
  url: 'https://setana-portal.vercel.app/life',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://setana-portal.vercel.app' },
      { '@type': 'ListItem', position: 2, name: '暮らす', item: 'https://setana-portal.vercel.app/life' },
    ],
  },
}

export default function LifePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a35] via-[#3d5a6e] to-[#2a3d2a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <span className="text-white/70">暮らす</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">LIFE IN SETANA</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            せたなに<span className="font-bold">暮らす</span>
          </h1>
          <p className="text-white/60 text-[15px] leading-[1.8] mt-3 max-w-[480px]">
            仕事・生活・移住支援。この町で生きることを、リアルに伝えます。
          </p>
        </div>
      </section>

      {/* 3セクション */}
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
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] font-medium tracking-[0.2em] nav-label" style={{ color: sec.accent }}>
                        {sec.labelEn}
                      </p>
                      {sec.note && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${sec.accent}18`, color: sec.accent }}>
                          {sec.note}
                        </span>
                      )}
                    </div>
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

      {/* リード文セクション */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">ABOUT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6 tracking-[0.02em]">せたな町という選択</h2>
          <div className="space-y-4 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em]">
            <p>
              北海道の日本海沿い、久遠郡に位置するせたな町。人口約7,000人のこの町は、海・山・川の豊かな自然に囲まれた場所です。
            </p>
            <p>
              漁業・農業・林業が基幹産業として根付き、一次産業に携わりたい人にとっての選択肢が豊富です。また、近年は移住支援制度も充実し、都市圏からの移住者も増えています。
            </p>
            <p>
              「仕事はあるの？」「冬はどうなの？」「子育て環境は？」— この町に暮らすためのリアルな情報を、できる限り正直にお伝えします。
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
