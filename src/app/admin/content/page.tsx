import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import StatusBadge from '@/components/admin/StatusBadge'
import SectionBadge from '@/components/admin/SectionBadge'
import ContentActions from './ContentActions'

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
}

const categoryLabels: Record<string, string> = {
  story: 'ストーリー', job_feature: '仕事紹介', iju: '移住',
  course: 'コース', special: '特集', producer: '生産者',
  recipe: 'レシピ', guide: 'ガイド',
}

export default async function AdminContentPage() {
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, section, category, status, author_name, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-[#e0e0e0]">
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-[0.02em]">コンテンツ管理</h1>
          <p className="text-[13px] text-[#8a8a8a] mt-1">{articles?.length ?? 0}件の記事</p>
        </div>
        <Link
          href="/admin/content/new"
          className="px-4 py-2 bg-[#5b7e95] hover:bg-[#3d5a6e] text-white text-[13px] font-medium rounded-md transition-colors"
        >
          ＋ 新規作成
        </Link>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#efefef]">
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">タイトル</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">セクション</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">カテゴリ</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">著者</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">ステータス</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">作成日</th>
              <th className="px-4 py-3 text-left text-[11px] text-[#8a8a8a] tracking-[0.08em] uppercase font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).map((a: any) => (
              <tr key={a.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <Link
                      href={`/admin/content/${a.id}/edit`}
                      className="text-[13px] font-medium text-[#1a1a1a] hover:text-[#5b7e95] line-clamp-1 transition-colors"
                    >
                      {a.title}
                    </Link>
                    <p className="text-[11px] text-[#8a8a8a]">{a.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><SectionBadge section={a.section} /></td>
                <td className="px-4 py-3 text-[12px] text-[#5c5c5c]">{categoryLabels[a.category] ?? a.category ?? '—'}</td>
                <td className="px-4 py-3 text-[13px] text-[#5c5c5c]">{a.author_name ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-[12px] text-[#8a8a8a] tabular-nums">{formatDate(a.created_at)}</td>
                <td className="px-4 py-3">
                  <ContentActions articleId={a.id} currentStatus={a.status} />
                </td>
              </tr>
            ))}
            {!articles?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#8a8a8a]">
                  記事がありません。
                  <Link href="/admin/content/new" className="ml-2 text-[#5b7e95] hover:underline">新規作成する →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
