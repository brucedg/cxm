'use client'

import { usePathname } from 'next/navigation'
import { Nav } from '@/app/Nav'

const AUTH_PATHS = ['/login', '/register', '/verify', '/create-password', '/forgot-password', '/reset-password', '/setup-2fa', '/verify-2fa']

export function ConditionalNav() {
  const pathname = usePathname()

  // Hide nav on auth pages and the canvas design page
  if (AUTH_PATHS.includes(pathname) || pathname.endsWith('/design')) {
    return null
  }

  return <Nav />
}
