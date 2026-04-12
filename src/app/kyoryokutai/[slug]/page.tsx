import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SpotCard from '@/components/spot/SpotCard'
import type { KyoryokutaiListing, Spot } from '@/lib/types'

const BASE_URL = 'https://www.setana.life'

const housingLabel: Record<string, string> = {
  provided:   '住居あり（町が用意）',
  subsidized: '家賃補助あり',
  none:       '各自手配',
}

async function getListing(slug: string): Promise<KyoryokutaiListing | null> {
  const { data } = await supabase
    .from('kyoryokutai_listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data as KyoryokutaiListing | null
}

async function getNearbySpots(lat: number, lng: number): Promise<Spot[]> {
  const delta = 0.045 // ~5km
  const { data } = await supabaseAdmin
    .from('spots')
    .select('*')
    .eq('status', 'public')
    .gte('latitude', lat - delta)
    .lte('latitude', lat + delta)
    .gte('longitude', lng - delta * 1.3)
    .lte('longitude', lng + delta * 1.3)
    .limit(6)
  return (data ?? []) as Spot[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing) return { title: '募集情報が見つかりません' }

  const description =
    listing.catchphrase ??
    listing.description?.slice(0, 120) ??
    `${listing.title} — 北海道せたな町の地域おこし協力隊募集情報。`

  return {
    title: listing.title,
    description,
    alternates: { canonical: `${BASE_URL}/kyoryokutai/${listing.slug}` },
    openGraph: {
      title: `${listing.title} | SETANA`,
      description,
      url: `${BASE_URL}/kyoryokutai/${listing.slug}`,
      images: listing.photos?.[0] ? [{ url: listing.photos[0] }] : [],
      siteName: 'SETANA',
      locale: 'ja_JP',
      type: 'website',
    },
  }
}

export default async function KyoryokutaiSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const listing = await getListing(slug)
  if (!listing) notFound()

  const nearbySpots =
    listing.latitude && listing.longitude
      ? await getNearbySpots(listing.latitude, listing.longitude)
      : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: listing.title,
    description: listing.duties ?? listing.description ?? undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'せたな町',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'せたな町',
        addressRegion: '北海道',
        addressCountry: 'JP',
      },
    },
    datePosted: listing.published_at ?? listing.created_at,
    url: `${BASE_URL}/kyoryokutai/${listing.slug}`,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム',         item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: '暮らす',         item: `${BASE_URL}/life` },
      { '@type': 'ListItem', position: 3, name: '地域おこし協力隊', item: `${BASE_URL}/kyoryokutai` },
      { '@type': 'ListItem', position: 4, name: listing.title,    item: `${BASE_URL}/kyoryokutai/${listing.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* メイン写真 */}
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        {listing.photos?.[0] ? (
          <>
            <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a2e20] via-[#3d5c42] to-[#2a4a5e]" />
        )}
      </div>

      <div className="max-w-[860px] mx-auto px-5 lg:px-8">
        {/* パンくず */}
        <nav className="py-5 flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label flex-wrap" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href="/life" className="hover:text-[#1a1a1a] transition-colors">暮らす</Link>
          <span>/</span>
          <Link href="/kyoryokutai" className="hover:text-[#1a1a1a] transition-colors">地域おこし協力隊</Link>
          <span>/</span>
          <span className="text-[#5c5c5c]">{listing.title}</span>
        </nav>

        {/* ヘッダー */}
        <header className="pb-10 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block px-2.5 py-1 rounded text-white text-[11px] font-medium bg-[#6b8f71]">
              地域おこし協力隊
            </span>
          </div>
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#1a1a1a] leading-[1.4] tracking-[0.02em]">
            {listing.title}
          </h1>
          {listing.catchphrase && (
            <p className="mt-3 text-[17px] text-[#5c5c5c] leading-[1.7] tracking-[0.04em]">{listing.catchphrase}</p>
          )}
        </header>

        {/* 写真ギャラリー */}
        {listing.photos.length > 1 && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {listing.photos.slice(1, 5).map((url, i) => (
                <div key={i} className="relative aspect-square rounded-[6px] overflow-hidden">
                  <Image src={url} alt={`${listing.title} 写真${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 事業内容 */}
        {listing.description && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-5 tracking-[0.03em]">事業内容</h2>
            <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.05em] whitespace-pre-line">
              {listing.description}
            </p>
          </section>
        )}

        {/* 業務内容 */}
        {listing.duties && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-5 tracking-[0.03em]">業務内容</h2>
            <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.05em] whitespace-pre-line">
              {listing.duties}
            </p>
          </section>
        )}

        {/* 給与・待遇 */}
        {listing.salary_benefits && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-5 tracking-[0.03em]">給与・待遇</h2>
            <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.05em] whitespace-pre-line">
              {listing.salary_benefits}
            </p>
          </section>
        )}

        {/* 住居支援 */}
        <section className="py-10 border-b border-[#e0e0e0]">
          <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-5 tracking-[0.03em]">住居支援</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-[14px] font-medium ${
            listing.housing_support === 'provided'   ? 'bg-[#ecf4ec] text-[#3d6b42]' :
            listing.housing_support === 'subsidized' ? 'bg-[#e8f0f4] text-[#3d5a6e]' :
            'bg-[#f5f5f5] text-[#5c5c5c]'
          }`}>
            <span>{listing.housing_support === 'provided' ? '🏠' : listing.housing_support === 'subsidized' ? '💴' : '📋'}</span>
            {housingLabel[listing.housing_support] ?? '各自手配'}
          </div>
        </section>

        {/* 周辺スポット */}
        {nearbySpots.length > 0 && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-5 tracking-[0.03em]">この事業所の周辺</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbySpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </section>
        )}

        {/* 応募・問い合わせ */}
        {(listing.contact_info || listing.application_url) && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-5 tracking-[0.03em]">応募・お問い合わせ</h2>
            {listing.contact_info && (
              <div className="bg-[#faf8f5] rounded-[10px] p-6 mb-4">
                <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2 nav-label">CONTACT</p>
                <p className="text-[14px] text-[#1a1a1a] leading-[1.8] whitespace-pre-line">{listing.contact_info}</p>
              </div>
            )}
            {listing.application_url && (
              <a
                href={listing.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#6b8f71] hover:bg-[#4a6b50] text-white text-[14px] font-medium rounded-[8px] transition-colors"
              >
                応募書類をダウンロード
                <span className="text-[12px]">↗</span>
              </a>
            )}
          </section>
        )}

        {/* 下部リンク */}
        <div className="py-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Link
            href="/life/living"
            className="inline-flex items-center gap-2 text-[14px] text-[#5b7e95] hover:text-[#3d5a6e] transition-colors"
          >
            <span>→</span>
            <span>せたなの暮らしを知る</span>
          </Link>
          <Link
            href="/kyoryokutai"
            className="inline-flex items-center gap-2 text-[14px] text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
          >
            <span>←</span>
            <span>他の募集を見る</span>
          </Link>
        </div>
      </div>
    </>
  )
}
