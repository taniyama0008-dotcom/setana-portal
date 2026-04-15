import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { SpotImage } from '@/lib/types'
import SpotImageManager from './SpotImageManager'

export default async function SpotImagesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [{ data: spot }, { data: images }] = await Promise.all([
    supabaseAdmin.from('spots').select('id, name, slug').eq('id', id).single(),
    supabaseAdmin
      .from('spot_images')
      .select('*')
      .eq('spot_id', id)
      .order('sort_order', { ascending: true }),
  ])

  if (!spot) notFound()

  return (
    <div className="p-8 max-w-[860px]">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/spots"
          className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
        >
          ← スポット管理
        </Link>
      </div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[22px] font-bold text-[#1a1a1a]">画像管理</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{spot.name}</p>
      </div>

      <SpotImageManager
        spotId={id}
        initialImages={(images ?? []) as SpotImage[]}
      />
    </div>
  )
}
