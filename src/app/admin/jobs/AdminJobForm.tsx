'use client'

import { useActionState, useState } from 'react'
import { adminCreateJob } from '@/app/actions/jobs'
import JobFormFields from '@/components/jobs/JobFormFields'

export default function AdminJobForm({ spots }: { spots: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(adminCreateJob, null)
  const [open, setOpen] = useState(false)

  if (state?.success && open) setOpen(false)

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 bg-[#5b7e95] hover:bg-[#3d5a6e] text-white text-[13px] font-medium rounded-[8px] transition-colors"
        >
          + 新規求人を登録
        </button>
      ) : (
        <div className="bg-white border border-[#efefef] rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">新規求人登録</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors text-[13px]"
            >
              キャンセル
            </button>
          </div>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p className="text-[13px] text-[#d94f4f] bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] px-4 py-3">
                {state.error}
              </p>
            )}
            <JobFormFields spots={spots} showStatus />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-[#5b7e95] hover:bg-[#3d5a6e] disabled:opacity-50 text-white text-[13px] font-medium rounded-[8px] transition-colors"
              >
                {isPending ? '登録中...' : '求人を登録する'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
