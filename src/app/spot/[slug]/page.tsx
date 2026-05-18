import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '@/lib/supabase'
import { getSessionUserId } from '@/lib/session'
import type { Spot, SpotImage, FaqItem, VideoItem } from '@/lib/types'
import { categoryMaster, sectionBadge, areaMaster, getCategoryLabel, getCategoryPath, type Section } from '@/lib/taxonomy'
import ReviewSection from '@/components/reviews/ReviewSection'
import RelatedSpots from '@/components/spot/RelatedSpots'
import AreaBadge from '@/components/spot/AreaBadge'
import SpotGallery from '@/components/spot/SpotGallery'
import FavoriteButton from '@/components/spot/FavoriteButton'
import ShareButtons from '@/components/spot/ShareButtons'
import { fetchSpotPhotos } from '@/app/actions/photo'

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

function buildFaqJsonLd(faq: FaqItem[], pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

function buildVideoJsonLd(video: VideoItem, spotName: string) {
  const embedUrl = getEmbedUrl(video)
  const thumbnailUrl = getYoutubeThumbnail(video)
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title || spotName,
    description: video.title || spotName,
    ...(embedUrl && { embedUrl }),
    ...(thumbnailUrl && { thumbnailUrl }),
  }
}

function getEmbedUrl(video: VideoItem): string | null {
  const { platform, url } = video
  if (platform === 'youtube') {
    const watchId = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1]
    const shortId = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)?.[1]
    const id = watchId ?? shortId
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (platform === 'tiktok') {
    const id = url.match(/video\/(\d+)/)?.[1]
    return id ? `https://www.tiktok.com/embed/v2/${id}` : null
  }
  if (platform === 'instagram') {
    const shortcode = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/)?.[1]
    return shortcode ? `https://www.instagram.com/p/${shortcode}/embed/` : null
  }
  return null
}

function getYoutubeThumbnail(video: VideoItem): string | undefined {
  if (video.platform !== 'youtube') return undefined
  const watchId = video.url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1]
  const shortId = video.url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)?.[1]
  const id = watchId ?? shortId
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : undefined
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

  const [{ data: spotImagesRaw }, userId, { photos: spotCommunityPhotos, total: spotPhotosTotal }] = await Promise.all([
    supabase
      .from('spot_images')
      .select('*')
      .eq('spot_id', spot.id)
      .order('sort_order', { ascending: true }),
    getSessionUserId(),
    fetchSpotPhotos(spot.id, 8),
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

  const faq    = (Array.isArray(spot.faq)    ? spot.faq    : []) as FaqItem[]
  const videos = (Array.isArray(spot.videos) ? spot.videos : []) as VideoItem[]
  const validVideos = videos.filter((v) => getEmbedUrl(v) !== null)

  // 全カテゴリラベル（プライマリ + サブ）
  const allCategoryLabels = [spot.primary_category, ...(spot.sub_categories ?? [])]
    .map((k) => getCategoryLabel(spot.section as Section, k))
    .filter(Boolean)
    .join('・')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(spot)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(spot, trail)) }} />
      {faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(faq, pageUrl)) }} />
      )}
      {validVideos.map((v, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildVideoJsonLd(v, spot.name)) }} />
      ))}

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
            <div className="max-w-[680px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-[20px] font-semibold text-[#1a1a1a] mt-10 mb-4 tracking-[0.02em]">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-[17px] font-semibold text-[#1a1a1a] mt-8 mb-3 tracking-[0.02em]">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em] mb-6">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[15px] text-[#1a1a1a] leading-[1.8] tracking-[0.05em]">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-[#5b7e95] underline underline-offset-2 hover:text-[#3d5a6e] transition-colors"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#1a1a1a]">{children}</strong>
                  ),
                  hr: () => <hr className="border-[#e0e0e0] my-8" />,
                }}
              >
                {spot.description}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* 動画 */}
        {validVideos.length > 0 && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-6 tracking-[0.03em]">動画</h2>
            <div className="space-y-6">
              {validVideos.map((video, i) => {
                const embedUrl = getEmbedUrl(video)!
                return (
                  <div key={i}>
                    {video.title && (
                      <p className="text-[14px] font-medium text-[#1a1a1a] mb-3 tracking-[0.03em]">{video.title}</p>
                    )}
                    <div className="rounded-[8px] overflow-hidden aspect-video">
                      <iframe
                        src={embedUrl}
                        title={video.title || `${spot.name} 動画 ${i + 1}`}
                        width="100%"
                        height="100%"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                        style={{ border: 0 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
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

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <h2 className="text-[18px] font-semibold text-[#1a1a1a] mb-6 tracking-[0.03em]">よくある質問</h2>
            <div className="space-y-2">
              {faq.map((item, i) => (
                <details key={i} className="group border border-[#e0e0e0] rounded-[8px] overflow-hidden">
                  <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none hover:bg-[#faf8f5] transition-colors">
                    <span className="text-[13px] font-semibold text-[#5b7e95] shrink-0 w-5">Q</span>
                    <span className="flex-1 text-[14px] font-medium text-[#1a1a1a] leading-[1.6] tracking-[0.03em] pr-2">
                      {item.question}
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="shrink-0 text-[#8a8a8a] group-open:rotate-180 transition-transform duration-200"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <div className="flex gap-3 px-5 pb-5 pt-1 bg-[#faf8f5]">
                    <span className="text-[13px] font-semibold text-[#c47e4f] shrink-0 w-5 pt-0.5">A</span>
                    <p className="text-[14px] text-[#1a1a1a] leading-[1.85] tracking-[0.05em]">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
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

        {/* みんなの写真 */}
        {spotCommunityPhotos.length > 0 && (
          <section className="py-10 border-b border-[#e0e0e0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-semibold text-[#1a1a1a] tracking-[0.03em]">
                ここで撮られた写真
                <span className="ml-2 text-[13px] font-normal text-[#8a8a8a]">{spotPhotosTotal}枚</span>
              </h2>
              {spotPhotosTotal > 8 && (
                <Link
                  href={`/photos?spot=${spot.id}`}
                  className="text-[13px] text-[#5b7e95] hover:underline"
                >
                  すべて見る →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {spotCommunityPhotos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/photos/${photo.id}`}
                  className="group block overflow-hidden rounded-[6px] bg-[#f0ece8]"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={photo.image_url}
                      alt={photo.caption ?? `${spot.name}の写真`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                      sizes="(max-width: 860px) 25vw, 200px"
                    />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/photos/new"
                className="inline-flex items-center gap-1.5 text-[13px] text-[#5b7e95] hover:underline"
              >
                <span>＋</span>
                <span>あなたの写真を投稿する</span>
              </Link>
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
