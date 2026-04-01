import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 放行：公开页面和静态资源
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/pending') ||
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

  // 非管理员：用 token 中的 status 做初步判断
  // pending 页面会轮询 /api/user/status 获取最新状态并跳转
  const status = token.status as string

  if (status === 'approved') {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // pending 或 rejected → 只能看等待页面
  if (!pathname.startsWith('/pending')) {
    const pendingUrl = new URL('/pending', req.url)
    pendingUrl.searchParams.set('status', status || 'pending')
    return NextResponse.redirect(pendingUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}
