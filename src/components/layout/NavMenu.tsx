'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { categoryMaster, getCategoriesForSection, type Section } from '@/lib/taxonomy'

type NavLink = { href: string; label: string; sub: string; accent: string }

function DropdownMenu({ links, accentColor }: { links: NavLink[]; accentColor: string }) {
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

function buildLinks(section: Section): NavLink[] {
  return getCategoriesForSection(section).map(([, entry]) => ({
    href:   entry.path,
    label:  entry.label,
    sub:    entry.sub,
    accent: entry.accent,
  }))
}

const sections = (['travel', 'life', 'connect'] as const).map((key) => ({
  key,
  label:    categoryMaster[key].label,
  accent:   categoryMaster[key].accent,
  topHref:  categoryMaster[key].topHref,
  links:    buildLinks(key),
}))

export default function NavMenu() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<Section | null>(null)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {sections.map(({ key, label, accent, topHref, links }) => {
          const active = pathname.startsWith(`/${key}`) ||
            (key === 'life' && pathname.startsWith('/kyoryokutai'))
          return (
            <div key={key} className="relative group">
              <Link
                href={topHref}
                className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors min-h-[48px] flex items-center gap-1 nav-label ${
                  active
                    ? `border-[${accent}] text-[${accent}]`
                    : 'border-transparent text-[#5c5c5c] hover:text-[#1a1a1a]'
                }`}
                style={active ? { borderColor: accent, color: accent } : undefined}
              >
                {label}
                <span className="text-[10px] opacity-50">▾</span>
              </Link>
              <DropdownMenu links={links} accentColor={accent} />
            </div>
          )
        })}
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
            {sections.map(({ key, label, links }) => (
              <div key={key}>
                <button
                  className="w-full flex items-center justify-between py-4 text-[15px] font-medium text-[#1a1a1a] border-b border-[#efefef]"
                  onClick={() => setMobileExpanded(mobileExpanded === key ? null : key)}
                >
                  <span>{label}</span>
                  <span className={`text-[#8a8a8a] transition-transform ${mobileExpanded === key ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {mobileExpanded === key && (
                  <div className="py-2 pl-4">
                    {links.map((link) => (
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
            ))}
          </div>
        </div>
      )}
    </>
  )
}
