import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import MyPageProfile from './MyPageProfile'

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
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
}

export default async function MyPage() {
  const uid = await getSessionUserId()
  if (!uid) redirect('/')

  const [{ data: user }, { data: myReviews }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, nickname, line_display_name, line_picture_url, role, created_at')
      .eq('id', uid)
      .single(),
    supabaseAdmin
      .from('reviews')
      .select('id, rating, text, visit_date, status, created_at, spots(name, slug, section)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-12">

        {/* プロフィール */}
        <MyPageProfile userId={uid} dbUser={user} />

        <div className="my-10 border-t border-[#e0e0e0]" />

        {/* 口コミ一覧 */}
        <section>
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-6">
            投稿した口コミ
            <span className="ml-2 text-[13px] font-normal text-[#8a8a8a]">{myReviews?.length ?? 0}件</span>
          </h2>

          {!myReviews?.length ? (
            <p className="text-[14px] text-[#8a8a8a] py-8">まだ口コミを投稿していません。</p>
          ) : (
            <ul className="space-y-5">
              {myReviews.map((r: any) => (
                <li key={r.id} className="pb-5 border-b border-[#efefef] last:border-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/spot/${r.spots?.slug}`}
                        className="text-[14px] font-medium text-[#5b7e95] hover:underline"
                      >
                        {r.spots?.name ?? '—'}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <StarDisplay rating={r.rating} />
                        {r.visit_date && (
                          <span className="text-[12px] text-[#8a8a8a]">
                            {r.visit_date.replace('-', '年').replace(/(\d+)$/, '$1月')}に訪問
                          </span>
                        )}
                      </div>
                      {r.text && (
                        <p className="text-[14px] text-[#1a1a1a] leading-[1.8]">{r.text}</p>
                      )}
                    </div>
                    <span className="text-[12px] text-[#8a8a8a] shrink-0 tabular-nums">{formatDate(r.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="my-10 border-t border-[#e0e0e0]" />

        {/* お気に入り（将来実装） */}
        <section className="opacity-50">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-3">
            お気に入りスポット
          </h2>
          <p className="text-[13px] text-[#8a8a8a]">この機能は近日公開予定です。</p>
        </section>

        <div className="my-10 border-t border-[#e0e0e0]" />

        {/* せたなコイン（将来実装） */}
        <section className="opacity-50">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-3">
            せたなコイン
          </h2>
          <p className="text-[13px] text-[#8a8a8a]">この機能は近日公開予定です。</p>
        </section>

      </div>
    </div>
  )
}
