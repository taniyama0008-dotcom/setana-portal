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
  const imageUrlsRaw = formData.get('image_urls') as string | null

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

  let imageUrls: string[] = []
  if (imageUrlsRaw) {
    try {
      imageUrls = JSON.parse(imageUrlsRaw)
    } catch {
      // 無視
    }
  }

  const userId = await getSessionUserId()

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      spot_id: spotId,
      user_id: userId ?? null,
      nickname,
      rating,
      text: text || null,
      visit_date: visitDate,
      status: 'public',
    })
    .select('id')
    .single()

  if (error || !review) {
    console.error('review insert error:', error)
    return { error: '投稿に失敗しました。もう一度お試しください。' }
  }

  // 画像をreview_imagesテーブルに保存
  if (imageUrls.length > 0) {
    const imageRows = imageUrls.map((url) => ({
      review_id: review.id,
      image_url: url,
      alt_text: null,
    }))
    const { error: imgError } = await supabase.from('review_images').insert(imageRows)
    if (imgError) {
      console.error('review_images insert error:', imgError)
      // 画像保存失敗でも口コミ自体は成功扱い
    }
  }

  revalidatePath(`/spot/${slug}`)
  return { success: true }
}
