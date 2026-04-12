import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import type { Spot } from '@/lib/types'
import ReviewSection from '@/components/reviews/ReviewSection'
import AreaBadge, { areaConfig } from '@/components/spot/AreaBadge'

const BASE_URL = 'https://www.setana.life'

// セクション設定（後方互換: パンくず用ラベルのみ残す）
const sectionBadge = {
  kurashi: { label: '暮らし', bgClass: 'bg-[#5b7e95]', gradient: 'from-[#5b7e95] to-[#3d5a6e]' },
  shoku:   { label: '食',     bgClass: 'bg-[#c47e4f]', gradient: 'from-[#c47e4f] to-[#a5663a]' },
  shizen:  { label: '自然',   bgClass: 'bg-[#6b8f71]', gradient: 'from-[#6b8f71] to-[#4a6b50]' },
}

// カテゴリ → ルート解決
const onsenCategories  = ['温泉', 'onsen', '日帰り温泉', '温泉施設']
const stayCategories   = ['宿泊', 'accommodation', 'ホテル', '旅館', 'キャンプ', '民宿']
const gourmetSections  = ['shoku']
const natureSections   = ['shizen']
const kurashiSections  = ['kurashi']

function resolveTrailRoute(spot: Spot): { href: string; label: string } {
  const cat = spot.category?.toLowerCase() ?? ''
  if (onsenCategories.some(k => cat.includes(k) || spot.category === k)) {
    return { href: '/travel/onsen', label: '温泉' }
  }
  if (stayCategories.some(k => cat.includes(k) || spot.category === k)) {
    return { href: '/travel/stay', label: '泊まる' }
  }
  if (gourmetSections.includes(spot.section)) {
    return { href: '/travel/gourmet', label: 'グルメ' }
  }
  if (natureSections.includes(spot.section)) {
    return { href: '/travel/nature', label: '観光・自然' }
  }
  if (kurashiSections.includes(spot.section)) {
    return { href: '/life/living', label: '暮らしのリアル' }
  }
  return { href: '/travel', label: '旅する' }
}

// 親ページURL（パンくず第2階層）
function resolveParentHref(trail: { href: string }): string {
  if (trail.href.startsWith('/travel')) return '/travel'
  if (trail.href.startsWith('/life')) return '/life'
  return '/'
}

function buildJsonLd(spot: Spot, trail: { href: string; label: string }) {
  const type = spot.section === 'shoku' ? 'Restaurant' : 'TouristAttraction'
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: spot.name,
    description: spot.description ?? undefined,
    address: spot.address
      ? { '@type': 'PostalAddress', streetAddress: spot.address, addressCountry: 'JP' }
      : undefined,
    telephone: spot.phone ?? undefined,
    geo:
      spot.latitude && spot.longitude
        ? { '@type': 'GeoCoordinates', latitude: spot.latitude, longitude: spot.longitude }
        : undefined,
    image: spot.cover_image ?? undefined,
    url: `${BASE_URL}/spot/${spot.slug}`,
  }
}

function buildBreadcrumbJsonLd(spot: Spot, trail: { href: string; label: string }) {
  const parentHref = resolveParentHref(trail)
  const parentLabel = parentHref === '/travel' ? '旅する' : '暮らす'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: parentLabel, item: `${BASE_URL}${parentHref}` },
      { '@type': 'ListItem', position: 3, name: trail.label, item: `${BASE_URL}${trail.href}` },
      { '@type': 'ListItem', position: 4, name: spot.name, item: `${BASE_URL}/spot/${spot.slug}` },
    ],
  }
}

