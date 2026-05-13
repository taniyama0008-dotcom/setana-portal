'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

/** cover type の画像を優先し、なければ sort_order 先頭を spots.cover_image に同期する */
export async function syncSpotCoverImage(spotId: string): Promise<void> {
  await assertAdmin()

  const { data: coverTyped } = await supabaseAdmin
    .from('spot_images')
    .select('image_url')
    .eq('spot_id', spotId)
    .eq('image_type', 'cover')
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  let coverUrl = coverTyped?.image_url ?? null
  if (!coverUrl) {
    const { data: first } = await supabaseAdmin
      .from('spot_images')
      .select('image_url')
      .eq('spot_id', spotId)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    coverUrl = first?.image_url ?? null
  }

  await supabaseAdmin.from('spots').update({ cover_image: coverUrl }).eq('id', spotId)

  const { data: spotInfo } = await supabaseAdmin
    .from('spots')
    .select('slug')
    .eq('id', spotId)
    .single()

  if (spotInfo?.slug) revalidatePath(`/spot/${spotInfo.slug}`)
  revalidatePath('/travel/stay')
  revalidatePath('/travel/gourmet')
  revalidatePath('/travel/onsen')
  revalidatePath('/travel/nature')
  revalidatePath('/travel/fishing')
}
