import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Google News sitemap — /reports 用
// 各エントリの URL は /reports/{report_number}。
// 個別レポートページが未実装の間は 404 になるが、
// Google Publisher Center 申請の前提条件となるサイトマップ構造として先行実装する。

const BASE_URL  = 'https://www.setana.life'
const SITE_NAME = 'SETANA'
const LANGUAGE  = 'ja'

// 2日 = 172800秒（Google News の推奨インデックス対象期間）
const NEWS_WINDOW_MS = 2 * 24 * 60 * 60 * 1000

const CATEGORY_LABEL: Record<string, string> = {
  road:         '道路情報',
  streetlight:  '街灯情報',
  park:         '公園情報',
  snow:         '除雪情報',
  other:        'お知らせ',
  shop_closed:  '閉店情報',
  shop_hours:   '営業時間変更',
  shop_crowded: '混雑情報',
  weather:      '天気・気象情報',
  event_info:   'イベント情報',
  other_info:   'リアルタイム情報',
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildTitle(report: {
  category: string
  spot_name: string | null
  public_message: string | null
  description: string | null
}): string {
  if (report.public_message?.trim()) {
    return report.public_message.trim().slice(0, 100)
  }
  const catLabel = CATEGORY_LABEL[report.category] ?? 'リアルタイム情報'
  if (report.spot_name?.trim()) return `${catLabel} — ${report.spot_name.trim()}`
  return catLabel
}

export async function GET() {
  const since = new Date(Date.now() - NEWS_WINDOW_MS).toISOString()

  const { data: reports } = await supabaseAdmin
    .from('reports')
    .select('report_number, category, spot_name, public_message, description, created_at')
    .eq('is_public', true)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000)

  const urlEntries = (reports ?? [])
    .map((r) => {
      const loc   = `${BASE_URL}/reports/${encodeURIComponent(r.report_number)}`
      const date  = new Date(r.created_at).toISOString()
      const title = esc(buildTitle(r))

      return `\
  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${SITE_NAME}</news:name>
        <news:language>${LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`
    })
    .join('\n')

  const xml = `\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="https://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Googlebot は 1時間程度でクロールするため短めにキャッシュ
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
