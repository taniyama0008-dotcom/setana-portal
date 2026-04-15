import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Article } from '@/lib/types'
import ArticleEditor from '../../ArticleEditor'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: article } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!article) notFound()

  return (
    <div className="p-8 max-w-[860px]">
      <div className="mb-2">
        <Link href="/admin/content" className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← コンテンツ管理
        </Link>
      </div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-[0.02em]">記事を編集</h1>
        <p className="text-[13px] text-[#8a8a8a] mt-1">{article.title}</p>
      </div>
      <ArticleEditor article={article as Article} />
    </div>
  )
}
