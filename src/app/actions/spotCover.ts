'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

/** spot_images の先頭画像を spots.cover_image に同期する */
export async function syncSpotCoverImage(spotId: string): Promise<void> {
  await assertAdmin()
  const { data } = await supabaseAdmin
    .from('spot_images')
    .select('image_url')
    .eq('spot_id', spotId)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  await supabaseAdmin
    .from('spots')
    .update({ cover_image: data?.image_url ?? null })
    .eq('id', spotId)
}
