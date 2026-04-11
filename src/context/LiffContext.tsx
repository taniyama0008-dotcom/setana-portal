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
  profile: LiffProfile | null
  login: () => void
  logout: () => void
}

const LiffContext = createContext<LiffContextValue>({
  isLoading: true,
  isLoggedIn: false,
  profile: null,
  login: () => {},
  logout: () => {},
})

export function LiffProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState<LiffProfile | null>(null)

  useEffect(() => {
    getLiff().then(async (liff) => {
      if (!liff) { setIsLoading(false); return }

      const loggedIn = liff.isLoggedIn()
      setIsLoggedIn(loggedIn)

      if (loggedIn) {
        try {
          const p = await liff.getProfile()
          setProfile({
            userId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
            statusMessage: p.statusMessage,
          })
          // セッションクッキー同期
          const idToken = liff.getIDToken()
          if (idToken) {
            fetch('/api/auth/line', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            }).catch(() => {})
          }
        } catch (err) {
          console.error('[LIFF] getProfile failed:', err)
        }
      }
      setIsLoading(false)
    })
  }, [])

  const login = useCallback(() => {
    getLiff().then((liff) => liff?.login())
  }, [])

  const logout = useCallback(() => {
    getLiff().then(async (liff) => {
      if (!liff) return
      // サーバーのセッションクッキーを削除
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      liff.logout()
      setIsLoggedIn(false)
      setProfile(null)
      window.location.href = '/'
    })
  }, [])

  return (
    <LiffContext.Provider value={{ isLoading, isLoggedIn, profile, login, logout }}>
      {children}
    </LiffContext.Provider>
  )
}

export function useLiff() {
  return useContext(LiffContext)
}
