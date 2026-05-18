import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE_URL = 'https://www.setana.life'

interface PageProps {
  params: Promise<{ id: string }>
}

interface PhotoRow {
  id: string
  image_url: string
  caption: string | null
  visit_year: number | null
  visit_month: number | null
  created_at: string
  is_featured: boolean
  users: { id: string; nickname: string | null; line_display_name: string | null; line_picture_url: string | null } | null
  spots: { name: string; slug: string } | null
}

async function getPhoto(id: string): Promise<PhotoRow | null> {
  const { data } = await supabaseAdmin
    .from('photos')
    .select('id,image_url,caption,visit_year,visit_month,created_at,is_featured,users(id,nickname,line_display_name,line_picture_url),spots(name,slug)')
    .eq('id', id)
    .eq('status', 'public')
    .single()
  return data as PhotoRow | null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const photo = await getPhoto(id)
  if (!photo) return { title: '写真が見つかりません' }

  const u = photo.users
  const s = photo.spots
  const nickname = u?.nickname ?? u?.line_display_name ?? '匿名'
  const title = photo.caption
    ? photo.caption.slice(0, 60)
    : s?.name
      ? `${nickname}さんが撮った${s.name}の写真`
      : `${nickname}さんのせたな写真`

  return {
    title,
    description: `${nickname}さんが撮影した北海道せたな町の写真。${s?.name ? `撮影場所：${s.name}。` : ''}みんなのせたなギャラリー。`,
    alternates: { canonical: `${BASE_URL}/photos/${id}` },
    openGraph: {
      title: `${title} | SETANA`,
      images: [{ url: photo.image_url }],
      url: `${BASE_URL}/photos/${id}`,
      siteName: 'SETANA',
      locale: 'ja_JP',
      type: 'website',
    },
  }
}

function formatVisit(year: number | null, month: number | null): string | null {
  if (!year && !month) return null
  if (year && month) return `${year}年${month}月`
  if (year) return `${year}年`
  return `${month}月`
}

export default async function PhotoDetailPage({ params }: PageProps) {
  const { id } = await params
  const photo = await getPhoto(id)
  if (!photo) notFound()

  const u = photo.users
  const s = photo.spots
  const nickname = u?.nickname ?? u?.line_display_name ?? '匿名'
  const visitStr = formatVisit(photo.visit_year, photo.visit_month)
  const pageUrl  = `${BASE_URL}/photos/${id}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: photo.image_url,
    description: photo.caption ?? undefined,
    dateCreated: photo.created_at,
    creator: {
      '@type': 'Person',
      name: nickname,
    },
    contentLocation: s?.name ? { '@type': 'Place', name: s.name } : undefined,
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: photo.image_url,
    },
  }

  // 同じユーザーの他の写真（最大4枚）
  const { data: otherPhotosRaw } = u?.id
    ? await supabaseAdmin
        .from('photos')
        .select('id,image_url,caption,spots(name,slug)')
        .eq('user_id', u.id)
        .eq('status', 'public')
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: null }

  const otherPhotos = (otherPhotosRaw ?? []) as unknown as {
    id: string
    image_url: string
    caption: string | null
    spots: { name: string; slug: string } | null
  }[]

  const shareText = encodeURIComponent(
    (photo.caption ? `${photo.caption} ` : '') + `#みんなのせたな #せたな町 ${pageUrl}`
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#faf8f5]">
        <div className="max-w-[860px] mx-auto px-5 lg:px-8 py-8">

          {/* パンくず */}
          <nav className="flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label mb-6">
            <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
            <span>/</span>
            <Link href="/photos" className="hover:text-[#1a1a1a] transition-colors">みんなのせたな</Link>
            <span>/</span>
            <span className="text-[#5c5c5c] truncate max-w-[160px]">
              {photo.caption?.slice(0, 20) ?? '写真'}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
            {/* メイン画像 */}
            <div>
              <div className="relative w-full overflow-hidden rounded-[12px] bg-[#f0ece8]">
                <Image
                  src={photo.image_url}
                  alt={photo.caption ?? (s?.name ? `${s.name}の写真` : 'せたなの写真')}
                  width={1200}
                  height={900}
                  className="w-full h-auto"
                  unoptimized
                  priority
                />
                {photo.is_featured && (
                  <span className="absolute top-4 left-4 bg-[#c47e4f] text-white text-[11px] font-medium px-3 py-1 rounded nav-label">
                    PICK UP
                  </span>
                )}
              </div>

              {/* キャプション */}
              {photo.caption && (
                <p className="mt-4 text-[15px] text-[#1a1a1a] leading-[1.85] tracking-[0.04em]">
                  {photo.caption}
                </p>
              )}

              {/* SNSシェア */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#efefef]">
                <span className="text-[12px] text-[#8a8a8a] nav-label">シェア</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[12px] rounded-[6px] hover:bg-[#333] transition-colors"
                >
                  <span className="font-bold">X</span>
                  <span>でシェア</span>
                </a>
                <a
                  href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06c755] text-white text-[12px] rounded-[6px] hover:bg-[#05a847] transition-colors"
                >
                  <span>LINE</span>
                </a>
              </div>
            </div>

            {/* サイドバー */}
            <aside className="space-y-6">
              {/* 投稿者 */}
              <div className="bg-white rounded-[10px] border border-[#efefef] p-5">
                <p className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.1em] mb-3">PHOTOGRAPHER</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#5b7e95] to-[#3d5a6e] flex items-center justify-center shrink-0">
                    {u?.line_picture_url ? (
                      <Image
                        src={u.line_picture_url}
                        alt={nickname}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-white font-bold text-[15px]">
                        {nickname.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] font-medium text-[#1a1a1a]">{nickname}</span>
                </div>
              </div>

              {/* 撮影情報 */}
              <div className="bg-white rounded-[10px] border border-[#efefef] p-5 space-y-4">
                {s && (
                  <div>
                    <p className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.1em] mb-1.5">SPOT</p>
                    <Link
                      href={`/spot/${s.slug}`}
                      className="text-[14px] font-medium text-[#5b7e95] hover:underline"
                    >
                      {s.name} →
                    </Link>
                  </div>
                )}
                {visitStr && (
                  <div>
                    <p className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.1em] mb-1.5">VISIT</p>
                    <p className="text-[14px] text-[#1a1a1a]">{visitStr}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.1em] mb-1.5">POSTED</p>
                  <p className="text-[13px] text-[#5c5c5c]">
                    {new Date(photo.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* ギャラリーへ戻る */}
              <Link
                href="/photos"
                className="flex items-center justify-center gap-2 w-full py-3 border border-[#d0d0d0] rounded-[8px] text-[13px] text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors"
              >
                ← ギャラリーに戻る
              </Link>
            </aside>
          </div>

          {/* 同じ投稿者の他の写真 */}
          {otherPhotos.length > 0 && (
            <section className="mt-14 pt-10 border-t border-[#e0e0e0]">
              <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-6 tracking-[0.03em]">
                {nickname}さんの他の写真
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {otherPhotos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/photos/${p.id}`}
                    className="group block overflow-hidden rounded-[8px] bg-[#f0ece8]"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={p.image_url}
                        alt={p.caption ?? '写真'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    </div>
                    {p.spots?.name && (
                      <p className="px-2 py-1.5 text-[11px] text-[#8a8a8a] truncate">{p.spots.name}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
