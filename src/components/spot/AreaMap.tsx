'use client'

import { useState } from 'react'
import type { Area } from '@/lib/types'

interface AreaMapProps {
  onAreaClick?: (area: Area) => void
}

const areas = [
  {
    key: 'kitahiyama' as Area,
    label: '北檜山区',
    sub: '行政の中心地',
    fill: '#ccdec6',
    stroke: '#7d8f6b',
    text: '#3d5c2d',
    spots: ['玉川公園', '道の駅せたな', '飲食店街'],
    // SVG rect position
    x: 80, y: 40, w: 200, h: 80,
  },
  {
    key: 'setana' as Area,
    label: '瀬棚区',
    sub: '漁港・観光の中心',
    fill: '#c8dce6',
    stroke: '#6b8fa3',
    text: '#2d4a5c',
    spots: ['三本杉岩', '瀬棚漁港', '日本海'],
    x: 60, y: 170, w: 200, h: 80,
  },
  {
    key: 'taisei' as Area,
    label: '大成区',
    sub: '断崖・絶景スポット',
    fill: '#e6dcd2',
    stroke: '#8f7d6b',
    text: '#5c4a3d',
    spots: ['太田神社', '親子熊岩', '賀老の滝'],
    x: 100, y: 300, w: 200, h: 80,
  },
]

// 矢印（中心点間）
const arrows = [
  { from: { x: 180, y: 120 }, to: { x: 160, y: 170 }, label: '約20分' },
  { from: { x: 160, y: 250 }, to: { x: 200, y: 300 }, label: '約60分' },
  { from: { x: 260, y: 130 }, to: { x: 280, y: 300 }, label: '約40分', dashed: true },
]

export default function AreaMap({ onAreaClick }: AreaMapProps) {
  const [hovered, setHovered] = useState<Area | null>(null)

  return (
    <div className="bg-[#faf8f5] rounded-[12px] p-6 lg:p-8">
      <p className="text-[11px] font-medium text-[#8a8a8a] tracking-[0.2em] nav-label mb-4">AREA MAP</p>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SVG */}
        <div className="flex-shrink-0 w-full max-w-[360px] mx-auto lg:mx-0">
          <svg
            viewBox="0 0 360 420"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-label="せたな町エリアマップ"
          >
            {/* 背景 */}
            <rect width="360" height="420" fill="#faf8f5" rx="8" />

            {/* 日本海ラベル */}
            <text x="310" y="230" fontSize="10" fill="#6b8fa3" opacity="0.6" textAnchor="middle" transform="rotate(-90 310 230)">
              日本海
            </text>
            <line x1="295" y1="60" x2="295" y2="380" stroke="#6b8fa3" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />

            {/* 矢印ライン */}
            {/* 北檜山 ↔ 瀬棚 */}
            <line x1="180" y1="122" x2="162" y2="168" stroke="#b0b0b0" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="155" y="148" fontSize="9" fill="#8a8a8a" textAnchor="end">約20分</text>

            {/* 瀬棚 ↔ 大成 */}
            <line x1="162" y1="252" x2="198" y2="298" stroke="#b0b0b0" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="152" y="278" fontSize="9" fill="#8a8a8a" textAnchor="end">約60分</text>

            {/* 北檜山 ↔ 大成 (dashed, 右側) */}
            <line x1="262" y1="122" x2="282" y2="298" stroke="#b0b0b0" strokeWidth="1" strokeDasharray="4 3" />
            <text x="290" y="215" fontSize="9" fill="#8a8a8a" textAnchor="start">約40分</text>

            {/* 矢印マーカー定義 */}
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#b0b0b0" />
              </marker>
            </defs>

            {/* エリア矩形 */}
            {areas.map((a) => {
              const isHovered = hovered === a.key
              return (
                <g
                  key={a.key}
                  style={{ cursor: onAreaClick ? 'pointer' : 'default' }}
                  onMouseEnter={() => setHovered(a.key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onAreaClick?.(a.key)}
                >
                  <rect
                    x={a.x}
                    y={a.y}
                    width={a.w}
                    height={a.h}
                    rx="8"
                    fill={isHovered ? a.stroke : a.fill}
                    stroke={a.stroke}
                    strokeWidth={isHovered ? 2 : 1.5}
                    style={{ transition: 'fill 0.15s' }}
                  />
                  {/* エリア名 */}
                  <text
                    x={a.x + a.w / 2}
                    y={a.y + 28}
                    fontSize="14"
                    fontWeight="700"
                    fill={isHovered ? '#fff' : a.text}
                    textAnchor="middle"
                    style={{ transition: 'fill 0.15s' }}
                  >
                    {a.label}
                  </text>
                  {/* サブタイトル */}
                  <text
                    x={a.x + a.w / 2}
                    y={a.y + 46}
                    fontSize="9"
                    fill={isHovered ? 'rgba(255,255,255,0.8)' : a.text}
                    opacity={isHovered ? 1 : 0.7}
                    textAnchor="middle"
                    style={{ transition: 'fill 0.15s' }}
                  >
                    {a.sub}
                  </text>
                  {/* スポット名（小さく） */}
                  {a.spots.map((spot, i) => (
                    <text
                      key={spot}
                      x={a.x + a.w / 2}
                      y={a.y + 62 + i * 13}
                      fontSize="8"
                      fill={isHovered ? 'rgba(255,255,255,0.7)' : a.text}
                      opacity={isHovered ? 1 : 0.55}
                      textAnchor="middle"
                      style={{ transition: 'fill 0.15s' }}
                    >
                      {spot}
                    </text>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        {/* テキスト説明 */}
        <div className="flex-1 space-y-4 w-full">
          {areas.map((a) => (
            <div
              key={a.key}
              className="flex items-start gap-3 p-4 rounded-[8px] transition-colors"
              style={{
                backgroundColor: hovered === a.key ? `${a.stroke}18` : 'white',
                borderLeft: `3px solid ${a.stroke}`,
              }}
            >
              <div className="flex-1">
                <p className="text-[14px] font-bold mb-0.5" style={{ color: a.text }}>
                  {a.label}
                </p>
                <p className="text-[13px] text-[#5c5c5c] leading-[1.7]">{a.sub}</p>
                <p className="text-[11px] text-[#8a8a8a] mt-1">{a.spots.join(' · ')}</p>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <p className="text-[11px] text-[#8a8a8a] leading-[1.8]">
              ※ 所要時間は目安です。季節・道路状況により変動します。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
