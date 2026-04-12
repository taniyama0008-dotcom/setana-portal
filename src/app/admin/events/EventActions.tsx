import { updateEventStatus, deleteEvent } from '@/app/actions/events'
import type { EventStatus } from '@/lib/types'

const nextStatus: Record<string, EventStatus> = {
  upcoming: 'ongoing',
  ongoing:  'finished',
  finished: 'upcoming',
}
const nextLabel: Record<string, string> = {
  upcoming: '開催中に変更',
  ongoing:  '終了に変更',
  finished: '予定に戻す',
}

export default function EventActions({ eventId, status }: { eventId: string; status: EventStatus }) {
  return (
    <div className="flex items-center gap-2">
      <form action={async () => { 'use server'; await updateEventStatus(eventId, nextStatus[status] ?? 'upcoming') }}>
        <button type="submit" className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#5c5c5c] hover:border-[#5b7e95] hover:text-[#5b7e95] transition-colors">
          {nextLabel[status] ?? '更新'}
        </button>
      </form>
      <form action={async () => { 'use server'; await updateEventStatus(eventId, 'cancelled') }}>
        <button type="submit" className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#8a8a8a] hover:border-[#d4a843] hover:text-[#d4a843] transition-colors">
          中止
        </button>
      </form>
      <form action={async () => { 'use server'; await deleteEvent(eventId) }}>
        <button type="submit" className="text-[12px] px-2.5 py-1 border border-[#e0e0e0] rounded text-[#8a8a8a] hover:border-[#d94f4f] hover:text-[#d94f4f] transition-colors">
          削除
        </button>
      </form>
    </div>
  )
}
