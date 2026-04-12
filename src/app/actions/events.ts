'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'
import type { EventStatus } from '@/lib/types'

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

export async function createEvent(_prev: unknown, formData: FormData) {
  await assertAdmin()

  const title       = (formData.get('title') as string ?? '').trim()
  const description = (formData.get('description') as string ?? '').trim()
  const start_date  = (formData.get('start_date') as string ?? '').trim()
  const end_date    = (formData.get('end_date') as string ?? '').trim()
  const area        = (formData.get('area') as string) || null
  const location    = (formData.get('location') as string ?? '').trim()
  const image_url   = (formData.get('image_url') as string ?? '').trim()
  const external_url = (formData.get('external_url') as string ?? '').trim()
  const is_annual   = formData.get('is_annual') === 'true'
  const status      = (formData.get('status') as EventStatus) || 'upcoming'

  if (!title)      return { error: 'タイトルを入力してください' }
  if (!start_date) return { error: '開始日を入力してください' }

  const { error } = await supabaseAdmin.from('events').insert({
    title,
    description:  description  || null,
    start_date,
    end_date:     end_date     || null,
    area:         area         || null,
    location:     location     || null,
    image_url:    image_url    || null,
    external_url: external_url || null,
    is_annual,
    status,
  })

  if (error) {
    console.error('[createEvent]', error)
    return { error: '作成に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
  return { success: true }
}

export async function updateEvent(_prev: unknown, formData: FormData) {
  await assertAdmin()

  const id          = (formData.get('id') as string ?? '').trim()
  const title       = (formData.get('title') as string ?? '').trim()
  const description = (formData.get('description') as string ?? '').trim()
  const start_date  = (formData.get('start_date') as string ?? '').trim()
  const end_date    = (formData.get('end_date') as string ?? '').trim()
  const area        = (formData.get('area') as string) || null
  const location    = (formData.get('location') as string ?? '').trim()
  const image_url   = (formData.get('image_url') as string ?? '').trim()
  const external_url = (formData.get('external_url') as string ?? '').trim()
  const is_annual   = formData.get('is_annual') === 'true'
  const status      = (formData.get('status') as EventStatus) || 'upcoming'

  if (!id)         return { error: 'IDが不正です' }
  if (!title)      return { error: 'タイトルを入力してください' }
  if (!start_date) return { error: '開始日を入力してください' }

  const { error } = await supabaseAdmin.from('events').update({
    title,
    description:  description  || null,
    start_date,
    end_date:     end_date     || null,
    area:         area         || null,
    location:     location     || null,
    image_url:    image_url    || null,
    external_url: external_url || null,
    is_annual,
    status,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) {
    console.error('[updateEvent]', error)
    return { error: '更新に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
  return { success: true }
}

export async function updateEventStatus(id: string, status: EventStatus) {
  await assertAdmin()
  await supabaseAdmin.from('events').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
}

export async function deleteEvent(id: string) {
  await assertAdmin()
  await supabaseAdmin.from('events').delete().eq('id', id)
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')
}
