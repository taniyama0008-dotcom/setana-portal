import Link from 'next/link'
import LineLoginButton from '@/components/LineLoginButton'

const navItems = [
  { href: '/kurashi', label: '暮らし', color: 'hover:text-[#5b7e95]', border: 'hover:border-[#5b7e95]' },
  { href: '/shoku', label: '食', color: 'hover:text-[#c47e4f]', border: 'hover:border-[#c47e4f]' },
  { href: '/shizen', label: '自然', color: 'hover:text-[#6b8f71]', border: 'hover:border-[#6b8f71]' },
]

export default function Header() {
  return (
    <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50">
      <div className="max-w-[1120px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-[#1a1a1a] font-bold text-base tracking-wide leading-tight hover:opacity-70 transition-opacity shrink-0"
          style={{ fontFamily: 'var(--font-noto-sans-jp), sans-serif' }}
        >
          せたなの暮らし・食・自然
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1 nav-label">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-[13px] font-medium text-[#5c5c5c] border-b-2 border-transparent transition-colors ${item.color} ${item.border} min-h-[48px] flex items-center`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-2 pl-2 border-l border-[#efefef]">
            <LineLoginButton />
          </div>
        </div>
      </div>
    </header>
  )
}
