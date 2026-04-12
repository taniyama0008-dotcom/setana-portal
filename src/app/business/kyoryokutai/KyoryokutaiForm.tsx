'use client'

import { useActionState, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { KyoryokutaiListing } from '@/lib/types'
import { upsertListing, uploadKyoryokutaiPhoto, deleteListing } from '@/app/actions/kyoryokutai'

type State = { error?: string; success?: boolean } | null

const fieldClass = 'w-full border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#5b7e95] transition-colors bg-white'
const labelClass = 'block text-[13px] font-medium text-[#1a1a1a] mb-2'

export default function KyoryokutaiForm({ listing }: { listing: KyoryokutaiListing | null }) {
  const [photos, setPhotos] = useState<string[]>(listing?.photos ?? [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [status, setStatus] = useState<'draft' | 'published'>(listing?.status ?? 'draft')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [state, formAction, isPending] = useActionState<State, FormData>(upsertListing, null)
  const router = useRouter()
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (photos.length + files.length > 5) {
      setUploadError('写真は最大5枚です')
      return
    }
    setUploadError(null)
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadKyoryokutaiPhoto(fd)
      if (result.url) {
        setPhotos(prev => [...prev, result.url!])
      } else {
        setUploadError(result.error ?? 'アップロードに失敗しました')
      }
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  function handleDragStart(idx: number) { dragItem.current = idx }
  function handleDragEnter(idx: number) { dragOverItem.current = idx }
  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return
    const next = [...photos]
    const [removed] = next.splice(dragItem.current, 1)
    next.splice(dragOverItem.current, 0, removed)
    setPhotos(next)
    dragItem.current = null
    dragOverItem.current = null
  }

  return (
    <form action={formAction} className="space-y-7">
      {listing?.id && <input type="hidden" name="id" value={listing.id} />}
      <input type="hidden" name="status" value={status} />
      {photos.map((url, i) => (
        <input key={`${url}-${i}`} type="hidden" name="photos[]" value={url} />
      ))}

      {/* フィードバック */}
      {state?.error && (
        <div className="bg-[#fef2f2] border border-[#fca5a5] rounded-[8px] px-4 py-3 text-[13px] text-[#dc2626]">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-[#f0fdf4] border border-[#86efac] rounded-[8px] px-4 py-3 text-[13px] text-[#16a34a]">
          保存しました
        </div>
      )}

      {/* 写真 */}
      <div>
        <label className={labelClass}>
          写真（最大5枚）
          <span className="text-[11px] text-[#8a8a8a] font-normal ml-2">1枚目がメイン。ドラッグで並び替え可</span>
        </label>
        {uploadError && (
          <p className="text-[12px] text-[#dc2626] mb-2">{uploadError}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative w-24 h-24 rounded-[6px] overflow-hidden border border-[#e0e0e0] cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
            >
              <Image src={url} alt={`写真${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white text-[10px] rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                ✕
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/50 text-white py-0.5">MAIN</span>
              )}
            </div>
          ))}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 rounded-[6px] border-2 border-dashed border-[#e0e0e0] flex flex-col items-center justify-center text-[#8a8a8a] hover:border-[#6b8f71] hover:text-[#6b8f71] transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <span className="text-[10px]">処理中...</span>
              ) : (
                <>
                  <span className="text-[22px] leading-none mb-1">＋</span>
                  <span className="text-[10px]">写真追加</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* スラッグ */}
      <div>
        <label className={labelClass}>
          スラッグ <span className="text-[#dc2626]">*</span>
          <span className="text-[11px] text-[#8a8a8a] font-normal ml-2">URLに使用（英小文字・数字・ハイフンのみ）</span>
        </label>
        <div className="flex items-center border border-[#e0e0e0] rounded-[6px] overflow-hidden focus-within:border-[#5b7e95] transition-colors">
          <span className="px-3 py-2.5 text-[12px] text-[#8a8a8a] bg-[#faf8f5] border-r border-[#e0e0e0] whitespace-nowrap">/kyoryokutai/</span>
          <input
            name="slug"
            defaultValue={listing?.slug ?? ''}
            required
            placeholder="my-business"
            className="flex-1 px-3 py-2.5 text-[13px] focus:outline-none bg-white font-mono"
          />
        </div>
      </div>

      {/* タイトル */}
      <div>
        <label className={labelClass}>募集タイトル <span className="text-[#dc2626]">*</span></label>
        <input
          name="title"
          defaultValue={listing?.title ?? ''}
          required
          placeholder="例: チーズ工房スタッフ（地域おこし協力隊）"
          className={fieldClass}
        />
      </div>

      {/* キャッチコピー */}
      <div>
        <label className={labelClass}>
          キャッチコピー
          <span className="text-[11px] text-[#8a8a8a] font-normal ml-2">50文字以内</span>
        </label>
        <input
          name="catchphrase"
          defaultValue={listing?.catchphrase ?? ''}
          maxLength={50}
          placeholder="例: チーズ作りで、せたなの酪農を届ける"
          className={fieldClass}
        />
      </div>

      {/* 事業内容 */}
      <div>
        <label className={labelClass}>事業内容の紹介</label>
        <textarea
          name="description"
          defaultValue={listing?.description ?? ''}
          rows={5}
          placeholder="事業所の紹介文を入力してください"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* 業務内容 */}
      <div>
        <label className={labelClass}>募集する業務内容</label>
        <textarea
          name="duties"
          defaultValue={listing?.duties ?? ''}
          rows={5}
          placeholder="どんな仕事をするか具体的に"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* 給与・待遇 */}
      <div>
        <label className={labelClass}>給与・待遇</label>
        <textarea
          name="salary_benefits"
          defaultValue={listing?.salary_benefits ?? ''}
          rows={4}
          placeholder="月給、社会保険、休日など"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* 住居支援 */}
      <div>
        <label className={labelClass}>住居支援</label>
        <select
          name="housing_support"
          defaultValue={listing?.housing_support ?? 'none'}
          className={fieldClass}
        >
          <option value="provided">住居あり（町が用意）</option>
          <option value="subsidized">家賃補助あり</option>
          <option value="none">各自手配</option>
        </select>
      </div>

      {/* 応募方法 */}
      <div>
        <label className={labelClass}>応募方法・問い合わせ先</label>
        <textarea
          name="contact_info"
          defaultValue={listing?.contact_info ?? ''}
          rows={3}
          placeholder="電話番号、メールアドレス、担当者名など"
          className={`${fieldClass} resize-y`}
        />
      </div>

      {/* 応募書類URL */}
      <div>
        <label className={labelClass}>
          応募書類URL
          <span className="text-[11px] text-[#8a8a8a] font-normal ml-2">任意</span>
        </label>
        <input
          type="url"
          name="application_url"
          defaultValue={listing?.application_url ?? ''}
          placeholder="https://example.com/application.pdf"
          className={fieldClass}
        />
      </div>

      {/* 公開設定 */}
      <div className="flex items-center justify-between bg-[#faf8f5] rounded-[10px] px-5 py-4 border border-[#efefef]">
        <div>
          <p className="text-[13px] font-medium text-[#1a1a1a]">公開設定</p>
          <p className="text-[11px] text-[#8a8a8a] mt-0.5">
            {status === 'published' ? '公開中 — サイトに表示されています' : '下書き — まだ公開されていません'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus(s => s === 'published' ? 'draft' : 'published')}
          aria-label="公開設定を切り替え"
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            status === 'published' ? 'bg-[#6b8f71]' : 'bg-[#e0e0e0]'
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            status === 'published' ? 'translate-x-7' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* 保存 / 削除 */}
      <div className="flex items-center justify-between pt-2">
        {listing?.id ? (
          confirmDelete ? (
            <div className="flex items-center gap-3">
              <p className="text-[12px] text-[#dc2626]">本当に削除しますか？</p>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true)
                  await deleteListing(listing.id)
                  router.replace('/business/kyoryokutai')
                }}
                className="text-[12px] px-3 py-1.5 bg-[#dc2626] text-white rounded-[6px] hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
              >
                {deleting ? '削除中...' : '削除する'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-[12px] text-[#8a8a8a] hover:text-[#dc2626] transition-colors"
            >
              削除する
            </button>
          )
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={isPending || uploading}
          className="px-8 py-2.5 bg-[#5b7e95] hover:bg-[#3d5a6e] text-white text-[13px] font-medium rounded-[8px] transition-colors disabled:opacity-50"
        >
          {isPending ? '保存中...' : '保存する'}
        </button>
      </div>
    </form>
  )
}
