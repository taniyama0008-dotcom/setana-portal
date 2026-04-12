'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { useLiff } from '@/context/LiffContext'
import { updateNickname } from '@/app/actions/user'

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
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateNickname, null)

  const nickname    = dbUser?.nickname ?? dbUser?.line_display_name ?? '—'
  const pictureUrl  = profile?.pictureUrl ?? dbUser?.line_picture_url ?? null
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
          alt={nickname}
          width={64}
          height={64}
          className="rounded-full shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#e0e0e0] flex items-center justify-center text-[20px] font-bold text-[#5c5c5c] shrink-0">
          {nickname.slice(0, 1)}
        </div>
      )}

      <div className="flex-1">
        {/* 表示名 + 編集 */}
        {isEditing ? (
          <form
            action={async (fd) => {
              await formAction(fd)
              setIsEditing(false)
            }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <input
                name="nickname"
                type="text"
                defaultValue={nickname === '—' ? '' : nickname}
                maxLength={30}
                required
                autoFocus
                placeholder="表示名（30文字以内）"
                className="border border-[#5b7e95] rounded-[6px] px-3 py-1.5 text-[15px] text-[#1a1a1a] focus:outline-none w-[180px]"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-3 py-1.5 bg-[#5b7e95] text-white text-[13px] rounded-[6px] hover:bg-[#4a6a7e] disabled:opacity-50 transition-colors"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-[13px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
              >
                キャンセル
              </button>
            </div>
            {state?.error && (
              <p className="text-[12px] text-[#d94f4f]">{state.error}</p>
            )}
          </form>
        ) : (
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[20px] font-bold text-[#1a1a1a] tracking-[0.02em]">{nickname}</h1>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              role === 'admin'    ? 'bg-[#1a1a1a] text-white' :
              role === 'business' ? 'bg-[#5b7e95] text-white' :
                                    'bg-[#e0e0e0] text-[#5c5c5c]'
            }`}>
              {roleLabel[role]}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[12px] text-[#8a8a8a] hover:text-[#5b7e95] transition-colors underline underline-offset-2"
            >
              変更
            </button>
          </div>
        )}

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
