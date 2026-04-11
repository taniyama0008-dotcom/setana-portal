import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId, getSessionRole } from '@/lib/session'
import ReplyForm from './ReplyForm'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-[13px]">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= rating ? 'text-[#c47e4f]' : 'text-[#e0e0e0]'}>★</span>
      ))}
    </span>
  )
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
}

export default async function BusinessReviewsPage() {
  const uid = await getSessionUserId()
  const role = await getSessionRole()

  // 自分の店舗IDを取得
  let spotIds: string[] = []
  if (role === 'admin') {
    const { data } = await supabaseAdmin.from('spots').select('id')
    spotIds = (data ?? []).map((s: any) => s.id)
  } else {
    const { data: bizSpots } = await supabaseAdmin
      .from('business_spots')
      .select('spot_id')
      .eq('user_id', uid!)
    spotIds = (bizSpots ?? []).map((bs: any) => bs.spot_id)
  }

  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('id, spot_id, nickname, rating, text, visit_date, status, business_reply, business_reply_at, created_at, spots(name, id)')
    .in('spot_id', spotIds.length ? spotIds : ['00000000-0000-0000-0000-000000000000'])
    .in('status', ['published', 'pending'])
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">口コミ・返信</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{reviews?.length ?? 0}件</p>
      </div>

      {(reviews ?? []).length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[15px] text-[#8a8a8a]">まだ口コミがありません。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(reviews ?? []).map((r: any) => (
            <div key={r.id} className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
              {/* 口コミ本文 */}
              <div className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[12px] text-[#5c5c5c] shrink-0">
                      {r.nickname.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{r.nickname}</p>
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={r.rating} />
                        <span className="text-[11px] text-[#8a8a8a]">{r.spots?.name}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#8a8a8a] tabular-nums shrink-0">{formatDate(r.created_at)}</span>
                </div>
                {r.text && (
                  <p className="text-[14px] text-[#1a1a1a] leading-[1.8] ml-10">{r.text}</p>
                )}
              </div>

              {/* 既存の返信 */}
              {r.business_reply && (
                <div className="mx-6 mb-4 px-4 py-3 bg-[#f0f5f8] rounded-md border-l-2 border-[#5b7e95]">
                  <p className="text-[11px] text-[#5b7e95] font-medium mb-1 nav-label">事業者からの返信</p>
                  <p className="text-[13px] text-[#1a1a1a] leading-[1.7]">{r.business_reply}</p>
                  <p className="text-[11px] text-[#8a8a8a] mt-1">{formatDate(r.business_reply_at)}</p>
                </div>
              )}

              {/* 返信フォーム */}
              {!r.business_reply && (
                <div className="px-6 pb-5">
                  <ReplyForm reviewId={r.id} spotId={r.spot_id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
