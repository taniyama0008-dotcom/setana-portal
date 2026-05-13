'use client'

import { useActionState, useState } from 'react'
import { createSpot } from '@/app/actions/admin'
import { getCategoriesForSection, type Section } from '@/lib/taxonomy'

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

export default function SpotNewForm() {
  const [state, action, isPending] = useActionState(createSpot, null)
  const [selectedSection, setSelectedSection] = useState<Section>('travel')
  const [subCategories, setSubCategories] = useState<string[]>([])

  const categoryEntries = getCategoriesForSection(selectedSection)

  function handleSectionChange(newSection: Section) {
    setSelectedSection(newSection)
    setSubCategories([])
  }

  function toggleSubCategory(key: string) {
    setSubCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <form action={action} className="space-y-8">
      {state?.error && (
        <div className="px-4 py-3 bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] text-[13px] text-[#d94f4f]">
          {state.error}
        </div>
      )}

      {/* ── 基本情報 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">基本情報</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>名前 <span className="text-[#d94f4f]">*</span></label>
            <input name="name" required className={inputClass} placeholder="例：瀬棚漁港" />
          </div>
          <div>
            <label className={labelClass}>スラッグ（URL） <span className="text-[#d94f4f]">*</span></label>
            <input name="slug" required className={inputClass} placeholder="例：setana-gyoko" />
            <p className="text-[11px] text-[#8a8a8a] mt-1">半角英数字・ハイフンのみ。/spot/（スラッグ）として使われます。</p>
          </div>
          <div>
            <label className={labelClass}>説明文</label>
            <textarea name="description" rows={4} className={`${inputClass} resize-none leading-[1.8]`} />
          </div>
        </div>
      </section>

      {/* ── 分類 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">分類</h2>
        <div className="space-y-5">
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

          <div>
            <label className={labelClass}>プライマリカテゴリ <span className="text-[#d94f4f]">*</span></label>
            <select name="primary_category" className={inputClass}>
              {categoryEntries.map(([key, entry]) => (
                <option key={key} value={key}>{entry.label}</option>
              ))}
            </select>
          </div>

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
          </div>

          <div>
            <label className={labelClass}>エリア</label>
            <select name="area" className={inputClass}>
              {areaOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── 連絡先 ── */}
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">連絡先・営業情報</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>住所</label>
            <input name="address" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>電話番号</label>
              <input name="phone" type="tel" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>営業時間</label>
              <input name="business_hours" className={inputClass} placeholder="9:00〜18:00" />
            </div>
          </div>
          <div>
            <label className={labelClass}>定休日</label>
            <input name="holidays" className={inputClass} placeholder="毎週月曜日" />
          </div>
        </div>
      </section>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-[#5b7e95] hover:bg-[#3d5a6e] disabled:opacity-50 text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px]"
        >
          {isPending ? '作成中...' : 'スポットを作成'}
        </button>
      </div>
    </form>
  )
}
