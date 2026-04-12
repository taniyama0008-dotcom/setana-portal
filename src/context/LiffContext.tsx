'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { getLiff, type LiffProfile } from '@/lib/liff'

interface LiffContextValue {
  isLoading: boolean
  isLoggedIn: boolean
  isSynced: boolean   // /api/auth/line でセッションCookieのセット完了
  profile: LiffProfile | null
  login: () => void
  logout: () => void
}

const LiffContext = createContext<LiffContextValue>({
  isLoading: true,
  isLoggedIn: false,
  isSynced: false,
  profile: null,
  login: () => {},
  logout: () => {},
})

export function LiffProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading]   = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSynced, setIsSynced]     = useState(false)
  const [profile, setProfile]       = useState<LiffProfile | null>(null)

  useEffect(() => {
    // React Strict Mode のダブル呼び出しに対応するキャンセルフラグ
    let cancelled = false

    ;(async () => {
      const liff = await getLiff()

      if (cancelled) return

      if (!liff) {
        console.warn('[LIFF] getLiff() returned null — LIFF_ID が未設定か init に失敗しました')
        setIsLoading(false)
        return
      }

      const loggedIn = liff.isLoggedIn()
      console.log('[LIFF] LiffContext — isLoggedIn:', loggedIn)

      setIsLoggedIn(loggedIn)

      if (loggedIn) {
        try {
          const p = await liff.getProfile()
          if (cancelled) return

          console.log('[LIFF] profile — displayName:', p.displayName)

          setProfile({
            userId:        p.userId,
            displayName:   p.displayName,
            pictureUrl:    p.pictureUrl,
            statusMessage: p.statusMessage,
          })

          // セッションクッキーをサーバーに同期（完了後に isSynced = true）
          const idToken = liff.getIDToken()
          console.log('[LIFF] getIDToken():', idToken ? `${idToken.slice(0, 20)}...` : 'null — openid scope が未設定の可能性')
          if (idToken) {
            try {
              const r = await fetch('/api/auth/line', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
              })
              const json = await r.json().catch(() => null)
              console.log('[LIFF] session sync —', r.status, json)
            } catch (err) {
              console.warn('[LIFF] session sync failed:', err)
            }
          } else {
            // idToken なし（openid scope 未設定等）: Cookie セット不要、そのまま完了扱い
            console.warn('[LIFF] no idToken — skipping session sync')
          }
          if (!cancelled) setIsSynced(true)
        } catch (err) {
          console.error('[LIFF] getProfile failed:', err)
        }
      }

      if (!cancelled) setIsLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(() => {
    ;(async () => {
      const liff = await getLiff()
      if (!liff) return
      console.log('[LIFF] login()')
      liff.login()
    })()
  }, [])

  const logout = useCallback(() => {
    ;(async () => {
      const liff = await getLiff()
      if (!liff) return
      console.log('[LIFF] logout()')
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      liff.logout()
      setIsLoggedIn(false)
      setProfile(null)
      window.location.href = '/'
    })()
  }, [])

  return (
    <LiffContext.Provider value={{ isLoading, isLoggedIn, isSynced, profile, login, logout }}>
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  return useContext(LiffContext)
}
