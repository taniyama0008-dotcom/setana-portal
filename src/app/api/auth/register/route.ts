import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { SESSION_UID_COOKIE, SESSION_ROLE_COOKIE, SESSION_PROVIDER_COOKIE, COOKIE_OPTIONS } from '@/lib/session'

function err(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { email, password, nickname } = body ?? {}

  if (!email || !password || !nickname) {
    return err(400, '必須項目が不足しています')
  }
  if (password.length < 6) {
    return err(400, 'パスワードは6文字以上で入力してください')
  }

  // Supabase Auth でユーザー作成（service role → メール確認スキップ）
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    console.error('[register] auth.admin.createUser error:', authError)
    if (authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already exists')) {
      return err(400, 'そのメールアドレスは既に登録されています')
    }
    return err(500, '登録に失敗しました。しばらく経ってから再試行してください')
  }

  const authUserId = authData.user.id

  // 同メールアドレスで既存ユーザーがいる場合（LINE で先に登録済み）は supabase_auth_id を紐づける
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('email', email)
    .maybeSingle()

  let userId: string
  let role: string

  if (existingUser) {
    await supabaseAdmin
      .from('users')
      .update({ supabase_auth_id: authUserId })
      .eq('id', existingUser.id)
    userId = existingUser.id
    role = existingUser.role ?? 'user'
  } else {
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        nickname,
        role: 'user',
        supabase_auth_id: authUserId,
        auth_provider: 'email',
      })
      .select('id, role')
      .single()

    if (insertError) {
      console.error('[register] users insert error:', insertError)
      return err(500, 'ユーザーの作成に失敗しました')
    }
    userId = newUser.id
    role = newUser.role ?? 'user'
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_UID_COOKIE, userId, COOKIE_OPTIONS)
  res.cookies.set(SESSION_ROLE_COOKIE, role, COOKIE_OPTIONS)
  res.cookies.set(SESSION_PROVIDER_COOKIE, 'email', COOKIE_OPTIONS)
  return res
}
