import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SESSION_UID_COOKIE, SESSION_ROLE_COOKIE, COOKIE_OPTIONS } from '@/lib/session'

interface LineVerifyResponse {
  iss: string
  sub: string
  aud: string
  exp: number
  iat: number
  name?: string
  picture?: string
  email?: string
  error?: string
  error_description?: string
}

function setSessionCookies(res: NextResponse, userId: string, role: string) {
  res.cookies.set(SESSION_UID_COOKIE, userId, COOKIE_OPTIONS)
  res.cookies.set(SESSION_ROLE_COOKIE, role, COOKIE_OPTIONS)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const idToken = body?.idToken as string | undefined

  if (!idToken) {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
  }

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
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (verified.aud !== process.env.LINE_LOGIN_CHANNEL_ID) {
    return NextResponse.json({ error: 'Token audience mismatch' }, { status: 401 })
  }

  const lineUserId = verified.sub
  const displayName = verified.name ?? 'LINEユーザー'
  const pictureUrl = verified.picture ?? null

  // 既存ユーザー検索
  const { data: existing } = await supabase
    .from('users')
    .select('id, role')
    .eq('line_user_id', lineUserId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('users')
      .update({ line_display_name: displayName, line_picture_url: pictureUrl })
      .eq('id', existing.id)

    const res = NextResponse.json({ userId: existing.id, displayName, role: existing.role, isNew: false })
    setSessionCookies(res, existing.id, existing.role ?? 'user')
    return res
  }

  // 新規ユーザー作成
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      line_user_id: lineUserId,
      line_display_name: displayName,
      line_picture_url: pictureUrl,
      nickname: displayName,
      role: 'user',
    })
    .select('id, role')
    .single()

  if (insertError) {
    console.error('[LINE auth] user insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }

  const res = NextResponse.json({ userId: newUser.id, displayName, role: newUser.role, isNew: true })
  setSessionCookies(res, newUser.id, newUser.role ?? 'user')
  return res
}
