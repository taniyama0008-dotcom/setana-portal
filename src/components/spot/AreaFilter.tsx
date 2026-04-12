'use client'

import type { SpotArea } from '@/lib/types'

const areas: { value: SpotArea | 'all'; label: string }[] = [
  { value: 'all',    label: 'すべて' },
  { value: '瀬棚区',  label: '瀬棚' },
  { value: '北檜山区', label: '北檜山' },
  { value: '大成区',  label: '大成' },
]

interface AreaFilterProps {
  selected: SpotArea | 'all'
  onChange: (area: SpotArea | 'all') => void
}

export default function AreaFilter({ selected, onChange }: AreaFilterProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-[11px] text-[#8a8a8a] mr-1 nav-label">エリア</span>
      {areas.map((a) => (
        <button
          key={a.value}
          onClick={() => onChange(a.value)}
          className={`px-3 py-1.5 text-[12px] rounded-[6px] border transition-colors nav-label ${
            selected === a.value
              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
              : 'bg-white text-[#5c5c5c] border-[#e0e0e0] hover:border-[#5b7e95] hover:text-[#5b7e95]'
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
