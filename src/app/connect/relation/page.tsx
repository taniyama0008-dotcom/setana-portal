import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '関係人口として関わる｜せたな町 — 二拠点・ワーケーション・ボランティア',
  description: '移住の前に、せたなと関わるもう一つの選択肢。二拠点生活・ワーケーション・副業リモートワーク・ボランティア活動でせたな町とつながる。',
}

const subPages = [
  {
    href: '/connect/relation/workation',
    label: '二拠点・ワーケーション',
    labelEn: 'WORKATION',
    description: '都市と地方の二拠点生活。せたなで働きながら暮らす新しいスタイル。',
    gradient: 'from-[#1a2820] via-[#6b8a72] to-[#4a6b50]',
    accent: '#6b8a72',
  },
  {
    href: '/connect/relation/remote-work',
    label: '副業・リモートワーク',
    labelEn: 'REMOTE WORK',
    description: 'せたな町の事業者・農家・行政とのプロジェクト型副業・リモートワーク。',
    gradient: 'from-[#1a2530] via-[#3d5c6e] to-[#2a4050]',
    accent: '#3d5c6e',
  },
  {
    href: '/connect/relation/volunteer',
    label: 'ボランティア・地域活動',
    labelEn: 'VOLUNTEER',
    description: '農業体験・祭り・地域行事への参加。短期から長期まで受け入れています。',
    gradient: 'from-[#301a10] via-[#8a6b5b] to-[#5c4035]',
    accent: '#8a6b5b',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '関係人口として関わる — せたな町',
  url: 'https://www.setana.life/connect/relation',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: '関係人口として関わる', item: 'https://www.setana.life/connect/relation' },
    ],
  },
}

export default function RelationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2820] via-[#2d4028] to-[#1a3028]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <span className="text-white/70">関係人口として関わる</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">RELATION POPULATION</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            関係人口として<span className="font-bold">関わる</span>
          </h1>
          <p className="text-white/60 text-[15px] leading-[1.8] mt-3 max-w-[480px]">
            移住の前に、せたなと関わるもう一つの選択肢。二拠点・ワーケーション・ボランティア。
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
                  <div className={`bg-gradient-to-br ${page.gradient} ${i === 0 ? 'h-48 lg:h-52' : 'h-36'} group-hover:scale-[1.02] transition-transform duration-500`} />
                  <div className="p-6">
                    <p className="text-[10px] font-medium tracking-[0.2em] nav-label mb-2" style={{ color: page.accent }}>
                      {page.labelEn}
                    </p>
                    <h2 className={`font-bold text-[#1a1a1a] tracking-[0.02em] mb-2 ${i === 0 ? 'text-[20px]' : 'text-[17px]'}`}>
                      {page.label}
                    </h2>
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

      {/* リード文 */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">ABOUT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6 tracking-[0.02em]">関係人口という選択</h2>
          <div className="space-y-4 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em]">
            <p>
              移住という大きな決断の前に、「関係人口」として関わることから始めてみませんか。週末だけ・夏の間だけ・プロジェクトベースで——さまざまな形でせたなとつながることができます。
            </p>
            <p>
              ワーケーションで海と山の景色の中でリモートワーク、農業体験や祭りへの参加、副業として地域課題解決に参加する。あなたのライフスタイルに合った関わり方が見つかるはずです。
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 lg:px-8 bg-[#faf8f5] border-t border-[#efefef]">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="text-[#5c5c5c] text-[14px] leading-[1.8] mb-6">
            関係人口としての関わり方についてご質問があればお気軽にどうぞ。
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#6b8a72] hover:bg-[#526a58] text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px]"
          >
            お問い合わせ →
          </Link>
        </div>
      </section>
    </>
  )
}
