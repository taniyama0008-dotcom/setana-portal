import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { updateEvent } from '@/app/actions/events'
import type { CalendarEvent } from '@/lib/types'
import EventForm from '../../EventForm'

export default async function AdminEventsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const event = data as CalendarEvent

  return (
    <div className="max-w-[700px]">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/events" className="text-[13px] text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors">
          ← イベント管理
        </Link>
        <span className="text-[#e0e0e0]">/</span>
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">イベント編集</h1>
      </div>

      <div className="bg-white rounded-[8px] border border-[#efefef] p-6">
        <EventForm action={updateEvent} event={event} />
      </div>
    </div>
  )
}
