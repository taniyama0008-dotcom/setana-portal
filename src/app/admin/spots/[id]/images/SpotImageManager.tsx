'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import type { SpotImage } from '@/lib/types'
import { addSpotImage, deleteSpotImage, moveSpotImageUp, moveSpotImageDown } from '@/app/actions/admin'

export default function SpotImageManager({
  spotId,
  initialImages,
}: {
  spotId: string
  initialImages: SpotImage[]
}) {
  const [images, setImages] = useState(initialImages)
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')
  const [isPending, start] = useTransition()

  const handleAdd = () => {
    if (!url.trim()) return
    start(async () => {
      await addSpotImage(spotId, url.trim(), alt.trim())
      setUrl('')
      setAlt('')
    })
  }

  return (
    <div className="space-y-6">
      {/* 追加フォーム */}
      <div className="bg-[#faf8f5] rounded-[8px] p-5 border border-[#e0e0e0]">
        <p className="text-[13px] font-medium text-[#5c5c5c] mb-3">画像を追加（URL入力）</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="url"
            placeholder="https://... 画像URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 min-w-[220px] border border-[#e0e0e0] rounded-[6px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#5b7e95]"
          />
          <input
            type="text"
            placeholder="alt テキスト（省略可）"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-[160px] border border-[#e0e0e0] rounded-[6px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#5b7e95]"
          />
          <button
            type="button"
            disabled={isPending || !url.trim()}
            onClick={handleAdd}
            className="px-4 py-2 bg-[#5b7e95] hover:bg-[#3d5a6e] disabled:opacity-50 text-white text-[13px] font-medium rounded-[6px] transition-colors"
          >
            追加
          </button>
        </div>
        {url && (
          <div className="mt-3">
            <p className="text-[11px] text-[#8a8a8a] mb-1">プレビュー</p>
            <Image
              src={url}
              alt="プレビュー"
              width={160}
              height={90}
              className="rounded-[4px] object-cover border border-[#e0e0e0]"
              unoptimized
              onError={() => {}}
            />
          </div>
        )}
      </div>

      {/* 画像リスト */}
      {images.length === 0 ? (
        <p className="text-[13px] text-[#8a8a8a] py-4">画像がありません。上のフォームから追加してください。</p>
      ) : (
        <ul className="space-y-3">
          {images.map((img, i) => (
            <li
              key={img.id}
              className="flex items-center gap-3 bg-white border border-[#efefef] rounded-[8px] p-3"
            >
              <Image
                src={img.image_url}
                alt={img.alt_text ?? `画像 ${i + 1}`}
                width={80}
                height={56}
                className="rounded-[4px] object-cover shrink-0 border border-[#e0e0e0]"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#1a1a1a] truncate">{img.image_url}</p>
                {img.alt_text && (
                  <p className="text-[11px] text-[#8a8a8a]">{img.alt_text}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={isPending || i === 0}
                  onClick={() => start(async () => { await moveSpotImageUp(img.id, spotId) })}
                  className="w-7 h-7 flex items-center justify-center text-[#5c5c5c] hover:text-[#1a1a1a] disabled:opacity-30 transition-colors"
                  aria-label="上へ"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={isPending || i === images.length - 1}
                  onClick={() => start(async () => { await moveSpotImageDown(img.id, spotId) })}
                  className="w-7 h-7 flex items-center justify-center text-[#5c5c5c] hover:text-[#1a1a1a] disabled:opacity-30 transition-colors"
                  aria-label="下へ"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm('この画像を削除しますか？')) return
                    setImages((prev) => prev.filter((im) => im.id !== img.id))
                    start(async () => { await deleteSpotImage(img.id, spotId) })
                  }}
                  className="w-7 h-7 flex items-center justify-center text-[#8a8a8a] hover:text-[#d94f4f] disabled:opacity-50 transition-colors"
                  aria-label="削除"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
