import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import type { Review } from '@/lib/types'
import ReviewForm from './ReviewForm'

interface ReviewSectionProps {
  spotId: string
  slug: string
  spotName: string
  spotType: 'Restaurant' | 'TouristAttraction'
}

function StarDisplay({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-[14px]', md: 'text-[18px]', lg: 'text-[24px]' }
  return (
    <span className={`${sizes[size]} leading-none`} aria-label={`${rating}点`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? 'text-[#c47e4f]' : 'text-[#e0e0e0]'}>
          ★
        </span>
      ))}
    </span>
  )
}

function formatVisitDate(visitDate: string | null): string | null {
  if (!visitDate) return null
  const [year, month] = visitDate.split('-')
  return `${year}年${parseInt(month, 10)}月`
}

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}

export default async function ReviewSection({
  spotId,
  slug,
  spotName,
  spotType,
}: ReviewSectionProps) {
  const [{ data: reviews }, userId] = await Promise.all([
    supabase
      .from('reviews')
      .select('*')
      .eq('spot_id', spotId)
      .eq('status', 'public')
      .order('created_at', { ascending: false }),
    getSessionUserId(),
  ])

  let dbNickname: string | undefined
  if (userId) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('nickname')
      .eq('id', userId)
      .single()
    dbNickname = user?.nickname ?? undefined
  }

  const list = (reviews ?? []) as Review[]
  const count = list.length
  const avg =
    count > 0
      ? Math.round((list.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0

  const aggregateJsonLd =
    count > 0
      ? {
          '@context': 'https://schema.org',
          '@type': spotType,
          name: spotName,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: avg,
            reviewCount: count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null

  return (
    <>
      {aggregateJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateJsonLd) }}
        />
      )}

      <section className="py-10 border-b border-[#e0e0e0]">
        {/* セクション見出し */}
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="text-[18px] font-semibold text-[#1a1a1a] tracking-[0.03em]">
            口コミ
          </h2>
          {count > 0 && (
            <div className="flex items-center gap-2">
              <StarDisplay rating={avg} size="sm" />
              <span className="text-[14px] font-medium text-[#1a1a1a]">{avg}</span>
              <span className="text-[13px] text-[#8a8a8a]">({count}件)</span>
            </div>
          )}
        </div>

        {/* 口コミ一覧 */}
        {count > 0 ? (
          <ul className="space-y-6 mb-12">
            {list.map((review) => (
              <li key={review.id} className="pb-6 border-b border-[#efefef] last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[12px] font-medium text-[#5c5c5c] flex-shrink-0">
                    {review.nickname.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{review.nickname}</p>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.rating} size="sm" />
                      {review.visit_date && (
                        <>
                          <span className="text-[#e0e0e0] text-[11px]">·</span>
                          <span className="text-[12px] text-[#8a8a8a]">
                            {formatVisitDate(review.visit_date)}に訪問
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="ml-auto text-[12px] text-[#8a8a8a]">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                {review.text && (
                  <p className="text-[14px] text-[#1a1a1a] leading-[1.8] tracking-[0.05em] mt-3 ml-11">
                    {review.text}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-[#8a8a8a] mb-10">
            まだ口コミがありません。最初の口コミを書いてみませんか？
          </p>
        )}

        {/* 投稿フォーム */}
        <div className="bg-[#faf8f5] rounded-[8px] p-6 lg:p-8">
          <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-6 tracking-[0.03em]">
            口コミを書く
          </h3>
          <ReviewForm spotId={spotId} slug={slug} dbNickname={dbNickname} />
        </div>
      </section>
    </>
  )
}
