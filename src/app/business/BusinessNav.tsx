'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/business',              label: 'ダッシュボード' },
  { href: '/business/jobs',         label: '求人管理' },
  { href: '/business/kyoryokutai',  label: '協力隊LP' },
  { href: '/business/reviews',      label: '口コミ・返信' },
]

export default function BusinessNav() {
  const pathname = usePathname()

  return (
    <header className="bg-white border-b border-[#e0e0e0]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <p className="text-[13px] font-bold text-[#1a1a1a]">事業者管理</p>
          <Link href="/" className="text-[12px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
            ← サイトに戻る
          </Link>
        </div>
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => {
            const isActive =
              tab.href === '/business'
                ? pathname === '/business'
                : pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2.5 text-[13px] border-b-2 transition-colors nav-label ${
                  isActive
                    ? 'border-[#5b7e95] text-[#5b7e95] font-medium'
                    : 'border-transparent text-[#5c5c5c] hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
