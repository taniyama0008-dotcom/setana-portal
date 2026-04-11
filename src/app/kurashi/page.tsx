import { supabase } from '@/lib/supabase'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '暮らし — せたなの暮らし・食・自然',
  description: '移住・子育て・仕事・住まい。せたな町で生きることのリアルをお届けします。',
}

export default async function KurashiPage() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .eq('section', 'kurashi')
    .order('created_at', { ascending: false })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: '暮らし — せたなの暮らし・食・自然',
            description: '移住・子育て・仕事・住まい。せたな町で生きることのリアル。',
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d5a6e] to-[#5b7e95]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 px-5 lg:px-8 max-w-[1120px] mx-auto w-full">
          <p className="text-white/70 text-[12px] font-medium tracking-[0.2em] mb-3 nav-label">
            KURASHI
          </p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] tracking-[0.02em]">
            暮らし
          </h1>
          <p className="text-white/80 text-[15px] mt-3 leading-[1.8]">
            移住・子育て・仕事・住まい。せたな町で生きることのリアル。
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
