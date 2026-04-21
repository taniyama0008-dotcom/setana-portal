'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Spot } from '@/lib/types'
import type { Area } from '@/lib/taxonomy'
import { areaMaster } from '@/lib/taxonomy'
import AreaFilter from '@/components/spot/AreaFilter'

type StayType = 'all' | 'hotel' | 'minshuku' | 'camp'

const typeLabels: { value: StayType; label: string }[] = [
  { value: 'all',      label: 'すべて' },
  { value: 'hotel',    label: '旅館・ホテル' },
  { value: 'minshuku', label: '民宿' },
  { value: 'camp',     label: 'キャンプ場' },
]

function detectStayType(spot: Spot): StayType {
  const n = spot.name.toLowerCase()
  const d = (spot.description ?? '').toLowerCase()
  const combined = n + ' ' + d
  if (combined.includes('キャンプ') || combined.includes('camp') || combined.includes('旅行村')) return 'camp'
  if (n.includes('民宿')) return 'minshuku'
  if (combined.includes('旅館') || combined.includes('ホテル') || combined.includes('hotel') || combined.includes('lodge') || combined.includes('ロッジ') || combined.includes('山荘')) return 'hotel'
  return 'minshuku'
}

function CheckIcon({ ok }: { ok?: boolean | null }) {
  if (ok == null) return <span className="text-[#d0d0d0]">—</span>
  return ok
    ? <span className="text-[#5a9e6f] font-bold">○</span>
    : <span className="text-[#c0c0c0]">×</span>
}

