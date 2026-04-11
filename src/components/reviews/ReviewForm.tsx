'use client'

import { useActionState, useState } from 'react'
import { submitReview } from '@/app/actions/review'

interface ReviewFormProps {
  spotId: string
  slug: string
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

export default function ReviewForm({ spotId, slug }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(submitReview, null)
  const [rating, setRating] = useState(0)

  if (state?.success) {
    return (
      <div className="py-8 px-6 bg-[#faf8f5] rounded-[8px] text-center">
        <p className="text-[22px] mb-2">ありがとうございます</p>
        <p className="text-[14px] text-[#5c5c5c]">
          口コミを投稿しました。
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
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

      {/* ニックネーム */}
      <div>
        <label htmlFor="review-nickname" className="block text-[13px] font-medium text-[#5c5c5c] mb-2">
          ニックネーム <span className="text-[#d94f4f]">*</span>
        </label>
        <input
          id="review-nickname"
          name="nickname"
          type="text"
          required
          maxLength={30}
          placeholder="例: 旅好きの田中"
          className="w-full max-w-xs bg-white border border-[#e0e0e0] rounded-[6px] px-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors min-h-[48px]"
        />
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
