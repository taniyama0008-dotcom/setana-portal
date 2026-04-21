import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ファミマッチ | 「うちの子をよろしく」が届く婚活 - SETANA',
  description:
    'せたな町での暮らしに興味のある町外の方と、町内の独身を出会わせるインターネット婚活サービス。運営：株式会社つなぐ。',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ファミマッチ',
  description:
    'せたな町での暮らしに興味のある町外の方と、町内の独身を出会わせるインターネット婚活サービス',
  url: 'https://www.famimatch.jp/',
  provider: {
    '@type': 'Organization',
    name: '株式会社つなぐ',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'せたな町北檜山区北檜山17',
      addressRegion: '北海道',
      addressCountry: 'JP',
    },
    telephone: '050-3773-4757',
    email: 'info@famimatch.jp',
  },
  areaServed: {
    '@type': 'City',
    name: 'せたな町',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
      { '@type': 'ListItem', position: 2, name: '関わる', item: 'https://www.setana.life/connect' },
      { '@type': 'ListItem', position: 3, name: 'ファミマッチ', item: 'https://www.setana.life/connect/famimatch' },
    ],
  },
}

const ORANGE = '#e07038'

const features = [
  {
    title: '完全無料',
    body: '応援金の仕組みにより、登録・利用に費用は一切かかりません。',
    icon: '¥0',
  },
  {
    title: 'プライバシーに配慮',
    body: '町内在住者同士にはプロフィールが表示されない仕組みです。町内の方に登録していることが知られることはありません。',
    icon: '🔒',
  },
  {
    title: '家族の存在が安心に',
    body: '家族の紹介を載せることができ、町外の方が安心して連絡しやすくなります。',
    icon: '👨‍👩‍👧',
  },
]

const steps = [
  {
    step: 'STEP 1',
    title: '応援する',
    body: '個人は500円から応援できます。協賛企業・個人事業者はプランをお選びください。',
  },
  {
    step: 'STEP 2',
    title: '応援金は全額、町内に出会いを届ける費用になる',
    body: '町内の方のプロフィールが、町外の独身者のスマホに届きます。応援が増えるほど、届く人数が増えます。',
  },
  {
    step: 'STEP 3',
    title: '出会いが生まれる',
    body: 'せたなの暮らしに興味のある方が全国から登録します。毎月、全額の使い道をレポートで公開します。',
  },
]

