import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'せたな町へのアクセス｜札幌・函館・新千歳からの交通案内',
  description: '北海道せたな町へのアクセス方法。札幌・函館・新千歳空港からの所要時間・交通手段・冬季注意点。',
}

const routes = [
  {
    from: '札幌',
    car: '約2時間40分（道央自動車道 → 国道229号）',
    bus: '函館バス「せたな号」約3時間30分',
    distance: '約140km',
    accent: '#5b7e95',
  },
  {
    from: '函館',
    car: '約1時間50分（国道5号 → 国道229号）',
    bus: '函館バス「せたな号」約2時間30分',
    distance: '約90km',
    accent: '#6b8f71',
  },
  {
    from: '新千歳空港',
    car: '約3時間（道央自動車道 → 国道229号）',
    bus: '千歳→札幌→函館バス乗り継ぎ',
    distance: '約200km',
    accent: '#c47e4f',
  },
]

const winterNotes = [
  '国道229号は冬期（12月〜3月）に積雪・凍結が発生します。スタッドレスタイヤ必須。',
  '大成区方面の峠道は吹雪時に通行止めになる場合があります。出発前に道路情報を確認してください。',
  '日が短いため早朝・深夜の運転は避け、明るい時間帯に移動することをおすすめします。',
]

export default function AccessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町へのアクセス',
            url: 'https://setana-portal.vercel.app/travel/access',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://setana-portal.vercel.app' },
                { '@type': 'ListItem', position: 2, name: '旅する', item: 'https://setana-portal.vercel.app/travel' },
                { '@type': 'ListItem', position: 3, name: 'アクセス', item: 'https://setana-portal.vercel.app/travel/access' },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[36vh] min-h-[240px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#4a4a4a] to-[#3a3a3a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <Link href="/travel" className="hover:text-white/70 transition-colors">旅する</Link>
            <span>›</span>
            <span className="text-white/70">アクセス</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">ACCESS</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px]">アクセス</h1>
          <p className="text-white/60 text-[14px] mt-2">せたな町への交通案内</p>
        </div>
      </section>

      <div className="max-w-[860px] mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* 交通手段 */}
        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-10">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">ROUTE</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-8 tracking-[0.02em]">各地からのアクセス</h2>

          <div className="space-y-6">
            {routes.map((route) => (
              <div
                key={route.from}
                className="bg-white border border-[#efefef] rounded-[10px] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: route.accent }}
                  />
                  <div>
                    <p className="text-[18px] font-bold text-[#1a1a1a]">{route.from}から</p>
                    <p className="text-[12px] text-[#8a8a8a]">距離: {route.distance}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4">
                  <div>
                    <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-1">🚗 車</p>
                    <p className="text-[14px] text-[#1a1a1a] leading-[1.7]">{route.car}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-1">🚌 バス</p>
                    <p className="text-[14px] text-[#1a1a1a] leading-[1.7]">{route.bus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Google Maps */}
        <section className="mb-16">
          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">MAP</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6 tracking-[0.02em]">地図</h2>
          <div className="rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94847.42068609254!2d139.5!3d42.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f717b3b7c3b8e0f%3A0x0!2z44Gb44Gf44Gq55S677Iy77yI5YyX6YeO6YO96YGp6YGL6Iq477yJ!5e0!3m2!1sja!2sjp!4v1600000000000!5m2!1sja!2sjp"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="せたな町の地図"
            />
          </div>
        </section>

        {/* 冬季注意事項 */}
        <section>
          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">WINTER</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[22px] font-bold mb-6 tracking-[0.02em]">冬季の注意点</h2>
          <div className="bg-[#faf8f5] rounded-[10px] p-6">
            <ul className="space-y-4">
              {winterNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#5b7e95] text-[16px] mt-0.5 shrink-0">❄</span>
                  <p className="text-[14px] text-[#1a1a1a] leading-[1.8] tracking-[0.04em]">{note}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}
