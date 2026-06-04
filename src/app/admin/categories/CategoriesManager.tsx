'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import type { CategorySetting } from '@/lib/types'

const SECTIONS = [
  {
    sectionLabel: 'SECTION HEROES',
    accent: '#1a1a1a',
    categories: [
      { path: 'travel',  label: 'せたなを旅する (/travel)' },
      { path: 'life',    label: 'せたなに暮らす (/life)' },
      { path: 'connect', label: 'せたなに関わる (/connect)' },
    ],
  },
  {
    sectionLabel: 'TRAVEL',
    accent: '#c47e4f',
    categories: [
      { path: 'travel/gourmet',   label: 'グルメ' },
      { path: 'travel/nature',    label: '観光・自然' },
      { path: 'travel/onsen',     label: '温泉' },
      { path: 'travel/stay',      label: '泊まる' },
      { path: 'travel/access',    label: 'アクセス' },
      { path: 'travel/fishing',   label: '釣り' },
    ],
  },
  {
    sectionLabel: 'LIFE',
    accent: '#5b7e95',
    categories: [
      { path: 'life/work',        label: 'しごと・求人' },
      { path: 'life/living',      label: '暮らしのリアル' },
      { path: 'life/migration',   label: '移住支援' },
    ],
  },
  {
    sectionLabel: 'CONNECT',
    accent: '#4a7c6f',
    categories: [
      { path: 'connect/furusato',           label: 'ふるさと納税' },
      { path: 'connect/corporate-furusato', label: '企業版ふるさと納税' },
      { path: 'connect/famimatch',          label: 'ファミマッチ' },
      { path: 'connect/relation',           label: '関係人口として関わる' },
    ],
  },
]

type RowState = {
  heroImageUrl: string | null
  heroImageAlt: string
  description: string
  gradFrom: string
  gradVia: string
  gradTo: string
  isUploading: boolean
  savingField: 'alt' | 'description' | 'gradient' | null
}

interface Props {
  settingsMap: Record<string, CategorySetting>
}

