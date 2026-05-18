'use client'

import { useState, useActionState, useTransition, useRef } from 'react'
import { submitPhoto, type PhotoState } from '@/app/actions/photo'
import { supabase } from '@/lib/supabase'

interface Spot {
  id: string
  name: string
}

interface Props {
  spots: Spot[]
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const MAX_IMAGES = 3

async function resizeAndConvert(file: File, maxPx = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('canvas.toBlob failed')),
        'image/webp',
        0.85,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load error')) }
    img.src = url
  })
}

export default function PhotoSubmitForm({ spots }: Props) {
  const [state, formAction] = useActionState<PhotoState, FormData>(submitPhoto, null)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [agree1, setAgree1] = useState(false)
  const [agree2, setAgree2] = useState(false)
  const [agree3, setAgree3] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const canSubmit = uploadedUrls.length > 0 && agree1 && agree2 && agree3 && !uploading

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const remaining = MAX_IMAGES - uploadedUrls.length
    const toProcess = files.slice(0, remaining)
    setUploadError(null)
    setUploading(true)

    try {
      const newUrls: string[] = []
      const newPreviews: string[] = []

      for (const file of toProcess) {
        const blob = await resizeAndConvert(file)
        const ext  = 'webp'
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('photos').upload(path, blob, {
          contentType: 'image/webp',
          upsert: false,
        })
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)
        newUrls.push(publicUrl)
        newPreviews.push(URL.createObjectURL(blob))
      }

      setUploadedUrls((prev) => [...prev, ...newUrls])
      setPreviews((prev) => [...prev, ...newPreviews])
    } catch (err: any) {
      setUploadError(`アップロードに失敗しました: ${err?.message ?? '不明なエラー'}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(index: number) {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="image_urls" value={JSON.stringify(uploadedUrls)} />

      {state?.error && (
        <p className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] px-4 py-3 text-[14px]">
          {state.error}
        </p>
      )}

      {/* 画像アップロード */}
      <section>
        <label className="block text-[14px] font-semibold text-[#1a1a1a] mb-3">
          写真 <span className="text-red-500">*</span>
          <span className="ml-2 text-[12px] font-normal text-[#8a8a8a]">最大{MAX_IMAGES}枚</span>
        </label>

        <div className="grid grid-cols-3 gap-3 mb-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-[8px] overflow-hidden bg-[#f0ece8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-[12px] flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}

          {uploadedUrls.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-[8px] border-2 border-dashed border-[#d0d0d0] flex flex-col items-center justify-center gap-2 text-[#8a8a8a] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="text-[12px]">アップロード中…</span>
              ) : (
                <>
                  <span className="text-[24px] leading-none">＋</span>
                  <span className="text-[11px]">写真を追加</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadError && (
          <p className="text-red-600 text-[13px] mt-2">{uploadError}</p>
        )}
        <p className="text-[12px] text-[#8a8a8a] mt-2">
          JPEG / PNG / WebP / HEIC・1枚10MBまで。自動でリサイズされます。
        </p>
      </section>

      {/* スポット */}
      <section>
        <label htmlFor="spot_id" className="block text-[14px] font-semibold text-[#1a1a1a] mb-3">
          撮影スポット
          <span className="ml-2 text-[12px] font-normal text-[#8a8a8a]">任意</span>
        </label>
        <select
          id="spot_id"
          name="spot_id"
          className="w-full h-[44px] pl-3 pr-8 border border-[#d0d0d0] rounded-[8px] text-[14px] text-[#1a1a1a] bg-white focus:outline-none focus:border-[#5b7e95] appearance-none"
        >
          <option value="">スポットを選択（任意）</option>
          {spots.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </section>

      {/* 撮影時期 */}
      <section>
        <p className="text-[14px] font-semibold text-[#1a1a1a] mb-3">
          撮影時期
          <span className="ml-2 text-[12px] font-normal text-[#8a8a8a]">任意</span>
        </p>
        <div className="flex gap-3">
          <select
            name="visit_year"
            className="h-[44px] pl-3 pr-8 border border-[#d0d0d0] rounded-[8px] text-[14px] text-[#1a1a1a] bg-white focus:outline-none focus:border-[#5b7e95] appearance-none"
          >
            <option value="">年</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            name="visit_month"
            className="h-[44px] pl-3 pr-8 border border-[#d0d0d0] rounded-[8px] text-[14px] text-[#1a1a1a] bg-white focus:outline-none focus:border-[#5b7e95] appearance-none"
          >
            <option value="">月</option>
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </section>

      {/* キャプション */}
      <section>
        <label htmlFor="caption" className="block text-[14px] font-semibold text-[#1a1a1a] mb-3">
          ひとこと
          <span className="ml-2 text-[12px] font-normal text-[#8a8a8a]">任意・200文字以内</span>
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={3}
          maxLength={200}
          placeholder="この写真について一言…"
          className="w-full px-4 py-3 border border-[#d0d0d0] rounded-[8px] text-[14px] text-[#1a1a1a] placeholder-[#c0c0c0] bg-white focus:outline-none focus:border-[#5b7e95] resize-none leading-[1.8]"
        />
      </section>

      {/* 同意チェック */}
      <section className="bg-[#f5f3f0] rounded-[10px] p-5 space-y-4">
        <p className="text-[13px] font-semibold text-[#1a1a1a]">投稿前の確認</p>

        {[
          {
            id: 'agree1',
            value: agree1,
            set: setAgree1,
            label: (
              <>
                撮影した写真はすべて<strong>自分で撮影したもの</strong>、または投稿権限を持つものです。
              </>
            ),
          },
          {
            id: 'agree2',
            value: agree2,
            set: setAgree2,
            label: (
              <>
                写真に<strong>人物が映っている場合</strong>は、本人の同意を得ています。
              </>
            ),
          },
          {
            id: 'agree3',
            value: agree3,
            set: setAgree3,
            label: (
              <>
                <a href="/terms/photos" target="_blank" className="underline text-[#5b7e95] hover:text-[#3d5a6e]">写真投稿ガイドライン</a>
                に同意します。投稿後の削除等については編集部の判断に従います。
              </>
            ),
          },
        ].map(({ id, value, set, label }) => (
          <label key={id} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => set(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#5b7e95] shrink-0"
            />
            <span className="text-[13px] text-[#3a3a3a] leading-[1.7]">{label}</span>
          </label>
        ))}
      </section>

      {/* コイン説明 */}
      <div className="flex items-start gap-3 bg-[#fef8f3] border border-[#f0d8c0] rounded-[8px] px-4 py-3">
        <span className="text-[18px] shrink-0">🪙</span>
        <p className="text-[13px] text-[#7a5030] leading-[1.7]">
          投稿すると<strong>せたなコイン +5</strong> が付与されます。
          写真がピックアップに選ばれるとさらに +10 コインも！
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isPending}
        className="w-full py-4 bg-[#5b7e95] hover:bg-[#3d5a6e] text-white text-[15px] font-medium rounded-[10px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]"
      >
        {isPending ? '投稿中…' : '写真を投稿する'}
      </button>
    </form>
  )
}
