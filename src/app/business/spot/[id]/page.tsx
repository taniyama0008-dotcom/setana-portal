import { notFound, redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId, getSessionRole } from '@/lib/session'
import SpotEditForm from './SpotEditForm'

export default async function BusinessSpotEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const uid = await getSessionUserId()
  const role = await getSessionRole()

  // スポットの所有権確認（admin はスキップ）
  if (role !== 'admin') {
    const { data: ownership } = await supabaseAdmin
      .from('business_spots')
      .select('id')
      .eq('user_id', uid!)
      .eq('spot_id', id)
      .single()
    if (!ownership) redirect('/business')
  }

  const { data: spot } = await supabaseAdmin
    .from('spots')
    .select('*')
    .eq('id', id)
    .single()

  if (!spot) notFound()

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <a href="/business" className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← ダッシュボードに戻る
        </a>
        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-[0.02em] mt-2">{spot.name} — 情報編集</h1>
      </div>
      <SpotEditForm spot={spot} />
    </div>
  )
}
