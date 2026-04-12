'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { Report, ReportStatus } from '@/lib/types'
import {
  updateReportStatus,
  toggleReportPublic,
  saveAdminNote,
  forwardReport,
  awardExtraCoins,
} from '@/app/actions/reports'

// ─── ラベル定義 ──────────────────────────────────────────────

const categoryLabels: Record<string, string> = {
  road: '道路', streetlight: '街灯', park: '公園・遊具', snow: '除雪', other: 'その他',
  shop_closed: '臨時休業', shop_hours: '営業時間変更', shop_crowded: '混雑',
  weather: '天候・道路', event_info: 'イベント', other_info: 'その他情報',
}
const categoryIcons: Record<string, string> = {
  road: '🚧', streetlight: '💡', park: '🏞️', snow: '❄️', other: '📌',
  shop_closed: '🏪', shop_hours: '🕐', shop_crowded: '👥',
  weather: '🌤️', event_info: '📢', other_info: '📝',
}
const statusLabels: Record<string, string> = {
  received: '受付済', confirmed: '確認済', in_progress: '対応中', resolved: '解決済', rejected: '却下',
}
const statusColors: Record<string, string> = {
  received: 'bg-[#e8f0f4] text-[#3d5a6e]',
  confirmed: 'bg-[#fef3cd] text-[#92650a]',
  in_progress: 'bg-[#e8f4ec] text-[#1a6640]',
  resolved: 'bg-[#efefef] text-[#5c5c5c]',
  rejected: 'bg-[#fce8e8] text-[#8b1f1f]',
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getMonth() + 1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
}

// ─── 詳細モーダル ────────────────────────────────────────────

