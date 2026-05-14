'use client'

import { useTransition } from 'react'
import { updateReviewStatus, deleteReview } from '@/app/actions/admin'

export default function ReviewActions({
  reviewId,
  currentStatus,
}: {
  reviewId: string
  currentStatus: string
}) {
  const [isPending, start] = useTransition()

  const greenBtn = 'bg-[#d4ede0] text-[#1a6640] hover:bg-[#c0e0cc]'
  const grayBtn  = 'bg-[#e9ecef] text-[#5c5c5c] hover:bg-[#dde0e3]'
  const redBtn   = 'bg-[#fce8e8] text-[#8b1f1f] hover:bg-[#f5d0d0]'
  const base     = 'text-[11px] px-2 py-1 rounded transition-colors disabled:opacity-50'

  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      {/* pending: 承認 + 非表示 */}
      {currentStatus === 'pending' && (
        <>
          <button disabled={isPending} className={`${base} ${greenBtn}`}
            onClick={() => start(() => void updateReviewStatus(reviewId, 'public'))}>
            承認
          </button>
          <button disabled={isPending} className={`${base} ${grayBtn}`}
            onClick={() => start(() => void updateReviewStatus(reviewId, 'hidden'))}>
            非表示
          </button>
        </>
      )}
      {/* public: 非表示のみ */}
      {currentStatus === 'public' && (
        <button disabled={isPending} className={`${base} ${grayBtn}`}
          onClick={() => start(() => void updateReviewStatus(reviewId, 'hidden'))}>
          非表示
        </button>
      )}
      {/* hidden: 公開のみ */}
      {currentStatus === 'hidden' && (
        <button disabled={isPending} className={`${base} ${greenBtn}`}
          onClick={() => start(() => void updateReviewStatus(reviewId, 'public'))}>
          公開
        </button>
      )}
      {/* 削除（物理削除）*/}
      <button
        disabled={isPending}
        className={`${base} ${redBtn}`}
        onClick={() => {
          if (!confirm('この口コミを削除しますか？')) return
          start(() => void deleteReview(reviewId))
        }}
      >
        削除
      </button>
    </div>
  )
}
