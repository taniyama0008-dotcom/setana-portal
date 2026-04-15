import Link from 'next/link'
import ArticleEditor from '../ArticleEditor'

export default function NewArticlePage() {
  return (
    <div className="p-8 max-w-[860px]">
      <div className="mb-2">
        <Link href="/admin/content" className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← コンテンツ管理
        </Link>
      </div>
      <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
        <h1 className="text-[22px] font-bold text-[#1a1a1a] tracking-[0.02em]">新規記事作成</h1>
      </div>
      <ArticleEditor />
    </div>
  )
}
