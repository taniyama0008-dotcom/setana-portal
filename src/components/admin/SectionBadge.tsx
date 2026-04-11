const config: Record<string, { label: string; className: string }> = {
  kurashi: { label: '暮らし', className: 'bg-[#e8f0f5] text-[#5b7e95]' },
  shoku:   { label: '食',     className: 'bg-[#faf0e8] text-[#c47e4f]' },
  shizen:  { label: '自然',   className: 'bg-[#eaf0eb] text-[#6b8f71]' },
}

export default function SectionBadge({ section }: { section: string }) {
  const c = config[section] ?? { label: section, className: 'bg-[#e9ecef] text-[#5c5c5c]' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tracking-[0.04em] ${c.className}`}>
      {c.label}
    </span>
  )
}
