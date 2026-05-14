import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ spotIds: [] })

  const { data } = await supabaseAdmin
    .from('favorites')
    .select('spot_id')
    .eq('user_id', userId)

  return NextResponse.json({ spotIds: (data ?? []).map((f: { spot_id: string }) => f.spot_id) })
}
