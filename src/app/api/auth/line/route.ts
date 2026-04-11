import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface LineVerifyResponse {
  iss: string
  sub: string      // LINE user ID
  aud: string
  exp: number
  iat: number
  name?: string
  picture?: string
  email?: string
  error?: string
  error_description?: string
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const idToken = body?.idToken as string | undefined

  if (!idToken) {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
  }

  // LINE ID トークンを検証
  const params = new URLSearchParams({
    id_token: idToken,
    client_id: process.env.LINE_LOGIN_CHANNEL_ID!,
  })

  const verifyRes = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  const verified: LineVerifyResponse = await verifyRes.json()

  if (!verifyRes.ok || verified.error || !verified.sub) {
    console.error('[LINE auth] token verify failed:', verified)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // チャンネルIDが一致するか確認
  if (verified.aud !== process.env.LINE_LOGIN_CHANNEL_ID) {
    return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 })
  }

  const lineUserId = verified.sub
  const displayName = verified.name ?? 'LINEユーザー'
  const pictureUrl = verified.picture ?? null

  // Supabase: line_user_idで検索 → なければ新規作成
  const { data: existing } = await supabase
    .from('users')
    .select('id, line_user_id, line_display_name')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (existing) {
    // プロフィール情報を更新
    await supabase
      .from('users')
      .update({
        line_display_name: displayName,
        line_picture_url: pictureUrl,
      })
      .eq('id', existing.id)

    return NextResponse.json({ userId: existing.id, displayName, isNew: false })
  }

  // 新規ユーザー作成
  // 同メールのユーザーが既存する場合はline_user_idを紐づける
  // (メールはLINE基本プロフィールでは取得できないため、将来の拡張ポイント)
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      line_user_id: lineUserId,
      line_display_name: displayName,
      line_picture_url: pictureUrl,
      nickname: displayName,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[LINE auth] user insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  return NextResponse.json({ userId: newUser.id, displayName, isNew: true })
}
