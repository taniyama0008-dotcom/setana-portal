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
