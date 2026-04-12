import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Report } from '@/lib/types'
import ReportsView from './ReportsView'

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; category?: string }>
}) {
  const { type, status, category } = await searchParams

  let query = supabaseAdmin
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (type && type !== 'all') query = query.eq('report_type', type)
  if (status)   query = query.eq('status', status)
  if (category) query = query.eq('category', category)

  const { data } = await query
  const reports = (data ?? []) as Report[]

  return <ReportsView reports={reports} currentType={type ?? 'all'} currentStatus={status ?? ''} currentCategory={category ?? ''} />
}
