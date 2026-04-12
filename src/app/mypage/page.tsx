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

  const [{ data: user }, { data: myReviews }, { data: coinTxs }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, nickname, line_display_name, line_picture_url, role, coin_balance, created_at')
      .eq('id', uid)
      .single(),
    supabaseAdmin
      .from('reviews')
      .select('id, rating, text, visit_date, status, created_at, spots(name, slug, section)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('coin_transactions')
      .select('id, amount, reason, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20),
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

        {/* せたなコイン */}
        <section>
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-5">
            せたなコイン
          </h2>

          {/* 残高カード */}
          <div className="bg-gradient-to-br from-[#c47e4f] to-[#8a5535] rounded-[12px] p-6 text-white mb-6">
            <p className="text-[11px] font-medium tracking-[0.2em] opacity-70 nav-label mb-2">COIN BALANCE</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[42px] font-bold leading-none tabular-nums">{user?.coin_balance ?? 0}</span>
              <span className="text-[16px] opacity-80">コイン</span>
            </div>
            <p className="text-[12px] opacity-60 mt-3">通報・情報提供・口コミ投稿で貯まります</p>
          </div>

          {/* 特典交換（プレースホルダー） */}
          <div className="mb-6 border border-[#e0e0e0] rounded-[10px] p-4 flex items-center justify-between opacity-60">
            <div>
              <p className="text-[13px] font-medium text-[#1a1a1a]">特典と交換</p>
              <p className="text-[12px] text-[#8a8a8a]">5月実装予定</p>
            </div>
            <button disabled className="px-4 py-2 bg-[#e0e0e0] text-[#8a8a8a] text-[12px] rounded-[6px] cursor-not-allowed">
              近日公開
            </button>
          </div>

          {/* コイン履歴 */}
          {coinTxs && coinTxs.length > 0 ? (
            <div>
              <p className="text-[13px] font-medium text-[#1a1a1a] mb-3">コイン履歴</p>
              <ul className="space-y-0">
                {coinTxs.map((tx: any) => {
                  const reasonLabels: Record<string, string> = {
                    report_infra: 'インフラ通報', report_info: '情報提供',
                    photo_bonus: '写真ボーナス', review: '口コミ投稿',
                    helpful_bonus: '役に立った', redeem: '特典交換',
                  }
                  return (
                    <li key={tx.id} className="flex items-center justify-between py-3 border-b border-[#efefef] last:border-0">
                      <div>
                        <p className="text-[13px] text-[#1a1a1a]">{reasonLabels[tx.reason] ?? tx.reason}</p>
                        <time className="text-[11px] text-[#8a8a8a]">{formatDate(tx.created_at)}</time>
                      </div>
                      <span className={`text-[14px] font-bold tabular-nums ${tx.amount > 0 ? 'text-[#c47e4f]' : 'text-[#8a8a8a]'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <p className="text-[13px] text-[#8a8a8a]">コイン履歴がありません。LINEで「通報」と送ってコインを貯めましょう！</p>
          )}
        </section>

      </div>
    </div>
  )
}
