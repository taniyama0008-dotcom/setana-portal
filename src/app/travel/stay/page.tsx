import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Spot } from '@/lib/types'
import SpotListWithAreaFilter from '@/components/spot/SpotListWithAreaFilter'

export const metadata: Metadata = {
  title: 'せたな町の宿泊施設｜ホテル・旅館・キャンプ場',
  description: '北海道せたな町の宿泊情報。ホテル・旅館・民宿・キャンプ場の一覧。',
}

export default async function StayPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('category', 'accommodation')
    .order('created_at', { ascending: false })

  const list = (spots ?? []) as Spot[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町の宿泊施設',
            url: 'https://setana-portal.vercel.app/travel/stay',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://setana-portal.vercel.app' },
                { '@type': 'ListItem', position: 2, name: '旅する', item: 'https://setana-portal.vercel.app/travel' },
                { '@type': 'ListItem', position: 3, name: '泊まる', item: 'https://setana-portal.vercel.app/travel/stay' },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2535] via-[#3d5a6e] to-[#2a3f50]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/travel" className="hover:text-white/70 transition-colors">旅する</Link>
            <span>›</span>
            <span className="text-white/70">泊まる</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">STAY</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.3] tracking-[0.02em]">
            泊まる
          </h1>
          <p className="text-white/60 text-[14px] mt-2">ホテル・旅館・民宿・キャンプ場。せたなでの一泊を。</p>
        </div>
      </section>

      {/* スポット一覧 */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[1120px] mx-auto">
          {list.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[#8a8a8a] text-[14px] mb-4">宿泊施設情報を準備中です。</p>
              <p className="text-[#8a8a8a] text-[13px]">
                スポット登録は管理画面から。category = <code className="bg-[#faf8f5] px-1.5 py-0.5 rounded text-[12px]">accommodation</code> を設定してください。
              </p>
            </div>
          ) : (
            <>
              <SpotListWithAreaFilter spots={list} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
