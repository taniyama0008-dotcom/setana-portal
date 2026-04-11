import { supabaseAdmin } from '@/lib/supabase-admin'
import UserActions from './UserActions'

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

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
}

export default async function AdminUsersPage() {
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, nickname, line_display_name, line_picture_url, role, created_at')
    .order('created_at', { ascending: false })

  // 各ユーザーの口コミ数を取得
  const { data: reviewCounts } = await supabaseAdmin
    .from('reviews')
    .select('user_id')
    .in('status', ['published', 'hidden'])

  const countMap: Record<string, number> = {}
  ;(reviewCounts ?? []).forEach((r: any) => {
    if (r.user_id) countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1
  })

  // 事業者のスポット紐づけ
  const { data: bizSpots } = await supabaseAdmin
    .from('business_spots')
    .select('user_id, spots(id, name)')

  const bizSpotMap: Record<string, any[]> = {}
  ;(bizSpots ?? []).forEach((bs: any) => {
    if (!bizSpotMap[bs.user_id]) bizSpotMap[bs.user_id] = []
    if (bs.spots) bizSpotMap[bs.user_id].push(bs.spots)
  })

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">ユーザー管理</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{users?.length ?? 0}件</p>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#efefef]">
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ユーザー</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ロール</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">口コミ数</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">店舗</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">登録日</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[11px] font-medium text-[#5c5c5c] shrink-0">
                      {(u.line_display_name ?? u.nickname ?? '?').slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">
                        {u.line_display_name ?? u.nickname ?? '—'}
                      </p>
                      <p className="text-[11px] text-[#8a8a8a]">LINE</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-[13px] text-[#5c5c5c] tabular-nums">
                  {countMap[u.id] ?? 0}
                </td>
                <td className="px-4 py-3">
                  {(bizSpotMap[u.id] ?? []).length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {bizSpotMap[u.id].map((s: any) => (
                        <span key={s.id} className="text-[11px] text-[#5c5c5c]">{s.name}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#8a8a8a]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[12px] text-[#8a8a8a] tabular-nums">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <UserActions userId={u.id} currentRole={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
