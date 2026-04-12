import Link from 'next/link'
import { createEvent } from '@/app/actions/events'
import EventForm from '../EventForm'

export default function AdminEventsNewPage() {
  return (
    <div className="max-w-[700px]">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-[13px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← イベント管理
        </Link>
        <span className="text-[#e0e0e0]">/</span>
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">新規イベント作成</h1>
      </div>

      <div className="bg-white rounded-[8px] border border-[#efefef] p-6">
        <EventForm action={createEvent} />
      </div>
    </div>
  )
}
