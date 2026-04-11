import type { Liff } from '@line/liff'

let _liff: Liff | null = null
let _initPromise: Promise<Liff | null> | null = null

export async function getLiff(): Promise<Liff | null> {
  if (typeof window === 'undefined') return null
  if (_liff) return _liff

  // 進行中の init があればそれを await して返す（二重呼び出し防止）
  if (!_initPromise) {
    _initPromise = (async () => {
      try {
        console.log('[LIFF] init start — liffId:', process.env.NEXT_PUBLIC_LIFF_ID)
        const { default: liff } = await import('@line/liff')
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        console.log('[LIFF] init complete — isLoggedIn:', liff.isLoggedIn())
        _liff = liff
        return _liff
      } catch (err) {
        console.error('[LIFF] init failed:', err)
        _initPromise = null
        return null
      }
    })()
  }

  // async 関数内で Promise を return すると unwrap される（await と同じ挙動）
  return await _initPromise
}

export type LiffProfile = {
  userId: string
  displayName: string
  pictureUrl: string | undefined
  statusMessage: string | undefined
}
