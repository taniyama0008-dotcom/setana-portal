import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#faf8f5] border-t border-[#e0e0e0] mt-24">
      <div className="max-w-[1120px] mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div>
            <p className="font-bold text-[#1a1a1a] text-base mb-2">
              せたなの暮らし・食・自然
            </p>
            <p className="text-[12px] text-[#8a8a8a] leading-relaxed max-w-xs">
              北海道久遠郡せたな町の暮らし・食・自然を伝える地域総合メディア。
              海と山に抱かれた町の、暮らしのすべて。
            </p>
          </div>

          <nav className="flex gap-6 nav-label">
            <Link href="/kurashi" className="text-[13px] text-[#5c5c5c] hover:text-[#5b7e95] transition-colors">
              暮らし
            </Link>
            <Link href="/shoku" className="text-[13px] text-[#5c5c5c] hover:text-[#c47e4f] transition-colors">
              食
            </Link>
            <Link href="/shizen" className="text-[13px] text-[#5c5c5c] hover:text-[#6b8f71] transition-colors">
              自然
            </Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-[#efefef]">
          <p className="text-[12px] text-[#8a8a8a]">
            © {new Date().getFullYear()} せたなの暮らし・食・自然
          </p>
        </div>
      </div>
    </footer>
  )
}
