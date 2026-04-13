import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 放行：公开页面和静态资源
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/blacklisted') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 放行：脚本调用的 API
  if (
    pathname.startsWith('/api/morning-news') ||
    pathname.startsWith('/api/articles') ||
    pathname.startsWith('/api/recommend-author') ||
    pathname.startsWith('/api/user/status')
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // 未登录 → 登录页
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 管理员直接放行（从 token 判断）
  if (token.isAdmin) {
    return NextResponse.next()
  }

  // 非管理员：用 token 中的 status 做判断
  const status = token.status as string

  // 黑名单用户 → 只能看黑名单提示页
  if (status === 'blacklisted') {
    if (!pathname.startsWith('/blacklisted')) {
      return NextResponse.redirect(new URL('/blacklisted', req.url))
    }
    return NextResponse.next()
  }

  // 正常用户：禁止访问管理后台
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