async function getSpot(slug: string): Promise<Spot | null> {
  const { data } = await supabase
    .from('spots')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'public')
    .single()
  return data as Spot | null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const spot = await getSpot(slug)
  if (!spot) return { title: 'スポットが見つかりません' }

  const description =
    spot.description?.slice(0, 120) ??
    `せたな町${spot.category ? `の${spot.category}` : ''}スポット「${spot.name}」の情報ページ。`

  return {
    title: spot.name,
    description,
    alternates: { canonical: `${BASE_URL}/spot/${spot.slug}` },
    openGraph: {
      title: `${spot.name} | SETANA`,
      description,
      url: `${BASE_URL}/spot/${spot.slug}`,
      images: spot.cover_image ? [{ url: spot.cover_image }] : [],
      siteName: 'SETANA',
      locale: 'ja_JP',
      type: 'website',
    },
  }
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <tr className="border-t border-[#efefef]">
      <th className="py-3.5 pr-6 text-left text-[13px] font-medium text-[#5c5c5c] whitespace-nowrap w-28 align-top">
        {label}
      </th>
      <td className="py-3.5 text-[14px] text-[#1a1a1a] leading-[1.8]">{value}</td>
    </tr>
  )
}

export default async function SpotPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const spot = await getSpot(slug)
  if (!spot) notFound()

  const sec     = sectionBadge[spot.section]
  const trail   = resolveTrailRoute(spot)
  const parent  = resolveParentHref(trail)
  const parentLabel = parent === '/travel' ? '旅する' : '暮らす'
  const hasBasicInfo = spot.address || spot.phone || spot.business_hours || spot.holidays || spot.area
  const hasMap = spot.latitude !== null && spot.longitude !== null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(spot, trail)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(spot, trail)) }} />

      {/* メイン写真 */}
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        {spot.cover_image ? (
          <>
            <Image src={spot.cover_image} alt={spot.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/25" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${sec.gradient}`} />
        )}
      </div>

      <div className="max-w-[860px] mx-auto px-5 lg:px-8">
        {/* パンくずリスト */}
        <nav className="py-5 flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label flex-wrap" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href={parent} className="hover:text-[#1a1a1a] transition-colors">{parentLabel}</Link>
          <span>/</span>
          <Link href={trail.href} className="hover:text-[#1a1a1a] transition-colors">{trail.label}</Link>
          <span>/</span>
          <span className="text-[#5c5c5c]">{spot.name}</span>
        </nav>

        {/* ヘッダー */}
        <header className="pb-10 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-block px-2.5 py-1 rounded text-white text-[11px] font-medium ${sec.bgClass}`}>
              {sec.label}
            </span>
            <AreaBadge area={spot.area} />
            {spot.category && (
              <span className="text-[12px] text-[#8a8a8a] tracking-[0.04em]">{spot.category}</span>
            )}
          </div>
          <h1 className="text-[28px] lg:text-[32px] font-bold text-[#1a1a1a] leading-[1.4] tracking-[0.02em]">
            {spot.name}
          </h1>
        </header>

        {/* 説明文 */}
        {spot.description && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em] max-w-[680px]">
              {spot.description}
            </p>
          </section>
        )}

        {/* 基本情報テーブル */}
        {hasBasicInfo && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-6 tracking-[0.03em]">基本情報</h2>
            <table className="w-full">
              <tbody>
                <InfoRow label="エリア" value={spot.area ? (areaConfig[spot.area]?.label ?? null) : null} />
                <InfoRow label="住所" value={spot.address} />
                <InfoRow label="電話" value={spot.phone} />
                <InfoRow label="営業時間" value={spot.business_hours} />
                <InfoRow label="定休日" value={spot.holidays} />
              </tbody>
            </table>
          </section>
        )}

        {/* Google Maps */}
        {hasMap && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-6 tracking-[0.03em]">アクセス</h2>
            <div className="rounded-[8px] overflow-hidden aspect-[16/9]">
              <iframe
                title={`${spot.name}の地図`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${spot.latitude},${spot.longitude}&z=15&output=embed`}
              />
            </div>
          </section>
        )}

        {/* 口コミ */}
        <ReviewSection
          spotId={spot.id}
          slug={spot.slug}
          spotName={spot.name}
          spotType={spot.section === 'shoku' ? 'Restaurant' : 'TouristAttraction'}
        />

        {/* 一覧へ戻る */}
        <div className="py-12">
          <Link
            href={trail.href}
            className="inline-flex items-center gap-2 text-[14px] text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
          >
            <span>←</span>
            <span>{trail.label}の一覧へ戻る</span>
          </Link>
        </div>
      </div>
    </>
  )
}
