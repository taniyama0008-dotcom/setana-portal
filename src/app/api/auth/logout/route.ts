import { NextResponse } from 'next/server'
import { SESSION_UID_COOKIE, SESSION_ROLE_COOKIE } from '@/lib/session'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(SESSION_UID_COOKIE)
  res.cookies.delete(SESSION_ROLE_COOKIE)
  return res
}
