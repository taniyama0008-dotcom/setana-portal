'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SpotImage } from '@/lib/types'

interface SpotGalleryProps {
  images: SpotImage[]
  coverImage: string | null
  spotName: string
  gradient: string  // e.g. 'from-[#5b7e95] to-[#3d5a6e]'
}

export default function SpotGallery({ images, coverImage, spotName, gradient }: SpotGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Build display list: DB images first, then cover_image as fallback if no DB images
  const allImages: { url: string; alt: string }[] = images.length > 0
    ? images.map((img) => ({ url: img.image_url, alt: img.alt_text ?? spotName }))
    : coverImage
    ? [{ url: coverImage, alt: spotName }]
    : []

  const active = allImages[activeIdx] ?? null

  return (
    <>
      {/* メイン画像 */}
      <div className="relative w-full aspect-[16/9] bg-[#1a1a1a] overflow-hidden">
        {active ? (
          <>
            <Image
              src={active.url}
              alt={active.alt}
              fill
              className="object-cover cursor-zoom-in"
              priority
              unoptimized
              onClick={() => setLightbox(activeIdx)}
            />
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          </>
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}

        {/* 枚数バッジ */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[12px] px-2.5 py-1 rounded-full">
            {activeIdx + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* サムネイル行 */}
      {allImages.length > 1 && (
        <div className="bg-[#111] px-4 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {allImages.slice(0, 5).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-16 h-11 rounded overflow-hidden transition-opacity focus:outline-none ${
                  i === activeIdx ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-80'
                }`}
                aria-label={`画像 ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={64}
                  height={44}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ライトボックス */}
      {lightbox !== null && allImages[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="画像を拡大表示"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-[22px] w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>

          {/* 前へ */}
          {lightbox > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-[28px] w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              aria-label="前の画像"
            >
              ‹
            </button>
          )}

          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={allImages[lightbox].url}
              alt={allImages[lightbox].alt}
              width={1200}
              height={800}
              className="w-full max-h-[85vh] object-contain rounded-lg"
              unoptimized
            />
          </div>

          {/* 次へ */}
          {lightbox < allImages.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-[28px] w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
              aria-label="次の画像"
            >
              ›
            </button>
          )}

          {allImages.length > 1 && (
            <div className="absolute bottom-4 flex gap-1.5 left-1/2 -translate-x-1/2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-2 h-2 rounded-full transition-colors ${i === lightbox ? 'bg-white' : 'bg-white/40'}`}
                  aria-label={`画像 ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
