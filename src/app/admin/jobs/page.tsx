import { supabaseAdmin } from '@/lib/supabase-admin'
import StatusBadge from '@/components/admin/StatusBadge'
import JobActions from './JobActions'
import AdminJobForm from './AdminJobForm'

const typeLabel: Record<string, string> = {
  regular:   '正規・パート',
  seasonal:  '季節',
  volunteer: '協力隊',
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export default async function AdminJobsPage() {
  const [{ data: jobs }, { data: spots }] = await Promise.all([
    supabaseAdmin
      .from('jobs')
      .select('*, spots(name), users(line_display_name, nickname)')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('spots')
      .select('id, name')
      .order('name'),
  ])

  const list = jobs ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">求人管理</h1>
        <p className="text-[13px] text-[#8a8a8a]">{list.length}件</p>
      </div>

      <AdminJobForm spots={spots ?? []} />

      {list.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-[#efefef] p-12 text-center">
          <p className="text-[#8a8a8a] text-[14px]">求人がありません。上のボタンから登録してください。</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-[#efefef] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#efefef] bg-[#faf8f5]">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">求人タイトル</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden sm:table-cell">種別</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden lg:table-cell">事業者</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden md:table-cell">登録日</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">状態</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((job: any) => (
                <tr key={job.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a] line-clamp-1">{job.title}</p>
                      {job.spots?.name && (
                        <p className="text-[11px] text-[#8a8a8a] mt-0.5">{job.spots.name}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-[12px] text-[#5c5c5c]">{typeLabel[job.type] ?? job.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[12px] text-[#5c5c5c]">
                      {job.users?.nickname ?? job.users?.line_display_name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[12px] text-[#8a8a8a] tabular-nums">{formatDate(job.created_at)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status === 'open' ? 'published' : 'hidden'} />
                  </td>
                  <td className="px-4 py-3">
                    <JobActions jobId={job.id} currentStatus={job.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
