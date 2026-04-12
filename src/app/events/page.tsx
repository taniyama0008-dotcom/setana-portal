import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { CalendarEvent } from '@/lib/types'
import EventsView from './EventsView'

const BASE_URL = 'https://www.setana.life'

export const metadata: Metadata = {
  title: 'せたな町のイベント｜漁火まつり・水仙まつり・年間カレンダー',
  description: '北海道せたな町の年間イベント情報。漁火まつり・水仙まつり・マルシェ・海の幸フェスタなど。',
  alternates: { canonical: `${BASE_URL}/events` },
}

export default async function EventsPage() {
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .not('status', 'eq', 'cancelled')
    .order('start_date', { ascending: true })

  const events = (data ?? []) as CalendarEvent[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'せたな町のイベント',
            url: `${BASE_URL}/events`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'ホーム',         item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'イベント', item: `${BASE_URL}/events` },
              ],
            },
          }),
        }}
      />

      {/* ヒーロー */}
      <section className="relative h-[40vh] min-h-[280px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1a10] via-[#8a5535] to-[#3a2820]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-[1120px] mx-auto px-5 lg:px-8 pb-12">
          <nav className="flex items-center gap-2 text-white/40 text-[12px] mb-4">
            <Link href="/" className="hover:text-white/70 transition-colors">ホーム</Link>
            <span>›</span>
            <span className="text-white/70">イベント</span>
          </nav>
          <p className="text-white/40 text-[11px] font-medium tracking-[0.25em] mb-2 nav-label">EVENTS</p>
          <h1 className="text-white font-bold text-[28px] lg:text-[36px] leading-[1.3] tracking-[0.02em]">
            せたなの<span style={{ fontWeight: 300 }}>イベント</span>
          </h1>
          <p className="text-white/60 text-[14px] mt-2">漁火まつり、水仙まつり、マルシェ。せたなの四季を彩るイベント。</p>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <EventsView events={events} />
      </div>
    </>
  )
}
