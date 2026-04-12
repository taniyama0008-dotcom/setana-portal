'use client'

import { useTransition } from 'react'
import { adminUpdateJobStatus, adminDeleteJob } from '@/app/actions/jobs'

export default function JobActions({
  jobId,
  currentStatus,
}: {
  jobId: string
  currentStatus: string
}) {
  const [isPending, start] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          start(() =>
            void adminUpdateJobStatus(jobId, currentStatus === 'open' ? 'closed' : 'open')
          )
        }
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50"
      >
        {currentStatus === 'open' ? '募集停止' : '再公開'}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (!confirm('この求人を削除しますか？')) return
          start(() => void adminDeleteJob(jobId))
        }}
        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#8a8a8a] hover:border-[#d94f4f] hover:text-[#d94f4f] transition-colors disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
