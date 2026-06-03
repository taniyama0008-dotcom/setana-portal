import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSessionRole } from '@/lib/session'

export async function POST(req: NextRequest) {
  const role = await getSessionRole()
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData     = await req.formData()
  const file         = formData.get('file') as File | null
  const categoryPath = formData.get('categoryPath') as string | null

  if (!file || !categoryPath) {
    return NextResponse.json({ error: '必須パラメータが不足しています。' }, { status: 400 })
  }

  // ─── sharp で処理（cover: 2000px, quality 85） ───────────
  const inputBuffer = Buffer.from(await file.arrayBuffer())
  let processed: Buffer
  try {
    processed = await sharp(inputBuffer)
      .rotate()
      .resize(2000, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer()
  } catch (err) {
    return NextResponse.json(
      { error: `画像処理に失敗しました: ${err instanceof Error ? err.message : ''}` },
      { status: 500 },
    )
  }

  // ─── ファイル名生成 ──────────────────────────────────────
  const originalBase = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w-]/g, '_')
    .slice(0, 60)
  const hash        = Math.random().toString(36).slice(2, 6)
  const safeCategory = categoryPath.replace(/\//g, '_')
  const filename    = `${originalBase}-${hash}.webp`
  const storagePath = `${safeCategory}/${filename}`

  // ─── categories バケットにアップロード ───────────────────
  const { error: uploadError } = await supabaseAdmin.storage
    .from('categories')
    .upload(storagePath, processed, { contentType: 'image/webp', upsert: false })

  if (uploadError) {
    return NextResponse.json(
      { error: `ストレージへのアップロードに失敗しました: ${uploadError.message}` },
      { status: 500 },
    )
  }

  const { data: urlData } = supabaseAdmin.storage.from('categories').getPublicUrl(storagePath)
  const publicUrl = urlData.publicUrl

  // ─── category_settings を更新 ────────────────────────────
  const { error: dbError } = await supabaseAdmin
    .from('category_settings')
    .update({ hero_image_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('category_path', categoryPath)

  if (dbError) {
    await supabaseAdmin.storage.from('categories').remove([storagePath])
    return NextResponse.json(
      { error: `DB 更新に失敗しました: ${dbError.message}` },
      { status: 500 },
    )
  }

  revalidatePath(`/${categoryPath}`)
  revalidatePath('/admin/categories')
  revalidatePath('/')

  return NextResponse.json({ success: true, url: publicUrl })
}

export async function DELETE(req: NextRequest) {
  const role = await getSessionRole()
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { categoryPath, imageUrl } = await req.json() as {
    categoryPath: string | undefined
    imageUrl: string | undefined
  }

  if (!categoryPath || !imageUrl) {
    return NextResponse.json({ error: '必須パラメータが不足しています。' }, { status: 400 })
  }

  // ─── Storage からファイルを削除 ──────────────────────────
  const bucketPrefix = '/object/public/categories/'
  const idx = imageUrl.indexOf(bucketPrefix)
  if (idx !== -1) {
    const storagePath = imageUrl.slice(idx + bucketPrefix.length)
    await supabaseAdmin.storage.from('categories').remove([storagePath])
  }

  // ─── category_settings をクリア ──────────────────────────
  const { error: dbError } = await supabaseAdmin
    .from('category_settings')
    .update({
      hero_image_url: null,
      hero_image_alt: null,
      updated_at: new Date().toISOString(),
    })
    .eq('category_path', categoryPath)

  if (dbError) {
    return NextResponse.json(
      { error: `DB 更新に失敗しました: ${dbError.message}` },
      { status: 500 },
    )
  }

  revalidatePath(`/${categoryPath}`)
  revalidatePath('/admin/categories')
  revalidatePath('/')

  return NextResponse.json({ success: true })
}
