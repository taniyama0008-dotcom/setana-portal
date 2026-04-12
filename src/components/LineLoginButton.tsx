'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLiff } from '@/context/LiffContext'

export default function LineLoginButton() {
  const { isLoading, isLoggedIn, isSynced, profile, login, logout } = useLiff()

  // LIFF初期化中はスペースを確保してレイアウトシフトを防ぐ
  if (isLoading) {
    return <div className="w-[80px] h-[36px] rounded-[8px] bg-[#e0e0e0] animate-pulse" />
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e0e0e0] text-[#1a1a1a] text-[13px] font-medium transition-colors hover:bg-[#f5f5f5] min-h-[36px]"
      >
        ログイン
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* プロフィール表示 → マイページへ（セッション同期完了後にリンク有効化） */}
      {isSynced ? (
        <Link href="/mypage" className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f5f5f5] transition-colors">
          {profile?.pictureUrl ? (
            <Image
              src={profile.pictureUrl}
              alt={profile.displayName}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#06C755] flex items-center justify-center text-white text-[11px] font-medium">
              {profile?.displayName.slice(0, 1) ?? 'L'}
            </div>
          )}
          <span className="text-[13px] text-[#1a1a1a] font-medium max-w-[80px] truncate hidden sm:block">
            マイページ
          </span>
        </Link>
      ) : (
        // セッション同期中: アバターのみ表示（クリック不可）
        <div className="flex items-center gap-2 px-2 py-1.5 opacity-60">
          {profile?.pictureUrl ? (
            <Image
              src={profile.pictureUrl}
              alt={profile.displayName}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#06C755] flex items-center justify-center text-white text-[11px] font-medium">
              {profile?.displayName.slice(0, 1) ?? 'L'}
            </div>
          )}
          <span className="text-[13px] text-[#8a8a8a] hidden sm:block">読込中…</span>
        </div>
      )}

      {/* ログアウト */}
      <button
        onClick={logout}
        className="px-2.5 py-1.5 text-[12px] text-[#8a8a8a] border border-[#e0e0e0] rounded-[6px] hover:bg-[#faf8f5] transition-colors min-h-[36px] nav-label"
      >
        ログアウト
      </button>
    </div>
  )
}
