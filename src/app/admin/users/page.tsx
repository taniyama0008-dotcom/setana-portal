import { supabaseAdmin } from '@/lib/supabase-admin'
import BusinessSetupModal from './BusinessSetupModal'

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
  const [{ data: users }, { data: reviewCounts }, { data: bizSpots }, { data: allSpots }] =
    await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, nickname, line_display_name, line_picture_url, role, created_at')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('reviews')
        .select('user_id')
        .in('status', ['published', 'hidden']),
      supabaseAdmin
        .from('business_spots')
        .select('user_id, spots(id, name)'),
      supabaseAdmin
        .from('spots')
        .select('id, name, area')
        .eq('status', 'public')
        .order('name'),
    ])

  const countMap: Record<string, number> = {}
  ;(reviewCounts ?? []).forEach((r: any) => {
    if (r.user_id) countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1
  })

  const bizSpotMap: Record<string, any[]> = {}
  ;(bizSpots ?? []).forEach((bs: any) => {
    if (!bizSpotMap[bs.user_id]) bizSpotMap[bs.user_id] = []
    if (bs.spots) bizSpotMap[bs.user_id].push(bs.spots)
  })

  const spots = (allSpots ?? []) as { id: string; name: string; area: string }[]

  return (
    <div className="p-4 md:p-8 max-w-[1100px]">
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">ユーザー管理</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{users?.length ?? 0}件</p>
      </div>

      {/* テーブル: md以上 */}
      <div className="hidden md:block bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#efefef]">
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ユーザー</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ロール</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">口コミ</th>
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
                  <BusinessSetupModal
                    userId={u.id}
                    userName={u.line_display_name ?? u.nickname ?? '—'}
                    currentRole={u.role}
                    currentSpotIds={(bizSpotMap[u.id] ?? []).map((s: any) => s.id)}
                    allSpots={spots}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* カード: md未満 */}
      <div className="md:hidden space-y-3">
        {(users ?? []).map((u: any) => (
          <div key={u.id} className="bg-white border border-[#e0e0e0] rounded-[10px] p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[13px] font-medium text-[#5c5c5c] shrink-0">
                  {(u.line_display_name ?? u.nickname ?? '?').slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#1a1a1a] truncate">
                    {u.line_display_name ?? u.nickname ?? '—'}
                  </p>
                  <p className="text-[11px] text-[#8a8a8a]">{formatDate(u.created_at)}</p>
                </div>
              </div>
              <RoleBadge role={u.role} />
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-[12px] text-[#5c5c5c]">
              <span>口コミ <strong className="text-[#1a1a1a]">{countMap[u.id] ?? 0}</strong></span>
              {(bizSpotMap[u.id] ?? []).length > 0 && (
                <span className="truncate max-w-[200px]">
                  店舗: {bizSpotMap[u.id].map((s: any) => s.name).join('、')}
                </span>
              )}
            </div>

            <BusinessSetupModal
              userId={u.id}
              userName={u.line_display_name ?? u.nickname ?? '—'}
              currentRole={u.role}
              currentSpotIds={(bizSpotMap[u.id] ?? []).map((s: any) => s.id)}
              allSpots={spots}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
