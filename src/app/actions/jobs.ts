'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId, getSessionRole } from '@/lib/session'

async function assertBusinessOrAdmin() {
  const role = await getSessionRole()
  if (role !== 'business' && role !== 'admin') throw new Error('Forbidden')
}

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

export async function createJob(formData: FormData) {
  await assertBusinessOrAdmin()
  const userId = await getSessionUserId()

  const title       = (formData.get('title') as string ?? '').trim()
  const type        = (formData.get('type') as string) || 'regular'
  const description = (formData.get('description') as string ?? '').trim()
  const salaryRange = (formData.get('salary_range') as string ?? '').trim()
  const requirements = (formData.get('requirements') as string ?? '').trim()
  const contactInfo = (formData.get('contact_info') as string ?? '').trim()
  const spotId      = (formData.get('spot_id') as string) || null

  if (!title) return { error: '求人タイトルを入力してください' }

  const { error } = await supabaseAdmin.from('jobs').insert({
    title,
    type,
    description: description || null,
    salary_range: salaryRange || null,
    requirements: requirements || null,
    contact_info: contactInfo || null,
    spot_id: spotId || null,
    user_id: userId,
    status: 'open',
  })

  if (error) {
    console.error('[createJob] error:', error)
    return { error: '求人の作成に失敗しました' }
  }

  revalidatePath('/business/jobs')
  revalidatePath('/life/work')
  return { success: true }
}

export async function updateJobStatus(jobId: string, status: 'open' | 'closed') {
  await assertBusinessOrAdmin()

  await supabaseAdmin.from('jobs').update({ status }).eq('id', jobId)
  revalidatePath('/business/jobs')
  revalidatePath('/life/work')
  return { success: true }
}

export async function deleteJob(jobId: string) {
  await assertBusinessOrAdmin()

  await supabaseAdmin.from('jobs').delete().eq('id', jobId)
  revalidatePath('/business/jobs')
  revalidatePath('/life/work')
  return { success: true }
}

export async function adminUpdateJobStatus(jobId: string, status: 'open' | 'closed') {
  await assertAdmin()
  await supabaseAdmin.from('jobs').update({ status }).eq('id', jobId)
  revalidatePath('/admin/jobs')
  revalidatePath('/life/work')
  return { success: true }
}

export async function adminDeleteJob(jobId: string) {
  await assertAdmin()
  await supabaseAdmin.from('jobs').delete().eq('id', jobId)
  revalidatePath('/admin/jobs')
  revalidatePath('/life/work')
  return { success: true }
}