export default function CategoriesManager({ settingsMap }: Props) {
  const [states, setStates] = useState<Record<string, RowState>>(() => {
    const initial: Record<string, RowState> = {}
    SECTIONS.flatMap(s => s.categories).forEach(({ path }) => {
      const s = settingsMap[path]
      initial[path] = {
        heroImageUrl: s?.hero_image_url ?? null,
        heroImageAlt: s?.hero_image_alt ?? '',
        description:  s?.description ?? '',
        gradFrom:     s?.hero_gradient_from ?? '#1a1a1a',
        gradVia:      s?.hero_gradient_via  ?? '#3a3a3a',
        gradTo:       s?.hero_gradient_to   ?? '#5a5a5a',
        isUploading:  false,
        savingField:  null,
      }
    })
    return initial
  })

  function updateRow(path: string, updates: Partial<RowState>) {
    setStates(prev => ({ ...prev, [path]: { ...prev[path], ...updates } }))
  }

  async function handleUpload(path: string, file: File) {
    const MAX_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert('ファイルサイズは20MB以下にしてください。')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
      alert('JPEG・PNG・WebP・HEIC 形式のファイルのみアップロードできます。')
      return
    }

    updateRow(path, { isUploading: true })
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('categoryPath', path)
      const res = await fetch('/api/admin/upload-category-image', { method: 'POST', body: fd })
      let json: { success?: boolean; url?: string; error?: string }
      try {
        json = await res.json()
      } catch {
        throw new Error(`サーバーエラー (HTTP ${res.status})`)
      }
      if (json.success && json.url) {
        updateRow(path, { heroImageUrl: json.url, isUploading: false })
      } else {
        throw new Error(json.error ?? 'アップロードに失敗しました')
      }
    } catch (err) {
      alert(`アップロードに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`)
      updateRow(path, { isUploading: false })
    }
  }

  async function handleDelete(path: string) {
    const imageUrl = states[path]?.heroImageUrl
    if (!imageUrl || !confirm('ヒーロー画像を削除しますか？')) return
    const res  = await fetch('/api/admin/upload-category-image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryPath: path, imageUrl }),
    })
    const json = await res.json() as { success?: boolean; error?: string }
    if (json.success) {
      updateRow(path, { heroImageUrl: null, heroImageAlt: '' })
    } else {
      alert(`削除に失敗しました: ${json.error ?? ''}`)
    }
  }

  async function saveField(path: string, field: 'alt' | 'description' | 'gradient') {
    updateRow(path, { savingField: field })
    const row = states[path]
    let updates: Record<string, string | null>
    if (field === 'alt') {
      updates = { hero_image_alt: row.heroImageAlt || null }
    } else if (field === 'description') {
      updates = { description: row.description || null }
    } else {
      updates = {
        hero_gradient_from: row.gradFrom || null,
        hero_gradient_via:  row.gradVia  || null,
        hero_gradient_to:   row.gradTo   || null,
      }
    }
    const res  = await fetch('/api/admin/category-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryPath: path, updates }),
    })
    const json = await res.json() as { success?: boolean; error?: string }
    if (!json.success) {
      alert(`保存に失敗しました: ${json.error ?? ''}`)
    }
    updateRow(path, { savingField: null })
  }

  return (
    <div className="space-y-10">
      {SECTIONS.map(section => (
        <div key={section.sectionLabel}>
          <p
            className="text-[11px] font-medium tracking-[0.15em] nav-label mb-4 pb-2 border-b border-[#e0e0e0]"
            style={{ color: section.accent }}
          >
            {section.sectionLabel}
          </p>
          <div className="space-y-4">
            {section.categories.map(({ path, label }) => (
              <CategoryRow
                key={path}
                path={path}
                label={label}
                state={states[path]}
                onUpload={(file) => handleUpload(path, file)}
                onDelete={() => handleDelete(path)}
                onChange={(updates) => updateRow(path, updates)}
                onBlurAlt={() => saveField(path, 'alt')}
                onBlurDescription={() => saveField(path, 'description')}
                onBlurGradient={() => saveField(path, 'gradient')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface RowProps {
  path: string
  label: string
  state: RowState
  onUpload: (file: File) => void
  onDelete: () => void
  onChange: (updates: Partial<RowState>) => void
  onBlurAlt: () => void
  onBlurDescription: () => void
  onBlurGradient: () => void
}

function CategoryRow({
  path, label, state,
  onUpload, onDelete, onChange,
  onBlurAlt, onBlurDescription, onBlurGradient,
}: RowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const gradientPreview = `linear-gradient(135deg, ${state.gradFrom}, ${state.gradVia}, ${state.gradTo})`

  return (
    <div className="bg-white border border-[#e0e0e0] rounded-[8px] p-5">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-[15px] text-[#1a1a1a]">{label}</p>
          <p className="text-[11px] text-[#8a8a8a] font-mono mt-0.5">/{path}</p>
        </div>
        <a
          href={`/${path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#5b7e95] hover:underline nav-label"
        >
          ページを見る →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-5">
        {/* 左: 画像プレビュー + 操作ボタン */}
        <div className="space-y-2">
          {state.heroImageUrl ? (
            <div className="relative w-full aspect-video rounded-[6px] overflow-hidden bg-[#f0f0f0]">
              <Image
                src={state.heroImageUrl}
                alt={state.heroImageAlt || label}
                fill
                className="object-cover"
                unoptimized
                sizes="160px"
              />
            </div>
          ) : (
            <div
              className="w-full aspect-video rounded-[6px]"
              style={{ background: gradientPreview }}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUpload(file)
              e.target.value = ''
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={state.isUploading}
            className="w-full py-1.5 px-3 text-[12px] border border-[#e0e0e0] rounded-[6px] hover:bg-[#faf8f5] transition-colors disabled:opacity-50 nav-label"
          >
            {state.isUploading ? 'アップロード中...' : '画像をアップロード'}
          </button>

          {state.heroImageUrl && (
            <button
              onClick={onDelete}
              className="w-full py-1.5 px-3 text-[12px] border border-[#d94f4f]/30 text-[#d94f4f] rounded-[6px] hover:bg-[#fef0f0] transition-colors nav-label"
            >
              画像を削除
            </button>
          )}
        </div>

        {/* 右: テキストフィールド + グラデーション */}
        <div className="space-y-4">
          {/* Alt テキスト */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c5c5c] mb-1 nav-label">
              Alt テキスト
              <span className="text-[#8a8a8a] font-normal ml-1">（100文字以内・画像設定時のみ有効）</span>
              {state.savingField === 'alt' && (
                <span className="ml-2 text-[#5b7e95]">保存中…</span>
              )}
            </label>
            <input
              type="text"
              value={state.heroImageAlt}
              maxLength={100}
              disabled={!state.heroImageUrl}
              onChange={(e) => onChange({ heroImageAlt: e.target.value })}
              onBlur={onBlurAlt}
              placeholder={state.heroImageUrl ? '例: 北海道せたな町の温泉' : '（画像がない場合は不要）'}
              className="w-full px-3 py-2 text-[13px] border border-[#e0e0e0] rounded-[6px] focus:outline-none focus:border-[#5b7e95] disabled:bg-[#faf8f5] disabled:text-[#8a8a8a]"
            />
          </div>

          {/* リード文 */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c5c5c] mb-1 nav-label">
              リード文
              <span className="text-[#8a8a8a] font-normal ml-1">（500文字以内）</span>
              {state.savingField === 'description' && (
                <span className="ml-2 text-[#5b7e95]">保存中…</span>
              )}
            </label>
            <textarea
              value={state.description}
              maxLength={500}
              rows={2}
              onChange={(e) => onChange({ description: e.target.value })}
              onBlur={onBlurDescription}
              placeholder="空欄の場合は各ページのデフォルトテキストを表示"
              className="w-full px-3 py-2 text-[13px] border border-[#e0e0e0] rounded-[6px] focus:outline-none focus:border-[#5b7e95] resize-none"
            />
            <p className="text-[11px] text-[#8a8a8a] mt-0.5 text-right">
              {state.description.length} / 500
            </p>
          </div>

          {/* グラデーション */}
          <div>
            <label className="block text-[11px] font-medium text-[#5c5c5c] mb-2 nav-label">
              グラデーション
              {state.savingField === 'gradient' && (
                <span className="ml-2 text-[#5b7e95]">保存中…</span>
              )}
            </label>
            <div className="flex gap-3 items-end mb-2">
              {(
                [
                  { key: 'gradFrom' as const, label: 'From' },
                  { key: 'gradVia'  as const, label: 'Via' },
                  { key: 'gradTo'   as const, label: 'To' },
                ] as const
              ).map(({ key, label: colorLabel }) => (
                <div key={key} className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#8a8a8a] mb-1 nav-label">{colorLabel}</p>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={state[key]}
                      onChange={(e) => onChange({ [key]: e.target.value })}
                      onBlur={onBlurGradient}
                      className="w-8 h-8 rounded cursor-pointer border border-[#e0e0e0] p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={state[key]}
                      maxLength={7}
                      onChange={(e) => {
                        const v = e.target.value
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange({ [key]: v })
                      }}
                      onBlur={onBlurGradient}
                      className="min-w-0 flex-1 px-2 py-1 text-[12px] font-mono border border-[#e0e0e0] rounded-[4px] focus:outline-none focus:border-[#5b7e95]"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* プレビュー strip */}
            <div
              className="h-5 rounded-[4px] w-full"
              style={{ background: gradientPreview }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
