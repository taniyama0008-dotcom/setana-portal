import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SectionBadge from '@/components/admin/SectionBadge'
import StatusBadge from '@/components/admin/StatusBadge'
import SpotActions from './SpotActions'

const sections = [
  { value: '', label: 'すべて' },
  { value: 'kurashi', label: '暮らし' },
  { value: 'shoku',   label: '食' },
  { value: 'shizen',  label: '自然' },
]

export default async function AdminSpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; q?: string }>
}) {
  const { section, q } = await searchParams

  let query = supabaseAdmin
    .from('spots')
    .select('id, name, slug, section, area, status, address, created_at')
    .order('created_at', { ascending: false })

  if (section) query = query.eq('section', section)
  if (q) query = query.ilike('name', `%${q}%`)

  const { data: spots } = await query

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-[#e0e0e0]">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">スポット管理</h1>
          <p className="text-[13px] text-[#8a8a8a] mt-1">{spots?.length ?? 0}件</p>
        </div>
        <Link
          href="/admin/spots/new"
          className="px-4 py-2 bg-[#5b7e95] hover:bg-[#3d5a6e] text-white text-[13px] font-medium rounded-md transition-colors"
        >
          ＋ 新規追加
        </Link>
      </div>

      {/* フィルタ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1">
          {sections.map((s) => (
            <Link
              key={s.value}
              href={`/admin/spots${s.value ? `?section=${s.value}` : ''}`}
              className={`px-3 py-1.5 text-[13px] rounded-md border transition-colors nav-label ${
                (section ?? '') === s.value
                  ? 'bg-[#5b7e95] text-white border-[#5b7e95]'
                  : 'bg-white text-[#5c5c5c] border-[#e0e0e0] hover:border-[#5b7e95]'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <form className="flex-1 max-w-xs">
          <input
            name="q"
            defaultValue={q}
            placeholder="スポット名で検索..."
            className="w-full bg-white border border-[#e0e0e0] rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#5b7e95]"
          />
        </form>
      </div>

      {/* テーブル */}
      <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#efefef]">
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">スポット名</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">セクション</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">エリア</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ステータス</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(spots ?? []).map((spot: any) => (
              <tr key={spot.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{spot.name}</p>
                    <p className="text-[11px] text-[#8a8a8a]">{spot.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><SectionBadge section={spot.section} /></td>
                <td className="px-4 py-3 text-[13px] text-[#5c5c5c]">{spot.area}</td>
                <td className="px-4 py-3"><StatusBadge status={spot.status} /></td>
                <td className="px-4 py-3">
                  <SpotActions spotId={spot.id} currentStatus={spot.status} />
                </td>
              </tr>
            ))}
            {!spots?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#8a8a8a]">スポットが見つかりません。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
