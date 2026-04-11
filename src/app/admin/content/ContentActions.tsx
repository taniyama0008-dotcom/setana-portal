'use client'

import { useTransition } from 'react'
import { updateArticleStatus, deleteArticle } from '@/app/actions/admin'

export default function ContentActions({
  articleId,
  currentStatus,
}: {
  articleId: string
  currentStatus: string
}) {
  const [isPending, start] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          start(() =>
            void updateArticleStatus(articleId, currentStatus === 'public' ? 'draft' : 'public')
          )
        }
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50"
      >
        {currentStatus === 'public' ? '下書きに戻す' : '公開'}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm('この記事を削除しますか？')) return
          start(() => void deleteArticle(articleId))
        }}
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#8a8a8a] hover:border-[#d94f4f] hover:text-[#d94f4f] transition-colors disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
