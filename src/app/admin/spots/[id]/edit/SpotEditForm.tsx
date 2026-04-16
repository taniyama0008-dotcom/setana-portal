'use client'

import { useActionState } from 'react'
import type { Spot } from '@/lib/types'
import { updateSpot } from '@/app/actions/admin'

const inputClass =
  'w-full bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors'
const labelClass = 'block text-[12px] font-medium text-[#5c5c5c] mb-1.5'

const areaOptions = [
  { value: '',       label: '未設定' },
  { value: '瀬棚区',   label: '瀬棚区' },
  { value: '北檜山区', label: '北檜山区' },
  { value: '大成区',   label: '大成区' },
]

const sectionOptions = [
  { value: 'kurashi', label: '暮らし' },
  { value: 'shoku',   label: '食' },
  { value: 'shizen',  label: '自然' },
]

export default function SpotEditForm({ spot }: { spot: Spot }) {
  const [state, action, isPending] = useActionState(updateSpot, null)

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="id" value={spot.id} />

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

      {/* ── 基本情報 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">基本情報</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>名前 <span className="text-[#d94f4f]">*</span></label>
            <input name="name" defaultValue={spot.name} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>スラッグ（URL） <span className="text-[#d94f4f]">*</span></label>
            <input name="slug" defaultValue={spot.slug} required className={inputClass} />
            <p className="text-[11px] text-[#8a8a8a] mt-1">/spot/{spot.slug}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>セクション <span className="text-[#d94f4f]">*</span></label>
              <select name="section" defaultValue={spot.section} className={inputClass}>
                {sectionOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>エリア</label>
              <select name="area" defaultValue={spot.area ?? ''} className={inputClass}>
                {areaOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>カテゴリ</label>
            <select name="category" defaultValue={spot.category ?? ''} className={inputClass}>
              <option value="">未設定</option>
              <option value="gourmet">グルメ・飲食</option>
              <option value="nature">観光・自然</option>
              <option value="onsen">温泉</option>
              <option value="stay">宿泊</option>
              <option value="activity">遊ぶ・体験</option>
              <option value="shop">買い物</option>
              <option value="facility">公共施設</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>説明文</label>
            <textarea name="description" defaultValue={spot.description ?? ''} rows={5} className={`${inputClass} resize-none leading-[1.8]`} />
          </div>
        </div>
      </section>

      {/* ── 連絡先・営業情報 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">連絡先・営業情報</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>住所</label>
            <input name="address" defaultValue={spot.address ?? ''} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>電話番号</label>
              <input name="phone" type="tel" defaultValue={spot.phone ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Webサイト</label>
              <input name="website" type="url" defaultValue={spot.website ?? ''} placeholder="https://..." className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>営業時間</label>
              <input name="business_hours" defaultValue={spot.business_hours ?? ''} placeholder="9:00〜18:00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>定休日</label>
              <input name="holidays" defaultValue={spot.holidays ?? ''} placeholder="毎週月曜日" className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 位置情報 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">位置情報</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>緯度</label>
            <input name="latitude" type="number" step="any" defaultValue={spot.latitude ?? ''} placeholder="42.1234" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>経度</label>
            <input name="longitude" type="number" step="any" defaultValue={spot.longitude ?? ''} placeholder="139.1234" className={inputClass} />
          </div>
        </div>
      </section>

      {/* ── 宿泊・施設情報 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">宿泊・施設情報</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>料金目安</label>
              <input name="price_range" defaultValue={spot.price_range ?? ''} placeholder="¥5,000〜¥10,000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>予約電話</label>
              <input name="booking_phone" type="tel" defaultValue={spot.booking_phone ?? ''} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>予約URL</label>
            <input name="booking_url" type="url" defaultValue={spot.booking_url ?? ''} placeholder="https://..." className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>部屋数</label>
              <input name="room_count" type="number" min="0" defaultValue={spot.room_count ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>収容人数</label>
              <input name="capacity" type="number" min="0" defaultValue={spot.capacity ?? ''} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="has_onsen"
                defaultChecked={spot.has_onsen ?? false}
                className="w-4 h-4 accent-[#5b7e95]"
              />
              <span className="text-[14px] text-[#1a1a1a]">温泉あり</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="has_meals"
                defaultChecked={spot.has_meals ?? false}
                className="w-4 h-4 accent-[#5b7e95]"
              />
              <span className="text-[14px] text-[#1a1a1a]">食事あり</span>
            </label>
          </div>
        </div>
      </section>

      {/* ── カバー画像 ── */}
      <input type="hidden" name="cover_image" value={spot.cover_image ?? ''} />
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">カバー画像</h2>
        <p className="text-[13px] text-[#5c5c5c]">カバー画像は「画像管理」から自動設定されます。</p>
      </section>

      {/* 保存ボタン */}
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
