'use client'

import { useActionState } from 'react'
import { adminUpdateJob } from '@/app/actions/jobs'
import JobFormFields from '@/components/jobs/JobFormFields'

export default function AdminJobEditForm({
  job,
  spots,
}: {
  job: {
    id: string
    title: string
    type: string
    spot_id: string | null
    salary_range: string | null
    description: string | null
    requirements: string | null
    contact_info: string | null
    status: string
  }
  spots: { id: string; name: string }[]
}) {
  const [state, action, isPending] = useActionState(adminUpdateJob, null)

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={job.id} />

      {state?.error && (
        <div className="px-4 py-3 bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] text-[13px] text-[#d94f4f]">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="px-4 py-3 bg-[#d4ede0] border border-[#a8d5bc] rounded-[6px] text-[13px] text-[#1a6640]">
          保存しました。
        </div>
      )}

      <JobFormFields spots={spots} showStatus defaultValues={job} />

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-[#5b7e95] hover:bg-[#3d5a6e] disabled:opacity-50 text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px]"
        >
          {isPending ? '保存中...' : '変更を保存'}
        </button>
      </div>
    </form>
  )
}
