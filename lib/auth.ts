import { NextRequest } from 'next/server'
import crypto from 'crypto'

export function checkAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) return false
  const decoded = Buffer.from(auth.slice(6), 'base64').toString()
  const [, password] = decoded.split(':')
  if (!password || !process.env.ADMIN_PASSWORD) return false
  const a = Buffer.from(password)
  const b = Buffer.from(process.env.ADMIN_PASSWORD)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
}
