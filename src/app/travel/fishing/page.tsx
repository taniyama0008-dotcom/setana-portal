import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot } from '@/lib/types'

const BASE_URL = 'https://www.setana.life'

export const metadata: Metadata = {
  title: 'せたな町の釣り情報｜磯釣りポイント・シーズン・釣具屋',
  description: '北海道せたな町の釣り情報。磯釣りポイント、シーズンカレンダー（ホッケ・ソイ・ブリ・サケ）、釣具店情報。日本海の磯釣りの聖地。',
  alternates: { canonical: `${BASE_URL}/travel/fishing` },
}

// シーズン強度: 0=オフ, 1=釣れる, 2=ベスト
type SeasonLevel = 0 | 1 | 2
const S: SeasonLevel = 0
const O: SeasonLevel = 1
const G: SeasonLevel = 2

const fishingSeasons: { fish: string; months: SeasonLevel[] }[] = [
  { fish: 'ホッケ',   months: [S, S, S, G, G, O, S, S, S, O, G, S] },
  { fish: 'ソイ',     months: [S, S, S, O, G, G, G, O, O, S, S, S] },
  { fish: 'アブラコ', months: [S, S, S, O, G, G, O, S, S, O, O, S] },
  { fish: 'カレイ',   months: [S, S, S, G, G, O, S, S, S, S, O, S] },
  { fish: 'ブリ',     months: [S, S, S, S, S, O, G, G, G, O, S, S] },
  { fish: 'ヒラメ',   months: [S, S, S, S, S, O, G, G, O, S, S, S] },
  { fish: 'サケ',     months: [S, S, S, S, S, S, S, S, G, G, O, S] },
]

const monthLabels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

function SeasonCell({ level }: { level: SeasonLevel }) {
  if (level === 0) return (
    <td className="text-center py-2.5 px-2 text-[13px] text-[#d0d0d0] border-r border-[#efefef] last:border-0">—</td>
  )
  if (level === 1) return (
    <td className="text-center py-2.5 px-2 border-r border-[#efefef] last:border-0">
      <span className="inline-block w-6 h-6 rounded-full bg-[#5b7e95]/40 text-[#5b7e95] text-[10px] font-bold leading-6">○</span>
    </td>
  )
  return (
    <td className="text-center py-2.5 px-2 border-r border-[#efefef] last:border-0">
      <span className="inline-block w-6 h-6 rounded-full bg-[#5b7e95] text-white text-[10px] font-bold leading-6">◎</span>
    </td>
  )
}

const rules = [
  { icon: '🎫', title: '遊漁券', body: '河川での釣りには遊漁券が必要な場合があります。地元釣具店または漁協窓口でご確認ください。' },
  { icon: '🚫', title: '立入禁止エリア', body: '一部の漁港内・養殖施設付近・立入禁止の磯場があります。標識をよく確認し、無断侵入は行わないでください。' },
  { icon: '♻️', title: 'ゴミの持ち帰り', body: 'ゴミは必ず持ち帰ってください。仕掛けのライン・パッケージ類も含めて。自然豊かなせたなを次世代に残すために。' },
  { icon: '🐟', title: 'サイズ・禁漁期', body: '魚種によってサイズ制限・禁漁期が設定されています。北海道の漁業調整規則を事前に確認してください。' },
]

const safetyTips = [
  { icon: '🌊', title: '磯での波に注意', body: '磯釣りは波に攫われる危険があります。ライフジャケット着用を強く推奨します。波が高い日は釣行を中止してください。' },
  { icon: '⛈', title: '天候を必ず確認', body: '出発前に気象情報と波浪情報を確認してください。急変時はすぐに撤収できる準備を。気象庁サイトや地元の天気予報を参照。' },
  { icon: '👥', title: 'できれば複数人で', body: '単独での磯釣りはリスクが高まります。できれば複数人での行動を。行先を誰かに伝えてから出発を。' },
  { icon: '📞', title: '緊急連絡先', body: '海上保安庁 緊急通報: 118\n警察: 110\nせたな消防署: 0137-87-2119' },
]

