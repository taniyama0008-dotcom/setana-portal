'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId, getSessionRole } from '@/lib/session'
import type { PhotoCard } from '@/lib/types'

export type PhotoState = { error?: string } | null

const PAGE_SIZE = 12

function toPhotoCard(row: Record<string, unknown>): PhotoCard {
  const u = row.users as Record<string, string | null> | null
  const s = row.spots as Record<string, string | null> | null
  return {
    id:          row.id as string,
    image_url:   row.image_url as string,
    caption:     row.caption as string | null,
    visit_year:  row.visit_year as number | null,
    visit_month: row.visit_month as number | null,
    is_featured: row.is_featured as boolean,
    nickname:    u?.nickname ?? u?.line_display_name ?? '匿名',
    spot_name:   s?.name ?? null,
    spot_slug:   s?.slug ?? null,
  }
}

function extractPhotoStoragePath(publicUrl: string): string | null {
  const marker = '/storage/v1/object/public/photos/'
  const idx = publicUrl.indexOf(marker)
  return idx >= 0 ? publicUrl.slice(idx + marker.length) : null
}

async function awardCoins(userId: string, amount: number, reason: string, referenceId: string) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('coin_balance')
    .eq('id', userId)
    .single()
  const newBalance = (user?.coin_balance ?? 0) + amount
  await Promise.all([
    supabaseAdmin.from('coin_transactions').insert({
      user_id: userId, amount, reason, reference_id: referenceId,
    }),
    supabaseAdmin.from('users').update({ coin_balance: newBalance }).eq('id', userId),
  ])
}

// ─── ユーザー：写真投稿 ──────────────────────────────────────
export async function submitPhoto(
  _prev: PhotoState,
  formData: FormData,
): Promise<PhotoState> {
  const userId = await getSessionUserId()
  if (!userId) return { error: 'ログインが必要です。' }

  const imageUrlsRaw = formData.get('image_urls') as string | null
  let imageUrls: string[] = []
  try { imageUrls = JSON.parse(imageUrlsRaw ?? '[]') } catch { /* ignore */ }
  if (imageUrls.length === 0) return { error: '画像をアップロードしてください。' }

  const caption    = (formData.get('caption') as string ?? '').trim()
  if (caption.length > 200) return { error: 'キャプションは200文字以内で入力してください。' }

  const spotId     = (formData.get('spot_id') as string)?.trim() || null
  const visitYear  = formData.get('visit_year')  as string
  const visitMonth = formData.get('visit_month') as string
  const month      = visitMonth ? parseInt(visitMonth, 10) : null
  if (month !== null && (month < 1 || month > 12)) return { error: '月が正しくありません。' }

  if (spotId) {
    const { data: spot } = await supabaseAdmin
      .from('spots').select('id').eq('id', spotId).eq('status', 'public').maybeSingle()
    if (!spot) return { error: '選択したスポットが見つかりません。' }
  }

  const rows = imageUrls.map((url) => ({
    user_id:     userId,
    spot_id:     spotId,
    image_url:   url,
    caption:     caption || null,
    visit_year:  visitYear ? parseInt(visitYear, 10) : null,
    visit_month: month,
    status:      'public',
  }))

  const { data: photos, error } = await supabaseAdmin
    .from('photos').insert(rows).select('id')
  if (error || !photos?.length) {
    console.error('photo insert error:', error)
    return { error: '投稿に失敗しました。もう一度お試しください。' }
  }

  // コイン +5（投稿枚数分ではなく1バッチ=1回）
  await awardCoins(userId, 5, 'photo_bonus', photos[0].id).catch(console.error)

  revalidatePath('/photos')
  revalidatePath('/')
  revalidatePath('/mypage')

  redirect(photos.length === 1 ? `/photos/${photos[0].id}` : '/photos')
}

