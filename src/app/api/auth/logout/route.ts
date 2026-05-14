import { NextRequest, NextResponse } from 'next/server'
import { SESSION_UID_COOKIE, SESSION_ROLE_COOKIE, SESSION_PROVIDER_COOKIE } from '@/lib/session'

export async function POST(req: NextRequest) {
  const explicit = req.nextUrl.searchParams.get('explicit') === 'true'
  const provider = req.cookies.get(SESSION_PROVIDER_COOKIE)?.value

  // explicit=true: ユーザーが明示的にログアウトボタンを押した場合 → 常に削除
  // explicit なし: LIFF の desync 検出による自動呼び出し → LINE セッションのみ削除
  //   provider='email' の事業者セッションは LIFF と無関係なので触らない
  if (!explicit && provider !== 'line') {
    return NextResponse.json({ success: true })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.delete(SESSION_UID_COOKIE)
  res.cookies.delete(SESSION_ROLE_COOKIE)
  res.cookies.delete(SESSION_PROVIDER_COOKIE)
  return res
}
