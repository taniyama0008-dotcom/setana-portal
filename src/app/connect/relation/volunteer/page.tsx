import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ボランティア・地域活動｜関係人口 — せたな町',
  description: 'せたな町での農業体験・祭り・地域行事への参加。短期から長期までボランティアを受け入れています。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'ボランティア・地域活動 — せたな町',
  url: 'https://www.setana.life/connect/relation/volunteer',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: '関係人口として関わる', item: 'https://www.setana.life/connect/relation' },
      { '@type': 'ListItem', position: 4, name: 'ボランティア・地域活動', item: 'https://www.setana.life/connect/relation/volunteer' },
    ],
  },
}

export default function VolunteerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#301a10] via-[#8a6b5b] to-[#5c4035]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <Link href="/connect/relation" className="hover:text-white/70 transition-colors">関係人口として関わる</Link>
            <span>›</span>
            <span className="text-white/70">ボランティア・地域活動</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">VOLUNTEER</p>
          <h1 className="text-white font-light text-[28px] lg:text-[40px] leading-[1.3]" style={{ fontWeight: 300 }}>
            ボランティア・<span className="font-bold">地域活動</span>
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <p className="text-[15px] text-[#5c5c5c] leading-[1.9] tracking-[0.06em] mb-12">
            このページは現在準備中です。ボランティア・地域活動の受け入れ情報をまもなくお届けします。
          </p>
          <Link href="/connect/relation" className="text-[#6b8a72] text-[14px] font-medium hover:underline">
            ← 関係人口トップに戻る
          </Link>
        </div>
      </section>
    </>
  )
}
