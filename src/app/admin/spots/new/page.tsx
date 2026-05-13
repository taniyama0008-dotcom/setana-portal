import Link from 'next/link'
import SpotNewForm from './SpotNewForm'

export default function SpotNewPage() {
  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-2">
        <Link href="/admin/spots" className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← スポット管理
        </Link>
      </div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-[0.02em]">スポット新規追加</h1>
      </div>
      <SpotNewForm />
    </div>
  )
}
