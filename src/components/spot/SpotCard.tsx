import Link from 'next/link'
import Image from 'next/image'
import type { Spot } from '@/lib/types'
import { sectionBadge, formatSpotCategories } from '@/lib/taxonomy'
import AreaBadge from './AreaBadge'
import FavoriteButton from './FavoriteButton'

interface SpotCardProps {
  spot: Spot
}

export default function SpotCard({ spot }: SpotCardProps) {
  const sec = sectionBadge[spot.section] ?? sectionBadge.travel
  const categoryText = formatSpotCategories(spot.section, spot.primary_category, spot.sub_categories ?? [])

  return (
    <div className="relative group">
      <Link href={`/spot/${spot.slug}`} className="block">
        <article className="bg-white rounded-[8px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
          {/* 写真エリア (3:2 aspect ratio) */}
          <div className="relative aspect-[3/2] overflow-hidden">
            {spot.cover_image ? (
              <Image
                src={spot.cover_image}
                alt={spot.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${sec.gradient}`} />
            )}
          </div>

          {/* テキストエリア */}
          <div className="p-5 pb-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`inline-block px-2 py-0.5 rounded text-white text-[11px] font-medium ${sec.bgClass}`}>
                {sec.label}
              </span>
              <AreaBadge area={spot.area} />
            </div>
            <h3 className="text-[15px] font-medium text-[#1a1a1a] leading-snug mb-1">
              {spot.name}
            </h3>
            {categoryText && (
              <p className="text-[12px] text-[#8a8a8a] tracking-[0.04em] mb-0.5">
                {categoryText}
              </p>
            )}
          </div>
        </article>
      </Link>

      {/* お気に入りボタン（写真右上） */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <FavoriteButton spotId={spot.id} slug={spot.slug} size="sm" />
      </div>
    </div>
  )
}
