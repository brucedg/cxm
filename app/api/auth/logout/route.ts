import { NextRequest, NextResponse } from 'next/server'
import { getSession, destroySession, clearSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (session) {
    await destroySession(session.sessionId)
  }
  const response = NextResponse.json({ success: true })
  return clearSessionCookie(response)
}
