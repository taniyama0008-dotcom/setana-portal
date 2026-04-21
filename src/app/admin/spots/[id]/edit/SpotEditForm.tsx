'use client'

import { useActionState, useState } from 'react'
import type { Spot } from '@/lib/types'
import { updateSpot } from '@/app/actions/admin'
import { categoryMaster, areaMaster, getCategoriesForSection, type Section } from '@/lib/taxonomy'

const inputClass =
  'w-full bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors'
const labelClass = 'block text-[12px] font-medium text-[#5c5c5c] mb-1.5'

const sectionOptions: { value: Section; label: string }[] = [
  { value: 'travel',  label: '旅する' },
  { value: 'life',    label: '暮らす' },
  { value: 'connect', label: '関わる' },
]

const areaOptions = [
  { value: '',           label: '未設定' },
  { value: 'setana',     label: '瀬棚区' },
  { value: 'kitahiyama', label: '北檜山区' },
  { value: 'taisei',     label: '大成区' },
]

interface BizUser {
  id: string
  nickname: string | null
  email: string | null
}

export default function SpotEditForm({
  spot,
  businessUsers,
  assignedUserId,
}: {
  spot: Spot
  businessUsers: BizUser[]
  assignedUserId: string | null
}) {
  const [state, action, isPending] = useActionState(updateSpot, null)
  const [selectedSection, setSelectedSection] = useState<Section>(spot.section)
  const [subCategories, setSubCategories] = useState<string[]>(spot.sub_categories ?? [])

  const categoryEntries = getCategoriesForSection(selectedSection)

  // セクションが変わったらサブカテゴリをリセット
  function handleSectionChange(newSection: Section) {
    setSelectedSection(newSection)
    setSubCategories([])
  }

  function toggleSubCategory(key: string) {
    setSubCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // 現在有効なカテゴリ（primary + sub）— spot_order 入力対象
  const activeCategoryKeys = [
    spot.primary_category,
    ...subCategories,
  ].filter(Boolean)

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

          <div>
            <label className={labelClass}>説明文</label>
            <textarea name="description" defaultValue={spot.description ?? ''} rows={5} className={`${inputClass} resize-none leading-[1.8]`} />
          </div>
        </div>
      </section>

      {/* ── 分類 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">分類</h2>
        <div className="space-y-5">

          {/* セクション */}
          <div>
            <label className={labelClass}>セクション <span className="text-[#d94f4f]">*</span></label>
            <div className="flex gap-3 flex-wrap">
              {sectionOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="section"
                    value={opt.value}
                    checked={selectedSection === opt.value}
                    onChange={() => handleSectionChange(opt.value)}
                    className="accent-[#5b7e95]"
                  />
                  <span className="text-[14px] text-[#1a1a1a]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* プライマリカテゴリ */}
          <div>
            <label className={labelClass}>プライマリカテゴリ <span className="text-[#d94f4f]">*</span></label>
            <select name="primary_category" defaultValue={spot.primary_category} className={inputClass}>
              {categoryEntries.map(([key, entry]) => (
                <option key={key} value={key}>{entry.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-[#8a8a8a] mt-1">一覧ページのメイン分類に使われます。</p>
          </div>

          {/* サブカテゴリ（複数選択） */}
          <div>
            <label className={labelClass}>サブカテゴリ（複数選択可）</label>
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 border border-[#e0e0e0] rounded-[6px] p-3 bg-[#faf8f5]">
              {categoryEntries.map(([key, entry]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sub_categories"
                    value={key}
                    checked={subCategories.includes(key)}
                    onChange={() => toggleSubCategory(key)}
                    className="accent-[#5b7e95]"
                  />
                  <span className="text-[13px] text-[#1a1a1a]">{entry.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-[#8a8a8a] mt-1">例：温泉宿なら「泊まる」＋「温泉」にチェック。</p>
          </div>

          {/* エリア */}
          <div>
            <label className={labelClass}>エリア</label>
            <select name="area" defaultValue={spot.area ?? ''} className={inputClass}>
              {areaOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── 並び順 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">並び順</h2>
        <p className="text-[12px] text-[#8a8a8a] mb-3">各カテゴリ一覧での表示順。小さい数値が先頭。未入力は末尾。</p>
        <div className="grid grid-cols-2 gap-3">
          {activeCategoryKeys.map((catKey) => {
            const catLabel = (categoryMaster[selectedSection]?.categories as Record<string, { label: string }>)?.[catKey]?.label ?? catKey
            return (
              <div key={catKey}>
                <label className={labelClass}>{catLabel}</label>
                <input
                  name={`spot_order[${catKey}]`}
                  type="number"
                  min="0"
                  defaultValue={spot.spot_order?.[catKey] ?? ''}
                  placeholder="未設定（末尾）"
                  className={inputClass}
                />
              </div>
            )
          })}
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
              <input type="checkbox" name="has_onsen" defaultChecked={spot.has_onsen ?? false} className="w-4 h-4 accent-[#5b7e95]" />
              <span className="text-[14px] text-[#1a1a1a]">温泉あり</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="has_meals" defaultChecked={spot.has_meals ?? false} className="w-4 h-4 accent-[#5b7e95]" />
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

      {/* ── 事業者割り当て ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">事業者割り当て</h2>
        <div>
          <label className={labelClass}>担当事業者</label>
          <select name="business_user_id" defaultValue={assignedUserId ?? ''} className={inputClass}>
            <option value="">未割り当て</option>
            {businessUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nickname ?? u.email ?? u.id}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#8a8a8a] mt-1">選択すると、事業者がこのスポットの管理画面にアクセスできます。</p>
        </div>
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
