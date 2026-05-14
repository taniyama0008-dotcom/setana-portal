'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'

export async function toggleFavorite(
  spotId: string,
  slug: string,
): Promise<{ favorited: boolean; needsLogin: boolean }> {
  const userId = await getSessionUserId()
  if (!userId) return { favorited: false, needsLogin: true }

  const { data: existing } = await supabaseAdmin
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('spot_id', spotId)
    .maybeSingle()

  if (existing) {
    await supabaseAdmin.from('favorites').delete().eq('id', existing.id)
    revalidatePath(`/spot/${slug}`)
    revalidatePath('/mypage')
    return { favorited: false, needsLogin: false }
  } else {
    await supabaseAdmin.from('favorites').insert({ user_id: userId, spot_id: spotId })
    revalidatePath(`/spot/${slug}`)
    revalidatePath('/mypage')
    return { favorited: true, needsLogin: false }
  }
}
