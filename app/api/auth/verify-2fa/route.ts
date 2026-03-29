import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyTOTP, decryptSecret, verifyRecoveryCode } from '@/lib/auth/totp'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/auth/rateLimit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

  try {
    const { pendingToken, code, recoveryCode } = await request.json()

    if (!pendingToken) {
      return NextResponse.json({ error: 'Pending token required' }, { status: 400 })
    }

    // Rate limit 2FA attempts
    const { allowed } = await checkRateLimit(`2fa:${pendingToken}`, 5, 15 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    // Validate pending token
    const sql = getDb()
    const [pending] = await sql`
      SELECT user_id FROM email_tokens
      WHERE token = ${pendingToken} AND type = 'totp_pending'
        AND used_at IS NULL AND expires_at > NOW()
    `

    if (!pending) {
      return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 })
    }

    const [user] = await sql`
      SELECT id, totp_secret, totp_enabled FROM users WHERE id = ${pending.user_id}
    `

    if (!user || !user.totp_enabled || !user.totp_secret) {
      return NextResponse.json({ error: '2FA not configured' }, { status: 400 })
    }

    let verified = false

    if (recoveryCode) {
      // Try recovery code
      verified = await verifyRecoveryCode(user.id, recoveryCode)
    } else if (code) {
      // Try TOTP code
      const secret = decryptSecret(user.totp_secret)
      verified = verifyTOTP(secret, code)
    } else {
      return NextResponse.json({ error: 'Code or recovery code required' }, { status: 400 })
    }

    if (!verified) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
    }

    // Mark pending token as used
    await sql`UPDATE email_tokens SET used_at = NOW() WHERE token = ${pendingToken}`

    // Create full session
    const sessionId = await createSession(user.id, request)
    const response = NextResponse.json({ success: true })
    return setSessionCookie(response, sessionId)
  } catch (e: any) {
    console.error('2FA verify error:', e.message)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
