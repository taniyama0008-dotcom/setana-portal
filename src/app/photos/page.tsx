import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { fetchMorePhotos } from '@/app/actions/photo'
import type { PhotoCard } from '@/lib/types'
import PhotoGrid from './PhotoGrid'

export const metadata: Metadata = {
  title: 'みんなのせたな | 写真ギャラリー',
  description: '住民・旅行者が撮ったせたな町のリアルな写真。スポットや季節で絞り込んで、あなたのせたな時間を見つけよう。',
  alternates: { canonical: 'https://www.setana.life/photos' },
  openGraph: {
    title: 'みんなのせたな | SETANA',
    description: '住民・旅行者が撮ったせたな町のリアルな写真ギャラリー。',
    url: 'https://www.setana.life/photos',
    siteName: 'SETANA',
    locale: 'ja_JP',
    type: 'website',
  },
}

const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const AREAS = [
  { value: 'setana',      label: 'せたな' },
  { value: 'kitahiyama',  label: '北檜山' },
  { value: 'taisei',      label: '大成' },
]

interface PageProps {
  searchParams: Promise<{ spot?: string; area?: string; month?: string }>
}

export default async function PhotosPage({ searchParams }: PageProps) {
  const { spot: spotId, area, month } = await searchParams

  const filters = {
    spotId: spotId || undefined,
    area:   area   || undefined,
    month:  month  || undefined,
  }

  const [{ photos: initialPhotos, hasMore }, { data: featuredPhotos }, { data: publicSpots }] = await Promise.all([
    fetchMorePhotos(0, filters),
    supabaseAdmin
      .from('photos')
      .select('id,image_url,caption,visit_year,visit_month,is_featured,users!inner(nickname,line_display_name),spots(name,slug)')
      .eq('status', 'public')
      .eq('is_featured', true)
      .order('featured_at', { ascending: false })
      .limit(3),
    supabaseAdmin
      .from('spots')
      .select('id, name')
      .eq('status', 'public')
      .order('name', { ascending: true }),
  ])

  const featured = (featuredPhotos ?? []).map((row: any) => {
    const u = row.users as { nickname?: string | null; line_display_name?: string | null } | null
    const s = row.spots as { name?: string | null; slug?: string | null } | null
    return {
      id:          row.id as string,
      image_url:   row.image_url as string,
      caption:     row.caption as string | null,
      visit_year:  row.visit_year as number | null,
      visit_month: row.visit_month as number | null,
      is_featured: true,
      nickname:    u?.nickname ?? u?.line_display_name ?? '匿名',
      spot_name:   s?.name ?? null,
      spot_slug:   s?.slug ?? null,
    } satisfies PhotoCard
  })

  const spots = publicSpots ?? []
  const hasFilters = !!(spotId || area || month)

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ─── ヒーロー ──────────────────────────────────── */}
      <section className="bg-[#1a2a35] py-14 lg:py-20 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
          <div className="flex-1">
            <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] nav-label mb-4">
              COMMUNITY PHOTOS
            </p>
            <h1 className="text-white font-light text-[30px] lg:text-[42px] leading-[1.3] tracking-[0.02em] mb-4">
              みんなの<span className="font-bold">せたな</span>
            </h1>
            <p className="text-white/60 text-[14px] lg:text-[15px] leading-[1.9] max-w-[460px]">
              住民・旅行者が撮ったリアルなせたな町の風景。
              あなたの「好き」も、ここに加えてください。
            </p>
          </div>
          <Link
            href="/photos/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#c47e4f] hover:bg-[#a5663a] text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px] self-start lg:self-auto shrink-0"
          >
            <span>＋</span>
            <span>写真を投稿する</span>
          </Link>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-5 lg:px-8 py-12 lg:py-16">

        {/* ─── ピックアップ（フィルタなし時のみ） ─────── */}
        {!hasFilters && featured.length > 0 && (
          <section className="mb-14 lg:mb-20">
            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.25em] nav-label">PICK UP</p>
              <div className="flex-1 h-px bg-[#e0e0e0]" />
            </div>
            <h2 className="text-[22px] font-semibold text-[#1a1a1a] mb-8 tracking-[0.02em]">
              今月のベスト
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((photo) => (
                <Link key={photo.id} href={`/photos/${photo.id}`} className="group block overflow-hidden rounded-[10px] relative">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f0ece8]">
                    <Image
                      src={photo.image_url}
                      alt={photo.caption ?? (photo.spot_name ? `${photo.spot_name}の写真` : 'せたなの写真')}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-[#c47e4f] text-white text-[10px] font-medium px-2 py-0.5 rounded nav-label">
                      PICK UP
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {photo.spot_name && (
                      <p className="text-[13px] font-medium mb-0.5 drop-shadow">{photo.spot_name}</p>
                    )}
                    <p className="text-[11px] text-white/70">{photo.nickname}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── フィルタバー ────────────────────────────── */}
        <section className="mb-8">
          <form className="flex flex-wrap gap-3 items-end">
            {/* スポット */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.08em]">スポット</label>
              <select
                name="spot"
                defaultValue={spotId ?? ''}
                className="h-[40px] pl-3 pr-8 border border-[#d0d0d0] rounded-[6px] text-[13px] text-[#1a1a1a] bg-white focus:outline-none focus:border-[#5b7e95] appearance-none min-w-[140px]"
              >
                <option value="">すべて</option>
                {spots.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* エリア */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.08em]">エリア</label>
              <select
                name="area"
                defaultValue={area ?? ''}
                className="h-[40px] pl-3 pr-8 border border-[#d0d0d0] rounded-[6px] text-[13px] text-[#1a1a1a] bg-white focus:outline-none focus:border-[#5b7e95] appearance-none"
              >
                <option value="">すべて</option>
                {AREAS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* 月 */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-[#8a8a8a] nav-label tracking-[0.08em]">訪問月</label>
              <select
                name="month"
                defaultValue={month ?? ''}
                className="h-[40px] pl-3 pr-8 border border-[#d0d0d0] rounded-[6px] text-[13px] text-[#1a1a1a] bg-white focus:outline-none focus:border-[#5b7e95] appearance-none"
              >
                <option value="">すべて</option>
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>{m}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-[40px] px-5 bg-[#5b7e95] hover:bg-[#3d5a6e] text-white text-[13px] rounded-[6px] transition-colors"
            >
              絞り込む
            </button>

            {hasFilters && (
              <Link
                href="/photos"
                className="h-[40px] px-4 flex items-center border border-[#d0d0d0] rounded-[6px] text-[13px] text-[#8a8a8a] hover:text-[#1a1a1a] hover:border-[#8a8a8a] transition-colors"
              >
                クリア
              </Link>
            )}
          </form>
        </section>

        {/* ─── 写真グリッド ─────────────────────────────── */}
        <PhotoGrid
          initialPhotos={initialPhotos}
          initialHasMore={hasMore}
          filters={filters}
        />
      </div>
    </div>
  )
}
