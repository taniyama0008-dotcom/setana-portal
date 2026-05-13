'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import type { SpotImage } from '@/lib/types'
import { addSpotImage, deleteSpotImage, moveSpotImageUp, moveSpotImageDown, updateSpotImageType } from '@/app/actions/admin'
import { syncSpotCoverImage } from '@/app/actions/spotCover'

const MAX = 20

type ImageType = 'cover' | 'inline' | 'gallery'

const imageTypeOptions: { value: ImageType; label: string; desc: string }[] = [
  { value: 'inline',  label: 'インライン（1600px）', desc: '本文・ギャラリー用。デフォルト' },
  { value: 'cover',   label: 'カバー（2000px）',     desc: '一覧・詳細ヒーロー用。大きめ' },
  { value: 'gallery', label: 'ギャラリー（2400px）', desc: 'ライトボックス拡大表示用' },
]

const imageTypeBadge: Record<ImageType, string> = {
  cover:   'bg-[#c47e4f]/10 text-[#c47e4f]',
  inline:  'bg-[#e8f0f4] text-[#4a6e83]',
  gallery: 'bg-[#e8f0ea] text-[#3d6b45]',
}

export default function SpotImageManager({
  spotId,
  spotSlug,
  initialImages,
}: {
  spotId: string
  spotSlug: string
  initialImages: SpotImage[]
}) {
  const [images, setImages]           = useState(initialImages)
  const [url, setUrl]                 = useState('')
  const [alt, setAlt]                 = useState('')
  const [imageType, setImageType]     = useState<ImageType>('inline')
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [isPending, start]            = useTransition()
  const [uploadProgress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef                       = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (!url.trim() || images.length >= MAX) return
    start(async () => {
      await addSpotImage(spotId, url.trim(), alt.trim(), imageType)
      await syncSpotCoverImage(spotId)
      setUrl('')
      setAlt('')
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files ?? [])
    if (allFiles.length === 0) return
    e.target.value = ''

    const remaining = MAX - images.length
    if (remaining <= 0) return
    const files = allFiles.slice(0, remaining)

    setUploadError(null)
    setProgress({ done: 0, total: files.length })

    for (let i = 0; i < files.length; i++) {
      try {
        const fd = new FormData()
        fd.append('file',      files[i])
        fd.append('spotId',    spotId)
        fd.append('spotSlug',  spotSlug)
        fd.append('imageType', imageType)
        fd.append('altText',   '')

        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          throw new Error(json.error ?? 'アップロードに失敗しました')
        }
        const { image } = await res.json()
        setImages(prev => [...prev, image as SpotImage])
        setProgress({ done: i + 1, total: files.length })
      } catch (err) {
        setUploadError(
          `${files[i].name} のアップロードに失敗しました。${err instanceof Error ? err.message : ''}`
        )
        break
      }
    }

    setProgress(null)
  }

  const atLimit = images.length >= MAX

  return (
    <div className="space-y-6">

      {/* ── 画像タイプ選択 ── */}
      <div className="bg-[#faf8f5] border border-[#e0e0e0] rounded-[8px] p-5">
        <p className="text-[13px] font-medium text-[#5c5c5c] mb-3">画像タイプ（アップロード時に適用）</p>
        <div className="flex flex-wrap gap-5">
          {imageTypeOptions.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageType"
                value={opt.value}
                checked={imageType === opt.value}
                onChange={() => setImageType(opt.value)}
                className="mt-0.5 accent-[#5b7e95]"
              />
              <span>
                <span className="text-[13px] font-medium text-[#1a1a1a]">{opt.label}</span>
                <span className="block text-[11px] text-[#8a8a8a]">{opt.desc}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-[#8a8a8a] mt-2.5">
          サーバー側でリサイズ・WebP変換・EXIF削除（位置情報除去）を行います。
        </p>
      </div>

      {/* ── ファイルアップロード ── */}
      <div className="bg-white border border-[#e0e0e0] rounded-[8px] p-5">
        <p className="text-[13px] font-medium text-[#5c5c5c] mb-3">ファイルをアップロード</p>
        {atLimit ? (
          <p className="text-[13px] text-[#8a8a8a]">最大 {MAX} 枚です</p>
        ) : (
          <>
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
          </>
        )}

        {uploadProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[12px] text-[#5c5c5c] mb-1">
              <span>処理中（リサイズ・WebP変換）...</span>
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
        {!atLimit && (
          <p className="mt-2 text-[11px] text-[#8a8a8a]">
            保存先: <code className="bg-[#f0f0f0] px-1 rounded text-[11px]">spots/{spotSlug}/</code>
            &nbsp;・&nbsp;最大 {MAX} 枚
          </p>
        )}
      </div>

      {/* ── URL入力 ── */}
      {!atLimit && (
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
          <p className="mt-2 text-[11px] text-[#8a8a8a]">※ URLで追加した画像はリサイズ・変換されません。</p>
        </div>
      )}

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
                <div className="flex items-center gap-2 mt-0.5">
                  {img.alt_text && <p className="text-[11px] text-[#8a8a8a]">{img.alt_text}</p>}
                  {/* image_type バッジ — クリックでインライン編集 */}
                  {editingTypeId === img.id ? (
                    <select
                      value={img.image_type ?? 'inline'}
                      autoFocus
                      onBlur={() => setEditingTypeId(null)}
                      onChange={(e) => {
                        const newType = e.target.value as ImageType
                        setImages(prev => prev.map(im => {
                          if (im.id === img.id) return { ...im, image_type: newType }
                          if (newType === 'cover' && im.image_type === 'cover') return { ...im, image_type: 'inline' }
                          return im
                        }))
                        setEditingTypeId(null)
                        start(async () => { await updateSpotImageType(img.id, spotId, newType) })
                      }}
                      className="text-[11px] border border-[#5b7e95] rounded px-1 py-0.5 bg-white focus:outline-none"
                    >
                      {imageTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label.split('（')[0]}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingTypeId(img.id)}
                      title="クリックで変更"
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium cursor-pointer hover:opacity-70 transition-opacity ${imageTypeBadge[img.image_type ?? 'inline'] ?? imageTypeBadge.inline}`}
                    >
                      {img.image_type ?? 'inline'}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={isPending || i === 0}
                  onClick={() => start(async () => {
                    await moveSpotImageUp(img.id, spotId)
                    await syncSpotCoverImage(spotId)
                  })}
                  className="w-7 h-7 flex items-center justify-center text-[#5c5c5c] hover:text-[#1a1a1a] disabled:opacity-30 transition-colors"
                  aria-label="上へ"
                >↑</button>
                <button
                  type="button"
                  disabled={isPending || i === images.length - 1}
                  onClick={() => start(async () => {
                    await moveSpotImageDown(img.id, spotId)
                    await syncSpotCoverImage(spotId)
                  })}
                  className="w-7 h-7 flex items-center justify-center text-[#5c5c5c] hover:text-[#1a1a1a] disabled:opacity-30 transition-colors"
                  aria-label="下へ"
                >↓</button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm('この画像を削除しますか？')) return
                    setImages(prev => prev.filter(im => im.id !== img.id))
                    start(async () => {
                      await deleteSpotImage(img.id, spotId)
                      await syncSpotCoverImage(spotId)
                    })
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
