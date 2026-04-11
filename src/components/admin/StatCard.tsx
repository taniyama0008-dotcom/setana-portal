interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  accent?: 'ocean' | 'forest' | 'sunset'
}

const accentBar: Record<string, string> = {
  ocean:  'bg-[#5b7e95]',
  forest: 'bg-[#6b8f71]',
  sunset: 'bg-[#c47e4f]',
}

export default function StatCard({ label, value, sub, accent = 'ocean' }: StatCardProps) {
  return (
    <div className="bg-white border border-[#e0e0e0] rounded-md p-6 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentBar[accent]}`} />
      <p className="text-[12px] text-[#8a8a8a] tracking-[0.08em] uppercase mb-3 nav-label">{label}</p>
      <p className="text-[32px] font-bold text-[#1a1a1a] leading-none tabular-nums">{value}</p>
      {sub && <p className="text-[12px] text-[#8a8a8a] mt-2">{sub}</p>}
    </div>
  )
}
