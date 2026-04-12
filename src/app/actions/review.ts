'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/session'

export type ReviewState = {
  success?: boolean
  error?: string
} | null

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const spotId = formData.get('spot_id') as string
  const slug = formData.get('slug') as string
  const nickname = (formData.get('nickname') as string ?? '').trim()
  const ratingRaw = formData.get('rating') as string
  const text = (formData.get('text') as string ?? '').trim()
  const visitYear = formData.get('visit_year') as string
  const visitMonth = formData.get('visit_month') as string

  // バリデーション
  if (!nickname || nickname.length < 1) {
    return { error: 'ニックネームを入力してください。' }
  }
  if (nickname.length > 30) {
    return { error: 'ニックネームは30文字以内で入力してください。' }
  }
  const rating = parseInt(ratingRaw ?? '0', 10)
  if (!rating || rating < 1 || rating > 5) {
    return { error: '星評価を選択してください。' }
  }
  if (text.length > 1000) {
    return { error: '口コミは1000文字以内で入力してください。' }
  }

  const visitDate =
    visitYear && visitMonth
      ? `${visitYear}-${visitMonth.padStart(2, '0')}`
      : null

  const userId = await getSessionUserId()

  const { error } = await supabase.from('reviews').insert({
    spot_id: spotId,
    user_id: userId ?? null,
    nickname,
    rating,
    text: text || null,
    visit_date: visitDate,
    status: 'published',
  })

  if (error) {
    console.error('review insert error:', error)
    return { error: '投稿に失敗しました。もう一度お試しください。' }
  }

  revalidatePath(`/spot/${slug}`)
  return { success: true }
}
