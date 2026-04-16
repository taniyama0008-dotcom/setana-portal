import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SETANAについて | SETANA',
  description: 'SETANAは北海道せたな町の暮らし・食・自然を伝える地域総合メディアです。',
}

export default function AboutPage() {
  return (
    <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-20">
      <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-[0.02em] mb-10">
        SETANAについて
      </h1>

      <div className="space-y-6 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.04em]">
        <p>
          SETANAは、北海道せたな町の暮らし・食・自然を伝える地域総合メディアです。
        </p>
        <p>
          観光で訪れる方にも、移住を考える方にも、<br />
          そして町で暮らす方にも役立つ情報を届けることを目指しています。
        </p>
      </div>

      <div className="mt-12 pt-10 border-t border-[#e0e0e0] space-y-3 text-[14px] text-[#5c5c5c]">
        <div className="flex gap-4">
          <span className="text-[#8a8a8a] w-20 shrink-0">運営者</span>
          <span>[名前を後で入れる]</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[#8a8a8a] w-20 shrink-0">所在地</span>
          <span>北海道久遠郡せたな町</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[#8a8a8a] w-20 shrink-0">メール</span>
          <span>[メールアドレスを後で入れる]</span>
        </div>
      </div>
    </div>
  )
}
