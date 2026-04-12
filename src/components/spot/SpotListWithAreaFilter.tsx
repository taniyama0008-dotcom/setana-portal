'use client'

import { useState } from 'react'
import type { Spot, Area } from '@/lib/types'
import SpotCard from './SpotCard'
import AreaFilter from './AreaFilter'

interface SpotListWithAreaFilterProps {
  spots: Spot[]
}

export default function SpotListWithAreaFilter({ spots }: SpotListWithAreaFilterProps) {
  const [area, setArea] = useState<Area | 'all'>('all')

  const filtered = area === 'all' ? spots : spots.filter((s) => s.area === area)

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <AreaFilter selected={area} onChange={setArea} />
        <p className="text-[13px] text-[#8a8a8a]">{filtered.length}件</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#8a8a8a] text-[14px] py-12 text-center">
          このエリアのスポットはありません。
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filtered.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  )
}
