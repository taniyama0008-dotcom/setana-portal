'use client'

import { useState, useTransition } from 'react'
import {
  updateUserRole,
  assignBusinessSpot,
  removeBusinessSpot,
} from '@/app/actions/admin'

interface Spot {
  id: string
  name: string
  area: string
}

interface Props {
  userId: string
  userName: string
  currentRole: string
  currentSpotIds: string[]
  allSpots: Spot[]
}

export default function BusinessSetupModal({
  userId,
  userName,
  currentRole,
  currentSpotIds,
  allSpots,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set(currentSpotIds))
  const [isPending, start] = useTransition()
  const [isDemoting, startDemote] = useTransition()
  const [query, setQuery] = useState('')

  if (currentRole === 'admin') {
    return <span className="text-[11px] text-[#8a8a8a]">管理者</span>
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSave() {
    start(async () => {
      // ロールを business に変更（まだでなければ）
      if (currentRole !== 'business') {
        await updateUserRole(userId, 'business')
      }

      // 追加するスポット
      for (const id of selected) {
        if (!currentSpotIds.includes(id)) {
          await assignBusinessSpot(userId, id)
        }
      }

      // 削除するスポット
      for (const id of currentSpotIds) {
        if (!selected.has(id)) {
          await removeBusinessSpot(userId, id)
        }
      }

      setIsOpen(false)
    })
  }

  function handleDemote() {
    if (!confirm(`${userName} の事業者権限を剥奪しますか？`)) return
    startDemote(() => void updateUserRole(userId, 'user'))
  }

  const filtered = query
    ? allSpots.filter(s => s.name.includes(query) || s.area.includes(query))
    : allSpots

  return (
    <>
      {/* トリガーボタン */}
      <div className="flex flex-wrap gap-1">
        {currentRole !== 'business' ? (
          <button
            onClick={() => setIsOpen(true)}
            className="text-[11px] px-2.5 py-1 bg-[#e8f0f5] text-[#5b7e95] rounded hover:bg-[#d0e5ef] transition-colors whitespace-nowrap font-medium"
          >
            事業者にする
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsOpen(true)}
              className="text-[11px] px-2.5 py-1 bg-[#e8f0f5] text-[#5b7e95] rounded hover:bg-[#d0e5ef] transition-colors whitespace-nowrap"
            >
              店舗を編集
            </button>
            <button
              disabled={isDemoting}
              onClick={handleDemote}
              className="text-[11px] px-2.5 py-1 bg-[#fce8e8] text-[#8b1f1f] rounded hover:bg-[#f5d0d0] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              権限剥奪
            </button>
          </>
        )}
      </div>

      {/* モーダル */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setIsOpen(false) }}
        >
          {/* バックドロップ */}
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative bg-white rounded-[12px] shadow-2xl w-full max-w-[480px] overflow-hidden">
            {/* ヘッダー */}
            <div className="px-6 py-5 border-b border-[#efefef] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#1a1a1a]">事業者設定</h2>
                <p className="text-[12px] text-[#8a8a8a] mt-0.5">{userName}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors text-[#8a8a8a]"
              >
                ✕
              </button>
            </div>

            {/* 本文 */}
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-[13px] font-medium text-[#5c5c5c] mb-3">
                  紐づける店舗を選択
                  <span className="ml-2 text-[11px] text-[#8a8a8a] font-normal">（複数選択可）</span>
                </p>

                {/* 検索 */}
                <input
                  type="text"
                  placeholder="店舗名・エリアで絞り込み"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full border border-[#e0e0e0] rounded-md px-3 py-2 text-[13px] text-[#1a1a1a] mb-3 focus:outline-none focus:border-[#5b7e95] transition-colors"
                />

                {/* スポット一覧 */}
                <div className="space-y-1 max-h-[220px] overflow-y-auto border border-[#efefef] rounded-md p-2">
                  {filtered.length === 0 ? (
                    <p className="text-[12px] text-[#8a8a8a] py-4 text-center">該当なし</p>
                  ) : (
                    filtered.map(spot => (
                      <label
                        key={spot.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-[#faf8f5] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(spot.id)}
                          onChange={() => toggle(spot.id)}
                          className="w-4 h-4 accent-[#5b7e95] shrink-0"
                        />
                        <span className="text-[13px] text-[#1a1a1a] flex-1">{spot.name}</span>
                        <span className="text-[11px] text-[#8a8a8a]">{spot.area}</span>
                      </label>
                    ))
                  )}
                </div>

                {selected.size > 0 && (
                  <p className="text-[11px] text-[#5b7e95] mt-2">
                    {selected.size}店舗を選択中
                  </p>
                )}
              </div>
            </div>

            {/* フッター */}
            <div className="px-6 py-4 border-t border-[#efefef] flex items-center justify-end gap-3 bg-[#faf8f5]">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-[13px] text-[#5c5c5c] border border-[#e0e0e0] rounded-md hover:bg-white transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-5 py-2 text-[13px] font-medium text-white bg-[#5b7e95] rounded-md hover:bg-[#3d5a6e] disabled:opacity-50 transition-colors min-w-[100px]"
              >
                {isPending ? '保存中...' : currentRole !== 'business' ? '事業者に設定' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
