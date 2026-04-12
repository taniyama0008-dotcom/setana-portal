import Link from 'next/link'
import { cookies } from 'next/headers'
import NavMenu from './NavMenu'
import AuthButton from '@/components/AuthButton'
import { SESSION_UID_COOKIE, SESSION_PROVIDER_COOKIE } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'

export default async function Header() {
  const cookieStore = await cookies()
  const provider = cookieStore.get(SESSION_PROVIDER_COOKIE)?.value
  const uid      = cookieStore.get(SESSION_UID_COOKIE)?.value

  // メール認証済みの場合のみサーバーでニックネームを取得
  let emailUser: { nickname: string } | null = null
  if (provider === 'email' && uid) {
    const { data } = await supabaseAdmin
      .from('users')
      .select('nickname')
      .eq('id', uid)
      .single()
    if (data?.nickname) emailUser = { nickname: data.nickname }
  }

  return (
    <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-50">
      <div className="max-w-[1120px] mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-[#1a1a1a] font-bold text-base tracking-wide leading-tight hover:opacity-70 transition-opacity shrink-0"
          style={{ fontFamily: 'var(--font-noto-sans-jp), sans-serif' }}
        >
          <span className="text-[17px] font-bold tracking-[0.08em]">SETANA</span>
          <span className="block text-[9px] font-normal text-[#8a8a8a] tracking-[0.12em] mt-0.5">暮らし・食・自然</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavMenu />

          <div className="ml-2 pl-2 border-l border-[#efefef]">
            <AuthButton emailUser={emailUser} />
          </div>
        </div>
      </div>
    </header>
  )
}
