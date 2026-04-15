'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { CalendarEvent } from '@/lib/types'

type ActionFn = (prev: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean } | null>

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
  const [imageUrl, setImageUrl] = useState(event?.image_url ?? '')
  const [imageUploading, setImageUploading] = useState(false)
  const imageFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.success) {
      router.push('/admin/events')
    }
  }, [state, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setImageUploading(true)
    try {
      const blob = await resizeImage(file)
      const path = `events/${Date.now()}_cover.jpg`
      const { error: upErr } = await supabase.storage
        .from('events')
        .upload(path, blob, { contentType: 'image/jpeg' })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('events').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    } catch {
      alert('画像のアップロードに失敗しました。')
    } finally {
      setImageUploading(false)
    }
  }

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

      {/* 画像 */}
      <div>
        <label className="block text-[13px] font-medium text-[#1a1a1a] mb-1.5">画像</label>
        <div className="flex gap-2 items-center">
          <input
            type="url"
            name="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://"
            className="flex-1 px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] focus:outline-none focus:border-[#5b7e95]"
          />
          <input
            ref={imageFileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            disabled={imageUploading}
            onClick={() => imageFileRef.current?.click()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-[13px] text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors disabled:opacity-50 min-h-[42px]"
          >
            {imageUploading ? (
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
            {imageUploading ? 'アップロード中...' : 'ファイルをアップロード'}
          </button>
        </div>
        {imageUrl && (
          <div className="mt-2">
            <Image
              src={imageUrl}
              alt="イベント画像プレビュー"
              width={320}
              height={180}
              className="rounded-[6px] object-cover border border-[#e0e0e0]"
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input type="hidden" name="is_annual" value="false" />
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
