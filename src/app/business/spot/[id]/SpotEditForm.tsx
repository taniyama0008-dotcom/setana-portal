'use client'

import { useActionState } from 'react'
import { updateSpotInfo } from '@/app/actions/business'

interface SpotEditFormProps {
  spot: {
    id: string
    name: string
    description: string | null
    address: string | null
    phone: string | null
    business_hours: string | null
    holidays: string | null
    cover_image: string | null
  }
}

const inputClass =
  'w-full bg-white border border-[#e0e0e0] rounded-md px-4 py-3 text-[15px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors'
const labelClass = 'block text-[13px] font-medium text-[#5c5c5c] mb-2'

export default function SpotEditForm({ spot }: SpotEditFormProps) {
  const [state, action, isPending] = useActionState(updateSpotInfo, null)

  return (
    <form action={action} className="space-y-6 max-w-[640px]">
      <input type="hidden" name="spot_id" value={spot.id} />

      {state?.error && (
        <p className="text-[13px] text-[#d94f4f] bg-[#fff5f5] border border-[#d94f4f]/20 rounded-md px-4 py-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-[13px] text-[#1a6640] bg-[#d4ede0] border border-[#a8d5bc] rounded-md px-4 py-3">
          保存しました。
        </p>
      )}

      {/* 店舗名: 表示のみ */}
      <div>
        <label className={labelClass}>店舗名</label>
        <div className="w-full bg-[#f5f5f5] border border-[#e0e0e0] rounded-md px-4 py-3 text-[15px] text-[#1a1a1a]">
          {spot.name}
        </div>
        <p className="text-[11px] text-[#8a8a8a] mt-1">店舗名の変更は管理者にお問い合わせください。</p>
      </div>

      {/* カバー画像（編集不可） */}
      <input type="hidden" name="cover_image" value={spot.cover_image ?? ''} />
      <div>
        <p className="text-[13px] text-[#8a8a8a] bg-[#faf8f5] border border-[#e0e0e0] rounded-md px-4 py-3">
          カバー画像は管理者が画像管理から設定します。
        </p>
      </div>

      <div>
        <label className={labelClass}>説明</label>
        <textarea
          name="description"
          defaultValue={spot.description ?? ''}
          rows={5}
          className={`${inputClass} resize-none leading-[1.8]`}
        />
      </div>

      <div>
        <label className={labelClass}>住所</label>
        <input name="address" defaultValue={spot.address ?? ''} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>電話番号</label>
        <input name="phone" type="tel" defaultValue={spot.phone ?? ''} className={`${inputClass} max-w-xs`} />
      </div>

      <div>
        <label className={labelClass}>営業時間</label>
        <input name="business_hours" defaultValue={spot.business_hours ?? ''} className={inputClass} placeholder="例: 9:00〜18:00" />
      </div>

      <div>
        <label className={labelClass}>定休日</label>
        <input name="holidays" defaultValue={spot.holidays ?? ''} className={inputClass} placeholder="例: 毎週月曜日" />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-[#5b7e95] hover:bg-[#3d5a6e] disabled:opacity-50 text-white text-[14px] font-medium rounded-md transition-colors min-h-[48px]"
        >
          {isPending ? '保存中...' : '変更を保存'}
        </button>
      </div>
    </form>
  )
}
