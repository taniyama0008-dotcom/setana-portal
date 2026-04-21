'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole, getSessionUserId } from '@/lib/session'

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

// ── 口コミ ──────────────────────────────────────────────
export async function updateReviewStatus(reviewId: string, status: string) {
  await assertAdmin()
  await supabaseAdmin.from('reviews').update({ status }).eq('id', reviewId)
  revalidatePath('/admin/reviews')
  return { success: true }
}

// ── スポット ─────────────────────────────────────────────
export async function updateSpotStatus(spotId: string, status: string) {
  await assertAdmin()
  await supabaseAdmin.from('spots').update({ status }).eq('id', spotId)
  revalidatePath('/admin/spots')
  return { success: true }
}

export async function deleteSpot(spotId: string) {
  await assertAdmin()
  await supabaseAdmin.from('spots').delete().eq('id', spotId)
  revalidatePath('/admin/spots')
  return { success: true }
}

// ── ユーザー ─────────────────────────────────────────────
export async function updateUserRole(userId: string, role: string) {
  await assertAdmin()
  await supabaseAdmin.from('users').update({ role }).eq('id', userId)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function assignBusinessSpot(userId: string, spotId: string) {
  await assertAdmin()
  await supabaseAdmin
    .from('business_spots')
    .upsert({ user_id: userId, spot_id: spotId }, { onConflict: 'user_id,spot_id' })
  revalidatePath('/admin/users')
  return { success: true }
}

export async function removeBusinessSpot(userId: string, spotId: string) {
  await assertAdmin()
  await supabaseAdmin
    .from('business_spots')
    .delete()
    .eq('user_id', userId)
    .eq('spot_id', spotId)
  revalidatePath('/admin/users')
  return { success: true }
}

// ── 記事 ─────────────────────────────────────────────────
export async function updateArticleStatus(articleId: string, status: string) {
  await assertAdmin()
  await supabaseAdmin.from('articles').update({ status }).eq('id', articleId)
  revalidatePath('/admin/content')
  return { success: true }
}

export async function deleteArticle(articleId: string) {
  await assertAdmin()
  await supabaseAdmin.from('articles').delete().eq('id', articleId)
  revalidatePath('/admin/content')
  return { success: true }
}

// ── スポット画像 ──────────────────────────────────────────
export async function addSpotImage(spotId: string, imageUrl: string, altText: string) {
  await assertAdmin()
  const { data: last } = await supabaseAdmin
    .from('spot_images')
    .select('sort_order')
    .eq('spot_id', spotId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()
  const nextOrder = last ? (last.sort_order ?? 0) + 1 : 0
  await supabaseAdmin.from('spot_images').insert({
    spot_id: spotId,
    image_url: imageUrl,
    alt_text: altText || null,
    sort_order: nextOrder,
  })
  revalidatePath(`/admin/spots/${spotId}/images`)
  return { success: true }
}

export async function deleteSpotImage(imageId: string, spotId: string) {
  await assertAdmin()
  await supabaseAdmin.from('spot_images').delete().eq('id', imageId)
  revalidatePath(`/admin/spots/${spotId}/images`)
  return { success: true }
}

export async function moveSpotImageUp(imageId: string, spotId: string) {
  await assertAdmin()
  const { data: all } = await supabaseAdmin
    .from('spot_images')
    .select('id, sort_order')
    .eq('spot_id', spotId)
    .order('sort_order', { ascending: true })
  if (!all) return { success: false }
  const idx = all.findIndex((r: { id: string }) => r.id === imageId)
  if (idx <= 0) return { success: false }
  const prev = all[idx - 1]
  const cur = all[idx]
  await supabaseAdmin.from('spot_images').update({ sort_order: prev.sort_order }).eq('id', cur.id)
  await supabaseAdmin.from('spot_images').update({ sort_order: cur.sort_order }).eq('id', prev.id)
  revalidatePath(`/admin/spots/${spotId}/images`)
  return { success: true }
}

export async function moveSpotImageDown(imageId: string, spotId: string) {
  await assertAdmin()
  const { data: all } = await supabaseAdmin
    .from('spot_images')
    .select('id, sort_order')
    .eq('spot_id', spotId)
    .order('sort_order', { ascending: true })
  if (!all) return { success: false }
  const idx = all.findIndex((r: { id: string }) => r.id === imageId)
  if (idx < 0 || idx >= all.length - 1) return { success: false }
  const next = all[idx + 1]
  const cur = all[idx]
  await supabaseAdmin.from('spot_images').update({ sort_order: next.sort_order }).eq('id', cur.id)
  await supabaseAdmin.from('spot_images').update({ sort_order: cur.sort_order }).eq('id', next.id)
  revalidatePath(`/admin/spots/${spotId}/images`)
  return { success: true }
}

// ── スポット基本情報更新（adminフォーム用）───────────────
export async function updateSpot(_prev: unknown, formData: FormData) {
  await assertAdmin()

  const id = formData.get('id') as string
  if (!id) return { error: 'IDが見つかりません。' }

  const str = (key: string) => (formData.get(key) as string)?.trim() || null
  const num = (key: string) => {
    const v = (formData.get(key) as string)?.trim()
    return v ? parseFloat(v) : null
  }
  const int = (key: string) => {
    const v = (formData.get(key) as string)?.trim()
    return v ? parseInt(v, 10) : null
  }
  const bool = (key: string) => formData.get(key) === 'on'

  const slug = str('slug') ?? ''
  if (!slug) return { error: 'スラッグは必須です。' }

  const payload = {
    name:           str('name') ?? '',
    slug,
    section:        str('section') ?? '',
    category:       str('category') ?? '',
    area:           str('area'),
    description:    str('description'),
    address:        str('address'),
    phone:          str('phone'),
    business_hours: str('business_hours'),
    holidays:       str('holidays'),
    latitude:       num('latitude'),
    longitude:      num('longitude'),
    cover_image:    str('cover_image'),
    price_range:    str('price_range'),
    has_onsen:      bool('has_onsen'),
    has_meals:      bool('has_meals'),
    booking_url:    str('booking_url'),
    booking_phone:  str('booking_phone'),
    room_count:     int('room_count'),
    capacity:       int('capacity'),
    website:        str('website'),
    updated_at:     new Date().toISOString(),
  }

  if (!payload.name) return { error: '名前は必須です。' }

  const { error } = await supabaseAdmin.from('spots').update(payload).eq('id', id)
  if (error) {
    if (error.code === '23505') return { error: 'そのスラッグは既に使用されています。' }
    return { error: `更新に失敗しました: ${error.message}` }
  }

  // 事業者割り当て
  const businessUserId = str('business_user_id')
  if (businessUserId) {
    await supabaseAdmin
      .from('business_spots')
      .upsert({ user_id: businessUserId, spot_id: id }, { onConflict: 'user_id,spot_id' })
  }

  revalidatePath('/admin/spots')
  revalidatePath(`/spot/${slug}`)
  return { success: true }
}

// ── スポット新規作成（adminフォーム用）────────────────────
export async function createSpot(_prev: unknown, formData: FormData) {
  await assertAdmin()
  const uid = await getSessionUserId()

  const payload = {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    section: formData.get('section') as string,
    category: formData.get('category') as string,
    area: formData.get('area') as string,
    description: (formData.get('description') as string) || null,
    address: (formData.get('address') as string) || null,
    phone: (formData.get('phone') as string) || null,
    business_hours: (formData.get('business_hours') as string) || null,
    holidays: (formData.get('holidays') as string) || null,
    status: 'public',
  }

  if (!payload.name || !payload.slug || !payload.section || !payload.category || !payload.area) {
    return { error: '必須項目を入力してください。' }
  }

  const { error } = await supabaseAdmin.from('spots').insert(payload)
  if (error) {
    if (error.code === '23505') return { error: 'そのスラッグは既に使用されています。' }
    return { error: '作成に失敗しました。' }
  }

  revalidatePath('/admin/spots')
  return { success: true }
}
