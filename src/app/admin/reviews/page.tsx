import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SectionBadge from '@/components/admin/SectionBadge'
import StatusBadge from '@/components/admin/StatusBadge'
import ReviewActions from './ReviewActions'

const statusFilters = [
  { value: '',          label: 'すべて' },
  { value: 'pending',   label: '保留中' },
  { value: 'published', label: '公開中' },
  { value: 'hidden',    label: '非表示' },
]

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-[13px]">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= rating ? 'text-[#c47e4f]' : 'text-[#e0e0e0]'}>★</span>
      ))}
    </span>
  )
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  let query = supabaseAdmin
    .from('reviews')
    .select('id, nickname, rating, text, status, created_at, spots(name, section, slug)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: reviews } = await query

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">口コミ管理</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{reviews?.length ?? 0}件</p>
      </div>

      {/* ステータスフィルタ */}
      <div className="flex gap-1 mb-6">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={`/admin/reviews${f.value ? `?status=${f.value}` : ''}`}
            className={`px-3 py-1.5 text-[13px] rounded-md border transition-colors nav-label ${
              (status ?? '') === f.value
                ? 'bg-[#5b7e95] text-white border-[#5b7e95]'
                : 'bg-white text-[#5c5c5c] border-[#e0e0e0] hover:border-[#5b7e95]'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#efefef]">
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">スポット</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">投稿者</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">評価</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium w-[240px]">内容</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ステータス</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(reviews ?? []).map((r: any) => (
              <tr key={r.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {r.spots?.section && <SectionBadge section={r.spots.section} />}
                    <span className="text-[12px] text-[#1a1a1a]">{r.spots?.name ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#5c5c5c] whitespace-nowrap">{r.nickname}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StarDisplay rating={r.rating} /></td>
                <td className="px-4 py-3">
                  <p className="text-[13px] text-[#1a1a1a] line-clamp-2 leading-[1.6]">
                    {r.text ?? <span className="text-[#8a8a8a] italic">本文なし</span>}
                  </p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">
                  <ReviewActions reviewId={r.id} currentStatus={r.status} />
                </td>
              </tr>
            ))}
            {!reviews?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#8a8a8a]">口コミが見つかりません。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
