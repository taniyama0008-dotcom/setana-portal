import { supabaseAdmin } from '@/lib/supabase-admin'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import SectionBadge from '@/components/admin/SectionBadge'

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-[12px]">
      {[1,2,3,4,5].map(n => (
        <span key={n} className={n <= rating ? 'text-[#c47e4f]' : 'text-[#e0e0e0]'}>★</span>
      ))}
    </span>
  )
}

export default async function AdminDashboard() {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: spotCount },
    { count: reviewCount },
    { count: userCount },
    { count: bizCount },
    { data: recentReviews },
    { data: recentUsers },
  ] = await Promise.all([
    supabaseAdmin.from('spots').select('*', { count: 'exact', head: true }).eq('status', 'public'),
    supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'business'),
    supabaseAdmin.from('reviews').select('id, nickname, rating, text, status, created_at, spots(name, section)').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('users').select('id, nickname, line_display_name, role, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="p-8 max-w-[1000px]">
      {/* ページタイトル */}
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">ダッシュボード</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="公開スポット" value={spotCount ?? 0} accent="ocean" />
        <StatCard label="今月の口コミ" value={reviewCount ?? 0} sub="今月" accent="sunset" />
        <StatCard label="登録ユーザー" value={userCount ?? 0} accent="forest" />
        <StatCard label="事業者" value={bizCount ?? 0} accent="ocean" />
      </div>

      {/* 最近の口コミ */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a] tracking-[0.03em]">最近の口コミ</h2>
          <a href="/admin/reviews" className="text-[12px] text-[#5b7e95] hover:underline">すべて見る</a>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#efefef]">
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">スポット</th>
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">投稿者</th>
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">評価</th>
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ステータス</th>
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">日付</th>
              </tr>
            </thead>
            <tbody>
              {(recentReviews ?? []).map((r: any) => (
                <tr key={r.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {r.spots?.section && <SectionBadge section={r.spots.section} />}
                      <span className="text-[13px] text-[#1a1a1a]">{r.spots?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#5c5c5c]">{r.nickname}</td>
                  <td className="px-4 py-3"><StarRow rating={r.rating} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-[12px] text-[#8a8a8a] tabular-nums">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 新規ユーザー */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a] tracking-[0.03em]">新規ユーザー</h2>
          <a href="/admin/users" className="text-[12px] text-[#5b7e95] hover:underline">すべて見る</a>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#efefef]">
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">名前</th>
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ロール</th>
                <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">登録日</th>
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u: any) => (
                <tr key={u.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors">
                  <td className="px-4 py-3 text-[13px] text-[#1a1a1a]">{u.line_display_name ?? u.nickname ?? '—'}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#8a8a8a] tabular-nums">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const c =
    role === 'admin'    ? 'bg-[#1a1a1a] text-white' :
    role === 'business' ? 'bg-[#5b7e95] text-white' :
                          'bg-[#e0e0e0] text-[#5c5c5c]'
  const l =
    role === 'admin'    ? '管理者' :
    role === 'business' ? '事業者' : 'ユーザー'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${c}`}>{l}</span>
  )
}
