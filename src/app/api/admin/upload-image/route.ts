import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'

type ImageType = 'cover' | 'inline' | 'gallery'

const IMAGE_CONFIG: Record<ImageType, { width: number; quality: number }> = {
  cover:   { width: 2000, quality: 85 },
  inline:  { width: 1600, quality: 80 },
  gallery: { width: 2400, quality: 85 },
}

export async function POST(req: NextRequest) {
  const role = await getSessionRole()
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file      = formData.get('file') as File | null
  const spotId    = formData.get('spotId') as string | null
  const spotSlug  = formData.get('spotSlug') as string | null
  const imageType = ((formData.get('imageType') as string) || 'inline') as ImageType
  const altText   = (formData.get('altText') as string) || ''

  if (!file || !spotId || !spotSlug) {
    return NextResponse.json({ error: '必須パラメータが不足しています。' }, { status: 400 })
  }

  // ─── sharp で処理 ───────────────────────────────────────
  const config = IMAGE_CONFIG[imageType] ?? IMAGE_CONFIG.inline
  const inputBuffer = Buffer.from(await file.arrayBuffer())

  let processed: Buffer
  try {
    processed = await sharp(inputBuffer)
      .rotate()                                                  // EXIF 回転を適用してメタデータを削除
      .resize(config.width, null, {
        withoutEnlargement: true,                               // 元より小さい時は拡大しない
        fit: 'inside',
      })
      .webp({ quality: config.quality })
      .toBuffer()                                               // toBuffer() で EXIF が除去される
  } catch (err) {
    return NextResponse.json({ error: `画像処理に失敗しました: ${err instanceof Error ? err.message : ''}` }, { status: 500 })
  }

  // ─── ファイル名生成 ──────────────────────────────────────
  const originalBase = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w-]/g, '_')
    .slice(0, 60)
  const hash = Math.random().toString(36).slice(2, 6)
  const filename     = `${originalBase}-${hash}.webp`
  const storagePath  = `spots/${spotSlug}/${filename}`

  // ─── Supabase Storage にアップロード ────────────────────
  const { error: uploadError } = await supabaseAdmin.storage
    .from('spots')
    .upload(storagePath, processed, { contentType: 'image/webp', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: `ストレージへのアップロードに失敗しました: ${uploadError.message}` }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('spots').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // ─── sort_order を決定 ──────────────────────────────────
  const { data: last } = await supabaseAdmin
    .from('spot_images')
    .select('sort_order')
    .eq('spot_id', spotId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = last ? (last.sort_order ?? 0) + 1 : 0

  // ─── spot_images に INSERT ───────────────────────────────
  const { data: image, error: dbError } = await supabaseAdmin
    .from('spot_images')
    .insert({
      spot_id:    spotId,
      image_url:  publicUrl,
      alt_text:   altText || null,
      image_type: imageType,
      sort_order: sortOrder,
    })
    .select('*')
    .single()

  if (dbError) {
    await supabaseAdmin.storage.from('spots').remove([storagePath])
    return NextResponse.json({ error: `DB登録に失敗しました: ${dbError.message}` }, { status: 500 })
  }

  // ─── cover_image を同期 ──────────────────────────────────
  const { data: firstImage } = await supabaseAdmin
    .from('spot_images')
    .select('image_url')
    .eq('spot_id', spotId)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  await supabaseAdmin
    .from('spots')
    .update({ cover_image: firstImage?.image_url ?? null })
    .eq('id', spotId)

  revalidatePath(`/admin/spots/${spotId}/images`)
  revalidatePath(`/spot/${spotSlug}`)
  revalidatePath('/travel/stay')
  revalidatePath('/travel/gourmet')
  revalidatePath('/travel/onsen')
  revalidatePath('/travel/nature')
  revalidatePath('/travel/fishing')

  return NextResponse.json({ success: true, image })
}
