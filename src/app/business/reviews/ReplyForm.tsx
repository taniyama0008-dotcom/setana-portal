'use client'

import { useActionState, useState } from 'react'
import { replyToReview } from '@/app/actions/business'

export default function ReplyForm({
  reviewId,
  spotId,
}: {
  reviewId: string
  spotId: string
}) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(replyToReview, null)

  if (state?.success) {
    return (
      <p className="text-[12px] text-[#1a6640] bg-[#d4ede0] rounded px-3 py-2">
        返信を保存しました。
      </p>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] px-3 py-1.5 border border-[#e0e0e0] rounded-md text-[#5b7e95] hover:bg-[#f0f5f8] transition-colors"
      >
        返信を書く
      </button>
    )
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="spot_id" value={spotId} />

      {state?.error && (
        <p className="text-[12px] text-[#d94f4f]">{state.error}</p>
      )}

      <textarea
        name="reply"
        rows={3}
        maxLength={500}
        placeholder="返信内容を入力してください（500文字以内）"
        className="w-full bg-white border border-[#e0e0e0] rounded-md px-3 py-2.5 text-[14px] text-[#1a1a1a] leading-[1.7] focus:outline-none focus:border-[#5b7e95] transition-colors resize-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-[#5b7e95] hover:bg-[#3d5a6e] disabled:opacity-50 text-white text-[13px] font-medium rounded-md transition-colors"
        >
          {isPending ? '送信中...' : '返信する'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 border border-[#e0e0e0] text-[13px] text-[#5c5c5c] rounded-md hover:bg-[#faf8f5] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
