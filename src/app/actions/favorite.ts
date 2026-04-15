'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/session'

export async function toggleFavorite(
  spotId: string,
  slug: string,
): Promise<{ favorited: boolean; needsLogin: boolean }> {
  const userId = await getSessionUserId()
  if (!userId) return { favorited: false, needsLogin: true }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('spot_id', spotId)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
    revalidatePath(`/spot/${slug}`)
    revalidatePath('/mypage')
    return { favorited: false, needsLogin: false }
  } else {
    await supabase.from('favorites').insert({ user_id: userId, spot_id: spotId })
    revalidatePath(`/spot/${slug}`)
    revalidatePath('/mypage')
    return { favorited: true, needsLogin: false }
  }
}
