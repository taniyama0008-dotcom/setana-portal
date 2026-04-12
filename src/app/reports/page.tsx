import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Report } from '@/lib/types'

const BASE_URL = 'https://www.setana.life'

export const metadata: Metadata = {
  title: '今のせたな｜リアルタイム情報・道路状況・営業情報',
  description: 'せたな町のリアルタイム情報。道路状況・お店の臨時休業・天候情報など、住民・観光客からの最新情報。',
  alternates: { canonical: `${BASE_URL}/reports` },
}

const categoryLabels: Record<string, string> = {
  road: '道路', streetlight: '街灯', park: '公園・遊具', snow: '除雪', other: 'その他',
  shop_closed: '臨時休業', shop_hours: '営業時間変更', shop_crowded: '混雑',
  weather: '天候・道路', event_info: 'イベント', other_info: 'その他情報',
}
const categoryIcons: Record<string, string> = {
  road: '🚧', streetlight: '💡', park: '🏞️', snow: '❄️', other: '📌',
  shop_closed: '🏪', shop_hours: '🕐', shop_crowded: '👥',
  weather: '🌤️', event_info: '📢', other_info: '📝',
}
const typeColors: Record<string, string> = {
  infrastructure: 'bg-[#fce8e8] text-[#8b1f1f]',
  realtime_info:  'bg-[#e8f0f4] text-[#3d5a6e]',
}
const typeLabels: Record<string, string> = {
  infrastructure: 'こまった',
  realtime_info:  'お店のいま',
}

function formatRelative(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'たった今'
  if (mins < 60)  return `${mins}分前`
  if (hours < 24) return `${hours}時間前`
  return `${days}日前`
}

export default async function ReportsPage() {
  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const reports = (data ?? []) as Report[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '今のせたな — リアルタイム情報',
            url: `${BASE_URL}/reports`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: '今のせたな', item: `${BASE_URL}/reports` },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[36vh] min-h-[240px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2535] via-[#2d3f50] to-[#3d5a6e]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <span className="text-white/70">今のせたな</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">REALTIME INFO</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px]">
            今の<span style={{ fontWeight: 300 }}>せたな</span>
          </h1>
          <p className="text-white/60 text-[14px] mt-2">道路状況・お店情報・天候など、住民からのリアルタイム情報。</p>
        </div>
      </section>

      <div className="max-w-[800px] mx-auto px-5 lg:px-8 py-12">
        {reports.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#8a8a8a] text-[15px]">現在、公開されている情報はありません。</p>
            <p className="text-[13px] text-[#8a8a8a] mt-2">LINEで「おしえる」と送って情報をシェアしよう。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <article key={r.id} className="bg-white rounded-[10px] border border-[#efefef] p-5">
                <div className="flex items-start gap-4">
                  <div className="text-[28px] shrink-0 leading-none mt-0.5">{categoryIcons[r.category] ?? '📌'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded nav-label ${typeColors[r.report_type]}`}>
                        {typeLabels[r.report_type]}
                      </span>
                      <span className="text-[11px] text-[#8a8a8a]">{categoryLabels[r.category]}</span>
                      <span className="text-[11px] text-[#c0c0c0]">·</span>
                      <time className="text-[11px] text-[#8a8a8a]">{formatRelative(r.created_at)}</time>
                    </div>

                    <p className="text-[14px] text-[#1a1a1a] leading-[1.7]">
                      {r.public_message ?? r.description ?? ''}
                    </p>

                    {r.spot_name && (
                      <p className="text-[12px] text-[#8a8a8a] mt-1">📍 {r.spot_name}</p>
                    )}

                    {r.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo_url} alt="通報写真" className="mt-3 w-full max-w-[300px] rounded-[6px] border border-[#efefef]" />
                    )}

                    {r.reporter_name && (
                      <p className="text-[11px] text-[#c0c0c0] mt-2">{r.reporter_name}さんの情報</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* LINE で送る */}
        <div className="mt-12 bg-[#faf8f5] rounded-[10px] border border-[#efefef] p-6 text-center">
          <p className="text-[14px] font-medium text-[#1a1a1a] mb-2">あなたもおしえる</p>
          <p className="text-[13px] text-[#5c5c5c] mb-4">LINEで「おしえる」と送るだけ。道路・お店・天候情報を共有できます。</p>
          <p className="text-[12px] text-[#8a8a8a]">おしえるとせたなコインがもらえるよ 🪙</p>
        </div>
      </div>
    </>
  )
}
