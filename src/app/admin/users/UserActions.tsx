'use client'

import { useTransition } from 'react'
import { updateUserRole } from '@/app/actions/admin'

export default function UserActions({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  const [isPending, start] = useTransition()

  if (currentRole === 'admin') {
    return <span className="text-[11px] text-[#8a8a8a]">管理者</span>
  }

  return (
    <div className="flex flex-col gap-1">
      {currentRole !== 'business' ? (
        <button
          disabled={isPending}
          onClick={() => {
            if (!confirm('事業者権限を付与しますか？')) return
            start(() => void updateUserRole(userId, 'business'))
          }}
          className="text-[11px] px-2.5 py-1 bg-[#e8f0f5] text-[#5b7e95] rounded hover:bg-[#d0e5ef] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          事業者に昇格
        </button>
      ) : (
        <button
          disabled={isPending}
          onClick={() => {
            if (!confirm('事業者権限を剥奪しますか？')) return
            start(() => void updateUserRole(userId, 'user'))
          }}
          className="text-[11px] px-2.5 py-1 bg-[#e9ecef] text-[#5c5c5c] rounded hover:bg-[#dde0e3] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          権限を剥奪
        </button>
      )}
    </div>
  )
}
