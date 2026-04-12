import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot } from '@/lib/types'

export const metadata: Metadata = {
  title: 'せたな町を旅する｜グルメ・温泉・自然の観光ガイド',
  description: '北海道せたな町の旅行情報。グルメ・観光・自然・温泉・宿泊・アクセスまでまとめた観光ガイド。',
}

const subSections = [
  {
    href: '/travel/gourmet',
    label: 'グルメ',
    labelEn: 'GOURMET',
    description: '日本海の幸、山の幸。地元食堂・海鮮・カフェ。',
    gradient: 'from-[#c47e4f] to-[#8a5535]',
  },
  {
    href: '/travel/nature',
    label: '観光・自然',
    labelEn: 'NATURE',
    description: '三本杉岩、狩場山、チャレンカの滝。せたなの大自然。',
    gradient: 'from-[#6b8f71] to-[#3d5c42]',
  },
  {
    href: '/travel/onsen',
    label: '温泉',
    labelEn: 'ONSEN',
    description: '旅の疲れを癒す、日帰り温泉・宿泊温泉。',
    gradient: 'from-[#5b7e95] to-[#3d5a6e]',
  },
  {
    href: '/travel/stay',
    label: '泊まる',
    labelEn: 'STAY',
    description: 'ホテル・旅館・民宿・キャンプ場の一覧。',
    gradient: 'from-[#3d5a6e] to-[#2a3f50]',
  },
  {
    href: '/travel/access',
    label: 'アクセス',
    labelEn: 'ACCESS',
    description: '札幌・函館・新千歳空港からの交通案内。',
    gradient: 'from-[#6e6e6e] to-[#3a3a3a]',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'せたな町を旅する',
  description: '北海道せたな町の旅行情報ガイド',
  url: 'https://www.setana.life/travel',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '旅する', item: 'https://www.setana.life/travel' },
    ],
  },
}

export default async function TravelPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .in('section', ['shoku', 'shizen'])
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a35] via-[#2d4a5e] to-[#1a2a20]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <span className="text-white/70">旅する</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">TRAVEL</p>
          <h1 className="text-white font-light text-[32px] lg:text-[44px] leading-[1.3] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            せたなを<span className="font-bold">旅する</span>
          </h1>
          <p className="text-white/60 text-[14px] leading-[1.8] mt-3 max-w-[480px]">
            グルメ・自然・温泉・宿泊・アクセス。日本海と山に囲まれたせたな町の旅行情報をまとめました。
          </p>
        </div>
      </section>

      {/* サブセクション一覧 */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {subSections.map((sec, i) => (
              <Link
                key={sec.href}
                href={sec.href}
                className={`group block ${i === 0 ? 'col-span-2 lg:col-span-2' : 'col-span-1'}`}
              >
                <div className="relative overflow-hidden rounded-[8px]">
                  <div className={`bg-gradient-to-br ${sec.gradient} ${i === 0 ? 'h-48 lg:h-52' : 'h-32 lg:h-40'} group-hover:scale-[1.02] transition-transform duration-500`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] mb-1 nav-label">{sec.labelEn}</p>
                    <p className="text-white font-bold text-[16px]">{sec.label}</p>
                    {i === 0 && (
                      <p className="text-white/60 text-[12px] mt-1 leading-[1.6]">{sec.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* おすすめスポット */}
      {spots && spots.length > 0 && (
        <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
          <div className="max-w-[1120px] mx-auto">
            <div className="flex items-baseline gap-4 mb-10">
              <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">RECOMMENDED</p>
              <div className="flex-1 h-px bg-[#e0e0e0]" />
            </div>
            <h2 className="text-[#1a1a1a] text-[24px] font-bold tracking-[0.02em] mb-10">おすすめスポット</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {(spots as Spot[]).map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
