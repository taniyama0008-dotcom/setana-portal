import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Spot } from '@/lib/types'
import SpotListWithAreaFilter from '@/components/spot/SpotListWithAreaFilter'

export const metadata: Metadata = {
  title: 'せたな町グルメ｜地元おすすめの飲食店・海鮮',
  description: '北海道せたな町のグルメ情報。地元食堂、海鮮、カフェ、菓子店など飲食スポット一覧。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'せたな町グルメ',
  url: 'https://www.setana.life/travel/gourmet',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '旅する', item: 'https://www.setana.life/travel' },
      { '@type': 'ListItem', position: 3, name: 'グルメ', item: 'https://www.setana.life/travel/gourmet' },
    ],
  },
}

export default async function GourmetPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', 'shoku')
    .order('created_at', { ascending: false })

  const list = (spots ?? []) as Spot[]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5c3320] via-[#c47e4f] to-[#8a5535]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/travel" className="hover:text-white/70 transition-colors">旅する</Link>
            <span>›</span>
            <span className="text-white/70">グルメ</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">GOURMET</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.3] tracking-[0.02em]">
            グルメ
          </h1>
          <p className="text-white/60 text-[14px] mt-2">日本海の幸・山の幸。せたなの味を楽しむ。</p>
        </div>
      </section>

      {/* スポット一覧 */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[1120px] mx-auto">
          {list.length === 0 ? (
            <p className="text-[#8a8a8a] text-[14px] py-16 text-center">スポット情報を準備中です。</p>
          ) : (
            <SpotListWithAreaFilter spots={list} />
          )}
        </div>
      </section>
    </>
  )
}
