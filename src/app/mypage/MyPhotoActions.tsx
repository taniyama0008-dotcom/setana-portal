'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUserPhoto } from '@/app/actions/photo'

interface Props {
  photoId: string
}

export default function MyPhotoActions({ photoId }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('この写真を削除しますか？')) return
    startTransition(async () => {
      const result = await deleteUserPhoto(photoId)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-[12px] text-[#c05050] hover:text-[#8a3030] transition-colors disabled:opacity-50 nav-label"
    >
      {isPending ? '削除中…' : '削除'}
    </button>
  )
}
