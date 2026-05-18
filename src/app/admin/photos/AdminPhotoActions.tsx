'use client'

import { useTransition } from 'react'
import { updatePhotoStatus, updatePhotoFeatured } from '@/app/actions/photo'

interface Props {
  photoId: string
  status: 'public' | 'hidden'
  isFeatured: boolean
}

export default function AdminPhotoActions({ photoId, status, isFeatured }: Props) {
  const [isPending, startTransition] = useTransition()

  function toggleStatus() {
    startTransition(async () => {
      await updatePhotoStatus(photoId, status === 'public' ? 'hidden' : 'public')
    })
  }

  function toggleFeatured() {
    startTransition(async () => {
      await updatePhotoFeatured(photoId, !isFeatured)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleFeatured}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-[5px] text-[11px] font-medium transition-colors nav-label disabled:opacity-50 ${
          isFeatured
            ? 'bg-[#fef3e8] text-[#c47e4f] hover:bg-[#fde8cc]'
            : 'bg-[#f5f5f5] text-[#8a8a8a] hover:bg-[#efefef]'
        }`}
      >
        {isFeatured ? 'PICKUP中' : 'PICKUP'}
      </button>
      <button
        onClick={toggleStatus}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-[5px] text-[11px] font-medium transition-colors nav-label disabled:opacity-50 ${
          status === 'public'
            ? 'bg-[#e8f4ea] text-[#4a8a55] hover:bg-[#d5ecd8]'
            : 'bg-[#f5e8e8] text-[#c05050] hover:bg-[#ecd5d5]'
        }`}
      >
        {status === 'public' ? '公開中' : '非公開'}
      </button>
    </div>
  )
}