export default async function FishingPage() {
  const { data: fishingSpots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', 'travel')
    .or('primary_category.eq.fishing,sub_categories.cs.{fishing}')
    .order('created_at', { ascending: false })

  const spots = ((fishingSpots ?? []) as Spot[]).sort((a, b) => {
    const ao = (a.spot_order?.fishing) ?? 999
    const bo = (b.spot_order?.fishing) ?? 999
    return ao - bo
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町の釣り情報',
            url: `${BASE_URL}/travel/fishing`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: '旅する', item: `${BASE_URL}/travel` },
                { '@type': 'ListItem', position: 3, name: '釣り',   item: `${BASE_URL}/travel/fishing` },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[44vh] min-h-[300px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e20] via-[#2d5c3a] to-[#1a3040]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/travel" className="hover:text-white/70 transition-colors">旅する</Link>
            <span>›</span>
            <span className="text-white/70">釣り</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">FISHING</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.3] tracking-[0.02em]">
            せたなで<span style={{ fontWeight: 300 }}>釣る</span>
          </h1>
          <p className="text-white/60 text-[14px] mt-2">日本海の磯釣りの聖地。</p>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-5 lg:px-8">

        {/* シーズンカレンダー */}
        <section className="py-16 lg:py-20 border-b border-[#efefef]">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">SEASON</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-3 tracking-[0.02em]">シーズンカレンダー</h2>
          <p className="text-[13px] text-[#8a8a8a] mb-8">
            <span className="inline-block w-5 h-5 rounded-full bg-[#5b7e95] text-white text-[9px] font-bold leading-5 text-center mr-1">◎</span>ベスト
            <span className="inline-block w-5 h-5 rounded-full bg-[#5b7e95]/40 text-[#5b7e95] text-[9px] font-bold leading-5 text-center mx-1">○</span>釣れる
            <span className="text-[#d0d0d0] mx-1">—</span>オフ
            ／目安であり保証ではありません
          </p>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[600px] text-[13px]">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a]">
                  <th className="text-left py-2.5 pr-3 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.05em] w-20">魚種</th>
                  {monthLabels.map((m) => (
                    <th key={m} className="text-center py-2.5 px-2 font-medium text-[#8a8a8a] text-[11px] w-[52px] border-r border-[#efefef] last:border-0">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fishingSeasons.map((row, i) => (
                  <tr key={row.fish} className={`border-b border-[#efefef] ${i % 2 === 0 ? '' : 'bg-[#faf8f5]/60'}`}>
                    <td className="py-2.5 pr-3 font-medium text-[#1a1a1a] text-[13px]">{row.fish}</td>
                    {row.months.map((level, mi) => (
                      <SeasonCell key={mi} level={level} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 釣りスポット */}
        <section className="py-16 lg:py-20 border-b border-[#efefef]">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">SPOTS</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-8 tracking-[0.02em]">釣りスポット・釣具店</h2>

          {spots.length === 0 ? (
            <div className="bg-[#faf8f5] rounded-[10px] p-8 text-center">
              <p className="text-[#8a8a8a] text-[14px] mb-2">釣りスポット情報を準備中です。</p>
              <p className="text-[#8a8a8a] text-[12px]">
                管理画面から primary_category = <code className="bg-white px-1.5 py-0.5 rounded">fishing</code> で登録してください。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </section>

        {/* ルール・マナー */}
        <section className="py-16 lg:py-20 border-b border-[#efefef]">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">RULES</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-8 tracking-[0.02em]">ルール・マナー</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rules.map((r) => (
              <div key={r.title} className="bg-white border border-[#efefef] rounded-[10px] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[20px]">{r.icon}</span>
                  <h3 className="text-[15px] font-semibold text-[#1a1a1a]">{r.title}</h3>
                </div>
                <p className="text-[13px] text-[#5c5c5c] leading-[1.8]">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[#8a8a8a] mt-5">※ 記載内容は参考情報です。最新の規則は北海道庁・地元漁協でご確認ください。</p>
        </section>

        {/* 安全情報 */}
        <section className="py-16 lg:py-20">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">SAFETY</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-8 tracking-[0.02em]">安全情報</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {safetyTips.map((s) => (
              <div key={s.title} className="bg-[#faf8f5] border border-[#efefef] rounded-[10px] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[20px]">{s.icon}</span>
                  <h3 className="text-[15px] font-semibold text-[#1a1a1a]">{s.title}</h3>
                </div>
                <p className="text-[13px] text-[#5c5c5c] leading-[1.8] whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
