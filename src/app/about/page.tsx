import type { Metadata } from 'next'
import Link from 'next/link'
import AboutEmail from './AboutEmail'

export const metadata: Metadata = {
  title: 'SETANAについて',
  description:
    'SETANAは北海道久遠郡せたな町の暮らし・食・自然を伝える独立メディアです。運営会社・編集方針・お問い合わせ先をご案内します。',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'SETANAについて | SETANA',
    description:
      'SETANAは北海道久遠郡せたな町の暮らし・食・自然を伝える独立メディアです。運営会社・編集方針・お問い合わせ先をご案内します。',
    url: 'https://www.setana.life/about',
    type: 'website',
  },
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://www.setana.life/#organization',
  name: '株式会社つなぐ',
  url: 'https://www.setana.life',
  sameAs: ['https://www.setana.life/about'],
  address: {
    '@type': 'PostalAddress',
    addressRegion: '北海道',
    addressLocality: '久遠郡せたな町',
    streetAddress: '北檜山区北檜山17',
    addressCountry: 'JP',
  },
  description:
    'せたな町を拠点に「つなぐ」を事業理念とする地域会社。地域メディアSETANAの運営母体。',
  founder: {
    '@type': 'Person',
    '@id': 'https://www.setana.life/about#person-taniyama',
    name: '谷山 浩司',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://www.setana.life/about#person-taniyama',
  name: '谷山 浩司',
  jobTitle: '代表',
  worksFor: {
    '@id': 'https://www.setana.life/#organization',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: '北海道久遠郡せたな町',
    streetAddress: '北檜山区北檜山17',
    addressCountry: 'JP',
  },
  description:
    '経歴・移住の経緯は後日追記予定。現地に根差したせたな町の暮らしと人をつなぐ活動を続けている。',
}

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://www.setana.life/#website',
  url: 'https://www.setana.life',
  name: 'SETANA',
  description:
    '北海道久遠郡せたな町の暮らし・食・自然を伝える地域総合メディア',
  publisher: {
    '@id': 'https://www.setana.life/#organization',
  },
  inLanguage: 'ja',
}

// ─── コンポーネント ──────────────────────────────────────────────────────────

const axes = [
  {
    label: '旅する',
    labelEn: 'TRAVEL',
    accent: '#c47e4f',
    href: '/travel',
    description:
      'グルメ、観光・自然、温泉、釣り、宿泊——せたな町を旅するすべての人に、現地ならではの情報をお届けします。',
  },
  {
    label: '暮らす',
    labelEn: 'LIFE',
    accent: '#5b7e95',
    href: '/life',
    description:
      '移住・仕事・暮らしのリアル——せたな町で生きることを考える人に向けて、飾らない日常の情報を伝えます。',
  },
  {
    label: '関わる',
    labelEn: 'CONNECT',
    accent: '#4a7c6f',
    href: '/connect',
    description:
      'ふるさと納税、関係人口、二拠点生活——距離を超えて町と関わりを持ちたいすべての人のための入口です。',
  },
] as const

