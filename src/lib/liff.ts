import type { Liff } from '@line/liff'

// SSR環境では動作しないため、クライアントサイドのみで使用する
// シングルトンパターンで初期化を1回に抑制

let _liff: Liff | null = null
let _initPromise: Promise<Liff | null> | null = null

export async function getLiff(): Promise<Liff | null> {
  if (typeof window === 'undefined') return null
  if (_liff) return _liff
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    try {
      const { default: liff } = await import('@line/liff')
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
      _liff = liff
      return _liff
    } catch (err) {
      console.error('[LIFF] init failed:', err)
      _initPromise = null
      return null
    }
  })()

  return _initPromise
}

export type LiffProfile = {
  userId: string
  displayName: string
  pictureUrl: string | undefined
  statusMessage: string | undefined
}
