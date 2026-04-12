import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import StatusBadge from '@/components/admin/StatusBadge'
import JobForm from './JobForm'
import { updateJobStatus, deleteJob } from '@/app/actions/jobs'

const typeLabel: Record<string, string> = {
  regular:   '正規・パート',
  seasonal:  '季節',
  volunteer: '協力隊',
}

function JobRowActions({ jobId, status }: { jobId: string; status: string }) {
  return (
    <div className="flex items-center gap-2">
      <form action={async () => { 'use server'; await updateJobStatus(jobId, status === 'open' ? 'closed' : 'open') }}>
        <button type="submit" className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors">
          {status === 'open' ? '募集停止' : '再公開'}
        </button>
      </form>
      <form action={async () => { 'use server'; await deleteJob(jobId) }}>
        <button type="submit" className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#8a8a8a] hover:border-[#d94f4f] hover:text-[#d94f4f] transition-colors">
          削除
        </button>
      </form>
    </div>
  )
}

export default async function BusinessJobsPage() {
  const userId = await getSessionUserId()
  if (!userId) redirect('/')

  const [{ data: jobs }, { data: mySpots }] = await Promise.all([
    supabaseAdmin
      .from('jobs')
      .select('*, spots(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('business_spots')
      .select('spot_id, spots(id, name)')
      .eq('user_id', userId),
  ])

  const list = jobs ?? []
  const spots = (mySpots ?? [])
    .map((bs: any) => bs.spots)
    .filter(Boolean)

  return (
    <div>
      <h1 className="text-[20px] font-bold text-[#1a1a1a] mb-6">求人管理</h1>

      <JobForm spots={spots} />

      {list.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-[#efefef] p-10 text-center">
          <p className="text-[#8a8a8a] text-[14px]">求人がありません。上のボタンから登録してください。</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-[#efefef] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#efefef] bg-[#faf8f5]">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a]">求人タイトル</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] hidden sm:table-cell">種別</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a]">状態</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a]">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((job: any) => (
                <tr key={job.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{job.title}</p>
                      {job.salary_range && (
                        <p className="text-[11px] text-[#5b7e95] mt-0.5">{job.salary_range}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-[12px] text-[#5c5c5c]">{typeLabel[job.type] ?? job.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status === 'open' ? 'published' : 'hidden'} />
                  </td>
                  <td className="px-4 py-3">
                    <JobRowActions jobId={job.id} status={job.status} />
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
