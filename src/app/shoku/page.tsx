import { supabase } from '@/lib/supabase'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '食 — せたなの暮らし・食・自然',
  description: '日本海の幸、山の恵み。せたな町の食の豊かさをご紹介します。',
}

export default async function ShokuPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', 'shoku')
    .order('created_at', { ascending: false })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: '食 — せたなの暮らし・食・自然',
            description: '日本海の幸、山の恵み。せたな町の食の豊かさ。',
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#a5663a] to-[#c47e4f]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 px-5 lg:px-8 max-w-[1120px] mx-auto w-full">
          <p className="text-white/70 text-[12px] font-medium tracking-[0.2em] mb-3 nav-label">
            SHOKU
          </p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] tracking-[0.02em]">
            食
          </h1>
          <p className="text-white/80 text-[15px] mt-3 leading-[1.8]">
            日本海の幸、山の恵み。せたな町の食の豊かさ。
          </p>
        </div>
      </section>

      {/* スポット一覧 */}
      <section className="py-20 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          {spots && spots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {(spots as Spot[]).map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          ) : (
            <p className="text-[#8a8a8a] text-[15px] text-center py-20">
              スポット情報を準備中です。
            </p>
          )}
        </div>
      </section>
    </>
  )
}
