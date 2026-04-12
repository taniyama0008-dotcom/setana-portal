import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot } from '@/lib/types'

export const metadata: Metadata = {
  title: 'せたな町の暮らしのリアル｜移住前に知っておきたい生活情報',
  description: '北海道せたな町の生活情報。冬の環境・医療・スーパー・学校・交通など、移住前に知っておくべき暮らしのリアル。',
}

const topics = [
  {
    title: '冬の生活',
    icon: '❄',
    accent: '#5b7e95',
    items: [
      '12月〜3月は積雪1〜2m。除雪作業が日課になります',
      'スタッドレスタイヤ・除雪機は必須装備',
      '光熱費（灯油代）が本州の3〜5倍になることも',
      '日照時間が短く、精神的なケアも大切に',
    ],
  },
  {
    title: '医療・病院',
    icon: '🏥',
    accent: '#6b8f71',
    items: [
      'せたな町立病院が基幹医療機関（内科・外科・整形外科等）',
      '専門医療は函館・札幌へのアクセスが必要な場合も',
      '救急対応は24時間可能',
      '歯科・眼科クリニックも複数あり',
    ],
  },
  {
    title: '買い物・生活用品',
    icon: '🛒',
    accent: '#c47e4f',
    items: [
      '町内にスーパー・ホームセンター・農協が揃っています',
      '大型ショッピング施設は函館（約90km）',
      'ネット通販（翌日〜2日配送）が生活の味方',
      '地元の朝市・直売所で新鮮な食材を入手可',
    ],
  },
  {
    title: '教育・学校',
    icon: '🏫',
    accent: '#3d5a6e',
    items: [
      '小学校・中学校が各区に設置',
      '高校は瀬棚高校（普通科・農業科）',
      '保育所・認定こども園あり',
      '少人数教育で教師との距離が近い',
    ],
  },
]

export default async function LivingPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', 'kurashi')
    .order('created_at', { ascending: false })
    .limit(6)

  const list = (spots ?? []) as Spot[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町の暮らしのリアル',
            url: 'https://setana-portal.vercel.app/life/living',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://setana-portal.vercel.app' },
                { '@type': 'ListItem', position: 2, name: '暮らす', item: 'https://setana-portal.vercel.app/life' },
                { '@type': 'ListItem', position: 3, name: '暮らしのリアル', item: 'https://setana-portal.vercel.app/life/living' },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a35] via-[#5b7e95] to-[#3d5a6e]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/life" className="hover:text-white/70 transition-colors">暮らす</Link>
            <span>›</span>
            <span className="text-white/70">暮らしのリアル</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">LIVING</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px]">暮らしのリアル</h1>
          <p className="text-white/60 text-[14px] mt-2">移住前に知っておきたい、せたなの生活情報。</p>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* トピック別 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {topics.map((topic) => (
            <div key={topic.title} className="bg-white border border-[#efefef] rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[20px]">{topic.icon}</span>
                <h2 className="text-[17px] font-bold text-[#1a1a1a]">{topic.title}</h2>
              </div>
              <ul className="space-y-3">
                {topic.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full mt-2.5 shrink-0" style={{ backgroundColor: topic.accent }} />
                    <p className="text-[13px] text-[#1a1a1a] leading-[1.7]">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 関連スポット */}
        {list.length > 0 && (
          <section>
            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">RELATED SPOTS</p>
              <div className="flex-1 h-px bg-[#efefef]" />
            </div>
            <h2 className="text-[#1a1a1a] text-[20px] font-bold mb-8">関連スポット</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