// ─── ユーザー：写真削除 ──────────────────────────────────────
export async function deleteUserPhoto(photoId: string): Promise<{ error?: string }> {
  const userId = await getSessionUserId()
  if (!userId) return { error: 'ログインが必要です。' }

  const { data: photo } = await supabaseAdmin
    .from('photos').select('id, user_id, image_url').eq('id', photoId).single()
  if (!photo || photo.user_id !== userId) return { error: '削除権限がありません。' }

  const path = extractPhotoStoragePath(photo.image_url)
  if (path) await supabaseAdmin.storage.from('photos').remove([path])
  await supabaseAdmin.from('photos').delete().eq('id', photoId)

  revalidatePath('/photos')
  revalidatePath('/mypage')
  revalidatePath('/')
  return {}
}

// ─── 管理者：ステータス変更 ─────────────────────────────────
export async function updatePhotoStatus(
  photoId: string, status: 'public' | 'hidden',
): Promise<{ error?: string }> {
  if ((await getSessionRole()) !== 'admin') return { error: 'Forbidden' }
  await supabaseAdmin.from('photos').update({ status }).eq('id', photoId)
  revalidatePath('/admin/photos')
  revalidatePath('/photos')
  revalidatePath('/')
  return {}
}

// ─── 管理者：ピックアップ切り替え ──────────────────────────
export async function updatePhotoFeatured(
  photoId: string, isFeatured: boolean,
): Promise<{ error?: string }> {
  if ((await getSessionRole()) !== 'admin') return { error: 'Forbidden' }

  const { data: photo } = await supabaseAdmin
    .from('photos').select('user_id, is_featured').eq('id', photoId).single()
  if (!photo) return { error: 'Not found' }

  await supabaseAdmin.from('photos').update({
    is_featured: isFeatured,
    featured_at: isFeatured ? new Date().toISOString() : null,
  }).eq('id', photoId)

  // 新規ピックアップ時のみコイン +10
  if (isFeatured && !photo.is_featured) {
    await awardCoins(photo.user_id, 10, 'photo_featured', photoId).catch(console.error)
  }

  revalidatePath('/admin/photos')
  revalidatePath('/photos')
  revalidatePath('/')
  return {}
}

// ─── 写真一覧取得（load-more 用）───────────────────────────
export async function fetchMorePhotos(
  offset: number,
  filters: { spotId?: string; area?: string; month?: string },
): Promise<{ photos: PhotoCard[]; hasMore: boolean }> {
  const { spotId, area, month } = filters

  const select = area
    ? 'id,image_url,caption,visit_year,visit_month,created_at,is_featured,users!inner(nickname,line_display_name),spots!inner(name,slug,area)'
    : 'id,image_url,caption,visit_year,visit_month,created_at,is_featured,users!inner(nickname,line_display_name),spots(name,slug,area)'

  let query = supabaseAdmin
    .from('photos')
    .select(select)
    .eq('status', 'public')

  if (spotId) query = query.eq('spot_id', spotId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (area)   query = (query as any).eq('spots.area', area)
  if (month)  query = query.eq('visit_month', parseInt(month))

  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE)

  const { data } = await query
  const rows = data ?? []
  return {
    photos:  rows.slice(0, PAGE_SIZE).map(toPhotoCard),
    hasMore: rows.length > PAGE_SIZE,
  }
}

// ─── スポット別写真取得 ─────────────────────────────────────
export async function fetchSpotPhotos(
  spotId: string, limit = 8,
): Promise<{ photos: PhotoCard[]; total: number }> {
  const [{ data }, { count }] = await Promise.all([
    supabaseAdmin
      .from('photos')
      .select('id,image_url,caption,visit_year,visit_month,is_featured,users!inner(nickname,line_display_name),spots(name,slug)')
      .eq('spot_id', spotId)
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabaseAdmin
      .from('photos')
      .select('id', { count: 'exact', head: true })
      .eq('spot_id', spotId)
      .eq('status', 'public'),
  ])
  return {
    photos: (data ?? []).map(toPhotoCard),
    total:  count ?? 0,
  }
}
