import { cookies } from 'next/headers'

export const SESSION_UID_COOKIE      = 'setana_uid'
export const SESSION_ROLE_COOKIE     = 'setana_role'
export const SESSION_PROVIDER_COOKIE = 'setana_provider'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30日

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
} as const

export async function getSessionProvider(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_PROVIDER_COOKIE)?.value ?? null
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_UID_COOKIE)?.value ?? null
}

export async function getSessionRole(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_ROLE_COOKIE)?.value ?? null
}

export async function requireRole(required: string | string[]): Promise<string> {
  const uid = await getSessionUserId()
  const role = await getSessionRole()
  const allowed = Array.isArray(required) ? required : [required]
  if (!uid || !role || !allowed.includes(role)) {
    throw new Error('Unauthorized')
  }
  return uid
}