export default function FamimatchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── ヒーロー ──────────────────────────────────────────── */}
      <section className="relative min-h-[560px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1008] via-[#7a3010] to-[#b85a28]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-16 lg:pb-24">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-6 flex-wrap">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/connect" className="hover:text-white/70 transition-colors">関わる</Link>
            <span>›</span>
            <span className="text-white/70">ファミマッチ</span>
          </nav>
          <p className="text-white/50 text-[11px] font-medium tracking-[0.25em] mb-4 nav-label">FAMIMATCH</p>
          <h1
            className="text-white text-[30px] lg:text-[46px] leading-[1.35] tracking-[0.02em] mb-4"
            style={{ fontWeight: 700 }}
          >
            「うちの子をよろしく」が届く婚活
          </h1>
          <p className="text-white/70 text-[15px] lg:text-[17px] leading-[1.9] tracking-[0.05em] max-w-[520px] mb-10">
            せたなに住みたい人は、全国にいます。<br className="hidden sm:block" />
            その出会いを、届けます。
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.famimatch.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 text-white text-[15px] font-bold rounded-[8px] transition-colors min-h-[52px] bg-[#e07038] hover:bg-[#b85a28]"
            >
              ファミマッチを開く
              <span className="text-[12px] opacity-80">↗</span>
            </a>
            <a
              href="https://www.famimatch.jp/support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/20 text-white text-[15px] font-medium rounded-[8px] transition-colors min-h-[52px] border border-white/25"
            >
              応援する
              <span className="text-[12px] opacity-80">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── セクション1：ファミマッチとは ────────────────────── */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[11px] font-medium tracking-[0.25em] nav-label" style={{ color: ORANGE }}>ABOUT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] lg:text-[26px] font-bold tracking-[0.02em] mb-6">
            ファミマッチとは
          </h2>
          <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em]">
            「地方で暮らしたい」「自然の中で子育てしたい」と考える町外の女性・男性は増えています。ファミマッチは、せたな町での暮らしに興味のある町外の方と、町内の独身を出会わせるインターネット婚活サービスです。
          </p>
          <div className="mt-8">
            <a
              href="https://www.famimatch.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white text-[14px] font-medium rounded-[8px] transition-opacity hover:opacity-80 min-h-[48px]"
              style={{ backgroundColor: ORANGE }}
            >
              ファミマッチを開く ↗
            </a>
          </div>
        </div>
      </section>

      {/* ─── セクション2：3つの特徴 ────────────────────────────── */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[11px] font-medium tracking-[0.25em] nav-label" style={{ color: ORANGE }}>FEATURES</p>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] lg:text-[26px] font-bold tracking-[0.02em] mb-10">
            3つの特徴
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-[12px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[18px] font-bold mb-4"
                  style={{ backgroundColor: ORANGE }}
                >
                  {f.icon}
                </div>
                <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-3 tracking-[0.02em]">{f.title}</h3>
                <p className="text-[13px] text-[#5c5c5c] leading-[1.8]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── セクション3：あと15年 ──────────────────────────────── */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#1a1a1a]">
        <div className="max-w-[680px] mx-auto">
          <h2
            className="text-white text-[22px] lg:text-[28px] font-bold leading-[1.5] tracking-[0.02em] mb-8"
          >
            「あと15年で、<br />せたなはどうなりますか」
          </h2>
          <div className="space-y-3 mb-10">
            {[
              'いつもの買い物が、できなくなる。',
              'ガソリンを入れる場所が、なくなる。',
              '子どもの声が聞こえない学校になる。',
              '除雪してくれる人がいなくなる。',
            ].map((line) => (
              <p key={line} className="text-white/60 text-[15px] leading-[1.8] tracking-[0.04em]">
                {line}
              </p>
            ))}
          </div>
          <p className="text-white/40 text-[13px] leading-[1.8] tracking-[0.04em] mb-8">
            想像したくない話ですが、何もしなければ15年後の現実です。
          </p>
          <p className="text-white text-[16px] lg:text-[18px] leading-[1.9] tracking-[0.04em] font-medium">
            この町の誰かに、出会いが届く。<br />
            誰かがこの町を選んでくれた。<br />
            それだけで町が続いていく。
          </p>
        </div>
      </section>

      {/* ─── セクション4：応援する3ステップ ───────────────────── */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[11px] font-medium tracking-[0.25em] nav-label" style={{ color: ORANGE }}>HOW TO SUPPORT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] lg:text-[26px] font-bold tracking-[0.02em] mb-10">
            応援する
          </h2>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-5">
                <div className="shrink-0 flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold"
                    style={{ backgroundColor: ORANGE }}
                  >
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 mt-2" style={{ backgroundColor: `${ORANGE}40` }} />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-[10px] font-medium tracking-[0.2em] nav-label mb-1" style={{ color: ORANGE }}>
                    {s.step}
                  </p>
                  <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2 tracking-[0.02em]">{s.title}</h3>
                  <p className="text-[14px] text-[#5c5c5c] leading-[1.8]">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <a
              href="https://www.famimatch.jp/support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 text-white text-[15px] font-bold rounded-[8px] transition-opacity hover:opacity-80 min-h-[52px]"
              style={{ backgroundColor: ORANGE }}
            >
              今すぐ応援する ↗
            </a>
          </div>
        </div>
      </section>

      {/* ─── セクション5：応援方法 ──────────────────────────────── */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-[#faf8f5]">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[11px] font-medium tracking-[0.25em] nav-label" style={{ color: ORANGE }}>PAYMENT</p>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold tracking-[0.02em] mb-8">
            応援方法
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-[10px] p-5 border border-[#efefef]">
              <p className="text-[12px] font-medium tracking-[0.15em] nav-label mb-2" style={{ color: ORANGE }}>
                クレジットカード
              </p>
              <p className="text-[14px] text-[#1a1a1a] leading-[1.8]">
                <a
                  href="https://www.famimatch.jp/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                  style={{ color: ORANGE }}
                >
                  famimatch.jp/support
                </a>
                {' '}からお手続きいただけます。
              </p>
            </div>
            <div className="bg-white rounded-[10px] p-5 border border-[#efefef]">
              <p className="text-[12px] font-medium tracking-[0.15em] nav-label mb-2" style={{ color: ORANGE }}>
                お振込み
              </p>
              <div className="text-[14px] text-[#1a1a1a] leading-[2] tracking-[0.03em]">
                <p>新函館農業協同組合 せたな中央支店</p>
                <p>普通 0033821</p>
                <p>口座名義：カ）ツナグ</p>
              </div>
            </div>
            <div className="bg-white rounded-[10px] p-5 border border-[#efefef]">
              <p className="text-[12px] font-medium tracking-[0.15em] nav-label mb-2" style={{ color: ORANGE }}>
                直接お持ちいただく場合
              </p>
              <div className="text-[14px] text-[#1a1a1a] leading-[2]">
                <p>株式会社つなぐ</p>
                <p>久遠郡せたな町北檜山区北檜山17</p>
                <p>
                  電話：
                  <a href="tel:050-3773-4757" className="font-medium" style={{ color: ORANGE }}>
                    050-3773-4757
                  </a>
                  （事前にご連絡ください）
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── セクション6：企業・個人事業者へ ──────────────────── */}
      <section className="py-16 lg:py-24 px-5 lg:px-8 bg-white">
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[11px] font-medium tracking-[0.25em] nav-label" style={{ color: ORANGE }}>FOR BUSINESS</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold tracking-[0.02em] mb-6">
            企業・個人事業者の方へ
          </h2>
          <p className="text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em] mb-6">
            地域の婚活支援・定住促進への取り組みとして、CSR活動の実績にもご活用いただけます。協賛金は広告宣伝費として経費算入できます。
          </p>
          <p className="text-[14px] text-[#5c5c5c] leading-[1.8] mb-8">
            お問い合わせ：
            <a
              href="mailto:info@famimatch.jp"
              className="font-medium hover:underline"
              style={{ color: ORANGE }}
            >
              info@famimatch.jp
            </a>
          </p>
          <a
            href="https://www.famimatch.jp/support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-white text-[14px] font-medium rounded-[8px] transition-opacity hover:opacity-80 min-h-[48px]"
            style={{ backgroundColor: ORANGE }}
          >
            協賛プランを見る ↗
          </a>
        </div>
      </section>

      {/* ─── 運営 + 最終CTA ─────────────────────────────────────── */}
      <section className="py-16 px-5 lg:px-8 bg-[#faf8f5] border-t border-[#efefef]">
        <div className="max-w-[680px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="text-[12px] text-[#8a8a8a] space-y-1">
              <p className="font-medium text-[#5c5c5c]">運営</p>
              <p>株式会社つなぐ</p>
              <p>久遠郡せたな町北檜山区北檜山17</p>
            </div>
            <div className="flex flex-col sm:items-end gap-3">
              <a
                href="https://www.famimatch.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 text-white text-[15px] font-bold rounded-[8px] transition-opacity hover:opacity-80 min-h-[52px] whitespace-nowrap"
                style={{ backgroundColor: ORANGE }}
              >
                ファミマッチを開く ↗
              </a>
              <a
                href="https://www.famimatch.jp/support"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 text-[15px] font-medium rounded-[8px] transition-colors min-h-[52px] border whitespace-nowrap"
                style={{ color: ORANGE, borderColor: `${ORANGE}60` }}
              >
                応援する ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
