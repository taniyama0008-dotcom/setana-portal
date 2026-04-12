import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import SectionBadge from '@/components/admin/SectionBadge'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-[13px]">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= Math.round(rating) ? 'text-[#c47e4f]' : 'text-[#e0e0e0]'}>★</span>
      ))}
    </span>
  )
}

export default async function BusinessDashboard() {
  const uid = await getSessionUserId()

  // 自分の店舗を取得
  const { data: bizSpots } = await supabaseAdmin
    .from('business_spots')
    .select('spot_id, spots(id, name, slug, section, area, status, cover_image, address)')
    .eq('user_id', uid!)

  const spots = (bizSpots ?? []).map((bs: any) => bs.spots).filter(Boolean)

  // 各スポットの口コミ集計
  const spotIds = spots.map((s: any) => s.id)
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('id, spot_id, rating, status, nickname, text, created_at')
    .in('spot_id', spotIds.length ? spotIds : ['00000000-0000-0000-0000-000000000000'])
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const reviewsBySpot: Record<string, any[]> = {}
  ;(reviews ?? []).forEach((r: any) => {
    if (!reviewsBySpot[r.spot_id]) reviewsBySpot[r.spot_id] = []
    reviewsBySpot[r.spot_id].push(r)
  })

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">店舗ダッシュボード</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{spots.length}店舗が登録されています</p>
      </div>

      {spots.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[15px] text-[#8a8a8a]">まだ店舗が紐づいていません。管理者にお問い合わせください。</p>
        </div>
      ) : (
        <div className="space-y-8">
          {spots.map((spot: any) => {
            const spotReviews = reviewsBySpot[spot.id] ?? []
            const avg = spotReviews.length
              ? Math.round((spotReviews.reduce((s: number, r: any) => s + r.rating, 0) / spotReviews.length) * 10) / 10
              : 0
            const latest = spotReviews[0]

            return (
              <div key={spot.id} className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
                {/* カバー画像 */}
                {spot.cover_image && (
                  <div className="relative h-[160px] w-full overflow-hidden">
                    <Image
                      src={spot.cover_image}
                      alt={spot.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}

                {/* スポットヘッダー */}
                <div className="px-6 py-5 border-b border-[#efefef] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <SectionBadge section={spot.section} />
                      <span className="text-[12px] text-[#8a8a8a]">{spot.area}</span>
                    </div>
                    <h2 className="text-[18px] font-bold text-[#1a1a1a]">{spot.name}</h2>
                    {spot.address && (
                      <p className="text-[12px] text-[#8a8a8a] mt-1">📍 {spot.address}</p>
                    )}
                  </div>
                  <Link
                    href={`/business/spot/${spot.id}`}
                    className="shrink-0 text-[12px] px-3 py-1.5 border border-[#e0e0e0] rounded-md text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors"
                  >
                    情報を編集
                  </Link>
                </div>

                {/* 統計 */}
                <div className="px-6 py-4 flex items-center gap-8 bg-[#faf8f5]">
                  <div>
                    <p className="text-[11px] text-[#8a8a8a] mb-1 nav-label">口コミ数</p>
                    <p className="text-[22px] font-bold text-[#1a1a1a] tabular-nums">{spotReviews.length}</p>
                  </div>
                  {avg > 0 && (
                    <div>
                      <p className="text-[11px] text-[#8a8a8a] mb-1 nav-label">平均評価</p>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={avg} />
                        <span className="text-[16px] font-bold text-[#1a1a1a]">{avg}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 最新口コミ */}
                {latest && (
                  <div className="px-6 py-4 border-t border-[#efefef]">
                    <p className="text-[11px] text-[#8a8a8a] mb-2 nav-label">最新の口コミ</p>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[11px] text-[#5c5c5c] shrink-0 mt-0.5">
                        {latest.nickname.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-medium text-[#1a1a1a]">{latest.nickname}</span>
                          <StarDisplay rating={latest.rating} />
                        </div>
                        {latest.text && (
                          <p className="text-[13px] text-[#5c5c5c] line-clamp-2 leading-[1.7]">{latest.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
