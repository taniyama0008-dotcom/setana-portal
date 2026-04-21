import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/session'
import type { Spot, SpotImage } from '@/lib/types'
import { categoryMaster, sectionBadge, areaMaster, getCategoryLabel, getCategoryPath, type Section } from '@/lib/taxonomy'
import ReviewSection from '@/components/reviews/ReviewSection'
import RelatedSpots from '@/components/spot/RelatedSpots'
import AreaBadge from '@/components/spot/AreaBadge'
import SpotGallery from '@/components/spot/SpotGallery'
import FavoriteButton from '@/components/spot/FavoriteButton'
import ShareButtons from '@/components/spot/ShareButtons'

const BASE_URL = 'https://www.setana.life'

/** taxonomy.ts を参照してパンくず用の trail を解決 */
function resolveTrailRoute(spot: Spot): { href: string; label: string; sectionHref: string; sectionLabel: string } {
  const section = spot.section as Section
  const catPath  = getCategoryPath(section, spot.primary_category)
  const catLabel = getCategoryLabel(section, spot.primary_category)
  const secData  = categoryMaster[section]

  return {
    sectionHref:  secData?.topHref  ?? `/${section}`,
    sectionLabel: secData?.label    ?? section,
    href:         catPath  ?? `/${section}`,
    label:        catLabel ?? spot.primary_category,
  }
}

function buildJsonLd(spot: Spot) {
  // グルメカテゴリなら Restaurant、それ以外は TouristAttraction
  const type = spot.primary_category === 'gourmet' ? 'Restaurant' : 'TouristAttraction'
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name: spot.name,
    description: spot.description ?? undefined,
    address: spot.address ? { '@type': 'PostalAddress', streetAddress: spot.address, addressCountry: 'JP' } : undefined,
    telephone: spot.phone ?? undefined,
    geo: spot.latitude && spot.longitude
      ? { '@type': 'GeoCoordinates', latitude: spot.latitude, longitude: spot.longitude }
      : undefined,
    image: spot.cover_image ?? undefined,
    url: `${BASE_URL}/spot/${spot.slug}`,
  }
}

function buildBreadcrumbJsonLd(spot: Spot, trail: ReturnType<typeof resolveTrailRoute>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム',               item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: trail.sectionLabel,     item: `${BASE_URL}${trail.sectionHref}` },
      { '@type': 'ListItem', position: 3, name: trail.label,            item: `${BASE_URL}${trail.href}` },
      { '@type': 'ListItem', position: 4, name: spot.name,              item: `${BASE_URL}/spot/${spot.slug}` },
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

  const catLabel = getCategoryLabel(spot.section as Section, spot.primary_category) ?? ''
  const description =
    spot.description?.slice(0, 120) ??
    `せたな町${catLabel ? `の${catLabel}` : ''}スポット「${spot.name}」の情報ページ。`

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

  const [{ data: spotImagesRaw }, userId] = await Promise.all([
    supabase
      .from('spot_images')
      .select('*')
      .eq('spot_id', spot.id)
      .order('sort_order', { ascending: true }),
    getSessionUserId(),
  ])

  let isFavorited = false
  if (userId) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('spot_id', spot.id)
      .maybeSingle()
    isFavorited = !!fav
  }

  const spotImages = (spotImagesRaw ?? []) as SpotImage[]
  const sec    = sectionBadge[spot.section as Section] ?? sectionBadge.travel
  const trail  = resolveTrailRoute(spot)
  const hasBasicInfo = spot.address || spot.phone || spot.business_hours || spot.holidays || spot.area
  const hasMap = spot.latitude !== null && spot.longitude !== null
  const pageUrl = `${BASE_URL}/spot/${spot.slug}`

  // 全カテゴリラベル（プライマリ + サブ）
  const allCategoryLabels = [spot.primary_category, ...(spot.sub_categories ?? [])]
    .map((k) => getCategoryLabel(spot.section as Section, k))
    .filter(Boolean)
    .join('・')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(spot)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(spot, trail)) }} />

      {/* 写真ギャラリー */}
      <SpotGallery
        images={spotImages}
        coverImage={spot.cover_image}
        spotName={spot.name}
        gradient={sec.gradient}
      />

      <div className="max-w-[860px] mx-auto px-5 lg:px-8">
        {/* パンくずリスト: ホーム > セクション > カテゴリ > スポット名 */}
        <nav className="py-5 flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label flex-wrap" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href={trail.sectionHref} className="hover:text-[#1a1a1a] transition-colors">{trail.sectionLabel}</Link>
          <span>/</span>
          <Link href={trail.href} className="hover:text-[#1a1a1a] transition-colors">{trail.label}</Link>
          <span>/</span>
          <span className="text-[#5c5c5c]">{spot.name}</span>
        </nav>

        {/* ヘッダー */}
        <header className="pb-8 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-block px-2.5 py-1 rounded text-white text-[11px] font-medium ${sec.bgClass}`}>
              {sec.label}
            </span>
            <AreaBadge area={spot.area} />
            {allCategoryLabels && (
              <span className="text-[12px] text-[#8a8a8a] tracking-[0.04em]">{allCategoryLabels}</span>
            )}
          </div>

          <div className="flex items-start gap-3 mb-5">
            <h1 className="flex-1 text-[28px] lg:text-[32px] font-bold text-[#1a1a1a] leading-[1.4] tracking-[0.02em]">
              {spot.name}
            </h1>
            <div className="shrink-0 mt-1">
              <FavoriteButton
                spotId={spot.id}
                slug={spot.slug}
                initialFavorited={isFavorited}
                size="md"
              />
            </div>
          </div>

          <ShareButtons url={pageUrl} title={spot.name} />
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
                <InfoRow label="エリア" value={spot.area ? (areaMaster[spot.area]?.label ?? null) : null} />
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
          spotType={spot.primary_category === 'gourmet' ? 'Restaurant' : 'TouristAttraction'}
        />

        {/* 関連スポット */}
        <RelatedSpots
          currentSpotId={spot.id}
          section={spot.section as Section}
          primaryCategory={spot.primary_category}
          area={spot.area}
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
