import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot } from '@/lib/types'

const sections = [
  {
    href: '/kurashi',
    label: '暮らし',
    labelEn: 'KURASHI',
    description: '移住・子育て・仕事・住まい。せたな町で生きることのリアルを伝えます。',
    gradient: 'from-[#5b7e95] to-[#3d5a6e]',
    cta: 'bg-[#5b7e95] hover:bg-[#3d5a6e]',
  },
  {
    href: '/shoku',
    label: '食',
    labelEn: 'SHOKU',
    description: '日本海の幸、山の恵み。せたな町の食の豊かさをご紹介します。',
    gradient: 'from-[#c47e4f] to-[#a5663a]',
    cta: 'bg-[#c47e4f] hover:bg-[#a5663a]',
  },
  {
    href: '/shizen',
    label: '自然',
    labelEn: 'SHIZEN',
    description: '狩場山、日本海、断崖の霊場。せたな町の豊かな自然に触れてください。',
    gradient: 'from-[#6b8f71] to-[#4a6b50]',
    cta: 'bg-[#6b8f71] hover:bg-[#4a6b50]',
  },
]

export default async function Home() {
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'せたなの暮らし・食・自然',
            description: '北海道久遠郡せたな町の暮らし・食・自然を伝える地域総合メディア',
            url: 'https://setana-portal.vercel.app',
          }),
        }}
      />

      {/* ヒーローセクション */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d5a6e] via-[#5b7e95] to-[#4a6b50]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-5 max-w-[860px] mx-auto">
          <p className="text-white/70 text-[13px] font-medium tracking-[0.2em] mb-4 nav-label">
            HOKKAIDO / SETANA
          </p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.4] tracking-[0.02em] mb-6">
            せたなの暮らし・食・自然
          </h1>
          <p className="text-white/85 text-[16px] lg:text-[18px] leading-relaxed tracking-[0.06em]">
            海と山に抱かれた町の、暮らしのすべて。
          </p>
        </div>
      </section>

      {/* 3セクション導線 */}
      <section className="py-24 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            {sections.map((sec) => (
              <Link key={sec.href} href={sec.href} className="group block">
                <div className="rounded-[8px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                  {/* 写真エリア */}
                  <div className={`h-48 bg-gradient-to-br ${sec.gradient}`} />
                  {/* テキスト */}
                  <div className="p-6 bg-white">
                    <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.15em] mb-1 nav-label">
                      {sec.labelEn}
                    </p>
                    <h2 className="text-[22px] font-semibold text-[#1a1a1a] mb-3 tracking-[0.03em]">
                      {sec.label}
                    </h2>
                    <p className="text-[14px] text-[#5c5c5c] leading-[1.8] mb-5">
                      {sec.description}
                    </p>
                    <span
                      className={`inline-block px-5 py-2.5 text-white text-[13px] font-medium rounded-[8px] transition-colors ${sec.cta}`}
                    >
                      もっと見る
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 新着スポット */}
      {spots && spots.length > 0 && (
        <section className="py-24 px-5 lg:px-8 bg-[#faf8f5]">
          <div className="max-w-[1120px] mx-auto">
            <div className="mb-12">
              <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.15em] mb-2 nav-label">
                SPOTS
              </p>
              <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-[0.02em]">
                新着スポット
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {(spots as Spot[]).map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
