import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import type { KyoryokutaiListing } from '@/lib/types'
import KyoryokutaiForm from './KyoryokutaiForm'

export default async function BusinessKyoryokutaiPage() {
  const userId = await getSessionUserId()
  if (!userId) redirect('/')

  const { data } = await supabaseAdmin
    .from('kyoryokutai_listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const listing = data as KyoryokutaiListing | null

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">協力隊LP管理</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">
          {listing
            ? `現在の状態: ${listing.status === 'published' ? '公開中' : '下書き'}`
            : '協力隊の募集LPを作成します'}
        </p>
      </div>

      {listing?.status === 'published' && (
        <div className="mb-6 p-4 bg-[#f0fdf4] border border-[#86efac] rounded-[8px] flex items-center justify-between gap-4">
          <p className="text-[13px] text-[#16a34a]">
            公開中 — <span className="font-mono">/kyoryokutai/{listing.slug}</span>
          </p>
          <a
            href={`/kyoryokutai/${listing.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#16a34a] hover:text-[#15803d] transition-colors nav-label underline"
          >
            公開ページを確認 ↗
          </a>
        </div>
      )}

      <div className="bg-white rounded-[10px] border border-[#efefef] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <KyoryokutaiForm listing={listing} />
      </div>
    </div>
  )
}
