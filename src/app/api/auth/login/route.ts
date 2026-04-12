import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { SESSION_UID_COOKIE, SESSION_ROLE_COOKIE, SESSION_PROVIDER_COOKIE, COOKIE_OPTIONS } from '@/lib/session'

function err(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { email, password } = body ?? {}

  if (!email || !password) {
    return err(400, 'メールアドレスとパスワードを入力してください')
  }

  // anon key クライアントで signInWithPassword（パスワード検証）
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData.user) {
    console.error('[login] signInWithPassword error:', signInError)
    return err(401, 'メールアドレスまたはパスワードが正しくありません')
  }

  // users テーブルからプロフィール取得（supabase_auth_id または email で照合）
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .or(`supabase_auth_id.eq.${signInData.user.id},email.eq.${email}`)
    .maybeSingle()

  if (!user) {
    return err(401, 'ユーザーが見つかりません。新規登録してください')
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_UID_COOKIE, user.id, COOKIE_OPTIONS)
  res.cookies.set(SESSION_ROLE_COOKIE, user.role ?? 'user', COOKIE_OPTIONS)
  res.cookies.set(SESSION_PROVIDER_COOKIE, 'email', COOKIE_OPTIONS)
  return res
}
