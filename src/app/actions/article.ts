'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

export type ArticleFormState = {
  success?: boolean
  error?: string
} | null

function toSlug(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return ascii || `article-${Date.now()}`
}

export async function saveArticle(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await assertAdmin()

  const id = (formData.get('id') as string | null) || null
  const title = (formData.get('title') as string ?? '').trim()
  const slugRaw = (formData.get('slug') as string ?? '').trim()
  const slug = slugRaw || toSlug(title)
  const section = formData.get('section') as string
  const category = (formData.get('category') as string) || null
  const cover_image = (formData.get('cover_image') as string ?? '').trim() || null
  const excerpt = (formData.get('excerpt') as string ?? '').trim() || null
  const content = (formData.get('content') as string ?? '').trim()
  const author_name = (formData.get('author_name') as string ?? '').trim() || null
  const status = (formData.get('status') as string) || 'draft'

  if (!title) return { error: 'タイトルを入力してください。' }
  if (!section) return { error: 'セクションを選択してください。' }
  if (!content) return { error: '本文を入力してください。' }

  const payload = { title, slug, section, category, cover_image, excerpt, content, author_name, status }

  if (id) {
    const { error } = await supabaseAdmin
      .from('articles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      if (error.code === '23505') return { error: 'そのスラッグは既に使用されています。' }
      return { error: '更新に失敗しました。' }
    }
    revalidatePath(`/article/${slug}`)
  } else {
    const { error } = await supabaseAdmin.from('articles').insert(payload)
    if (error) {
      if (error.code === '23505') return { error: 'そのスラッグは既に使用されています。' }
      return { error: '作成に失敗しました。' }
    }
  }

  revalidatePath('/admin/content')
  revalidatePath('/')
  return { success: true }
}
