'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { fetchMorePhotos } from '@/app/actions/photo'
import type { PhotoCard } from '@/lib/types'

interface Props {
  initialPhotos: PhotoCard[]
  initialHasMore: boolean
  filters: { spotId?: string; area?: string; month?: string }
}

function formatVisit(year: number | null, month: number | null): string {
  if (!year && !month) return ''
  if (year && month) return `${year}年${month}月`
  if (year) return `${year}年`
  return `${month}月`
}

function PhotoCardItem({ photo }: { photo: PhotoCard }) {
  return (
    <Link
      href={`/photos/${photo.id}`}
      className="group block overflow-hidden rounded-[8px] bg-[#f0ece8]"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={photo.image_url}
          alt={photo.caption ?? (photo.spot_name ? `${photo.spot_name}の写真` : 'せたなの写真')}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {photo.is_featured && (
          <span className="absolute top-2 left-2 bg-[#c47e4f] text-white text-[10px] font-medium px-2 py-0.5 rounded nav-label">
            PICK UP
          </span>
        )}
      </div>
      <div className="p-3">
        {photo.spot_name && (
          <p className="text-[12px] font-medium text-[#5b7e95] truncate mb-0.5">{photo.spot_name}</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-[#8a8a8a] truncate">{photo.nickname}</p>
          {(photo.visit_year || photo.visit_month) && (
            <p className="text-[10px] text-[#c0c0c0] shrink-0 tabular-nums">
              {formatVisit(photo.visit_year, photo.visit_month)}
            </p>
          )}
        </div>
        {photo.caption && (
          <p className="text-[12px] text-[#5c5c5c] leading-[1.6] mt-1.5 line-clamp-2">{photo.caption}</p>
        )}
      </div>
    </Link>
  )
}

export default function PhotoGrid({ initialPhotos, initialHasMore, filters }: Props) {
  const [photos, setPhotos] = useState<PhotoCard[]>(initialPhotos)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isPending, startTransition] = useTransition()

  function loadMore() {
    startTransition(async () => {
      const result = await fetchMorePhotos(photos.length, filters)
      setPhotos((prev) => [...prev, ...result.photos])
      setHasMore(result.hasMore)
    })
  }

  if (photos.length === 0) {
    return (
      <p className="text-center text-[14px] text-[#8a8a8a] py-16">
        写真がまだありません。最初に投稿してみましょう！
      </p>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {photos.map((photo) => (
          <PhotoCardItem key={photo.id} photo={photo} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-8 py-3 border border-[#c0c0c0] rounded-[8px] text-[14px] text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {isPending ? '読み込み中…' : 'もっと見る'}
          </button>
        </div>
      )}
    </div>
  )
}
