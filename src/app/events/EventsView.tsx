'use client'

import { useState } from 'react'
import type { CalendarEvent } from '@/lib/types'
import { areaConfig } from '@/components/spot/AreaBadge'

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const statusConfig = {
  upcoming: { label: '開催予定', class: 'bg-[#e8f0f4] text-[#3d5a6e]' },
  ongoing:  { label: '開催中',   class: 'bg-[#f0fdf4] text-[#16a34a]' },
  finished: { label: '終了',     class: 'bg-[#f0f0f0] text-[#8a8a8a]' },
  cancelled:{ label: '中止',     class: 'bg-[#fff0f0] text-[#dc2626]' },
}

function formatDate(start: string, end?: string | null): string {
  const s = new Date(start)
  const sStr = `${s.getMonth() + 1}/${s.getDate()}`
  if (!end || end === start) return sStr
  const e = new Date(end)
  const eStr = `${e.getMonth() + 1}/${e.getDate()}`
  return `${sStr} — ${eStr}`
}

function EventItem({ event, past }: { event: CalendarEvent; past?: boolean }) {
  const sc = statusConfig[event.status] ?? statusConfig.upcoming
  const areaLabel = event.area ? (areaConfig[event.area]?.label ?? event.area) : null

  return (
    <div className={`flex gap-5 py-6 border-b border-[#efefef] last:border-0 ${past ? 'opacity-50' : ''}`}>
      {/* 日付 */}
      <div className="shrink-0 text-center w-14">
        <p className="text-[22px] font-bold text-[#1a1a1a] leading-none tabular-nums">
          {new Date(event.start_date).getDate()}
        </p>
        <p className="text-[11px] text-[#8a8a8a] mt-1 nav-label">
          {MONTH_NAMES[new Date(event.start_date).getMonth()]}
        </p>
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full nav-label ${sc.class}`}>
            {sc.label}
          </span>
          {event.is_annual && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#faf0e8] text-[#8a5535] nav-label">毎年開催</span>
          )}
          {areaLabel && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium"
              style={{
                backgroundColor: event.area ? areaConfig[event.area]?.bg : '#f0f0f0',
                color: event.area ? areaConfig[event.area]?.text : '#666',
              }}>
              {areaLabel}
            </span>
          )}
        </div>
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] leading-snug mb-1">{event.title}</h3>
        <div className="flex flex-wrap gap-3 text-[12px] text-[#8a8a8a] mb-1.5">
          <span>{formatDate(event.start_date, event.end_date)}</span>
          {event.location && <span>📍 {event.location}</span>}
        </div>
        {event.description && (
          <p className="text-[13px] text-[#5c5c5c] leading-[1.7] line-clamp-2">{event.description}</p>
        )}
        {event.external_url && (
          <a href={event.external_url} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-2 text-[12px] text-[#5b7e95] hover:underline nav-label">
            詳細を見る ↗
          </a>
        )}
      </div>
    </div>
  )
}

export default function EventsView({ events }: { events: CalendarEvent[] }) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const today = new Date().toISOString().split('T')[0]

  // 月別グループ
  const byMonth: Record<number, CalendarEvent[]> = {}
  events.forEach((e) => {
    const m = new Date(e.start_date).getMonth()
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m].push(e)
  })

  // 直近の年度を基準に月を並べる（今月から12ヶ月）
  const currentMonth = new Date().getMonth()
  const orderedMonths = Array.from({ length: 12 }, (_, i) => (currentMonth + i) % 12)
  const hasAnyEvents = events.length > 0

  return (
    <div>
      {/* ビュー切り替え */}
      <div className="flex items-center justify-between mb-10">
        <p className="text-[13px] text-[#8a8a8a]">{events.length}件のイベント</p>
        <div className="flex gap-1 bg-[#faf8f5] p-1 rounded-[8px] border border-[#efefef]">
          {(['calendar', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-[12px] rounded-[6px] transition-colors nav-label ${
                viewMode === mode
                  ? 'bg-white text-[#1a1a1a] shadow-sm font-medium'
                  : 'text-[#8a8a8a] hover:text-[#1a1a1a]'
              }`}
            >
              {mode === 'calendar' ? 'カレンダー' : 'リスト'}
            </button>
          ))}
        </div>
      </div>

      {!hasAnyEvents && (
        <div className="py-20 text-center">
          <p className="text-[#8a8a8a] text-[15px]">現在イベント情報はありません。</p>
        </div>
      )}

      {/* カレンダービュー（月別） */}
      {viewMode === 'calendar' && hasAnyEvents && (
        <div className="space-y-12">
          {orderedMonths.map((monthIdx) => {
            const monthEvents = byMonth[monthIdx] ?? []
            return (
              <section key={monthIdx}>
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-[18px] font-bold text-[#1a1a1a] tracking-[0.03em]">{MONTH_NAMES[monthIdx]}</h2>
                  <div className="flex-1 h-px bg-[#efefef]" />
                </div>
                {monthEvents.length === 0 ? (
                  <p className="text-[13px] text-[#c0c0c0] pl-2">イベントなし</p>
                ) : (
                  <div className="bg-white rounded-[10px] border border-[#efefef] overflow-hidden px-5">
                    {monthEvents.map((e) => (
                      <EventItem key={e.id} event={e} past={e.end_date ? e.end_date < today : e.start_date < today} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {/* リストビュー（時系列） */}
      {viewMode === 'list' && hasAnyEvents && (
        <div className="bg-white rounded-[10px] border border-[#efefef] overflow-hidden px-5">
          {events.map((e) => (
            <EventItem key={e.id} event={e} past={e.end_date ? e.end_date < today : e.start_date < today} />
          ))}
        </div>
      )}
    </div>
  )
}
