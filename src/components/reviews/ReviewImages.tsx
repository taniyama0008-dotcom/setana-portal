'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ReviewImage } from '@/lib/types'

export default function ReviewImages({ images }: { images: ReviewImage[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      {/* サムネイル行 */}
      <div className="flex gap-2 mt-3 ml-11 flex-wrap">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5b7e95] focus:ring-offset-1"
            aria-label={`画像 ${i + 1} を拡大表示`}
          >
            <Image
              src={img.image_url}
              alt={img.alt_text ?? `口コミ画像 ${i + 1}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* ライトボックス */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="画像を拡大表示"
        >
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white text-[24px] leading-none w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>

          {/* 拡大画像 */}
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIdx].image_url}
              alt={images[lightboxIdx].alt_text ?? `口コミ画像 ${lightboxIdx + 1}`}
              width={1200}
              height={900}
              className="w-full max-h-[80vh] object-contain rounded-lg"
              unoptimized
            />
          </div>

          {/* 複数枚のドットナビ */}
          {images.length > 1 && (
            <div className="absolute bottom-5 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIdx(i)
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === lightboxIdx ? 'bg-white' : 'bg-white/40'
                  }`}
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
