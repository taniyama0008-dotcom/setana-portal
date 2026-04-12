import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { KyoryokutaiListing } from '@/lib/types'

const BASE_URL = 'https://www.setana.life'

export const metadata: Metadata = {
  title: '地域おこし協力隊',
  description: '北海道せたな町の地域おこし協力隊の募集情報。漁業、農業、IT、観光、チーズ製造など多様な事業所で隊員を募集中。',
  alternates: { canonical: `${BASE_URL}/kyoryokutai` },
  openGraph: {
    title: '地域おこし協力隊 | SETANA',
    description: '北海道せたな町の地域おこし協力隊の募集情報。多様な事業所で隊員を募集中。',
    url: `${BASE_URL}/kyoryokutai`,
    siteName: 'SETANA',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default async function KyoryokutaiPage() {
  const { data: listings } = await supabase
    .from('kyoryokutai_listings')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const list = (listings ?? []) as KyoryokutaiListing[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: '地域おこし協力隊募集 — せたな町',
            url: `${BASE_URL}/kyoryokutai`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: '暮らす', item: `${BASE_URL}/life` },
                { '@type': 'ListItem', position: 3, name: '地域おこし協力隊', item: `${BASE_URL}/kyoryokutai` },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[54vh] min-h-[380px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e20] via-[#3d5c42] to-[#2a4a5e]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 0, transparent 50%)`,
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-14">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-5">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/life" className="hover:text-white/70 transition-colors">暮らす</Link>
            <span>›</span>
            <span className="text-white/70">地域おこし協力隊</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-3 nav-label">COMMUNITY SUPPORTER</p>
          <h1 className="text-white font-light text-[30px] lg:text-[44px] leading-[1.35] tracking-[0.02em]" style={{ fontWeight: 300 }}>
            せたなで暮らし、<span className="font-bold">せたなで働く</span>
          </h1>
          <p className="text-white/65 text-[15px] leading-[1.8] mt-4 max-w-[480px]">
            地域おこし協力隊として、せたな町で新しい暮らしを始めませんか。
          </p>
        </div>
      </section>

      {/* 協力隊とは */}
      <section className="bg-[#faf8f5] py-14 lg:py-20 px-5 lg:px-8">
        <div className="max-w-[860px] mx-auto">
          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">ABOUT</p>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-5 tracking-[0.02em]">地域おこし協力隊とは？</h2>
          <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.05em] max-w-[680px]">
            地域おこし協力隊は、総務省の制度で都市部から地方へ移住し、1〜3年間地域活動に従事します。
            せたな町では現在、複数の事業所で隊員を募集しています。活動中は給与・住居支援あり。
            任期後も定住される方が多く、せたなで新しいキャリアと暮らしを築くきっかけになっています。
          </p>
        </div>
      </section>

      {/* 募集一覧 */}
      <section className="bg-white py-16 lg:py-24 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">OPEN POSITIONS</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-10 tracking-[0.02em]">募集中の事業所</h2>

          {list.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[#8a8a8a] text-[15px]">現在準備中です。しばらくお待ちください。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {list.map((listing) => (
                <Link key={listing.id} href={`/kyoryokutai/${listing.slug}`} className="group block">
                  <div className="bg-white border border-[#efefef] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden">
                      {listing.photos?.[0] ? (
                        <Image
                          src={listing.photos[0]}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#3d5c42] to-[#5b7e95]" />
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-medium tracking-[0.2em] text-[#6b8f71] mb-2 nav-label">COMMUNITY SUPPORTER</p>
                      <h3 className="text-[15px] font-bold text-[#1a1a1a] leading-[1.5] mb-2">{listing.title}</h3>
                      {listing.catchphrase && (
                        <p className="text-[13px] text-[#5c5c5c] leading-[1.7] line-clamp-2">{listing.catchphrase}</p>
                      )}
                      <p className="mt-4 text-[12px] font-medium text-[#6b8f71] nav-label">詳しく見る →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* せたなの暮らしを知る */}
      <section className="bg-[#faf8f5] py-16 lg:py-20 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">LIFE IN SETANA</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[20px] font-bold mb-8 tracking-[0.02em]">せたなの暮らしを知る</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[680px]">
            {[
              { href: '/life/living',    label: '暮らしのリアル', sub: '冬の生活・医療・買い物・教育情報', accent: '#5b7e95' },
              { href: '/life/migration', label: '移住支援制度',   sub: '補助金・体験住宅・相談窓口',       accent: '#6b8f71' },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex items-center justify-between bg-white rounded-[10px] border border-[#efefef] px-6 py-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow"
              >
                <div>
                  <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">{card.label}</p>
                  <p className="text-[12px] text-[#8a8a8a]">{card.sub}</p>
                </div>
                <span className="text-[#e0e0e0] group-hover:text-[#5b7e95] transition-colors text-[16px]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 他の求人へ */}
      <section className="bg-white py-12 px-5 lg:px-8 border-t border-[#efefef]">
        <div className="max-w-[860px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-[#5c5c5c]">協力隊以外の求人も見てみませんか？</p>
          <Link
            href="/life/work"
            className="px-5 py-2.5 border border-[#e0e0e0] rounded-[8px] text-[13px] font-medium text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors nav-label shrink-0"
          >
            しごと・求人一覧 →
          </Link>
        </div>
      </section>
    </>
  )
}
