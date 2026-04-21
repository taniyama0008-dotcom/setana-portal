import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import SpotCard from '@/components/spot/SpotCard'
import type { Spot, CalendarEvent, Report } from '@/lib/types'

const travelCards = [
  {
    href: '/travel/gourmet',
    label: 'グルメ',
    labelEn: 'GOURMET',
    description: '日本海の幸、山の幸。地元食堂から海鮮まで。',
    gradient: 'from-[#c47e4f] to-[#8a5535]',
    accent: '#c47e4f',
  },
  {
    href: '/travel/nature',
    label: '観光・自然',
    labelEn: 'NATURE',
    description: '狩場山、断崖の霊場、日本海の絶景。',
    gradient: 'from-[#6b8f71] to-[#3d5c42]',
    accent: '#6b8f71',
  },
  {
    href: '/travel/onsen',
    label: '温泉',
    labelEn: 'ONSEN',
    description: '旅の疲れを癒すせたなの温泉。',
    gradient: 'from-[#5b7e95] to-[#3d5a6e]',
    accent: '#5b7e95',
  },
  {
    href: '/travel/stay',
    label: '泊まる',
    labelEn: 'STAY',
    description: '海辺のホテルから山のキャンプ場まで。',
    gradient: 'from-[#3d5a6e] to-[#2a3f50]',
    accent: '#3d5a6e',
  },
  {
    href: '/travel/access',
    label: 'アクセス',
    labelEn: 'ACCESS',
    description: '札幌・函館・新千歳からの交通案内。',
    gradient: 'from-[#6e6e6e] to-[#3a3a3a]',
    accent: '#6e6e6e',
  },
]

const connectCards = [
  {
    href: '/connect/furusato',
    label: 'ふるさと納税',
    labelEn: 'FURUSATO',
    description: '返礼品と寄付金の使いみち、生産者の顔が見えるせたなのふるさと納税。',
    gradient: 'from-[#4a7c6f] to-[#2d5a50]',
    accent: '#4a7c6f',
    large: true,
  },
  {
    href: '/connect/corporate-furusato',
    label: '企業版ふるさと納税',
    labelEn: 'CORPORATE',
    description: '法人による地域貢献。税制優遇と具体的な認定事業のご案内。',
    gradient: 'from-[#3d5c6e] to-[#2a4050]',
    accent: '#3d5c6e',
    large: false,
  },
  {
    href: '/connect/famimatch',
    label: 'ファミマッチ',
    labelEn: 'MATCH',
    description: '町内の独身と町外の人をつなぐ、せたな町の出会いの広場。',
    gradient: 'from-[#8a6b5b] to-[#5c4035]',
    accent: '#8a6b5b',
    large: false,
  },
  {
    href: '/connect/relation',
    label: '関係人口',
    labelEn: 'RELATION',
    description: '移住の前に、せたなと関わるもう一つの選択肢。',
    gradient: 'from-[#6b8a72] to-[#4a6b50]',
    accent: '#6b8a72',
    large: false,
  },
]

const lifeCards = [
  {
    href: '/life/work',
    label: 'しごと・求人',
    labelEn: 'WORK',
    description: '正規・季節・地域おこし協力隊まで。せたなで働くすべての情報。',
    gradient: 'from-[#c47e4f] to-[#a5663a]',
    accent: '#c47e4f',
    large: true,
  },
  {
    href: '/life/living',
    label: '暮らしのリアル',
    labelEn: 'LIVING',
    description: '冬の生活、医療、買い物事情。移住前に知っておきたいこと。',
    gradient: 'from-[#5b7e95] to-[#3d5a6e]',
    accent: '#5b7e95',
    large: false,
  },
  {
    href: '/life/migration',
    label: '移住支援',
    labelEn: 'MIGRATION',
    description: '補助金・体験住宅・相談窓口の一覧。',
    gradient: 'from-[#6b8f71] to-[#4a6b50]',
    accent: '#6b8f71',
    large: false,
  },
]

