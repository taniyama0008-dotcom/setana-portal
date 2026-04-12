import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Spot } from '@/lib/types'
import SpotListWithAreaFilter from '@/components/spot/SpotListWithAreaFilter'

export const metadata: Metadata = {
  title: 'せたな町の観光・自然スポット｜絶景・アクティビティ',
  description: '北海道せたな町の観光・自然スポット一覧。三本杉岩、狩場山、チャレンカの滝など絶景・自然体験。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'せたな町の観光・自然',
  url: 'https://www.setana.life/travel/nature',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '旅する', item: 'https://www.setana.life/travel' },
      { '@type': 'ListItem', position: 3, name: '観光・自然', item: 'https://www.setana.life/travel/nature' },
    ],
  },
}

export default async function NaturePage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', 'shizen')
    .order('created_at', { ascending: false })

  const list = (spots ?? []) as Spot[]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3020] via-[#6b8f71] to-[#3d5c42]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/travel" className="hover:text-white/70 transition-colors">旅する</Link>
            <span>›</span>
            <span className="text-white/70">観光・自然</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">NATURE</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.3] tracking-[0.02em]">
            観光・自然
          </h1>
          <p className="text-white/60 text-[14px] mt-2">狩場山・断崖・日本海。せたなの大自然を体感する。</p>
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
