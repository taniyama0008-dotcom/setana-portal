'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { saveArticle } from '@/app/actions/article'
import type { Article } from '@/lib/types'

const sectionOptions = [
  { value: 'kurashi', label: '暮らし' },
  { value: 'shoku',   label: '食' },
  { value: 'shizen',  label: '自然' },
]

const categoryOptions = [
  { value: 'story',       label: 'ストーリー' },
  { value: 'job_feature', label: '仕事紹介' },
  { value: 'iju',         label: '移住' },
  { value: 'guide',       label: 'ガイド' },
  { value: 'special',     label: '特集' },
  { value: 'producer',    label: '生産者' },
  { value: 'recipe',      label: 'レシピ' },
  { value: 'course',      label: 'コース' },
]

function toSlug(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return ascii || ''
}

interface ArticleEditorProps {
  article?: Article
}

export default function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter()
  const [title, setTitle]         = useState(article?.title ?? '')
  const [slug, setSlug]           = useState(article?.slug ?? '')
  const [slugDirty, setSlugDirty] = useState(!!article)
  const [section, setSection]     = useState(article?.section ?? '')
  const [category, setCategory]   = useState(article?.category ?? '')
  const [coverImage, setCoverImage] = useState(article?.cover_image ?? '')
  const [excerpt, setExcerpt]     = useState(article?.excerpt ?? '')
  const [content, setContent]     = useState(article?.content ?? '')
  const [authorName, setAuthorName] = useState(article?.author_name ?? '')
  const [mode, setMode]           = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (!slugDirty) setSlug(toSlug(v))
  }

  const handleSave = async (status: 'draft' | 'public') => {
    setSaving(true)
    setError(null)
    const formData = new FormData()
    if (article?.id) formData.set('id', article.id)
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('section', section)
    formData.set('category', category)
    formData.set('cover_image', coverImage)
    formData.set('excerpt', excerpt)
    formData.set('content', content)
    formData.set('author_name', authorName)
    formData.set('status', status)
    const result = await saveArticle(null, formData)
    setSaving(false)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push('/admin/content')
    }
  }

  const inputClass =
    'w-full bg-white border border-[#e0e0e0] rounded-[6px] px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:outline-none focus:border-[#5b7e95] transition-colors'
  const labelClass = 'block text-[12px] font-medium text-[#5c5c5c] mb-1.5'

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] text-[13px] text-[#d94f4f]">
          {error}
        </div>
      )}

      {/* タイトル */}
      <div>
        <label className={labelClass}>タイトル <span className="text-[#d94f4f]">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="記事タイトル"
          className={inputClass}
        />
      </div>

      {/* スラッグ */}
      <div>
        <label className={labelClass}>スラッグ（URL）</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugDirty(true) }}
          placeholder="my-article-slug"
          className={inputClass}
        />
        {slug && (
          <p className="text-[11px] text-[#8a8a8a] mt-1">/article/{slug}</p>
        )}
      </div>

      {/* セクション・カテゴリ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>セクション <span className="text-[#d94f4f]">*</span></label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className={inputClass}
          >
            <option value="">選択...</option>
            {sectionOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>カテゴリ</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">選択...</option>
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 著者名 */}
      <div>
        <label className={labelClass}>著者名</label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="せたな太郎"
          className={inputClass}
        />
      </div>

      {/* カバー画像URL */}
      <div>
        <label className={labelClass}>カバー画像URL</label>
        <input
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
        {coverImage && (
          <div className="mt-2">
            <Image
              src={coverImage}
              alt="カバー画像プレビュー"
              width={320}
              height={180}
              className="rounded-[6px] object-cover border border-[#e0e0e0]"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* 抜粋 */}
      <div>
        <label className={labelClass}>抜粋（一覧表示用・150文字程度）</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="記事の要約を入力..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* 本文 Markdown */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={labelClass + ' mb-0'}>本文（Markdown） <span className="text-[#d94f4f]">*</span></label>
          <div className="flex rounded-[6px] overflow-hidden border border-[#e0e0e0]">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-3 py-1 text-[12px] transition-colors ${mode === 'edit' ? 'bg-[#5b7e95] text-white' : 'bg-white text-[#5c5c5c] hover:bg-[#faf8f5]'}`}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-3 py-1 text-[12px] transition-colors ${mode === 'preview' ? 'bg-[#5b7e95] text-white' : 'bg-white text-[#5c5c5c] hover:bg-[#faf8f5]'}`}
            >
              プレビュー
            </button>
          </div>
        </div>

        {mode === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="# 見出し&#10;&#10;本文を Markdown で入力..."
            className={`${inputClass} resize-y font-mono text-[13px]`}
          />
        ) : (
          <div className="min-h-[320px] bg-white border border-[#e0e0e0] rounded-[6px] px-6 py-5 text-[#1a1a1a]">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <p className="text-[#8a8a8a] text-[13px]">本文を入力するとプレビューが表示されます</p>
            )}
          </div>
        )}
      </div>

      {/* 保存ボタン */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('draft')}
          className="px-6 py-2.5 border border-[#e0e0e0] rounded-[8px] text-[14px] text-[#5c5c5c] hover:bg-[#faf8f5] disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : '下書き保存'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('public')}
          className="px-6 py-2.5 bg-[#c47e4f] hover:bg-[#a5663a] disabled:opacity-50 text-white text-[14px] font-medium rounded-[8px] transition-colors"
        >
          {saving ? '保存中...' : '公開'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/content')}
          className="text-[13px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
