import Link from 'next/link'
import Image from 'next/image'
import type { Spot } from '@/lib/types'

const sectionConfig = {
  kurashi: {
    label: '暮らし',
    bgClass: 'bg-[#5b7e95]',
    gradient: 'from-[#5b7e95] to-[#3d5a6e]',
  },
  shoku: {
    label: '食',
    bgClass: 'bg-[#c47e4f]',
    gradient: 'from-[#c47e4f] to-[#a5663a]',
  },
  shizen: {
    label: '自然',
    bgClass: 'bg-[#6b8f71]',
    gradient: 'from-[#6b8f71] to-[#4a6b50]',
  },
}

interface SpotCardProps {
  spot: Spot
}

export default function SpotCard({ spot }: SpotCardProps) {
  const config = sectionConfig[spot.section]

  return (
    <Link href={`/spot/${spot.slug}`} className="group block">
      <article className="bg-white rounded-[8px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
        {/* 写真エリア (3:2 aspect ratio) */}
        <div className="relative aspect-[3/2] overflow-hidden">
          {spot.cover_image ? (
            <Image
              src={spot.cover_image}
              alt={spot.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${config.gradient}`} />
          )}
        </div>

        {/* テキストエリア */}
        <div className="p-5 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-block px-2 py-0.5 rounded text-white text-[11px] font-medium ${config.bgClass}`}>
              {config.label}
            </span>
            <span className="text-[12px] text-[#8a8a8a] tracking-[0.04em]">
              {spot.category}
            </span>
          </div>
          <h3 className="text-[15px] font-medium text-[#1a1a1a] leading-snug mb-1">
            {spot.name}
          </h3>
          <p className="text-[12px] text-[#8a8a8a] tracking-[0.04em]">
            {spot.area}
          </p>
        </div>
      </article>
    </Link>
  )
}
