'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLiff } from '@/context/LiffContext'

interface MyPageProfileProps {
  userId: string
  dbUser: {
    nickname: string | null
    line_display_name: string | null
    line_picture_url: string | null
    role: string
    created_at: string
  } | null
}

const roleLabel: Record<string, string> = {
  admin:    '管理者',
  business: '事業者',
  user:     'メンバー',
}

export default function MyPageProfile({ dbUser }: MyPageProfileProps) {
  const { profile, logout } = useLiff()

  const displayName = profile?.displayName ?? dbUser?.line_display_name ?? dbUser?.nickname ?? '—'
  const pictureUrl  = profile?.pictureUrl  ?? dbUser?.line_picture_url  ?? null
  const role        = dbUser?.role ?? 'user'
  const since       = dbUser?.created_at
    ? new Date(dbUser.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="flex items-start gap-5">
      {/* アバター */}
      {pictureUrl ? (
        <Image
          src={pictureUrl}
          alt={displayName}
          width={64}
          height={64}
          className="rounded-full shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[20px] font-bold text-[#5c5c5c] shrink-0">
          {displayName.slice(0, 1)}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-[20px] font-bold text-[#1a1a1a] tracking-[0.02em]">{displayName}</h1>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            role === 'admin'    ? 'bg-[#1a1a1a] text-white' :
            role === 'business' ? 'bg-[#5b7e95] text-white' :
                                  'bg-[#e0e0e0] text-[#5c5c5c]'
          }`}>
            {roleLabel[role]}
          </span>
        </div>
        <p className="text-[12px] text-[#8a8a8a] mb-3">{since}より利用</p>

        <div className="flex items-center gap-3 flex-wrap">
          {role === 'business' && (
            <Link
              href="/business"
              className="text-[12px] px-3 py-1.5 bg-[#e8f0f5] text-[#5b7e95] rounded-md hover:bg-[#d0e5ef] transition-colors"
            >
              事業者管理画面
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/admin"
              className="text-[12px] px-3 py-1.5 bg-[#1a1a1a] text-white rounded-md hover:opacity-80 transition-opacity"
            >
              管理画面
            </Link>
          )}
          <button
            onClick={logout}
            className="text-[12px] px-3 py-1.5 border border-[#e0e0e0] text-[#8a8a8a] rounded-md hover:bg-[#faf8f5] transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}
