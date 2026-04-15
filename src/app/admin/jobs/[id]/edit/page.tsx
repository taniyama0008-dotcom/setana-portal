import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import AdminJobEditForm from './AdminJobEditForm'

export default async function AdminJobEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [{ data: job }, { data: spots }] = await Promise.all([
    supabaseAdmin.from('jobs').select('*').eq('id', id).single(),
    supabaseAdmin.from('spots').select('id, name').order('name'),
  ])

  if (!job) notFound()

  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-2">
        <Link
          href="/admin/jobs"
          className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
        >
          ← 求人管理
        </Link>
      </div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-[0.02em]">求人編集</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{job.title}</p>
      </div>
      <AdminJobEditForm job={job} spots={spots ?? []} />
    </div>
  )
}
