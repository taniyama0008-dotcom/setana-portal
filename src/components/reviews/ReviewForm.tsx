'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { submitReview } from '@/app/actions/review'
import { supabase } from '@/lib/supabase'

interface ReviewFormProps {
  spotId: string
  slug: string
  dbNickname?: string  // ログイン済みユーザーの表示名（サーバーから渡す）
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="星評価">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n}点`}
          className={`text-[28px] leading-none transition-colors select-none min-w-[44px] min-h-[44px] flex items-center justify-center ${
            n <= active ? 'text-[#c47e4f]' : 'text-[#e0e0e0]'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

async function resizeImage(file: File, maxWidth = 1200): Promise<Blob> {
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
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('canvas.toBlob failed'))
        },
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('image load failed'))
    }
    img.src = objectUrl
  })
}

export default function ReviewForm({ spotId, slug, dbNickname }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isPending, setIsPending] = useState(false)
  const [state, setState] = useState<{ success?: boolean; error?: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (state?.success) {
    return (
      <div className="py-8 px-6 bg-[#faf8f5] rounded-[8px] text-center">
        <p className="text-[22px] mb-2">ありがとうございます</p>
        <p className="text-[14px] text-[#5c5c5c]">口コミを投稿しました。</p>
      </div>
    )
  }

  const isLoggedIn = dbNickname !== undefined

  if (!isLoggedIn) {
    return (
      <div className="py-8 text-center">
        <p className="text-[14px] text-[#5c5c5c] mb-4">口コミを投稿するにはログインが必要です。</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#c47e4f] hover:bg-[#a5663a] text-white text-[14px] font-medium rounded-[8px] transition-colors"
        >
          ログインして口コミを投稿
        </Link>
      </div>
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 3 - images.length
    const newFiles = files.slice(0, remaining)
    if (newFiles.length === 0) return

    setImages((prev) => [...prev, ...newFiles])
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target!.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setState(null)

    try {
      // 画像をアップロード
      const imageUrls: string[] = []
      if (images.length > 0) {
        const tempId = crypto.randomUUID()
        for (let i = 0; i < images.length; i++) {
          const blob = await resizeImage(images[i])
          const path = `reviews/${tempId}/${i}.jpg`
          const { error: uploadError } = await supabase.storage
            .from('reviews')
            .upload(path, blob, { contentType: 'image/jpeg' })
          if (uploadError) throw uploadError
          const { data } = supabase.storage.from('reviews').getPublicUrl(path)
          imageUrls.push(data.publicUrl)
        }
      }

      // フォームデータを組み立てる
      const formData = new FormData(e.currentTarget)
      formData.set('image_urls', JSON.stringify(imageUrls))

      const result = await submitReview(null, formData)
      setState(result)
    } catch (err) {
      console.error('review submit error:', err)
      setState({ error: '投稿に失敗しました。もう一度お試しください。' })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="spot_id" value={spotId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      {/* エラー */}
      {state?.error && (
        <p className="text-[13px] text-[#d94f4f] bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] px-4 py-3">
          {state.error}
        </p>
      )}

      {/* 星評価 */}
      <div>
        <label className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          評価 <span className="text-[#d94f4f]">*</span>
        </label>
        <StarPicker value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-[12px] text-[#8a8a8a] mt-1">
            {['', 'とても残念', 'いまひとつ', '普通', 'よかった', 'とても良かった'][rating]}
          </p>
        )}
      </div>

      {/* 投稿者表示名 */}
      <div>
        <label className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          投稿者 <span className="text-[#d94f4f]">*</span>
        </label>
        <div className="flex items-center gap-3 py-2">
          <div className="w-9 h-9 rounded-full bg-[#e8f0f5] flex items-center justify-center text-[#5b7e95] text-[14px] font-medium shrink-0">
            {dbNickname!.slice(0, 1)}
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#1a1a1a]">{dbNickname}</p>
            <p className="text-[11px] text-[#8a8a8a]">マイページから変更できます</p>
          </div>
          <input type="hidden" name="nickname" value={dbNickname} />
        </div>
      </div>

      {/* 口コミ本文 */}
      <div>
        <label htmlFor="review-text" className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          口コミ
        </label>
        <textarea
          id="review-text"
          name="text"
          rows={4}
          maxLength={1000}
          placeholder="このスポットの感想を書いてください"
          className="w-full bg-white border border-[#e0e0e0] rounded-[6px] px-4 py-3 text-[15px] text-[#1a1a1a] leading-[1.8] focus:outline-none focus:border-[#5b7e95] transition-colors resize-none"
        />
      </div>

      {/* 写真を追加 */}
      <div>
        <label className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          写真（最大3枚）
        </label>

        {/* サムネイルプレビュー */}
        {previews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={src}
                  alt={`選択画像 ${i + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[11px] leading-none transition-colors"
                  aria-label={`画像 ${i + 1} を削除`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 追加ボタン */}
        {images.length < 3 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleImageChange}
              aria-label="写真を選択"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border border-dashed border-[#c8c8c8] rounded-[8px] bg-[#f5f5f5] hover:bg-[#efefef] text-[13px] text-[#5c5c5c] transition-colors min-h-[44px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              写真を追加
              {images.length > 0 && (
                <span className="text-[#8a8a8a]">（あと{3 - images.length}枚）</span>
              )}
            </button>
          </>
        )}
      </div>

      {/* 訪問時期 */}
      <div>
        <label className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          訪問時期
        </label>
        <div className="flex items-center gap-2">
          <select
            name="visit_year"
            className="bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors min-h-[44px]"
          >
            <option value="">年</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select
            name="visit_month"
            className="bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors min-h-[44px]"
          >
            <option value="">月</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="px-8 py-3.5 bg-[#c47e4f] hover:bg-[#a5663a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15px] font-medium rounded-[8px] transition-colors min-h-[48px]"
      >
        {isPending ? '投稿中...' : '口コミを投稿する'}
      </button>
    </form>
  )
}
