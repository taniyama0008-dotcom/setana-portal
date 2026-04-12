'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole, getSessionUserId } from '@/lib/session'

async function assertBusiness() {
  const role = await getSessionRole()
  if (role !== 'business' && role !== 'admin') throw new Error('Forbidden')
}

async function assertSpotOwner(spotId: string) {
  const uid = await getSessionUserId()
  const role = await getSessionRole()
  if (role === 'admin') return // admin はすべて許可
  const { data } = await supabaseAdmin
    .from('business_spots')
    .select('id')
    .eq('user_id', uid!)
    .eq('spot_id', spotId)
    .single()
  if (!data) throw new Error('Forbidden: not your spot')
}

export async function updateSpotInfo(_prev: unknown, formData: FormData) {
  await assertBusiness()
  const spotId = formData.get('spot_id') as string
  await assertSpotOwner(spotId)

  const payload = {
    description: (formData.get('description') as string) || null,
    address: (formData.get('address') as string) || null,
    phone: (formData.get('phone') as string) || null,
    business_hours: (formData.get('business_hours') as string) || null,
    holidays: (formData.get('holidays') as string) || null,
    cover_image: (formData.get('cover_image') as string) || null,
  }

  if (!spotId) return { error: 'スポットIDが不正です。' }

  const { error } = await supabaseAdmin
    .from('spots')
    .update(payload)
    .eq('id', spotId)

  if (error) return { error: '更新に失敗しました。' }

  revalidatePath(`/business/spot/${spotId}`)
  return { success: true }
}

export async function replyToReview(_prev: unknown, formData: FormData) {
  await assertBusiness()
  const reviewId = formData.get('review_id') as string
  const reply = (formData.get('reply') as string).trim()
  const spotId = formData.get('spot_id') as string

  if (!reply) return { error: '返信内容を入力してください。' }
  if (reply.length > 500) return { error: '返信は500文字以内で入力してください。' }

  await assertSpotOwner(spotId)

  const { error } = await supabaseAdmin
    .from('reviews')
    .update({ business_reply: reply, business_reply_at: new Date().toISOString() })
    .eq('id', reviewId)

  if (error) return { error: '返信の保存に失敗しました。' }

  revalidatePath('/business/reviews')
  return { success: true }
}
