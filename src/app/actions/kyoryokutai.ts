'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId, getSessionRole } from '@/lib/session'

type State = { error?: string; success?: boolean } | null

async function assertBusinessOrAdmin() {
  const role = await getSessionRole()
  if (role !== 'business' && role !== 'admin') throw new Error('Forbidden')
}

export async function uploadKyoryokutaiPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  await assertBusinessOrAdmin()

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'ファイルが選択されていません' }
  if (file.size > 5 * 1024 * 1024) return { error: 'ファイルサイズは5MB以内にしてください' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { data, error } = await supabaseAdmin.storage
    .from('kyoryokutai')
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[uploadKyoryokutaiPhoto]', error)
    return { error: 'アップロードに失敗しました: ' + error.message }
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('kyoryokutai')
    .getPublicUrl(data.path)

  return { url: publicUrl }
}

export async function upsertListing(_prev: unknown, formData: FormData): Promise<State> {
  await assertBusinessOrAdmin()
  const userId = await getSessionUserId()

  const id             = (formData.get('id') as string | null) || null
  const slug           = (formData.get('slug') as string ?? '').trim().toLowerCase()
  const title          = (formData.get('title') as string ?? '').trim()
  const catchphrase    = (formData.get('catchphrase') as string ?? '').trim()
  const description    = (formData.get('description') as string ?? '').trim()
  const duties         = (formData.get('duties') as string ?? '').trim()
  const salary_benefits = (formData.get('salary_benefits') as string ?? '').trim()
  const housing_support = (formData.get('housing_support') as string) || 'none'
  const contact_info   = (formData.get('contact_info') as string ?? '').trim()
  const application_url = (formData.get('application_url') as string ?? '').trim()
  const photos         = formData.getAll('photos[]') as string[]
  const status         = (formData.get('status') as string) || 'draft'

  if (!slug)  return { error: 'スラッグを入力してください' }
  if (!title) return { error: 'タイトルを入力してください' }
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: 'スラッグは英小文字・数字・ハイフンのみ使用できます' }

  const now = new Date().toISOString()

  const record: Record<string, unknown> = {
    user_id: userId,
    slug,
    title,
    catchphrase:     catchphrase     || null,
    description:     description     || null,
    duties:          duties          || null,
    salary_benefits: salary_benefits || null,
    housing_support,
    contact_info:    contact_info    || null,
    application_url: application_url || null,
    photos,
    status,
    updated_at: now,
  }

  // published_at: 初回公開時のみセット
  if (status === 'published') {
    if (id) {
      const { data: existing } = await supabaseAdmin
        .from('kyoryokutai_listings')
        .select('published_at')
        .eq('id', id)
        .single()
      if (!existing?.published_at) record.published_at = now
    } else {
      record.published_at = now
    }
  }

  let dbError
  if (id) {
    const { error } = await supabaseAdmin
      .from('kyoryokutai_listings')
      .update(record)
      .eq('id', id)
      .eq('user_id', userId!)
    dbError = error
  } else {
    record.created_at = now
    const { error } = await supabaseAdmin
      .from('kyoryokutai_listings')
      .insert(record)
    dbError = error
  }

  if (dbError) {
    console.error('[upsertListing]', dbError)
    if (dbError.code === '23505') return { error: 'そのスラッグは既に使用されています' }
    return { error: '保存に失敗しました: ' + dbError.message }
  }

  revalidatePath('/business/kyoryokutai')
  revalidatePath('/kyoryokutai')
  return { success: true }
}

export async function deleteListing(id: string): Promise<void> {
  await assertBusinessOrAdmin()
  const userId = await getSessionUserId()

  await supabaseAdmin
    .from('kyoryokutai_listings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId!)

  revalidatePath('/business/kyoryokutai')
  revalidatePath('/kyoryokutai')
}
