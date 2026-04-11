import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const uid = req.cookies.get('setana_uid')?.value
  const role = req.cookies.get('setana_role')?.value
  const { pathname } = req.nextUrl

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

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/business/:path*', '/mypage/:path*'],
}
