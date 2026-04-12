'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'
import type { ReportStatus } from '@/lib/types'

async function assertAdmin() {
  const role = await getSessionRole()
  if (role !== 'admin') throw new Error('Forbidden')
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  await assertAdmin()
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (status === 'resolved') update.resolved_at = new Date().toISOString()
  await supabaseAdmin.from('reports').update(update).eq('id', id)
  revalidatePath('/admin/reports')
  revalidatePath('/')
}

export async function toggleReportPublic(id: string, isPublic: boolean, publicMessage: string) {
  await assertAdmin()
  await supabaseAdmin.from('reports').update({
    is_public: isPublic,
    public_message: publicMessage || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/admin/reports')
  revalidatePath('/reports')
  revalidatePath('/')
}

export async function saveAdminNote(id: string, note: string) {
  await assertAdmin()
  await supabaseAdmin.from('reports').update({
    admin_note: note || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/admin/reports')
}

export async function forwardReport(id: string, toEmail: string) {
  await assertAdmin()

  const { data: report } = await supabaseAdmin.from('reports').select('*').eq('id', id).single()
  if (!report) return { error: 'レポートが見つかりません' }

  if (process.env.RESEND_API_KEY && toEmail) {
    const mapsLink = report.latitude && report.longitude
      ? `https://www.google.com/maps?q=${report.latitude},${report.longitude}`
      : '（位置情報なし）'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@setana.life',
        to: [toEmail],
        subject: `[通報転送] ${report.report_number} — ${report.category}`,
        html: `<h2>通報内容 ${report.report_number}</h2>
               <p><b>カテゴリ:</b> ${report.category}</p>
               <p><b>内容:</b> ${report.description ?? '—'}</p>
               <p><b>場所:</b> ${report.spot_name ?? '—'}</p>
               <p><b>報告者:</b> ${report.reporter_name ?? '匿名'}</p>
               ${report.photo_url ? `<p><b>写真:</b> <a href="${report.photo_url}">${report.photo_url}</a></p>` : ''}
               <p><b>マップ:</b> <a href="${mapsLink}">${mapsLink}</a></p>
               <p><b>受付日時:</b> ${new Date(report.created_at).toLocaleString('ja-JP')}</p>`,
      }),
    })
    if (!res.ok) return { error: 'メール送信に失敗しました' }
  }

  await supabaseAdmin.from('reports').update({
    forwarded_to: toEmail,
    forwarded_at: new Date().toISOString(),
    updated_at:   new Date().toISOString(),
  }).eq('id', id)

  revalidatePath('/admin/reports')
  return { success: true }
}

export async function awardExtraCoins(reportId: string, userId: string, amount: number) {
  await assertAdmin()
  if (amount <= 0) return { error: '1以上の値を入力してください' }

  const { data: user } = await supabaseAdmin.from('users').select('coin_balance').eq('id', userId).single()
  if (!user) return { error: 'ユーザーが見つかりません' }

  await Promise.all([
    supabaseAdmin.from('coin_transactions').insert({
      user_id: userId, amount, reason: 'helpful_bonus', reference_id: reportId,
    }),
    supabaseAdmin.from('users').update({ coin_balance: (user.coin_balance ?? 0) + amount }).eq('id', userId),
    supabaseAdmin.from('reports').update({ coins_awarded: (amount) }).eq('id', reportId),
  ])

  revalidatePath('/admin/reports')
  return { success: true }
}
