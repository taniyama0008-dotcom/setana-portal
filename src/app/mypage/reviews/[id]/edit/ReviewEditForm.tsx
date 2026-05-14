'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { updateUserReview } from '@/app/actions/review'
import type { ReviewImage } from '@/lib/types'

const currentYear = new Date().getFullYear()
const years  = Array.from({ length: 5 }, (_, i) => currentYear - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
        (blob) => { if (blob) resolve(blob); else reject(new Error('canvas.toBlob failed')) },
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('image load failed')) }
    img.src = objectUrl
  })
}

interface Props {
  reviewId: string
  initialRating: number
  initialComment: string
  initialVisitYear: number | null
  initialVisitMonth: number | null
  existingImages: ReviewImage[]
}

export default function ReviewEditForm({
  reviewId,
  initialRating,
  initialComment,
  initialVisitYear,
  initialVisitMonth,
  existingImages,
}: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rating, setRating]         = useState(initialRating)
  const [comment, setComment]       = useState(initialComment)
  const [visitYear, setVisitYear]   = useState(initialVisitYear?.toString() ?? '')
  const [visitMonth, setVisitMonth] = useState(initialVisitMonth?.toString() ?? '')
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [newImages, setNewImages]   = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [isPending, setIsPending]   = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const activeExisting = existingImages.filter((img) => !removedIds.includes(img.id))
  const totalCount     = activeExisting.length + newImages.length
  const remaining      = 3 - totalCount

  const removeExisting = (id: string) => setRemovedIds((prev) => [...prev, id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, remaining)
    if (files.length === 0) return
    setNewImages((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target!.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeNew = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const newImageUrls: string[] = []
      if (newImages.length > 0) {
        const tempId = crypto.randomUUID()
        for (let i = 0; i < newImages.length; i++) {
          const blob = await resizeImage(newImages[i])
          const path = `reviews/${tempId}/${i}.jpg`
          const { error: uploadError } = await supabase.storage
            .from('reviews')
            .upload(path, blob, { contentType: 'image/jpeg' })
          if (uploadError) throw uploadError
          const { data } = supabase.storage.from('reviews').getPublicUrl(path)
          newImageUrls.push(data.publicUrl)
        }
      }

      const formData = new FormData()
      formData.set('rating', rating.toString())
      formData.set('comment', comment)
      formData.set('visit_year', visitYear)
      formData.set('visit_month', visitMonth)
      formData.set('image_urls', JSON.stringify(newImageUrls))
      formData.set('removed_image_ids', JSON.stringify(removedIds))

      const result = await updateUserReview(reviewId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/mypage')
      }
    } catch (err) {
      console.error('review edit error:', err)
      setError('更新に失敗しました。もう一度お試しください。')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-[13px] text-[#d94f4f] bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] px-4 py-3">
          {error}
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

      {/* 口コミ本文 */}
      <div>
        <label htmlFor="edit-comment" className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          口コミ
        </label>
        <textarea
          id="edit-comment"
          rows={4}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="このスポットの感想を書いてください"
          className="w-full bg-white border border-[#e0e0e0] rounded-[6px] px-4 py-3 text-[15px] text-[#1a1a1a] leading-[1.8] focus:outline-none focus:border-[#5b7e95] transition-colors resize-none"
        />
      </div>

      {/* 写真 */}
      <div>
        <label className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          写真（最大3枚）
        </label>

        {/* 既存画像 */}
        {activeExisting.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {activeExisting.map((img) => (
              <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={img.image_url}
                  alt={img.alt_text ?? '口コミ画像'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeExisting(img.id)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[11px] leading-none transition-colors"
                  aria-label="画像を削除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 新規追加画像プレビュー */}
        {newPreviews.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {newPreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={src}
                  alt={`追加画像 ${i + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[11px] leading-none transition-colors"
                  aria-label={`追加画像 ${i + 1} を削除`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 追加ボタン */}
        {remaining > 0 && (
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              写真を追加
              {totalCount > 0 && (
                <span className="text-[#8a8a8a]">（あと{remaining}枚）</span>
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
            value={visitYear}
            onChange={(e) => setVisitYear(e.target.value)}
            className="bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors min-h-[44px]"
          >
            <option value="">年</option>
            {years.map((y) => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select
            value={visitMonth}
            onChange={(e) => setVisitMonth(e.target.value)}
            className="bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors min-h-[44px]"
          >
            <option value="">月</option>
            {months.map((m) => <option key={m} value={m}>{m}月</option>)}
          </select>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="px-8 py-3.5 bg-[#c47e4f] hover:bg-[#a5663a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[15px] font-medium rounded-[8px] transition-colors min-h-[48px]"
        >
          {isPending ? '保存中...' : '変更を保存'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/mypage')}
          className="px-6 py-3.5 text-[14px] text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