function ReportModal({ report, onClose, onUpdate }: {
  report: Report
  onClose: () => void
  onUpdate: (updated: Partial<Report>) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<ReportStatus>(report.status)
  const [isPublic, setIsPublic] = useState(report.is_public)
  const [publicMsg, setPublicMsg] = useState(report.public_message ?? '')
  const [adminNote, setAdminNote] = useState(report.admin_note ?? '')
  const [forwardEmail, setForwardEmail] = useState('')
  const [extraCoins, setExtraCoins] = useState(5)
  const [msg, setMsg] = useState('')

  const act = (fn: () => Promise<void>) => {
    startTransition(async () => { try { await fn(); setMsg('保存しました') } catch { setMsg('エラーが発生しました') } })
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-[540px] bg-white overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#efefef] sticky top-0 bg-white z-10">
          <div>
            <p className="text-[12px] text-[#8a8a8a] nav-label">{report.report_number}</p>
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">{categoryIcons[report.category]} {categoryLabels[report.category]}</h2>
          </div>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#1a1a1a] text-[20px] leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-6 flex-1">
          {msg && (
            <div className="text-[13px] px-3 py-2 bg-[#f0fdf4] text-[#16a34a] rounded-[6px]">{msg}</div>
          )}

          {/* 基本情報 */}
          <section>
            <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-3">基本情報</p>
            <dl className="space-y-2 text-[13px]">
              <div className="flex gap-3"><dt className="text-[#8a8a8a] w-20 shrink-0">種別</dt>
                <dd>{report.report_type === 'infrastructure' ? '🔴 こまった' : '🔵 お店のいま'}</dd>
              </div>
              <div className="flex gap-3"><dt className="text-[#8a8a8a] w-20 shrink-0">報告者</dt>
                <dd>{report.reporter_name ?? '匿名'}</dd>
              </div>
              <div className="flex gap-3"><dt className="text-[#8a8a8a] w-20 shrink-0">場所</dt>
                <dd>{report.spot_name ?? '—'}</dd>
              </div>
              <div className="flex gap-3"><dt className="text-[#8a8a8a] w-20 shrink-0">内容</dt>
                <dd className="leading-[1.7]">{report.description ?? '—'}</dd>
              </div>
              <div className="flex gap-3"><dt className="text-[#8a8a8a] w-20 shrink-0">受付日時</dt>
                <dd className="tabular-nums">{new Date(report.created_at).toLocaleString('ja-JP')}</dd>
              </div>
            </dl>
          </section>

          {/* 写真 */}
          {report.photo_url && (
            <section>
              <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">写真</p>
              {report.photo_url.startsWith('line://') ? (
                <div className="text-[12px] text-[#5b7e95] bg-[#f0f5f8] rounded-[6px] px-3 py-2">
                  <p>📷 LINE画像参照 (ID: {report.photo_url.replace('line://', '')})</p>
                  <p className="text-[11px] text-[#8a8a8a] mt-1">LINE Content APIから取得可能（30日間有効）</p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={report.photo_url} alt="通報写真" className="w-full rounded-[8px] border border-[#efefef]" />
              )}
            </section>
          )}

          {/* 位置情報 */}
          {report.latitude && report.longitude && (
            <section>
              <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">位置情報</p>
              <a
                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[13px] text-[#5b7e95] hover:underline"
              >
                📍 Google Maps で開く ({report.latitude.toFixed(5)}, {report.longitude.toFixed(5)})
              </a>
            </section>
          )}

          {/* ステータス変更 */}
          <section>
            <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">ステータス</p>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="flex-1 px-3 py-2 border border-[#e0e0e0] rounded-[6px] text-[13px] bg-white focus:outline-none focus:border-[#5b7e95]"
              >
                {Object.entries(statusLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <button
                onClick={() => act(async () => { await updateReportStatus(report.id, status); onUpdate({ status }) })}
                disabled={isPending}
                className="px-4 py-2 bg-[#5b7e95] text-white text-[13px] rounded-[6px] disabled:opacity-50"
              >
                更新
              </button>
            </div>
          </section>

          {/* 公開設定 */}
          <section>
            <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">「今のせたな」に公開</p>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <div
                onClick={() => setIsPublic(!isPublic)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${isPublic ? 'bg-[#5b7e95]' : 'bg-[#d0d0d0]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-[13px] text-[#1a1a1a]">{isPublic ? '公開中' : '非公開'}</span>
            </label>
            <textarea
              value={publicMsg}
              onChange={(e) => setPublicMsg(e.target.value)}
              rows={3}
              placeholder="公開するメッセージ（空欄なら description を使用）"
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded-[6px] text-[13px] focus:outline-none focus:border-[#5b7e95] resize-none"
            />
            <button
              onClick={() => act(async () => { await toggleReportPublic(report.id, isPublic, publicMsg); onUpdate({ is_public: isPublic, public_message: publicMsg }) })}
              disabled={isPending}
              className="mt-2 px-4 py-2 bg-[#6b8f71] text-white text-[13px] rounded-[6px] disabled:opacity-50"
            >
              公開設定を保存
            </button>
          </section>

          {/* 管理者メモ */}
          <section>
            <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">管理者メモ</p>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="内部メモ（公開されません）"
              className="w-full px-3 py-2 border border-[#e0e0e0] rounded-[6px] text-[13px] focus:outline-none focus:border-[#5b7e95] resize-none"
            />
            <button
              onClick={() => act(async () => { await saveAdminNote(report.id, adminNote) })}
              disabled={isPending}
              className="mt-2 px-4 py-2 bg-[#5b7e95] text-white text-[13px] rounded-[6px] disabled:opacity-50"
            >
              メモを保存
            </button>
          </section>

          {/* 転送済み表示 or 手動転送 */}
          <section>
            <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">メール転送</p>
            {report.forwarded_to ? (
              <p className="text-[13px] text-[#5c5c5c]">✓ 転送済: {report.forwarded_to}</p>
            ) : null}
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                value={forwardEmail}
                onChange={(e) => setForwardEmail(e.target.value)}
                placeholder="転送先メールアドレス"
                className="flex-1 px-3 py-2 border border-[#e0e0e0] rounded-[6px] text-[13px] focus:outline-none focus:border-[#5b7e95]"
              />
              <button
                onClick={() => act(async () => {
                  const res = await forwardReport(report.id, forwardEmail)
                  if (res && 'error' in res) throw new Error(res.error)
                })}
                disabled={isPending || !forwardEmail}
                className="px-4 py-2 bg-[#c47e4f] text-white text-[13px] rounded-[6px] disabled:opacity-50"
              >
                転送
              </button>
            </div>
          </section>

          {/* コイン追加付与（ユーザーがいる場合のみ） */}
          {report.user_id && (
            <section>
              <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.1em] mb-2">コイン追加付与</p>
              <p className="text-[12px] text-[#8a8a8a] mb-2">現在の付与済: {report.coins_awarded}コイン</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={extraCoins}
                  onChange={(e) => setExtraCoins(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-[#e0e0e0] rounded-[6px] text-[13px] focus:outline-none focus:border-[#5b7e95]"
                />
                <span className="text-[13px]">コイン</span>
                <button
                  onClick={() => act(async () => {
                    const res = await awardExtraCoins(report.id, report.user_id!, extraCoins)
                    if (res && 'error' in res) throw new Error(res.error)
                  })}
                  disabled={isPending}
                  className="px-4 py-2 bg-[#c47e4f] text-white text-[13px] rounded-[6px] disabled:opacity-50"
                >
                  付与
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── メインビュー ────────────────────────────────────────────

const TABS = [
  { value: 'all',            label: 'すべて' },
  { value: 'infrastructure', label: 'こまった' },
  { value: 'realtime_info',  label: 'お店のいま' },
]

export default function ReportsView({
  reports: initialReports, currentType, currentStatus, currentCategory,
}: {
  reports: Report[]
  currentType: string
  currentStatus: string
  currentCategory: string
}) {
  const [reports, setReports] = useState(initialReports)
  const [selected, setSelected] = useState<Report | null>(null)

  const updateReport = (id: string, patch: Partial<Report>) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r))
    setSelected((prev) => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  const buildHref = (params: Record<string, string>) => {
    const p = new URLSearchParams()
    const merged = { type: currentType, status: currentStatus, category: currentCategory, ...params }
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'all') p.set(k, v) })
    const qs = p.toString()
    return `/admin/reports${qs ? '?' + qs : ''}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">みんなの情報</h1>
        <p className="text-[13px] text-[#8a8a8a]">{reports.length}件</p>
      </div>

      {/* タブ */}
      <div className="flex gap-1 mb-5">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref({ type: tab.value })}
            className={`px-4 py-2 text-[13px] rounded-[6px] border transition-colors nav-label ${
              currentType === tab.value
                ? 'bg-[#5b7e95] text-white border-[#5b7e95]'
                : 'bg-white text-[#5c5c5c] border-[#e0e0e0] hover:border-[#5b7e95]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* ステータスフィルタ */}
      <div className="flex gap-1 flex-wrap mb-5">
        {[{ value: '', label: 'すべてのステータス' }, ...Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))].map((f) => (
          <Link
            key={f.value}
            href={buildHref({ status: f.value })}
            className={`px-3 py-1 text-[12px] rounded border transition-colors ${
              currentStatus === f.value
                ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                : 'bg-white text-[#5c5c5c] border-[#e0e0e0] hover:border-[#5b7e95]'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-[8px] border border-[#efefef] p-12 text-center">
          <p className="text-[#8a8a8a] text-[14px]">みんなの情報はまだありません。</p>
        </div>
      ) : (
        <div className="bg-white rounded-[8px] border border-[#efefef] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#efefef] bg-[#faf8f5]">
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">受付番号</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden sm:table-cell">種別</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">カテゴリ</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden md:table-cell">概要</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em]">状態</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden lg:table-cell">公開</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden lg:table-cell">転送</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8a8a8a] tracking-[0.08em] hidden sm:table-cell">日時</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="border-b border-[#efefef] last:border-0 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-mono text-[#5b7e95]">{r.report_number}</p>
                    <p className="text-[11px] text-[#8a8a8a] mt-0.5">{r.reporter_name ?? '匿名'}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded nav-label ${
                      r.report_type === 'infrastructure' ? 'bg-[#fce8e8] text-[#8b1f1f]' : 'bg-[#e8f0f4] text-[#3d5a6e]'
                    }`}>
                      {r.report_type === 'infrastructure' ? 'インフラ' : '情報'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px]">{categoryIcons[r.category]} {categoryLabels[r.category]}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-[12px] text-[#5c5c5c] line-clamp-1">{r.description ?? r.spot_name ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full nav-label ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-[11px] ${r.is_public ? 'text-[#16a34a]' : 'text-[#c0c0c0]'}`}>
                      {r.is_public ? '● 公開' : '○ 非公開'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[11px] text-[#8a8a8a]">
                      {r.forwarded_at ? '✓ 済' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-[11px] text-[#8a8a8a] tabular-nums">{formatDate(r.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <ReportModal
          report={selected}
          onClose={() => setSelected(null)}
          onUpdate={(patch) => updateReport(selected.id, patch)}
        />
      )}
    </div>
  )
}
