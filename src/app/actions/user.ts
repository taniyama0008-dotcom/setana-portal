'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'

export type UserActionState = { success?: boolean; error?: string } | null

export async function updateNickname(
  _prev: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const userId = await getSessionUserId()
  if (!userId) return { error: 'ログインが必要です' }

  const nickname = (formData.get('nickname') as string ?? '').trim()
  if (!nickname) return { error: '表示名を入力してください' }
  if (nickname.length > 30) return { error: '表示名は30文字以内で入力してください' }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ nickname })
    .eq('id', userId)

  if (error) {
    console.error('[updateNickname] error:', error)
    return { error: '更新に失敗しました' }
  }

  revalidatePath('/mypage')
  return { success: true }
}
