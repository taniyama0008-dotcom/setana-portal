'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin',         label: 'ダッシュボード', icon: '◈' },
  { href: '/admin/spots',   label: 'スポット管理',   icon: '◉' },
  { href: '/admin/jobs',    label: '求人管理',       icon: '◑' },
  { href: '/admin/reviews', label: '口コミ管理',     icon: '◎' },
  { href: '/admin/users',   label: 'ユーザー管理',   icon: '◐' },
  { href: '/admin/reports', label: '通報・情報管理',  icon: '◉' },
  { href: '/admin/events',  label: 'イベント管理',   icon: '◈' },
  { href: '/admin/content', label: 'コンテンツ管理', icon: '◇' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-[#e0e0e0] min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="px-6 py-5 border-b border-[#efefef]">
        <p className="text-[11px] text-[#8a8a8a] tracking-[0.12em] uppercase nav-label mb-0.5">Setana Portal</p>
        <p className="text-[14px] font-bold text-[#1a1a1a]">管理画面</p>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-[13px] transition-colors border-l-2 ${
                isActive
                  ? 'border-[#5b7e95] text-[#5b7e95] bg-[#f0f5f8] font-medium'
                  : 'border-transparent text-[#5c5c5c] hover:text-[#1a1a1a] hover:bg-[#faf8f5]'
              }`}
            >
              <span className="text-[16px] leading-none opacity-60">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div className="px-6 py-4 border-t border-[#efefef]">
        <Link
          href="/"
          className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors"
        >
          ← サイトに戻る
        </Link>
      </div>
    </aside>
  )
}
