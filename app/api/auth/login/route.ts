import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyPassword } from '@/lib/auth/password'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/auth/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  // Rate limit by IP
  const ipLimit = await checkRateLimit(`login:ip:${ip}`, 10, 15 * 60 * 1000)
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
  }

  try {
    const { email, password } = await request.json()
    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Rate limit by email
    const emailLimit = await checkRateLimit(`login:email:${normalizedEmail}`, 5, 60 * 60 * 1000)
    if (!emailLimit.allowed) {
      return NextResponse.json({ error: 'Too many login attempts for this email. Try again later.' }, { status: 429 })
    }

    const sql = getDb()
    const [user] = await sql`
      SELECT id, email, password_hash, email_verified, totp_enabled
      FROM users WHERE email = ${normalizedEmail}
    `

    // Timing-safe: always verify even if user doesn't exist
    const fakeHash = '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    const valid = await verifyPassword(user?.password_hash || fakeHash, password)

    if (!user || !valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.email_verified) {
      return NextResponse.json({ error: 'Email not verified', code: 'EMAIL_NOT_VERIFIED' }, { status: 401 })
    }

    // If TOTP enabled, return pending state (don't create session yet)
    if (user.totp_enabled) {
      // Create a short-lived pending token
      const crypto = await import('crypto')
      const pendingToken = crypto.randomBytes(32).toString('hex')
      await sql`
        INSERT INTO email_tokens (user_id, token, type, expires_at)
        VALUES (${user.id}, ${pendingToken}, ${'totp_pending'}, ${new Date(Date.now() + 5 * 60 * 1000).toISOString()})
      `
      return NextResponse.json({ requires2FA: true, pendingToken })
    }

    // Create session
    const sessionId = await createSession(user.id, request)
    const response = NextResponse.json({ success: true })
    return setSessionCookie(response, sessionId)
  } catch (e: any) {
    console.error('Login error:', e.message)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
