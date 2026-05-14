'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'

// Storage の public URL からバケット内パスを抽出
function extractStoragePath(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/reviews/'
  const idx = publicUrl.indexOf(marker)
  return idx >= 0 ? publicUrl.slice(idx + marker.length) : null
}

export type ReviewState = {
  success?: boolean
  error?: string
} | null

export async function submitReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // 1. セッション確認 — 未ログインは拒否
  const userId = await getSessionUserId()
  if (!userId) return { error: 'ログインが必要です。' }

  const spotId    = formData.get('spot_id') as string
  const slug      = formData.get('slug') as string
  const nickname  = (formData.get('nickname') as string ?? '').trim()
  const ratingRaw = formData.get('rating') as string
  const comment    = (formData.get('comment') as string ?? '').trim()
  const visitYear  = formData.get('visit_year') as string
  const visitMonth = formData.get('visit_month') as string
  const imageUrlsRaw = formData.get('image_urls') as string | null

  // 2. nickname バリデーション
  if (!nickname) return { error: 'ニックネームを入力してください。' }
  if (nickname.length > 30) return { error: 'ニックネームは30文字以内で入力してください。' }

  // 3. rating バリデーション（1〜5 の整数）
  const rating = parseInt(ratingRaw ?? '', 10)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: '星評価を1〜5で選択してください。' }
  }

  // 4. 本文バリデーション
  if (comment.length > 1000) return { error: '口コミは1000文字以内で入力してください。' }

  // 5. スポット存在確認 + status = 'public' チェック
  const { data: spot } = await supabaseAdmin
    .from('spots')
    .select('id')
    .eq('id', spotId)
    .eq('status', 'public')
    .maybeSingle()
  if (!spot) return { error: '投稿先のスポットが見つかりません。' }

  let imageUrls: string[] = []
  if (imageUrlsRaw) {
    try { imageUrls = JSON.parse(imageUrlsRaw) } catch { /* ignore */ }
  }

  const { data: review, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      spot_id:     spotId,
      user_id:     userId,
      nickname,
      rating,
      comment:     comment || null,
      visit_year:  visitYear  ? parseInt(visitYear,  10) : null,
      visit_month: visitMonth ? parseInt(visitMonth, 10) : null,
      status:      'public',
    })
    .select('id')
    .single()

  if (error || !review) {
    console.error('review insert error — code:', error?.code, 'message:', error?.message, 'details:', error?.details)
    return { error: '投稿に失敗しました。もう一度お試しください。' }
  }

  if (imageUrls.length > 0) {
    const { error: imgError } = await supabaseAdmin
      .from('review_images')
      .insert(imageUrls.map((url) => ({ review_id: review.id, image_url: url, alt_text: null })))
    if (imgError) console.error('review_images insert error:', imgError)
    // 画像保存失敗でも口コミ本体は成功扱いにする
  }

  revalidatePath(`/spot/${slug}`)
  return { success: true }
}

// ── ユーザーによる口コミ削除 ──────────────────────────────────
export async function deleteUserReview(reviewId: string): Promise<{ error?: string }> {
  const userId = await getSessionUserId()
  if (!userId) return { error: 'ログインが必要です。' }

  const { data: review } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id, spots(slug)')
    .eq('id', reviewId)
    .single()

  if (!review || review.user_id !== userId) return { error: '削除権限がありません。' }

  // Storage から画像ファイルを削除
  const { data: images } = await supabaseAdmin
    .from('review_images')
    .select('image_url')
    .eq('review_id', reviewId)

  if (images && images.length > 0) {
    const paths = images.map((img: { image_url: string }) => extractStoragePath(img.image_url)).filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabaseAdmin.storage.from('reviews').remove(paths)
    }
  }

  await supabaseAdmin.from('review_images').delete().eq('review_id', reviewId)
  await supabaseAdmin.from('reviews').delete().eq('id', reviewId)

  revalidatePath('/mypage')
  const slug = (review.spots as any)?.slug
  if (slug) revalidatePath(`/spot/${slug}`)
  return {}
}

// ── ユーザーによる口コミ更新 ──────────────────────────────────
export async function updateUserReview(
  reviewId: string,
  formData: FormData,
): Promise<{ success?: boolean; error?: string }> {
  const userId = await getSessionUserId()
  if (!userId) return { error: 'ログインが必要です。' }

  const { data: review } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id, spots(slug)')
    .eq('id', reviewId)
    .single()

  if (!review || review.user_id !== userId) return { error: '編集権限がありません。' }

  const ratingRaw    = formData.get('rating') as string
  const comment      = (formData.get('comment') as string ?? '').trim()
  const visitYear    = formData.get('visit_year') as string
  const visitMonth   = formData.get('visit_month') as string
  const imageUrlsRaw        = formData.get('image_urls') as string | null
  const removedImageIdsRaw  = formData.get('removed_image_ids') as string | null

  const rating = parseInt(ratingRaw ?? '', 10)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: '星評価を1〜5で選択してください。' }
  }
  if (comment.length > 1000) return { error: '口コミは1000文字以内で入力してください。' }

  // 削除対象の既存画像を Storage + DB から除去
  let removedImageIds: string[] = []
  if (removedImageIdsRaw) {
    try { removedImageIds = JSON.parse(removedImageIdsRaw) } catch { /* ignore */ }
  }
  if (removedImageIds.length > 0) {
    const { data: toDelete } = await supabaseAdmin
      .from('review_images')
      .select('image_url')
      .in('id', removedImageIds)
    if (toDelete && toDelete.length > 0) {
      const paths = toDelete.map((img: { image_url: string }) => extractStoragePath(img.image_url)).filter(Boolean) as string[]
      if (paths.length > 0) await supabaseAdmin.storage.from('reviews').remove(paths)
    }
    await supabaseAdmin.from('review_images').delete().in('id', removedImageIds)
  }

  // 口コミ本体を更新
  const { error: updateError } = await supabaseAdmin
    .from('reviews')
    .update({
      rating,
      comment:     comment || null,
      visit_year:  visitYear  ? parseInt(visitYear,  10) : null,
      visit_month: visitMonth ? parseInt(visitMonth, 10) : null,
    })
    .eq('id', reviewId)

  if (updateError) {
    console.error('review update error — code:', updateError.code, 'message:', updateError.message)
    return { error: '更新に失敗しました。もう一度お試しください。' }
  }

  // 新規画像を review_images に追加
  let imageUrls: string[] = []
  if (imageUrlsRaw) {
    try { imageUrls = JSON.parse(imageUrlsRaw) } catch { /* ignore */ }
  }
  if (imageUrls.length > 0) {
    await supabaseAdmin
      .from('review_images')
      .insert(imageUrls.map((url) => ({ review_id: reviewId, image_url: url, alt_text: null })))
  }

  revalidatePath('/mypage')
  const slug = (review.spots as any)?.slug
  if (slug) revalidatePath(`/spot/${slug}`)
  return { success: true }
}
