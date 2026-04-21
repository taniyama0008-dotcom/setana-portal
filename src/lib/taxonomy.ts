// ============================================================
// taxonomy.ts — カテゴリ・エリアの単一ソース定義
// NavMenu / Footer / Admin / フィルタページ が全てここを参照する
// ============================================================

export const SECTIONS = ['travel', 'life', 'connect'] as const
export type Section = typeof SECTIONS[number]

export interface CategoryEntry {
  readonly label: string
  readonly path: string
  readonly sub: string    // ナビ表示用サブテキスト
  readonly accent: string // アクセントカラー
}

export const categoryMaster = {
  travel: {
    label: '旅する',
    labelEn: 'TRAVEL',
    accent: '#c47e4f',
    topHref: '/travel',
    categories: {
      gourmet: { label: 'グルメ',    path: '/travel/gourmet',  sub: '地元食堂・海鮮・カフェ',     accent: '#c47e4f' },
      nature:  { label: '観光・自然', path: '/travel/nature',   sub: '絶景・アクティビティ・神社', accent: '#6b8f71' },
      fishing: { label: '釣り',       path: '/travel/fishing',  sub: '日本海の磯釣りの聖地',       accent: '#6b8f71' },
      onsen:   { label: '温泉',       path: '/travel/onsen',    sub: 'くつろぎの日帰り・宿泊湯',   accent: '#5b7e95' },
      stay:    { label: '泊まる',     path: '/travel/stay',     sub: 'ホテル・旅館・キャンプ場',   accent: '#3d5a6e' },
      access:  { label: 'アクセス',   path: '/travel/access',   sub: '札幌・函館からの交通案内',   accent: '#8a8a8a' },
    },
  },
  life: {
    label: '暮らす',
    labelEn: 'LIFE',
    accent: '#5b7e95',
    topHref: '/life',
    categories: {
      work:        { label: 'しごと',          path: '/life/work',      sub: '求人・協力隊・農林漁業',       accent: '#c47e4f' },
      kyoryokutai: { label: '地域おこし協力隊', path: '/kyoryokutai',    sub: '都市から地方へ。1〜3年の挑戦', accent: '#6b8f71' },
      living:      { label: '暮らしのリアル',   path: '/life/living',    sub: '生活・医療・買い物・教育',     accent: '#5b7e95' },
      migration:   { label: '移住支援',         path: '/life/migration', sub: '補助金・体験住宅・相談窓口',   accent: '#3d5a6e' },
    },
  },
  connect: {
    label: '関わる',
    labelEn: 'CONNECT',
    accent: '#4a7c6f',
    topHref: '/connect',
    categories: {
      furusato:             { label: 'ふるさと納税',         path: '/connect/furusato',           sub: 'せたなを応援する寄付',   accent: '#4a7c6f' },
      'corporate-furusato': { label: '企業版ふるさと納税',   path: '/connect/corporate-furusato', sub: '法人による地域貢献',     accent: '#3d5c6e' },
      famimatch:            { label: 'ファミマッチ',         path: '/connect/famimatch',          sub: '町内外のマッチング',     accent: '#8a6b5b' },
      relation:             { label: '関係人口として関わる', path: '/connect/relation',           sub: '二拠点・ワーケーション', accent: '#6b8a72' },
    },
  },
} as const

// セクション別バッジ設定（SpotCard・スポット詳細ページで使用）
export const sectionBadge: Record<Section, { label: string; bgClass: string; gradient: string }> = {
  travel:  { label: '旅する', bgClass: 'bg-[#c47e4f]', gradient: 'from-[#c47e4f] to-[#a5663a]' },
  life:    { label: '暮らす', bgClass: 'bg-[#5b7e95]', gradient: 'from-[#5b7e95] to-[#3d5a6e]' },
  connect: { label: '関わる', bgClass: 'bg-[#4a7c6f]', gradient: 'from-[#4a7c6f] to-[#2f5a50]' },
}

// エリアマスター（spots・events 両テーブル共通）
export const areaMaster = {
  setana:     { label: '瀬棚区',  shortLabel: '瀬棚',  bg: '#e8f0f4', text: '#4a6e83' },
  kitahiyama: { label: '北檜山区', shortLabel: '北檜山', bg: '#ecf0e8', text: '#5a6e4a' },
  taisei:     { label: '大成区',  shortLabel: '大成',  bg: '#f0ece8', text: '#6e5a4a' },
} as const

export type Area = keyof typeof areaMaster

// ── ユーティリティ ────────────────────────────────────────────

export function getCategoryLabel(section: Section, key: string): string | undefined {
  const cats = categoryMaster[section]?.categories as Record<string, { label: string }> | undefined
  return cats?.[key]?.label
}

export function getCategoryPath(section: Section, key: string): string | undefined {
  const cats = categoryMaster[section]?.categories as Record<string, { path: string }> | undefined
  return cats?.[key]?.path
}

/** セクション配下のカテゴリを [key, entry] 配列で返す */
export function getCategoriesForSection(section: Section): [string, CategoryEntry][] {
  return Object.entries(categoryMaster[section].categories) as [string, CategoryEntry][]
}

/** スポットの全カテゴリ（プライマリ + サブ）のラベルを '・' 結合で返す */
export function formatSpotCategories(section: Section, primaryCategory: string, subCategories: string[]): string {
  const all = [primaryCategory, ...subCategories]
  return all
    .map(k => getCategoryLabel(section, k))
    .filter(Boolean)
    .join('・')
}
