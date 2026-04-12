import Link from 'next/link'
import LineLoginButton from '@/components/LineLoginButton'
import NavMenu from './NavMenu'

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
          <NavMenu />

          <div className="ml-2 pl-2 border-l border-[#efefef]">
            <LineLoginButton />
          </div>
        </div>
      </div>
    </header>
  )
}
