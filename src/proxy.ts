import { NextRequest, NextResponse } from 'next/server'

const PRODUCTION_VERCEL_HOST = 'setana-portal.vercel.app'
const CANONICAL_HOST = 'www.setana.life'

export function proxy(req: NextRequest) {
  const host = req.headers.get('host')

  // vercel.app の本番デプロイURLを正規ドメインへ301リダイレクト（ドメイン評価の一本化）
  if (host === PRODUCTION_VERCEL_HOST) {
    const url = req.nextUrl.clone()
    url.protocol = 'https'
    url.host = CANONICAL_HOST
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/business') ||
    pathname.startsWith('/mypage')
  ) {
    const uid = req.cookies.get('setana_uid')?.value
    const role = req.cookies.get('setana_role')?.value

    // 未ログインはトップへ
    if (!uid) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // /admin は admin ロールのみ
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // /business は business または admin ロールのみ
    if (
      pathname.startsWith('/business') &&
      role !== 'business' &&
      role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
