'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { CalendarEvent } from '@/lib/types'

type ActionFn = (prev: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean } | null>

const areaOptions = [
  { value: '', label: '指定なし' },
  { value: 'setana',     label: '瀬棚地区' },
  { value: 'kitahiyama', label: '北檜山地区' },
  { value: 'taisei',     label: '大成地区' },
]

const statusOptions = [
  { value: 'upcoming',  label: '開催予定' },
  { value: 'ongoing',   label: '開催中' },
  { value: 'finished',  label: '終了' },
  { value: 'cancelled', label: '中止' },
]

export default function EventForm({
  action,
  event,
}: {
  action: ActionFn
  event?: CalendarEvent
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/events')
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}

      {state?.error && (
        <div className="bg-[#fff0f0] border border-[#f5c6c6] rounded-[6px] px-4 py-3 text-[13px] text-[#dc2626]">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">
          タイトル <span className="text-[#dc2626]">*</span>
        </label>
        <input
          type="text"
          name="title"
          defaultValue={event?.title ?? ''}
          required
          placeholder="例: 漁火まつり 2026"
          className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none focus:border-[#5b7e95]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">
            開始日 <span className="text-[#dc2626]">*</span>
          </label>
          <input
            type="date"
            name="start_date"
            defaultValue={event?.start_date ?? ''}
            required
            className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95]"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">終了日</label>
          <input
            type="date"
            name="end_date"
            defaultValue={event?.end_date ?? ''}
            className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">エリア</label>
          <select
            name="area"
            defaultValue={event?.area ?? ''}
            className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] bg-white"
          >
            {areaOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">状態</label>
          <select
            name="status"
            defaultValue={event?.status ?? 'upcoming'}
            className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] bg-white"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">開催場所</label>
        <input
          type="text"
          name="location"
          defaultValue={event?.location ?? ''}
          placeholder="例: 瀬棚港周辺"
          className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none focus:border-[#5b7e95]"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">説明</label>
        <textarea
          name="description"
          defaultValue={event?.description ?? ''}
          rows={4}
          placeholder="イベントの概要・詳細を入力"
          className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none focus:border-[#5b7e95] resize-vertical"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">外部リンクURL</label>
        <input
          type="url"
          name="external_url"
          defaultValue={event?.external_url ?? ''}
          placeholder="https://"
          className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none focus:border-[#5b7e95]"
        />
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">画像URL</label>
        <input
          type="url"
          name="image_url"
          defaultValue={event?.image_url ?? ''}
          placeholder="https://"
          className="w-full px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none focus:border-[#5b7e95]"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="hidden"
          name="is_annual"
          value="false"
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="is_annual"
            value="true"
            defaultChecked={event?.is_annual ?? false}
            className="w-4 h-4 accent-[#5b7e95]"
          />
          <span className="text-[13px] text-[#1a1a1a]">毎年開催のイベント</span>
        </label>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#efefef]">
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="px-5 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[13px] text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-[#5b7e95] hover:bg-[#4a6a7e] disabled:opacity-50 text-white text-[13px] font-medium rounded-[6px] transition-colors"
        >
          {isPending ? '保存中...' : (event ? '更新する' : '作成する')}
        </button>
      </div>
    </form>
  )
}
