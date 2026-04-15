'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import type { SpotImage } from '@/lib/types'
import { addSpotImage, deleteSpotImage, moveSpotImageUp, moveSpotImageDown } from '@/app/actions/admin'
import { supabase } from '@/lib/supabase'

async function resizeImage(file: File, maxWidth = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('resize failed')) },
        'image/jpeg',
        0.88,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('load failed')) }
    img.src = objectUrl
  })
}

export default function SpotImageManager({
  spotId,
  initialImages,
}: {
  spotId: string
  initialImages: SpotImage[]
}) {
  const [images, setImages]           = useState(initialImages)
  const [url, setUrl]                 = useState('')
  const [alt, setAlt]                 = useState('')
  const [isPending, start]            = useTransition()
  const [uploadProgress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef                       = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (!url.trim()) return
    start(async () => {
      await addSpotImage(spotId, url.trim(), alt.trim())
      setUrl('')
      setAlt('')
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    e.target.value = ''

    setUploadError(null)
    setProgress({ done: 0, total: files.length })

    for (let i = 0; i < files.length; i++) {
      try {
        const blob = await resizeImage(files[i])
        const path = `spots/${spotId}/${Date.now()}_${i}.jpg`
        const { error: upErr } = await supabase.storage
          .from('spots')
          .upload(path, blob, { contentType: 'image/jpeg' })
        if (upErr) throw upErr
        const { data } = supabase.storage.from('spots').getPublicUrl(path)
        // server action で spot_images に INSERT
        await addSpotImage(spotId, data.publicUrl, '')
        setProgress({ done: i + 1, total: files.length })
      } catch (err) {
        setUploadError(`${files[i].name} のアップロードに失敗しました。`)
        break
      }
    }

    setProgress(null)
  }

  return (
    <div className="space-y-6">
      {/* ── ファイルアップロード ── */}
      <div className="bg-white border border-[#e0e0e0] rounded-[8px] p-5">
        <p className="text-[13px] font-medium text-[#5c5c5c] mb-3">ファイルをアップロード</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          disabled={isPending || uploadProgress !== null}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-3 border border-dashed border-[#c8c8c8] rounded-[8px] bg-[#faf8f5] hover:bg-[#f0eeeb] text-[13px] text-[#5c5c5c] transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          画像を選択（複数可）
        </button>

        {/* プログレスバー */}
        {uploadProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[12px] text-[#5c5c5c] mb-1">
              <span>アップロード中...</span>
              <span>{uploadProgress.done} / {uploadProgress.total}</span>
            </div>
            <div className="w-full bg-[#e0e0e0] rounded-full h-1.5">
              <div
                className="bg-[#5b7e95] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        {uploadError && (
          <p className="mt-2 text-[12px] text-[#d94f4f]">{uploadError}</p>
        )}
        <p className="mt-2 text-[11px] text-[#8a8a8a]">最大幅1600pxに自動リサイズ。Supabase Storage の spots バケットに保存されます。</p>
      </div>

      {/* ── URL入力 ── */}
      <div className="bg-[#faf8f5] rounded-[8px] p-5 border border-[#e0e0e0]">
        <p className="text-[13px] font-medium text-[#5c5c5c] mb-3">URLで追加</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="url"
            placeholder="https://... 画像URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 min-w-[220px] border border-[#e0e0e0] rounded-[6px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#5b7e95] bg-white"
          />
          <input
            type="text"
            placeholder="alt テキスト（省略可）"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            className="w-[160px] border border-[#e0e0e0] rounded-[6px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#5b7e95] bg-white"
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
            <Image src={url} alt="プレビュー" width={160} height={90} className="rounded-[4px] object-cover border border-[#e0e0e0]" unoptimized onError={() => {}} />
          </div>
        )}
      </div>

      {/* ── 画像リスト ── */}
      {images.length === 0 ? (
        <p className="text-[13px] text-[#8a8a8a] py-4">画像がありません。上から追加してください。</p>
      ) : (
        <ul className="space-y-3">
          {images.map((img, i) => (
            <li key={img.id} className="flex items-center gap-3 bg-white border border-[#efefef] rounded-[8px] p-3">
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
                {img.alt_text && <p className="text-[11px] text-[#8a8a8a]">{img.alt_text}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={isPending || i === 0}
                  onClick={() => start(async () => { await moveSpotImageUp(img.id, spotId) })}
                  className="w-7 h-7 flex items-center justify-center text-[#5c5c5c] hover:text-[#1a1a1a] disabled:opacity-30 transition-colors"
                  aria-label="上へ"
                >↑</button>
                <button
                  type="button"
                  disabled={isPending || i === images.length - 1}
                  onClick={() => start(async () => { await moveSpotImageDown(img.id, spotId) })}
                  className="w-7 h-7 flex items-center justify-center text-[#5c5c5c] hover:text-[#1a1a1a] disabled:opacity-30 transition-colors"
                  aria-label="下へ"
                >↓</button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm('この画像を削除しますか？')) return
                    setImages(prev => prev.filter(im => im.id !== img.id))
                    start(async () => { await deleteSpotImage(img.id, spotId) })
                  }}
                  className="w-7 h-7 flex items-center justify-center text-[#8a8a8a] hover:text-[#d94f4f] disabled:opacity-50 transition-colors"
                  aria-label="削除"
                >✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
