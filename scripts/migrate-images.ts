/**
 * 既存スポット画像をWebP（sharp処理済み）に一括マイグレーション
 *
 * 実行方法:
 *   npx tsx scripts/migrate-images.ts
 *   npx tsx scripts/migrate-images.ts --dry-run   # 変更なしで確認
 *
 * 前提:
 *   - .env.local に SUPABASE_SERVICE_ROLE_KEY が設定済み
 *   - sql/011_add_image_type.sql を Supabase で実行済み
 */

import 'dotenv/config'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!supabaseUrl || !serviceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const IMAGE_CONFIG = {
  cover:   { width: 2000, quality: 85 },
  inline:  { width: 1600, quality: 80 },
  gallery: { width: 2400, quality: 85 },
} as const

type ImageType = keyof typeof IMAGE_CONFIG

async function processImage(buffer: Buffer, type: ImageType = 'inline'): Promise<Buffer> {
  const { width, quality } = IMAGE_CONFIG[type]
  return sharp(buffer)
    .rotate()
    .resize(width, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality })
    .toBuffer()
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

async function main() {
  console.log(DRY_RUN ? '🔍 ドライランモード（変更なし）\n' : '🚀 マイグレーション開始\n')

  // spot_images と spots(slug) を JOIN
  const { data: records, error } = await supabase
    .from('spot_images')
    .select('id, spot_id, image_url, image_type, spots(slug)')
    .order('created_at', { ascending: true })

  if (error) { console.error('取得エラー:', error.message); process.exit(1) }
  if (!records?.length) { console.log('対象レコードなし'); return }

  console.log(`対象: ${records.length} 件\n`)

  let success = 0
  let skip    = 0
  let fail    = 0

  for (const rec of records) {
    const url  = rec.image_url
    const spotsVal = rec.spots
    const slug = (Array.isArray(spotsVal) ? spotsVal[0] : spotsVal as { slug: string } | null)?.slug ?? 'unknown'
    const type: ImageType = (rec.image_type ?? 'inline') as ImageType

    // すでに WebP 変換済みかチェック（spots/{slug}/ パスかつ .webp）
    if (url.includes(`spots/${slug}/`) && url.endsWith('.webp')) {
      console.log(`  ⏭  skip  [${rec.id.slice(0, 8)}] ${url.split('/').pop()}`)
      skip++
      continue
    }

    console.log(`  ⬇  dl    [${rec.id.slice(0, 8)}] ${url}`)
    const buf = await downloadImage(url)
    if (!buf) {
      console.log(`  ❌ fail  ダウンロード失敗: ${url}`)
      fail++
      continue
    }

    let processed: Buffer
    try {
      processed = await processImage(buf, type)
    } catch (e) {
      console.log(`  ❌ fail  sharp 処理失敗: ${e instanceof Error ? e.message : e}`)
      fail++
      continue
    }

    const originalName = url.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/[^\w-]/g, '_').slice(0, 60) ?? 'image'
    const hash         = Math.random().toString(36).slice(2, 6)
    const filename     = `${originalName}-${hash}.webp`
    const storagePath  = `spots/${slug}/${filename}`

    if (DRY_RUN) {
      const kbIn  = Math.round(buf.byteLength / 1024)
      const kbOut = Math.round(processed.byteLength / 1024)
      console.log(`  ✅ dry   → ${storagePath} (${kbIn}KB → ${kbOut}KB, ${type})`)
      success++
      continue
    }

    const { error: upErr } = await supabase.storage
      .from('spots')
      .upload(storagePath, processed, { contentType: 'image/webp', upsert: false })
    if (upErr) {
      console.log(`  ❌ fail  Storage: ${upErr.message}`)
      fail++
      continue
    }

    const { data: urlData } = supabase.storage.from('spots').getPublicUrl(storagePath)
    const newUrl = urlData.publicUrl

    const { error: dbErr } = await supabase
      .from('spot_images')
      .update({ image_url: newUrl })
      .eq('id', rec.id)
    if (dbErr) {
      console.log(`  ❌ fail  DB更新: ${dbErr.message}`)
      await supabase.storage.from('spots').remove([storagePath])
      fail++
      continue
    }

    const kbIn  = Math.round(buf.byteLength / 1024)
    const kbOut = Math.round(processed.byteLength / 1024)
    console.log(`  ✅ done  → ${storagePath} (${kbIn}KB → ${kbOut}KB)`)
    success++
  }

  console.log(`\n完了: 成功 ${success} / スキップ ${skip} / 失敗 ${fail}`)

  if (!DRY_RUN && success > 0) {
    console.log('\ncover_image を再同期中...')
    const { data: spots } = await supabase.from('spots').select('id')
    for (const spot of spots ?? []) {
      const { data: first } = await supabase
        .from('spot_images')
        .select('image_url')
        .eq('spot_id', spot.id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (first !== undefined) {
        await supabase.from('spots').update({ cover_image: first?.image_url ?? null }).eq('id', spot.id)
      }
    }
    console.log('cover_image 同期完了')
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
