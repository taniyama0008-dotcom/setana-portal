import type { Area } from '@/lib/types'

export const areaConfig: Record<Area, { label: string; bg: string; text: string }> = {
  setana:     { label: '瀬棚',   bg: '#e8f0f4', text: '#4a6e83' },
  kitahiyama: { label: '北檜山', bg: '#ecf0e8', text: '#5a6e4a' },
  taisei:     { label: '大成',   bg: '#f0ece8', text: '#6e5a4a' },
}

export default function AreaBadge({ area }: { area: Area | null | undefined }) {
  if (!area || !areaConfig[area]) return null
  const { label, bg, text } = areaConfig[area]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  )
}
