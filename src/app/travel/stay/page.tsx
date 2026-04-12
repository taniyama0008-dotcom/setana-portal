import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Spot } from '@/lib/types'
import StayListWithFilters from '@/components/stay/StayListWithFilters'

const BASE_URL = 'https://www.setana.life'

export const metadata: Metadata = {
  title: 'せたな町の宿泊施設｜旅館・民宿・キャンプ場一覧',
  description: '北海道せたな町の宿泊情報。旅館・民宿・山荘・キャンプ場の一覧。温泉付き・食事付きの宿も。',
  alternates: { canonical: `${BASE_URL}/travel/stay` },
}

const stayCategories = ['accommodation', 'hotel', '旅館', 'minshuku', '民宿', 'キャンプ', 'campground', '宿泊']

export default async function StayPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .in('category', stayCategories)
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
            url: `${BASE_URL}/travel/stay`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム',   item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: '旅する',   item: `${BASE_URL}/travel` },
                { '@type': 'ListItem', position: 3, name: '泊まる',   item: `${BASE_URL}/travel/stay` },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[44vh] min-h-[300px] flex items-end overflow-hidden">
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
            せたなに<span style={{ fontWeight: 300 }}>泊まる</span>
          </h1>
          <p className="text-white/60 text-[14px] mt-2">温泉宿から民宿、山荘、キャンプ場まで。</p>
        </div>
      </section>

      {/* 本文 */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[1120px] mx-auto">
          {list.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#8a8a8a] text-[14px] mb-2">宿泊施設情報を準備中です。</p>
              <p className="text-[#8a8a8a] text-[13px]">
                スポット登録は管理画面から。category = <code className="bg-[#faf8f5] px-1.5 py-0.5 rounded text-[12px]">accommodation</code> を設定してください。
              </p>
            </div>
          ) : (
            <StayListWithFilters spots={list} />
          )}
        </div>
      </section>

      {/* 温泉ページへ */}
      <section className="bg-[#faf8f5] py-12 px-5 lg:px-8 border-t border-[#efefef]">
        <div className="max-w-[860px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-[#5c5c5c]">日帰り温泉の情報もあります。</p>
          <Link
            href="/travel/onsen"
            className="px-5 py-2.5 border border-[#e0e0e0] rounded-[8px] text-[13px] font-medium text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors nav-label shrink-0"
          >
            温泉ページへ →
          </Link>
        </div>
      </section>
    </>
  )
}
