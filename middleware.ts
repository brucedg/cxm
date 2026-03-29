import { NextRequest, NextResponse } from 'next/server'

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify', '/create-password', '/setup-2fa', '/verify-2fa']
const PROTECTED_PREFIX = '/projects'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('cxm_session')?.value

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Protected routes — redirect to login if no session
  if (pathname.startsWith(PROTECTED_PREFIX) && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auth pages — redirect to projects if already logged in
  if (AUTH_PAGES.some(p => pathname === p) && sessionCookie) {
    // Allow verify and setup-2fa even when logged in (part of registration flow)
    if (pathname === '/verify' || pathname === '/create-password' || pathname === '/setup-2fa' || pathname === '/verify-2fa') {
      return response
    }
    return NextResponse.redirect(new URL('/projects', request.url))
  }

  return response
}

export const config = {
  matcher: ['/projects/:path*', '/login', '/register', '/forgot-password', '/reset-password', '/verify', '/create-password', '/setup-2fa', '/verify-2fa'],
}
