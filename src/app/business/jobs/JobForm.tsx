'use client'

import { useActionState, useState } from 'react'
import { createJob } from '@/app/actions/jobs'

export default function JobForm({ spots }: { spots: { id: string; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(createJob, null)
  const [open, setOpen] = useState(false)

  if (state?.success && open) setOpen(false)

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 bg-[#c47e4f] hover:bg-[#a5663a] text-white text-[13px] font-medium rounded-[8px] transition-colors"
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

            {/* タイトル */}
            <div>
              <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">
                求人タイトル <span className="text-[#d94f4f]">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                maxLength={100}
                placeholder="例: 食堂スタッフ募集（パートタイム）"
                className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors"
              />
            </div>

            {/* 種別 + スポット */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">種別</label>
                <select
                  name="type"
                  className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors"
                >
                  <option value="regular">正規・パート</option>
                  <option value="seasonal">季節</option>
                  <option value="volunteer">地域おこし協力隊</option>
                </select>
              </div>
              {spots.length > 0 && (
                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">関連スポット</label>
                  <select
                    name="spot_id"
                    className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors"
                  >
                    <option value="">選択しない</option>
                    {spots.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 給与 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">給与・報酬</label>
              <input
                name="salary_range"
                type="text"
                maxLength={100}
                placeholder="例: 時給1,100円〜 / 月給200,000円〜"
                className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors"
              />
            </div>

            {/* 仕事内容 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">仕事内容</label>
              <textarea
                name="description"
                rows={4}
                maxLength={2000}
                placeholder="仕事の内容・特徴を記載してください"
                className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors resize-none"
              />
            </div>

            {/* 応募条件 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">応募条件</label>
              <textarea
                name="requirements"
                rows={3}
                maxLength={1000}
                placeholder="必要な資格・経験・条件など"
                className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors resize-none"
              />
            </div>

            {/* 連絡先 */}
            <div>
              <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1">お問い合わせ先</label>
              <input
                name="contact_info"
                type="text"
                maxLength={200}
                placeholder="例: 電話 0137-XX-XXXX / メール info@example.com"
                className="w-full border border-[#e0e0e0] rounded-[6px] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#5b7e95] transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-[#c47e4f] hover:bg-[#a5663a] disabled:opacity-50 text-white text-[13px] font-medium rounded-[8px] transition-colors"
              >
                {isPending ? '登録中...' : '求人を公開する'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