function StayCard({ spot }: { spot: Spot }) {
  const areaConf = spot.area ? areaMaster[spot.area] : null

  return (
    <Link href={`/spot/${spot.slug}`} className="group block">
      <article className="flex gap-0 bg-white rounded-[8px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-300">
        {/* 左: 写真 */}
        <div className="relative w-[220px] sm:w-[260px] shrink-0 aspect-[16/10] overflow-hidden">
          {spot.cover_image ? (
            <Image
              src={spot.cover_image}
              alt={spot.name}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#5b7e95] to-[#3d5a6e]" />
          )}
        </div>

        {/* 右: 情報 */}
        <div className="flex flex-col justify-between flex-1 min-w-0 p-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {areaConf && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded font-medium"
                  style={{ backgroundColor: areaConf.bg, color: areaConf.text }}
                >
                  {areaConf.shortLabel}
                </span>
              )}
            </div>
            <h3 className="text-[16px] font-semibold text-[#1a1a1a] leading-snug mb-2">{spot.name}</h3>
            {spot.description && (
              <p className="text-[13px] text-[#5c5c5c] leading-[1.7] line-clamp-2 mb-3">{spot.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[#5c5c5c]">
            <span className="flex items-center gap-1.5">
              <span>🛁</span>
              <span>温泉 <CheckIcon ok={spot.has_onsen} /></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>🍽</span>
              <span>食事 <CheckIcon ok={spot.has_meals} /></span>
            </span>
            {spot.price_range && (
              <span className="flex items-center gap-1.5">
                <span>💰</span>
                <span>{spot.price_range}</span>
              </span>
            )}
            {(spot.room_count || spot.capacity) && (
              <span className="flex items-center gap-1.5">
                <span>🏠</span>
                <span>
                  {spot.room_count ? `${spot.room_count}室` : ''}
                  {spot.room_count && spot.capacity ? ' / ' : ''}
                  {spot.capacity ? `最大${spot.capacity}名` : ''}
                </span>
              </span>
            )}
          </div>

          <p className="mt-3 text-[12px] font-medium text-[#5b7e95] nav-label group-hover:text-[#3d5a6e] transition-colors">
            詳しく見る →
          </p>
        </div>
      </article>
    </Link>
  )
}

interface Props {
  spots: Spot[]
}

export default function StayListWithFilters({ spots }: Props) {
  const [area, setArea] = useState<Area | 'all'>('all')
  const [stayType, setStayType] = useState<StayType>('all')

  const filtered = spots.filter((s) => {
    if (area !== 'all' && s.area !== area) return false
    if (stayType !== 'all' && detectStayType(s) !== stayType) return false
    return true
  })

  return (
    <div>
      {/* フィルタ */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[11px] text-[#8a8a8a] mr-1 nav-label">エリア</span>
          <AreaFilter selected={area} onChange={setArea} />
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[11px] text-[#8a8a8a] mr-1 nav-label">タイプ</span>
          {typeLabels.map((t) => (
            <button
              key={t.value}
              onClick={() => setStayType(t.value)}
              className={`px-3 py-1.5 text-[12px] rounded-[6px] border transition-colors nav-label ${
                stayType === t.value
                  ? 'bg-[#5b7e95] text-white border-[#5b7e95]'
                  : 'bg-white text-[#5c5c5c] border-[#e0e0e0] hover:border-[#5b7e95]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-[#8a8a8a]">{filtered.length}件</p>
      </div>

      {/* 横長リスト */}
      {filtered.length === 0 ? (
        <p className="text-[#8a8a8a] text-[14px] py-16 text-center">該当する施設がありません。</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((spot) => (
            <StayCard key={spot.id} spot={spot} />
          ))}
        </div>
      )}

      {/* 比較テーブル */}
      {spots.length > 0 && (
        <section className="mt-20">
          <div className="flex items-baseline gap-4 mb-8">
            <p className="text-[#8a8a8a] text-[11px] font-medium tracking-[0.2em] nav-label">COMPARISON</p>
            <div className="flex-1 h-px bg-[#efefef]" />
          </div>
          <h2 className="text-[#1a1a1a] text-[20px] font-bold mb-6 tracking-[0.02em]">施設比較</h2>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full min-w-[580px] text-[13px]">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a]">
                  <th className="text-left py-3 pr-4 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.06em]">施設名</th>
                  <th className="text-left py-3 pr-4 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.06em]">エリア</th>
                  <th className="text-center py-3 pr-4 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.06em]">温泉</th>
                  <th className="text-center py-3 pr-4 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.06em]">食事</th>
                  <th className="text-left py-3 pr-4 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.06em]">料金目安</th>
                  <th className="text-left py-3 font-semibold text-[#1a1a1a] text-[12px] tracking-[0.06em]">予約</th>
                </tr>
              </thead>
              <tbody>
                {spots.map((spot, i) => {
                  const areaConf = spot.area ? areaMaster[spot.area] : null
                  return (
                    <tr key={spot.id} className={`border-b border-[#efefef] hover:bg-[#faf8f5] transition-colors ${i % 2 === 0 ? '' : 'bg-[#faf8f5]/40'}`}>
                      <td className="py-3.5 pr-4">
                        <Link href={`/spot/${spot.slug}`} className="font-medium text-[#1a1a1a] hover:text-[#5b7e95] transition-colors">
                          {spot.name}
                        </Link>
                      </td>
                      <td className="py-3.5 pr-4 text-[#5c5c5c]">
                        {areaConf ? areaConf.shortLabel : '—'}
                      </td>
                      <td className="py-3.5 pr-4 text-center"><CheckIcon ok={spot.has_onsen} /></td>
                      <td className="py-3.5 pr-4 text-center"><CheckIcon ok={spot.has_meals} /></td>
                      <td className="py-3.5 pr-4 text-[#5c5c5c]">{spot.price_range ?? '—'}</td>
                      <td className="py-3.5">
                        {spot.booking_url ? (
                          <a href={spot.booking_url} target="_blank" rel="noopener noreferrer"
                            className="text-[#5b7e95] hover:underline text-[12px]">予約サイト ↗</a>
                        ) : spot.booking_phone ? (
                          <a href={`tel:${spot.booking_phone}`} className="text-[#5c5c5c] text-[12px]">
                            {spot.booking_phone}
                          </a>
                        ) : spot.phone ? (
                          <a href={`tel:${spot.phone}`} className="text-[#5c5c5c] text-[12px]">
                            {spot.phone}
                          </a>
                        ) : (
                          <span className="text-[#d0d0d0]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
