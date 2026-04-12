'use client'

import Link from 'next/link'
import { useCallback, useTransition } from 'react'
import LineLoginButton from './LineLoginButton'

interface Props {
  emailUser: { nickname: string } | null
}

export default function AuthButton({ emailUser }: Props) {
  const [isPending, start] = useTransition()

  const logout = useCallback(() => {
    start(async () => {
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      window.location.href = '/'
    })
  }, [])

  // メールログイン済み
  if (emailUser) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/mypage"
          className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f5f5f5] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#5b7e95] flex items-center justify-center text-white text-[11px] font-medium shrink-0">
            {emailUser.nickname.slice(0, 1)}
          </div>
          <span className="text-[13px] text-[#1a1a1a] font-medium max-w-[80px] truncate hidden sm:block">
            マイページ
          </span>
        </Link>
        <button
          onClick={logout}
          disabled={isPending}
          className="px-2.5 py-1.5 text-[12px] text-[#8a8a8a] border border-[#e0e0e0] rounded-[6px] hover:bg-[#faf8f5] transition-colors min-h-[36px] nav-label disabled:opacity-50"
        >
          ログアウト
        </button>
      </div>
    )
  }

  // LINE ログイン or 未ログイン → 既存の LineLoginButton に委譲
  return <LineLoginButton />
}
