'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLiff } from '@/context/LiffContext'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const { login: liffLogin, isLoading: liffLoading } = useLiff()
  const [tab, setTab] = useState<Tab>('login')

  // ログイン
  const [loginError, setLoginError] = useState('')
  const [loginPending, startLogin] = useTransition()

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email    = fd.get('email') as string
    const password = fd.get('password') as string
    setLoginError('')

    startLogin(async () => {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        setLoginError(json.error ?? 'ログインに失敗しました')
        return
      }
      router.push('/mypage')
    })
  }

  // 新規登録
  const [regError, setRegError] = useState('')
  const [regPending, startReg] = useTransition()

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd       = new FormData(e.currentTarget)
    const nickname = fd.get('nickname') as string
    const email    = fd.get('email') as string
    const password = fd.get('password') as string
    const confirm  = fd.get('confirm') as string
    setRegError('')

    if (password !== confirm) {
      setRegError('パスワードが一致しません')
      return
    }

    startReg(async () => {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      })
      const json = await r.json().catch(() => ({}))
      if (!r.ok) {
        setRegError(json.error ?? '登録に失敗しました')
        return
      }
      router.push('/mypage')
    })
  }

  const inputClass =
    'w-full bg-white border border-[#e0e0e0] rounded-[8px] px-4 py-3 text-[15px] text-[#1a1a1a] placeholder-[#bdbdbd] focus:outline-none focus:border-[#5b7e95] transition-colors'

  return (
    <div className="min-h-[calc(100vh-128px)] bg-[#faf8f5] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px]">

        {/* ロゴ */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-[22px] font-bold tracking-[0.1em] text-[#1a1a1a]">SETANA</span>
            <span className="block text-[10px] font-normal text-[#8a8a8a] tracking-[0.14em] mt-0.5">暮らし・食・自然</span>
          </Link>
        </div>

        <div className="bg-white rounded-[14px] shadow-sm border border-[#efefef] overflow-hidden">

          {/* タブ */}
          <div className="flex border-b border-[#efefef]">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3.5 text-[13px] font-medium transition-colors ${
                  tab === t
                    ? 'text-[#1a1a1a] border-b-2 border-[#5b7e95]'
                    : 'text-[#8a8a8a] hover:text-[#5c5c5c]'
                }`}
              >
                {t === 'login' ? 'ログイン' : '新規登録'}
              </button>
            ))}
          </div>

          <div className="px-6 pt-6 pb-7 space-y-5">

            {/* LINEログイン */}
            <button
              onClick={liffLogin}
              disabled={liffLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] text-white text-[14px] font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{ backgroundColor: '#06C755' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINEでログイン
            </button>

            {/* 区切り */}
            <div className="flex items-center gap-3 text-[12px] text-[#c0c0c0]">
              <div className="flex-1 border-t border-[#efefef]" />
              または
              <div className="flex-1 border-t border-[#efefef]" />
            </div>

            {/* ──── ログインタブ ──── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <p className="text-[13px] text-[#d94f4f] bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] px-4 py-2.5">
                    {loginError}
                  </p>
                )}

                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1.5">
                    メールアドレス
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="example@email.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1.5">
                    パスワード
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-right">
                    <span className="text-[11px] text-[#8a8a8a] cursor-default">
                      パスワードを忘れた方（準備中）
                    </span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loginPending}
                  className="w-full py-3 bg-[#c47e4f] hover:bg-[#a5663a] disabled:opacity-50 text-white text-[14px] font-medium rounded-[8px] transition-colors mt-1"
                >
                  {loginPending ? 'ログイン中...' : 'ログイン'}
                </button>
              </form>
            )}

            {/* ──── 新規登録タブ ──── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && (
                  <p className="text-[13px] text-[#d94f4f] bg-[#fff5f5] border border-[#d94f4f]/20 rounded-[6px] px-4 py-2.5">
                    {regError}
                  </p>
                )}

                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1.5">
                    ニックネーム <span className="text-[#d94f4f]">*</span>
                  </label>
                  <input
                    name="nickname"
                    type="text"
                    required
                    maxLength={30}
                    placeholder="例: せたな太郎"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1.5">
                    メールアドレス <span className="text-[#d94f4f]">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="example@email.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1.5">
                    パスワード <span className="text-[#d94f4f]">*</span>
                    <span className="ml-1 font-normal text-[#8a8a8a]">（6文字以上）</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#5c5c5c] mb-1.5">
                    パスワード確認 <span className="text-[#d94f4f]">*</span>
                  </label>
                  <input
                    name="confirm"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={regPending}
                  className="w-full py-3 bg-[#c47e4f] hover:bg-[#a5663a] disabled:opacity-50 text-white text-[14px] font-medium rounded-[8px] transition-colors mt-1"
                >
                  {regPending ? '登録中...' : '登録する'}
                </button>
              </form>
            )}

          </div>
        </div>

        <p className="text-center text-[12px] text-[#8a8a8a] mt-6">
          <Link href="/" className="hover:text-[#5c5c5c] transition-colors">
            ← サイトに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
