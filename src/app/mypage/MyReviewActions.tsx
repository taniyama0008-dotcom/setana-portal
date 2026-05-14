'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteUserReview } from '@/app/actions/review'

export default function MyReviewActions({ reviewId }: { reviewId: string }) {
  const [isPending, start] = useTransition()

  return (
    <div className="flex items-center gap-0.5">
      <Link
        href={`/mypage/reviews/${reviewId}/edit`}
        title="編集"
        className="p-1.5 text-[#b0b0b0] hover:text-[#5b7e95] hover:bg-[#f0f4f7] rounded-[4px] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Link>
      <button
        disabled={isPending}
        title="削除"
        className="p-1.5 text-[#b0b0b0] hover:text-[#d94f4f] hover:bg-[#fff5f5] rounded-[4px] transition-colors disabled:opacity-40"
        onClick={() => {
          if (!confirm('この口コミを削除しますか？')) return
          start(() => void deleteUserReview(reviewId))
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}
