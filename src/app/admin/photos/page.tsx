import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'
import AdminPhotoActions from './AdminPhotoActions'

export const metadata: Metadata = { title: '写真管理 | 管理画面' }

function formatDate(d: string): string {
  const dt = new Date(d)
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`
}

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminPhotosPage({ searchParams }: PageProps) {
  const { status: filterStatus } = await searchParams

  let query = supabaseAdmin
    .from('photos')
    .select('id,image_url,caption,visit_year,visit_month,status,is_featured,created_at,users(nickname,line_display_name),spots(name,slug)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filterStatus === 'public' || filterStatus === 'hidden') {
    query = query.eq('status', filterStatus)
  }

  const { data: photos } = await query

  const rows = (photos ?? []) as unknown as {
    id: string
    image_url: string
    caption: string | null
    visit_year: number | null
    visit_month: number | null
    status: 'public' | 'hidden'
    is_featured: boolean
    created_at: string
    users: { nickname: string | null; line_display_name: string | null } | null
    spots: { name: string; slug: string } | null
  }[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-bold text-[#1a1a1a]">写真管理</h1>
        <span className="text-[13px] text-[#8a8a8a]">{rows.length}件</span>
      </div>

      {/* フィルタ */}
      <div className="flex gap-2 mb-6">
        {[
          { label: 'すべて', value: '' },
          { label: '公開中', value: 'public' },
          { label: '非公開', value: 'hidden' },
        ].map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/photos?status=${f.value}` : '/admin/photos'}
            className={`px-4 py-2 rounded-[6px] text-[12px] nav-label transition-colors ${
              (filterStatus ?? '') === f.value
                ? 'bg-[#5b7e95] text-white'
                : 'bg-[#f5f5f5] text-[#5c5c5c] hover:bg-[#efefef]'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-[14px] text-[#8a8a8a] py-8">写真がありません。</p>
      ) : (
        <div className="bg-white rounded-[10px] border border-[#e0e0e0] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#faf8f5] border-b border-[#e0e0e0]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] nav-label">画像</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] nav-label">投稿者</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] nav-label">スポット</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] nav-label">キャプション</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] nav-label">投稿日</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] nav-label">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((photo) => {
                const u = photo.users
                const nickname = u?.nickname ?? u?.line_display_name ?? '匿名'
                return (
                  <tr key={photo.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3">
                      <Link href={`/photos/${photo.id}`} target="_blank">
                        <div className="relative w-14 h-14 rounded-[6px] overflow-hidden bg-[#f0ece8] shrink-0">
                          <Image
                            src={photo.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#1a1a1a] max-w-[120px] truncate">
                      {nickname}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#5c5c5c] max-w-[140px] truncate">
                      {photo.spots?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#5c5c5c] max-w-[200px] truncate">
                      {photo.caption ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#8a8a8a] whitespace-nowrap tabular-nums">
                      {formatDate(photo.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminPhotoActions
                        photoId={photo.id}
                        status={photo.status}
                        isFeatured={photo.is_featured}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
