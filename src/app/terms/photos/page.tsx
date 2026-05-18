import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '写真投稿ガイドライン | SETANA',
  description: 'みんなのせたな写真ギャラリーへの写真投稿に関するガイドライン。',
  alternates: { canonical: 'https://www.setana.life/terms/photos' },
}

export default function PhotoTermsPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#8a8a8a] nav-label mb-8">
          <Link href="/" className="hover:text-[#1a1a1a] transition-colors">ホーム</Link>
          <span>/</span>
          <Link href="/photos" className="hover:text-[#1a1a1a] transition-colors">みんなのせたな</Link>
          <span>/</span>
          <span className="text-[#5c5c5c]">写真投稿ガイドライン</span>
        </nav>

        <h1 className="text-[26px] font-bold text-[#1a1a1a] mb-2 tracking-[0.02em]">
          写真投稿ガイドライン
        </h1>
        <p className="text-[13px] text-[#8a8a8a] mb-10">最終更新：2025年5月</p>

        <div className="prose prose-sm max-w-none space-y-8 text-[15px] leading-[1.9] text-[#1a1a1a]">

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">1. 投稿できる写真</h2>
            <ul className="space-y-2 pl-5 list-disc text-[14px] text-[#3a3a3a]">
              <li>せたな町内またはその周辺で撮影した写真</li>
              <li>ご自身が撮影した写真、または投稿する権利を持つ写真</li>
              <li>風景、食べ物、体験、イベント、日常のひとコマなど、せたな町の魅力を伝えるもの</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">2. 投稿できない写真</h2>
            <ul className="space-y-2 pl-5 list-disc text-[14px] text-[#3a3a3a]">
              <li>他者の著作権・肖像権を侵害する写真</li>
              <li>人物が映っており、本人の同意を得ていない写真</li>
              <li>わいせつ・暴力的・差別的な内容を含む写真</li>
              <li>せたな町と無関係な写真</li>
              <li>個人情報（住所・電話番号・車のナンバープレートなど）が特定できる写真</li>
              <li>広告・宣伝を主目的とした写真</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">3. 肖像権・プライバシー</h2>
            <p className="text-[14px] text-[#3a3a3a]">
              人物が写っている場合、投稿者は被写体本人の同意を得たうえで投稿してください。
              同意なく他者を撮影・公開することは肖像権・プライバシーの侵害となる場合があります。
              未成年が被写体の場合は保護者の同意が必要です。
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">4. 知的財産権</h2>
            <p className="text-[14px] text-[#3a3a3a]">
              投稿された写真の著作権は投稿者に帰属します。
              ただし、投稿者は株式会社つなぐおよびSETANA編集部に対し、
              本サービスの運営・広報目的での使用（ウェブサイト・SNS・印刷物等）を
              無償で許諾するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">5. 削除・非公開化</h2>
            <p className="text-[14px] text-[#3a3a3a]">
              以下に該当すると判断した場合、予告なく投稿を削除または非公開にすることがあります。
            </p>
            <ul className="mt-3 space-y-2 pl-5 list-disc text-[14px] text-[#3a3a3a]">
              <li>本ガイドラインに違反する投稿</li>
              <li>第三者から苦情・削除申請があり、正当と判断された場合</li>
              <li>その他、編集部が不適切と判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">6. ピックアップ選出</h2>
            <p className="text-[14px] text-[#3a3a3a]">
              編集部が特に優れた写真をピックアップとして選出する場合があります。
              ピックアップ選出はせたなコイン +10 が付与されます。
              選出基準や選出数等は編集部の裁量によります。
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">7. 免責事項</h2>
            <p className="text-[14px] text-[#3a3a3a]">
              投稿者が本ガイドラインに違反したことにより第三者に損害が発生した場合、
              株式会社つなぐは一切の責任を負いません。
              投稿者自身が責任を持って対処してください。
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold mb-4 tracking-[0.02em]">8. お問い合わせ</h2>
            <p className="text-[14px] text-[#3a3a3a]">
              本ガイドラインに関するお問い合わせは
              <Link href="/contact" className="text-[#5b7e95] underline underline-offset-2 hover:text-[#3d5a6e] mx-1">
                お問い合わせフォーム
              </Link>
              よりご連絡ください。
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#e0e0e0]">
          <Link
            href="/photos"
            className="inline-flex items-center gap-2 text-[14px] text-[#5c5c5c] hover:text-[#1a1a1a] transition-colors"
          >
            ← みんなのせたなへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
