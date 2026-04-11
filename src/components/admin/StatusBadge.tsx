const config: Record<string, { label: string; className: string }> = {
  pending:   { label: '保留中',   className: 'bg-[#fef3cd] text-[#92650a]' },
  published: { label: '公開',     className: 'bg-[#d4ede0] text-[#1a6640]' },
  public:    { label: '公開',     className: 'bg-[#d4ede0] text-[#1a6640]' },
  hidden:    { label: '非表示',   className: 'bg-[#e9ecef] text-[#5c5c5c]' },
  deleted:   { label: '削除済み', className: 'bg-[#fce8e8] text-[#8b1f1f]' },
  draft:     { label: '下書き',   className: 'bg-[#e9ecef] text-[#5c5c5c]' },
}

export default function StatusBadge({ status }: { status: string }) {
  const c = config[status] ?? { label: status, className: 'bg-[#e9ecef] text-[#5c5c5c]' }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium tracking-[0.04em] ${c.className}`}>
      {c.label}
    </span>
  )
}
