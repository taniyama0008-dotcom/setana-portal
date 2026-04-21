import { supabase } from '@/lib/supabase'
import type { Spot } from '@/lib/types'
import type { Area, Section } from '@/lib/taxonomy'
import SpotCard from './SpotCard'

interface RelatedSpotsProps {
  currentSpotId: string
  section: Section
  primaryCategory: string
  area: Area | null
}

export default async function RelatedSpots({ currentSpotId, section, primaryCategory, area }: RelatedSpotsProps) {
  // 1. 同じエリア × 同じプライマリカテゴリ
  const { data: sameAreaSpots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', section)
    .eq('primary_category', primaryCategory)
    .eq('area', area ?? '')
    .neq('id', currentSpotId)
    .limit(3)

  const sameArea = (sameAreaSpots ?? []) as Spot[]

  // 2. 不足分を同セクション・別エリアで補充
  let related = sameArea
  if (related.length < 3) {
    const excludeIds = [currentSpotId, ...related.map((s) => s.id)]
    const { data: otherSpots } = await supabase
      .from('spots')
      .select('*')
      .eq('status', 'public')
      .eq('section', section)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(3 - related.length)
    related = [...related, ...((otherSpots ?? []) as Spot[])]
  }

  if (related.length === 0) return null

  return (
    <section className="py-12 border-b border-[#e0e0e0]">
      <h2 className="text-[18px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-8">
        このエリアのおすすめ
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </section>
  )
}