const editorialPolicies = [
  {
    title: '現地取材に基づく情報',
    body: 'すべてのスポット・記事の情報は、私たちが現地を訪れて確認したものです。ネットの転記や二次情報の掲載は行いません。',
  },
  {
    title: '自社撮影の写真',
    body: 'SETANAに掲載する写真はすべて自社で撮影しています。せたな町の光と空気をそのままお届けすることを大切にしています。',
  },
  {
    title: '事業者との直接連絡',
    body: '掲載するお店・施設・生産者とは必ず直接連絡を取り、内容の確認を得た上で情報を公開しています。',
  },
] as const

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {/* ─── ページヘッダー ─────────────────────────────────────── */}
      <section className="bg-[#faf8f5] pt-20 pb-20 px-5 lg:px-8">
        <div className="max-w-[680px] mx-auto">
          <p
            className="text-[11px] tracking-[0.2em] text-[#5b7e95] mb-5"
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            ABOUT
          </p>
          <h1 className="text-[28px] lg:text-[36px] font-bold text-[#1a1a1a] tracking-[0.02em] leading-[1.4] mb-7">
            SETANAについて
          </h1>
          <p className="text-[15px] text-[#5c5c5c] leading-[1.9] tracking-[0.06em]">
            SETANAは、北海道久遠郡せたな町の暮らし・食・自然を伝える地域メディアです。
            観光協会の公式サイトでも、行政広報でもありません。
            せたな町で実際に生きている人たちの目線で、この町のすべてをお届けします。
          </p>
        </div>
      </section>

      {/* ─── メディアの趣旨 ─────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-8">
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#1a1a1a] tracking-[0.03em] leading-[1.5] mb-8">
            観光ガイドではなく、<br />「暮らしのプラットフォーム」を目指して
          </h2>
          <div className="space-y-6 text-[15px] text-[#1a1a1a] leading-[1.9] tracking-[0.06em]">
            <p>
              せたな町は、日本海と狩場山脈に挟まれた北海道南西部の町です。
              人口約7,000人、漁業と酪農が生業の中心で、都市部からは決してアクセスが良いとはいえない。
              それでも——いや、だからこそ——この町には失われていない何かがある、と私たちは感じています。
            </p>
            <p>
              SETANAが伝えたいのは、観光スポットの網羅ではありません。
              ここで魚を獲り、牛を育て、子どもを育て、年を重ねている人たちの日常。
              移住を考える人が本当に知りたい「暮らしのリアル」。
              町を離れてもせたなと関わり続けたい人のための入口。
              そういう場所を、インターネット上につくろうとしています。
            </p>
            <p>
              情報はすべて現地取材に基づき、私たちが直接見て、聞いて、確認したものを掲載します。
              よそから眺めるのではなく、この町の中から発信するメディアであることが、SETANAの核心です。
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3つの軸 ────────────────────────────────────────────── */}
      <section className="bg-[#faf8f5] py-24 px-5 lg:px-8">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#1a1a1a] tracking-[0.03em] leading-[1.5] mb-3">
            SETANAの3つの軸
          </h2>
          <p className="text-[14px] text-[#8a8a8a] tracking-[0.05em] mb-12">
            せたな町との関わり方は一つではありません。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {axes.map((axis) => (
              <Link
                key={axis.labelEn}
                href={axis.href}
                className="group block bg-white rounded-[8px] p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow"
              >
                <p
                  className="text-[10px] tracking-[0.2em] mb-3"
                  style={{
                    color: axis.accent,
                    fontFamily: 'var(--font-inter), sans-serif',
                  }}
                >
                  {axis.labelEn}
                </p>
                <p className="text-[18px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-4">
                  {axis.label}
                </p>
                <p className="text-[13px] text-[#5c5c5c] leading-[1.8] tracking-[0.04em]">
                  {axis.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 編集方針 ───────────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-8">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#1a1a1a] tracking-[0.03em] leading-[1.5] mb-12">
            編集方針
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-10">
            {editorialPolicies.map((policy, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[11px] font-semibold tracking-[0.1em] text-[#5b7e95]"
                    style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                  >
                    0{i + 1}
                  </span>
                  <div className="flex-1 h-px bg-[#5b7e95] opacity-30" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-3">
                  {policy.title}
                </h3>
                <p className="text-[13px] text-[#5c5c5c] leading-[1.85] tracking-[0.04em]">
                  {policy.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 運営者情報 ─────────────────────────────────────────── */}
      <section className="bg-[#faf8f5] py-24 px-5 lg:px-8">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#1a1a1a] tracking-[0.03em] leading-[1.5] mb-12">
            運営者情報
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* 株式会社つなぐ */}
            <div>
              <p
                className="text-[10px] tracking-[0.2em] text-[#8a8a8a] mb-4"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                COMPANY
              </p>
              <h3 className="text-[18px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-6">
                株式会社つなぐ
              </h3>
              <dl className="space-y-4">
                {[
                  { label: '所在地', value: '北海道久遠郡せたな町北檜山区北檜山17' },
                  { label: '代表者', value: '谷山 浩司' },
                  { label: '設立', value: '2023年11月' },
                  { label: '事業内容', value: 'ふるさと納税運用代行・地域メディア運営・地域コーディネート事業' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-5 text-[13px]">
                    <dt className="text-[#8a8a8a] w-[5em] shrink-0 tracking-[0.04em]">
                      {label}
                    </dt>
                    <dd className="text-[#1a1a1a] leading-[1.7] tracking-[0.04em]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* 代表プロフィール */}
            <div>
              <p
                className="text-[10px] tracking-[0.2em] text-[#8a8a8a] mb-4"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                EDITOR IN CHIEF
              </p>
              <h3 className="text-[18px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-2">
                谷山 浩司
              </h3>
              <p className="text-[12px] text-[#8a8a8a] tracking-[0.04em] mb-5">
                代表 / 編集長
              </p>
              {/* 顔写真プレースホルダー */}
              <div className="w-20 h-20 rounded-full bg-[#e0e0e0] mb-6 flex items-center justify-center">
                <span className="text-[10px] text-[#8a8a8a] tracking-[0.04em]">photo</span>
              </div>
              <p className="text-[13px] text-[#5c5c5c] leading-[1.9] tracking-[0.04em]">
                【ここに谷山さんの経歴・せたな町との関わり・移住の経緯などを記入します。
                どんな思いでSETANAを立ち上げたか、この町でどんな活動をしているか、
                読者が「この人が書いているメディアなら信頼できる」と感じられる文章をお願いします。】
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── お問い合わせ ────────────────────────────────────────── */}
      <section className="py-24 px-5 lg:px-8">
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#1a1a1a] tracking-[0.03em] leading-[1.5] mb-3">
            お問い合わせ
          </h2>
          <p className="text-[14px] text-[#8a8a8a] tracking-[0.05em] mb-10">
            掲載に関するご相談、取材依頼、その他のお問い合わせはこちらから。
          </p>

          <div className="space-y-8">
            {/* 一般お問い合わせ */}
            <div className="border border-[#e0e0e0] rounded-[8px] p-7">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-2">
                メディア全般・取材・広報のご相談
              </h3>
              <p className="text-[13px] text-[#5c5c5c] leading-[1.8] tracking-[0.04em] mb-5">
                SETANAへの掲載依頼、取材のご相談、メディアとしての連携など。
              </p>
              <Link
                href="/contact"
                className="inline-block bg-[#5b7e95] text-white text-[13px] font-semibold tracking-[0.04em] px-6 py-3 rounded-[8px] hover:bg-[#3d5a6e] transition-colors"
              >
                お問い合わせフォームへ
              </Link>
            </div>

            {/* 事業者向け */}
            <div className="border border-[#e0e0e0] rounded-[8px] p-7">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] tracking-[0.03em] mb-2">
                事業者・店舗の方へ
              </h3>
              <p className="text-[13px] text-[#5c5c5c] leading-[1.8] tracking-[0.04em] mb-5">
                せたな町内でお店や施設を運営されている方で、情報掲載をご希望の方はご連絡ください。
                現地取材の上、掲載の可否をご案内します。
              </p>
              <Link
                href="/contact"
                className="inline-block bg-white border border-[#e0e0e0] text-[#1a1a1a] text-[13px] font-semibold tracking-[0.04em] px-6 py-3 rounded-[8px] hover:bg-[#faf8f5] transition-colors"
              >
                掲載についてお問い合わせ
              </Link>
            </div>

            {/* 直接連絡先 */}
            <div className="pt-6 border-t border-[#efefef]">
              <p className="text-[12px] text-[#8a8a8a] tracking-[0.04em] leading-[1.8]">
                お急ぎの場合は直接メールにてご連絡ください。<br />
                <AboutEmail />
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
