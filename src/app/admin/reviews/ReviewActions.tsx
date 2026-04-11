'use client'

import { useTransition } from 'react'
import { updateReviewStatus } from '@/app/actions/admin'

export default function ReviewActions({
  reviewId,
  currentStatus,
}: {
  reviewId: string
  currentStatus: string
}) {
  const [isPending, start] = useTransition()

  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      {currentStatus !== 'published' && (
        <button
          disabled={isPending}
          onClick={() => start(() => void updateReviewStatus(reviewId, 'published'))}
          className="text-[11px] px-2 py-1 bg-[#d4ede0] text-[#1a6640] rounded hover:bg-[#c0e0cc] transition-colors disabled:opacity-50"
        >
          承認
        </button>
      )}
      {currentStatus !== 'hidden' && (
        <button
          disabled={isPending}
          onClick={() => start(() => void updateReviewStatus(reviewId, 'hidden'))}
          className="text-[11px] px-2 py-1 bg-[#e9ecef] text-[#5c5c5c] rounded hover:bg-[#dde0e3] transition-colors disabled:opacity-50"
        >
          非表示
        </button>
      )}
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm('この口コミを削除しますか？')) return
          start(() => void updateReviewStatus(reviewId, 'deleted'))
        }}
        className="text-[11px] px-2 py-1 bg-[#fce8e8] text-[#8b1f1f] rounded hover:bg-[#f5d0d0] transition-colors disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
