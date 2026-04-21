import { areaMaster, type Area } from '@/lib/taxonomy'

export { areaMaster }

export default function AreaBadge({ area }: { area: Area | null | undefined }) {
  if (!area || !areaMaster[area]) return null
  const { shortLabel, bg, text } = areaMaster[area]
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {shortLabel}
    </span>
  )
}
