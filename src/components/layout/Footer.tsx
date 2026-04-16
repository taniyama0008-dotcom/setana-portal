import Link from 'next/link'

const travelLinks = [
  { href: '/travel/gourmet', label: 'グルメ' },
  { href: '/travel/nature',  label: '観光・自然' },
  { href: '/travel/onsen',   label: '温泉' },
  { href: '/travel/stay',    label: '泊まる' },
  { href: '/travel/access',  label: 'アクセス' },
]

const lifeLinks = [
  { href: '/life/work',      label: 'しごと・求人' },
  { href: '/kyoryokutai',    label: '地域おこし協力隊' },
  { href: '/life/living',    label: '暮らしのリアル' },
  { href: '/life/migration', label: '移住支援' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] mt-0">
      <div className="max-w-[1120px] mx-auto px-5 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* ブランド */}
          <div>
            <p className="font-bold text-white text-[17px] tracking-[0.1em] mb-3">
              SETANA
            </p>
            <p className="text-[12px] text-white/40 leading-[1.8] max-w-xs">
              北海道久遠郡せたな町の暮らし・食・自然を伝える地域総合メディア。
              海と山に抱かれた町の、暮らしのすべて。
            </p>
          </div>

          {/* 旅する */}
          <div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] nav-label mb-4">TRAVEL</p>
            <nav className="space-y-2">
              {travelLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-[13px] text-white/50 hover:text-white/90 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 暮らす */}
          <div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] nav-label mb-4">LIFE</p>
            <nav className="space-y-2">
              {lifeLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-[13px] text-white/50 hover:text-white/90 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] text-white/25">
            © 2026 SETANA
          </p>
          <nav className="flex items-center gap-5">
            <Link href="/about"   className="text-[11px] text-white/30 hover:text-white/70 transition-colors">SETANAについて</Link>
            <Link href="/contact" className="text-[11px] text-white/30 hover:text-white/70 transition-colors">お問い合わせ</Link>
            <Link href="/privacy" className="text-[11px] text-white/30 hover:text-white/70 transition-colors">プライバシーポリシー</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
