import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'せたな町の移住支援｜補助金・体験住宅・相談窓口',
  description: '北海道せたな町の移住支援制度。移住補助金・体験住宅・移住相談窓口の情報まとめ。',
}

const supports = [
  {
    title: '移住支援金',
    accent: '#c47e4f',
    description: '東京圏等から移住し就業・起業した方への支援金制度。条件を満たす場合、最大100万円の支援が受けられる可能性があります。',
    note: '※要件・金額は年度により変更される場合があります。最新情報は窓口へお問い合わせください。',
  },
  {
    title: '空き家バンク・移住体験住宅',
    accent: '#5b7e95',
    description: '移住前に実際の暮らしを体験できる「お試し住宅」制度があります。短期滞在しながら移住の判断ができます。また、空き家バンクで格安物件を紹介しています。',
    note: '※空き家バンクは随時更新。問い合わせ先：せたな町役場まちづくり推進課',
  },
  {
    title: '農業・漁業支援',
    accent: '#6b8f71',
    description: '新規就農・就漁への支援制度があります。農業経営開始計画認定による各種補助、漁業就業者確保育成センターによる漁業研修等。',
    note: '※詳細は農林水産課へ',
  },
  {
    title: '子育て支援',
    accent: '#3d5a6e',
    description: '子育て世代向けの各種支援。医療費助成・保育料補助・学校給食費助成など。子どもを育てやすい環境づくりに取り組んでいます。',
    note: '※詳細はこども課へ',
  },
]

const voices = [
  {
    name: 'A.K さん（30代・家族移住）',
    from: '東京都 → せたな町',
    year: '2022年移住',
    comment: '農業をやりたくて移住を決めました。最初は不安でしたが、役場の移住担当者が親身に相談に乗ってくれて、今は充実した毎日を送っています。',
  },
  {
    name: 'M.T さん（20代・単身移住）',
    from: '大阪府 → せたな町',
    year: '2023年移住',
    comment: 'テレワークで働きながら、趣味の釣りとサーフィンを楽しんでいます。東京での家賃より安く、生活の質が格段に上がりました。',
  },
]

export default function MigrationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町の移住支援',
            url: 'https://www.setana.life/life/migration',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.setana.life' },
                { '@type': 'ListItem', position: 2, name: '暮らす', item: 'https://www.setana.life/life' },
                { '@type': 'ListItem', position: 3, name: '移住支援', item: 'https://www.setana.life/life/migration' },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3020] via-[#6b8f71] to-[#3d5c42]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/life" className="hover:text-white/70 transition-colors">暮らす</Link>
            <span>›</span>
            <span className="text-white/70">移住支援</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">MIGRATION</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px]">移住支援</h1>
          <p className="text-white/60 text-[14px] mt-2">せたな町への移住を支援する制度・相談窓口。</p>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* 支援制度 */}
        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">SUPPORT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-8">支援制度一覧</h2>
          <div className="space-y-5">
            {supports.map((s) => (
              <div key={s.title} className="bg-white border border-[#efefef] rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-1 h-full min-h-[40px] rounded-full shrink-0 mt-1" style={{ backgroundColor: s.accent }} />
                  <div>
                    <h3 className="text-[16px] font-bold text-[#1a1a1a] mb-2">{s.title}</h3>
                    <p className="text-[14px] text-[#1a1a1a] leading-[1.8] mb-3">{s.description}</p>
                    <p className="text-[12px] text-[#8a8a8a]">{s.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 先輩移住者の声 */}
        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">VOICES</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-8">先輩移住者の声</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {voices.map((v) => (
              <div key={v.name} className="bg-[#faf8f5] rounded-[10px] p-6">
                <p className="text-[14px] text-[#1a1a1a] leading-[1.8] mb-4">"{v.comment}"</p>
                <div className="border-t border-[#e0e0e0] pt-4">
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{v.name}</p>
                  <p className="text-[12px] text-[#8a8a8a]">{v.from} / {v.year}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[#8a8a8a] mt-4">※掲載内容はプレースホルダーです。実際の移住者の声に差し替えてください。</p>
        </section>

        {/* 相談窓口 */}
        <section>
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">CONTACT</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6">移住相談窓口</h2>
          <div className="bg-[#1a1a1a] rounded-[10px] p-8 text-white">
            <p className="text-[16px] font-bold mb-2">せたな町役場 まちづくり推進課</p>
            <p className="text-white/60 text-[14px] mb-4">移住・定住に関するご相談をお受けしています。</p>
            <div className="space-y-2 text-[14px] text-white/70">
              <p>📍 〒049-4192 北海道久遠郡せたな町北檜山区北檜山145番地1</p>
              <p>📞 0137-84-6137</p>
              <p>🕐 平日 8:45〜17:30</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
