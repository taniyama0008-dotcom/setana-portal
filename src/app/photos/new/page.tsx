import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUserId } from '@/lib/session'
import PhotoSubmitForm from './PhotoSubmitForm'

export const metadata: Metadata = {
  title: '写真を投稿する | みんなのせたな',
  robots: { index: false },
}

export default async function PhotoNewPage() {
  const userId = await getSessionUserId()
  if (!userId) redirect('/login')

  const { data: spotsRaw } = await supabaseAdmin
    .from('spots')
    .select('id, name')
    .eq('status', 'public')
    .order('name', { ascending: true })

  const spots = (spotsRaw ?? []) as { id: string; name: string }[]

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-[640px] mx-auto px-5 lg:px-8 py-12">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label mb-8">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href="/photos" className="hover:text-[#1a1a1a] transition-colors">みんなのせたな</Link>
          <span>/</span>
          <span className="text-[#5c5c5c]">写真を投稿</span>
        </nav>

        <h1 className="text-[24px] font-bold text-[#1a1a1a] mb-2 tracking-[0.02em]">
          写真を投稿する
        </h1>
        <p className="text-[14px] text-[#8a8a8a] leading-[1.8] mb-10">
          あなたのせたな体験を写真でシェアしましょう。
        </p>

        <PhotoSubmitForm spots={spots} />
      </div>
    </div>
  )
}
