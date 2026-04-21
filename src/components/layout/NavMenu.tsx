'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const travelLinks = [
  { href: '/travel/gourmet', label: 'グルメ',     sub: '地元食堂・海鮮・カフェ',     accent: '#c47e4f' },
  { href: '/travel/nature',  label: '観光・自然', sub: '絶景・アクティビティ・神社', accent: '#6b8f71' },
  { href: '/travel/fishing', label: '釣り',       sub: '日本海の磯釣りの聖地',       accent: '#6b8f71' },
  { href: '/travel/onsen',   label: '温泉',       sub: 'くつろぎの日帰り・宿泊湯',   accent: '#5b7e95' },
  { href: '/travel/stay',    label: '泊まる',     sub: 'ホテル・旅館・キャンプ場',   accent: '#3d5a6e' },
  { href: '/travel/access',  label: 'アクセス',   sub: '札幌・函館からの交通案内',   accent: '#8a8a8a' },
]

const lifeLinks = [
  { href: '/life/work',      label: 'しごと',         sub: '求人・協力隊・農林漁業',   accent: '#c47e4f' },
  { href: '/kyoryokutai',    label: '地域おこし協力隊', sub: '都市から地方へ。1〜3年の挑戦', accent: '#6b8f71' },
  { href: '/life/living',    label: '暮らしのリアル',  sub: '生活・医療・買い物・教育', accent: '#5b7e95' },
  { href: '/life/migration', label: '移住支援',       sub: '補助金・体験住宅・相談窓口', accent: '#3d5a6e' },
]

const connectLinks = [
  { href: '/connect/furusato',          label: 'ふるさと納税',         sub: 'せたなを応援する寄付',     accent: '#4a7c6f' },
  { href: '/connect/corporate-furusato', label: '企業版ふるさと納税',   sub: '法人による地域貢献',       accent: '#3d5c6e' },
  { href: '/connect/famimatch',          label: 'ファミマッチ',         sub: '町内外のマッチング',       accent: '#8a6b5b' },
  { href: '/connect/relation',           label: '関係人口として関わる', sub: '二拠点・ワーケーション',   accent: '#6b8a72' },
]

function DropdownMenu({
  links,
  accentColor,
}: {
  links: typeof travelLinks
  accentColor: string
}) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-3 w-[320px] z-50 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out">
      <div className="bg-white rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden" style={{ borderTop: `2px solid ${accentColor}` }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-[#faf8f5] transition-colors border-b border-[#efefef] last:border-0 group/item"
          >
            <div>
              <p className="text-[14px] font-medium text-[#1a1a1a] mb-0.5">{link.label}</p>
              <p className="text-[11px] text-[#8a8a8a]">{link.sub}</p>
            </div>
            <span className="text-[#e0e0e0] group-hover/item:text-[#5b7e95] transition-colors text-[12px]">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function NavMenu() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<'travel' | 'life' | 'connect' | null>(null)
  const pathname = usePathname()

  const travelActive  = pathname.startsWith('/travel')
  const lifeActive    = pathname.startsWith('/life')
  const connectActive = pathname.startsWith('/connect')

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {/* 旅する */}
        <div className="relative group">
          <Link
            href="/travel"
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors min-h-[48px] flex items-center gap-1 nav-label ${
              travelActive
                ? 'border-[#c47e4f] text-[#c47e4f]'
                : 'border-transparent text-[#5c5c5c] hover:text-[#1a1a1a]'
            }`}
          >
            旅する
            <span className="text-[10px] opacity-50">▾</span>
          </Link>
          <DropdownMenu links={travelLinks} accentColor="#c47e4f" />
        </div>

        {/* 暮らす */}
        <div className="relative group">
          <Link
            href="/life"
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors min-h-[48px] flex items-center gap-1 nav-label ${
              lifeActive
                ? 'border-[#5b7e95] text-[#5b7e95]'
                : 'border-transparent text-[#5c5c5c] hover:text-[#1a1a1a]'
            }`}
          >
            暮らす
            <span className="text-[10px] opacity-50">▾</span>
          </Link>
          <DropdownMenu links={lifeLinks} accentColor="#5b7e95" />
        </div>

        {/* 関わる */}
        <div className="relative group">
          <Link
            href="/connect"
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors min-h-[48px] flex items-center gap-1 nav-label ${
              connectActive
                ? 'border-[#4a7c6f] text-[#4a7c6f]'
                : 'border-transparent text-[#5c5c5c] hover:text-[#1a1a1a]'
            }`}
          >
            関わる
            <span className="text-[10px] opacity-50">▾</span>
          </Link>
          <DropdownMenu links={connectLinks} accentColor="#4a7c6f" />
        </div>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="sm:hidden p-2 text-[#1a1a1a] min-h-[44px] min-w-[44px] flex items-center justify-center"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="メニュー"
      >
        {mobileOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
          <div className="px-5 py-4">
            {/* 旅する */}
            <div>
              <button
                className="w-full flex items-center justify-between py-4 text-[15px] font-medium text-[#1a1a1a] border-b border-[#efefef]"
                onClick={() => setMobileExpanded(mobileExpanded === 'travel' ? null : 'travel')}
              >
                <span>旅する</span>
                <span className={`text-[#8a8a8a] transition-transform ${mobileExpanded === 'travel' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {mobileExpanded === 'travel' && (
                <div className="py-2 pl-4">
                  {travelLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-[#faf8f5]"
                    >
                      <div>
                        <p className="text-[14px] font-medium text-[#1a1a1a]">{link.label}</p>
                        <p className="text-[11px] text-[#8a8a8a]">{link.sub}</p>
                      </div>
                      <span className="text-[#e0e0e0] text-[12px]">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 暮らす */}
            <div>
              <button
                className="w-full flex items-center justify-between py-4 text-[15px] font-medium text-[#1a1a1a] border-b border-[#efefef]"
                onClick={() => setMobileExpanded(mobileExpanded === 'life' ? null : 'life')}
              >
                <span>暮らす</span>
                <span className={`text-[#8a8a8a] transition-transform ${mobileExpanded === 'life' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {mobileExpanded === 'life' && (
                <div className="py-2 pl-4">
                  {lifeLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-[#faf8f5]"
                    >
                      <div>
                        <p className="text-[14px] font-medium text-[#1a1a1a]">{link.label}</p>
                        <p className="text-[11px] text-[#8a8a8a]">{link.sub}</p>
                      </div>
                      <span className="text-[#e0e0e0] text-[12px]">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 関わる */}
            <div>
              <button
                className="w-full flex items-center justify-between py-4 text-[15px] font-medium text-[#1a1a1a] border-b border-[#efefef]"
                onClick={() => setMobileExpanded(mobileExpanded === 'connect' ? null : 'connect')}
              >
                <span>関わる</span>
                <span className={`text-[#8a8a8a] transition-transform ${mobileExpanded === 'connect' ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {mobileExpanded === 'connect' && (
                <div className="py-2 pl-4">
                  {connectLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between py-3 border-b border-[#faf8f5]"
                    >
                      <div>
                        <p className="text-[14px] font-medium text-[#1a1a1a]">{link.label}</p>
                        <p className="text-[11px] text-[#8a8a8a]">{link.sub}</p>
                      </div>
                      <span className="text-[#e0e0e0] text-[12px]">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