const sectionArticleConfig: Record<string, { label: string; color: string }> = {
  kurashi: { label: '暮らし', color: '#5b7e95' },
  shoku:   { label: '食',     color: '#c47e4f' },
  shizen:  { label: '自然',   color: '#6b8f71' },
}

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

export default async function Home() {
  const today = new Date().toISOString().split('T')[0]

  const [{ data: spots }, { data: upcomingEvents }, { data: publicReports }, { data: latestArticles }] = await Promise.all([
    supabase
      .from('spots')
      .select('*')
      .eq('status', 'public')
      .in('section', ['shoku', 'shizen'])
      .order('created_at', { ascending: false })
      .limit(6),
    supabaseAdmin
      .from('events')
      .select('*')
      .in('status', ['upcoming', 'ongoing'])
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(3),
    supabase
      .from('reports')
      .select('id, category, report_type, description, public_message, spot_name, reporter_name, photo_url, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('articles')
      .select('id, title, slug, section, cover_image, excerpt, created_at')
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const events  = (upcomingEvents ?? []) as CalendarEvent[]
  const reports = (publicReports ?? []) as Report[]

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'SETANA',
            description: '北海道久遠郡せたな町の暮らし・食・自然を伝える地域総合メディア',
            url: 'https://www.setana.life',
          }),
        }}
      />

      {/* ─── ヒーロー ──────────────────────────────────────── */}
      <section className="relative h-[75vh] min-h-[520px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-[#1a2a35]" />
        <Image
          src="/images/hero.jpg"
          alt="北海道せたな町の風景"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-16 lg:pb-24">
          <p className="text-white/50 text-[11px] font-medium tracking-[0.25em] mb-5 nav-label">
            HOKKAIDO / SETANA-CHO
          </p>
          <h1 className="text-white font-light text-[32px] lg:text-[52px] leading-[1.3] tracking-[0.02em] mb-5" style={{ fontWeight: 300 }}>
            海と山に抱かれた町の、<br className="hidden sm:block" />
            <span className="font-bold">暮らしのすべて。</span>
          </h1>
          <p className="text-white/70 text-[15px] lg:text-[17px] leading-[1.9] tracking-[0.06em] max-w-[480px]">
            北海道久遠郡せたな町 — グルメ・自然・温泉を旅する人にも、<br className="hidden sm:block" />
            移住・仕事を探す人にも。
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/travel"
              className="px-7 py-3.5 bg-[#c47e4f] hover:bg-[#a5663a] text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px] flex items-center"
            >
              旅する →
            </Link>
            <Link
              href="/life"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px] flex items-center border border-white/20"
            >
              暮らす →
            </Link>
            <Link
              href="/connect"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white text-[14px] font-medium rounded-[8px] transition-colors min-h-[48px] flex items-center border border-white/20"
            >
              関わる →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── せたなを旅する ─────────────────────────────────── */}
      <section className="bg-[#1a1a1a] py-20 lg:py-28 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          {/* セクションヘッダー */}
          <div className="flex items-baseline gap-4 mb-12">
            <p className="text-white/30 text-[11px] font-medium tracking-[0.25em] nav-label">TRAVEL</p>
            <div className="flex-1 h-px bg-white/10" />
            <Link href="/travel" className="text-white/50 text-[12px] hover:text-white/80 transition-colors nav-label">
              すべて見る →
            </Link>
          </div>
          <h2 className="text-white text-[28px] lg:text-[36px] font-bold tracking-[0.02em] mb-3" style={{ fontWeight: 300 }}>
            せたなを<span className="font-bold">旅する</span>
          </h2>
          <p className="text-white/50 text-[14px] leading-[1.8] tracking-[0.06em] mb-12 max-w-[480px]">
            グルメ・自然・温泉・宿泊。日本海と山に囲まれたせたな町の旅行ガイド。
          </p>

          {/* 5カード */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {travelCards.map((card, i) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group block ${i === 0 ? 'col-span-2 lg:col-span-2' : 'col-span-1'}`}
              >
                <div className="relative overflow-hidden rounded-[8px]">
                  {/* 背景 */}
                  <div className={`bg-gradient-to-br ${card.gradient} ${i === 0 ? 'h-52 lg:h-64' : 'h-36 lg:h-48'} group-hover:scale-[1.02] transition-transform duration-500`} />
                  {/* オーバーレイ */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* テキスト */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/50 text-[10px] font-medium tracking-[0.2em] mb-1 nav-label">{card.labelEn}</p>
                    <p className="text-white font-bold text-[16px] lg:text-[18px] tracking-[0.02em]">{card.label}</p>
                    {i === 0 && (
                      <p className="text-white/60 text-[12px] mt-1 leading-[1.6]">{card.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── せたなに暮らす ─────────────────────────────────── */}
      <section className="bg-[#faf8f5] py-20 lg:py-28 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          {/* セクションヘッダー */}
          <div className="flex items-baseline gap-4 mb-12">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.25em] nav-label">LIFE</p>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
            <Link href="/life" className="text-[#8a8a8a] text-[12px] hover:text-[#1a1a1a] transition-colors nav-label">
              すべて見る →
            </Link>
          </div>
          <h2 className="text-[#1a1a1a] text-[28px] lg:text-[36px] tracking-[0.02em] mb-3" style={{ fontWeight: 300 }}>
            せたなに<span className="font-bold">暮らす</span>
          </h2>
          <p className="text-[#5c5c5c] text-[14px] leading-[1.8] tracking-[0.06em] mb-12 max-w-[480px]">
            仕事を探す人、移住を考える人。せたなで生きることのリアルを、まっすぐに伝えます。
          </p>

          {/* 3カード — しごとを最大化 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {lifeCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group block ${card.large ? 'sm:col-span-2' : 'sm:col-span-1'}`}
              >
                <div className="relative overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                  {/* 写真エリア */}
                  <div
                    className={`bg-gradient-to-br ${card.gradient} ${card.large ? 'h-48 lg:h-56' : 'h-36'}`}
                  />
                  {/* テキストエリア */}
                  <div className="p-6">
                    <p className="text-[10px] font-medium tracking-[0.2em] mb-2 nav-label" style={{ color: card.accent }}>
                      {card.labelEn}
                    </p>
                    <h3 className={`font-bold text-[#1a1a1a] tracking-[0.02em] mb-2 ${card.large ? 'text-[20px]' : 'text-[17px]'}`}>
                      {card.label}
                    </h3>
                    <p className="text-[13px] text-[#5c5c5c] leading-[1.8]">{card.description}</p>
                    <p className="mt-4 text-[12px] font-medium transition-colors nav-label" style={{ color: card.accent }}>
                      くわしく見る →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── せたなに関わる ─────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          {/* セクションヘッダー */}
          <div className="flex items-baseline gap-4 mb-12">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.25em] nav-label">CONNECT</p>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
            <Link href="/connect" className="text-[#8a8a8a] text-[12px] hover:text-[#1a1a1a] transition-colors nav-label">
              すべて見る →
            </Link>
          </div>
          <h2 className="text-[#1a1a1a] text-[28px] lg:text-[36px] tracking-[0.02em] mb-3" style={{ fontWeight: 300 }}>
            せたなに<span className="font-bold">関わる</span>
          </h2>
          <p className="text-[#5c5c5c] text-[14px] leading-[1.8] tracking-[0.06em] mb-12 max-w-[480px]">
            旅でも暮らしでもなく、もっと気軽に。寄付・法人貢献・二拠点・マッチングで町とつながる方法。
          </p>

          {/* 4カード — ふるさと納税を最大化 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {connectCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group block ${card.large ? 'sm:col-span-2' : 'sm:col-span-1'}`}
              >
                <div className="relative overflow-hidden rounded-[10px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                  <div
                    className={`bg-gradient-to-br ${card.gradient} ${card.large ? 'h-48 lg:h-56' : 'h-36'}`}
                  />
                  <div className="p-6">
                    <p className="text-[10px] font-medium tracking-[0.2em] mb-2 nav-label" style={{ color: card.accent }}>
                      {card.labelEn}
                    </p>
                    <h3 className={`font-bold text-[#1a1a1a] tracking-[0.02em] mb-2 ${card.large ? 'text-[20px]' : 'text-[17px]'}`}>
                      {card.label}
                    </h3>
                    <p className="text-[13px] text-[#5c5c5c] leading-[1.8]">{card.description}</p>
                    <p className="mt-4 text-[12px] font-medium transition-colors nav-label" style={{ color: card.accent }}>
                      くわしく見る →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 今月のイベント ─────────────────────────────────── */}
      {events.length > 0 && (
        <section className="bg-[#faf8f5] py-16 lg:py-20 px-5 lg:px-8 border-t border-[#efefef]">
          <div className="max-w-[1120px] mx-auto">
            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.25em] nav-label">EVENTS</p>
              <div className="flex-1 h-px bg-[#e0e0e0]" />
              <Link href="/events" className="text-[#8a8a8a] text-[12px] hover:text-[#1a1a1a] transition-colors nav-label">
                すべて見る →
              </Link>
            </div>
            <h2 className="text-[#1a1a1a] text-[24px] lg:text-[30px] tracking-[0.02em] mb-8" style={{ fontWeight: 300 }}>
              直近の<span className="font-bold">イベント</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {events.map((event) => {
                const d = new Date(event.start_date)
                return (
                  <Link key={event.id} href="/events" className="group bg-white rounded-[10px] border border-[#efefef] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 text-center w-12 bg-[#5b7e95] rounded-[8px] py-2">
                        <p className="text-[22px] font-bold text-white leading-none tabular-nums">{d.getDate()}</p>
                        <p className="text-[10px] text-white/70 mt-0.5 nav-label">{MONTH_NAMES[d.getMonth()]}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        {event.status === 'ongoing' && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#16a34a] nav-label mb-1.5 inline-block">開催中</span>
                        )}
                        <p className="text-[14px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2">{event.title}</p>
                        {event.location && (
                          <p className="text-[12px] text-[#8a8a8a] mt-1">📍 {event.location}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── 今のせたな（新着情報） ─────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 px-5 lg:px-8">
        <div className="max-w-[1120px] mx-auto">
          <div className="flex items-baseline gap-4 mb-12">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.25em] nav-label">NOW</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1a1a1a] text-[28px] lg:text-[36px] tracking-[0.02em]" style={{ fontWeight: 300 }}>
              今の<span className="font-bold">せたな</span>
            </h2>
            <Link href="/reports" className="text-[#8a8a8a] text-[12px] hover:text-[#1a1a1a] transition-colors nav-label">
              もっと見る →
            </Link>
          </div>

          {/* リアルタイム情報 */}
          {reports.length > 0 && (
            <div className="mb-10 space-y-3">
              {reports.map((r) => {
                const icons: Record<string, string> = {
                  road: '🚧', streetlight: '💡', park: '🏞️', snow: '❄️',
                  shop_closed: '🏪', shop_hours: '🕐', shop_crowded: '👥',
                  weather: '🌤️', event_info: '📢', other: '📌', other_info: '📝',
                }
                const catLabels: Record<string, string> = {
                  road: '道路', streetlight: '街灯', park: '公園・遊具', snow: '除雪',
                  shop_closed: '臨時休業', shop_hours: '営業時間変更', shop_crowded: '混雑',
                  weather: '天候・道路', event_info: 'イベント', other: 'その他', other_info: 'その他',
                }
                const diff  = Date.now() - new Date(r.created_at).getTime()
                const mins  = Math.floor(diff / 60000)
                const hours = Math.floor(diff / 3600000)
                const timeStr = mins < 60 ? `${mins}分前` : hours < 24 ? `${hours}時間前` : `${Math.floor(diff / 86400000)}日前`

                return (
                  <Link key={r.id} href="/reports" className="flex items-start gap-3 px-4 py-3 bg-[#faf8f5] rounded-[8px] border border-[#efefef] hover:border-[#5b7e95] transition-colors group">
                    <span className="text-[20px] shrink-0">{icons[r.category] ?? '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded nav-label ${r.report_type === 'infrastructure' ? 'bg-[#fef0e8] text-[#c47e4f]' : 'bg-[#e8f0f4] text-[#3d5a6e]'}`}>
                          {r.report_type === 'infrastructure' ? 'こまった' : 'お店のいま'}
                        </span>
                        <span className="text-[10px] text-[#8a8a8a]">{catLabels[r.category]}</span>
                        <span className="text-[11px] text-[#c0c0c0]">{timeStr}</span>
                      </div>
                      <p className="text-[13px] text-[#1a1a1a] line-clamp-1 leading-snug">
                        {r.public_message ?? r.description ?? ''}
                      </p>
                      {r.spot_name && <p className="text-[11px] text-[#8a8a8a] mt-0.5">📍 {r.spot_name}</p>}
                    </div>
                    <span className="text-[#e0e0e0] group-hover:text-[#5b7e95] text-[12px] shrink-0">→</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* 記事3件 */}
          {latestArticles && latestArticles.length > 0 ? (
            <div className="space-y-0">
              {latestArticles.map((article: any) => {
                const secCfg = sectionArticleConfig[article.section] ?? sectionArticleConfig.kurashi
                const d = new Date(article.created_at)
                const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月`
                return (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="flex items-start gap-6 py-8 border-b border-[#efefef] last:border-0 group hover:opacity-80 transition-opacity"
                  >
                    {/* サムネイル */}
                    <div className="relative w-[100px] h-[68px] lg:w-[140px] lg:h-[94px] rounded-[6px] shrink-0 overflow-hidden">
                      {article.cover_image ? (
                        <Image
                          src={article.cover_image}
                          alt={article.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="w-full h-full opacity-80"
                          style={{ background: `linear-gradient(135deg, ${secCfg.color}88, ${secCfg.color}44)` }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="text-[10px] font-medium tracking-[0.1em] px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${secCfg.color}18`, color: secCfg.color }}
                        >
                          {secCfg.label}
                        </span>
                        <time className="text-[12px] text-[#8a8a8a]">{dateStr}</time>
                      </div>
                      <h3 className="text-[15px] lg:text-[16px] font-medium text-[#1a1a1a] leading-[1.6] tracking-[0.03em] mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-[13px] text-[#5c5c5c] leading-[1.8] hidden sm:line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-[13px] text-[#8a8a8a] py-4">まだ記事がありません。</p>
          )}
        </div>
      </section>

      {/* ─── おすすめスポット ───────────────────────────────── */}
      {spots && spots.length > 0 && (
        <section className="py-20 lg:py-28 px-5 lg:px-8 bg-[#faf8f5]">
          <div className="max-w-[1120px] mx-auto">
            <div className="flex items-baseline gap-4 mb-12">
              <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.25em] nav-label">SPOTS</p>
              <div className="flex-1 h-px bg-[#e0e0e0]" />
              <Link href="/travel" className="text-[#8a8a8a] text-[12px] hover:text-[#1a1a1a] transition-colors nav-label">
                すべて見る →
              </Link>
            </div>
            <h2 className="text-[#1a1a1a] text-[28px] tracking-[0.02em] mb-12" style={{ fontWeight: 300 }}>
              おすすめ<span className="font-bold">スポット</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {(spots as Spot[]).map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
