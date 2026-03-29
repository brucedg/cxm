import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyEmailToken } from '@/lib/auth/tokens'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const result = await verifyEmailToken(token, 'magic_link')
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid or expired login link' }, { status: 400 })
    }

    const sql = getDb()
    const [user] = await sql`SELECT id, totp_enabled FROM users WHERE id = ${result.userId}`
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If TOTP enabled, return pending state
    if (user.totp_enabled) {
      const pendingToken = crypto.randomBytes(32).toString('hex')
      await sql`
        INSERT INTO email_tokens (user_id, token, type, expires_at)
        VALUES (${user.id}, ${pendingToken}, ${'totp_pending'}, ${new Date(Date.now() + 5 * 60 * 1000).toISOString()})
      `
      return NextResponse.json({ requires2FA: true, pendingToken })
    }

    // Create session directly
    const sessionId = await createSession(user.id, request)
    const response = NextResponse.json({ success: true })
    return setSessionCookie(response, sessionId)
  } catch (e: any) {
    console.error('Magic link verify error:', e.message)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
