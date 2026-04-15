import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Spot } from '@/lib/types'
import SpotEditForm from './SpotEditForm'

export default async function SpotEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: spot } = await supabaseAdmin
    .from('spots')
    .select('*')
    .eq('id', id)
    .single()

  if (!spot) notFound()

  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-2">
        <Link href="/admin/spots" className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← スポット管理
        </Link>
      </div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-[0.02em]">スポット編集</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{spot.name}</p>
      </div>
      <SpotEditForm spot={spot as Spot} />
    </div>
  )
}
