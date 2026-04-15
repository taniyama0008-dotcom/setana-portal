'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { updateSpotStatus, deleteSpot } from '@/app/actions/admin'

export default function SpotActions({
  spotId,
  currentStatus,
}: {
  spotId: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/spots/${spotId}/edit`}
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors"
      >
        編集
      </Link>
      <Link
        href={`/admin/spots/${spotId}/images`}
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors"
      >
        画像
      </Link>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            void updateSpotStatus(spotId, currentStatus === 'public' ? 'draft' : 'public')
          )
        }
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50"
      >
        {currentStatus === 'public' ? '非公開化' : '公開'}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm('このスポットを削除しますか？関連する口コミも削除されます。')) return
          startTransition(() => void deleteSpot(spotId))
        }}
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#8a8a8a] hover:border-[#d94f4f] hover:text-[#d94f4f] transition-colors disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
