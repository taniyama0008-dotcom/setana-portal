import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { CalendarEvent } from '@/lib/types'
import EventActions from './EventActions'

const statusLabel: Record<string, string> = {
  upcoming:  '開催予定',
  ongoing:   '開催中',
  finished:  '終了',
  cancelled: '中止',
}

const statusClass: Record<string, string> = {
  upcoming:  'bg-[#e8f0f4] text-[#3d5a6e]',
  ongoing:   'bg-[#f0fdf4] text-[#16a34a]',
  finished:  'bg-[#f0f0f0] text-[#8a8a8a]',
  cancelled: 'bg-[#fff0f0] text-[#dc2626]',
}

function formatDate(start: string, end?: string | null) {
  const s = new Date(start)
  const base = `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`
  if (!end || end === start) return base
  const e = new Date(end)
  return `${base} 〜 ${e.getMonth() + 1}/${e.getDate()}`
}

export default async function AdminEventsPage() {
  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('start_date', { ascending: false })

  const list = (data ?? []) as CalendarEvent[]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">イベント管理</h1>
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-[#8a8a8a]">{list.length}件</p>
          <Link
            href="/admin/events/new"
            className="px-4 py-2 bg-[#5b7e95] hover:bg-[#4a6a7e] text-white text-[13px] font-medium rounded-[6px] transition-colors nav-label"
          >
            + 新規作成
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-[#efefef] p-12 text-center">
          <p className="text-[#8a8a8a] text-[14px] mb-4">イベントがありません。</p>
          <Link href="/admin/events/new" className="text-[13px] text-[#5b7e95] hover:underline">
            最初のイベントを作成 →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-[#efefef] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#efefef] bg-[#faf8f5]">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">タイトル</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden sm:table-cell">日程</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden md:table-cell">場所</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">状態</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((event) => (
                <tr key={event.id} className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a] line-clamp-1">{event.title}</p>
                      {event.is_annual && (
                        <span className="text-[10px] text-[#8a5535] bg-[#faf0e8] px-1.5 py-0.5 rounded mt-0.5 inline-block">毎年開催</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-[12px] text-[#5c5c5c] tabular-nums">{formatDate(event.start_date, event.end_date)}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[12px] text-[#8a8a8a]">{event.location ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full nav-label ${statusClass[event.status] ?? statusClass.upcoming}`}>
                      {statusLabel[event.status] ?? event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors"
                      >
                        編集
                      </Link>
                      <EventActions eventId={event.id} status={event.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
