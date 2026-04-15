'use client'

import { useActionState, useRef, useState } from 'react'
import Image from 'next/image'
import type { Spot } from '@/lib/types'
import { updateSpot } from '@/app/actions/admin'
import { supabase } from '@/lib/supabase'

async function resizeImage(file: File, maxWidth = 1600): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxWidth / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('resize failed')) },
        'image/jpeg',
        0.88,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('load failed')) }
    img.src = objectUrl
  })
}

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
  const [coverPreview, setCoverPreview] = useState(spot.cover_image ?? '')
  const [coverUploading, setCoverUploading] = useState(false)
  const coverFileRef = useRef<HTMLInputElement>(null)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCoverUploading(true)
    try {
      const blob = await resizeImage(file)
      const path = `spots/${spot.id}/cover.jpg`
      const { error: upErr } = await supabase.storage
        .from('spots')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('spots').getPublicUrl(path)
      setCoverPreview(data.publicUrl)
    } catch {
      alert('カバー画像のアップロードに失敗しました。')
    } finally {
      setCoverUploading(false)
    }
  }

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
            <input name="category" defaultValue={spot.category} placeholder="restaurant / nature / fishing 等" className={inputClass} />
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
      <section>
        <h2 className="text-[13px] font-semibold text-[#8a8a8a] tracking-[0.08em] uppercase mb-4">カバー画像</h2>
        <div className="flex gap-2 items-center">
          <input
            name="cover_image"
            type="url"
            value={coverPreview}
            onChange={e => setCoverPreview(e.target.value)}
            placeholder="https://..."
            className={`${inputClass} flex-1`}
          />
          <input
            ref={coverFileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleCoverUpload}
          />
          <button
            type="button"
            disabled={coverUploading}
            onClick={() => coverFileRef.current?.click()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[13px] text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50 min-h-[42px]"
          >
            {coverUploading ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            )}
            {coverUploading ? 'アップロード中...' : 'ファイルをアップロード'}
          </button>
        </div>
        {coverPreview && (
          <div className="mt-3 relative w-full max-w-[400px] aspect-[3/2] rounded-[6px] overflow-hidden border border-[#e0e0e0]">
            <Image src={coverPreview} alt="カバープレビュー" fill className="object-cover" unoptimized />
          </div>
        )}
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
