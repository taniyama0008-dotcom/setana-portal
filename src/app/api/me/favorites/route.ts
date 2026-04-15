import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/session'

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ spotIds: [] })

  const { data } = await supabase
    .from('favorites')
    .select('spot_id')
    .eq('user_id', userId)

  return NextResponse.json({ spotIds: (data ?? []).map((f: { spot_id: string }) => f.spot_id) })
}
