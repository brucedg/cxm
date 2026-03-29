import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { createSession, setSessionCookie } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { userId, password, displayName } = await request.json()

    if (!userId || !password) {
      return NextResponse.json({ error: 'User ID and password required' }, { status: 400 })
    }

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
      return NextResponse.json({ error: 'Password too weak', details: validation.errors }, { status: 400 })
    }

    const sql = getDb()

    // Verify user exists and email is verified
    const [user] = await sql`SELECT id, email_verified, password_hash FROM users WHERE id = ${userId}`
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (!user.email_verified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 400 })
    }
    if (user.password_hash) {
      return NextResponse.json({ error: 'Password already set. Use login instead.' }, { status: 400 })
    }

    // Hash and store password
    const hash = await hashPassword(password)
    await sql`
      UPDATE users SET
        password_hash = ${hash},
        display_name = ${(displayName || '').trim() || null},
        updated_at = NOW()
      WHERE id = ${userId}
    `

    // Create session
    const sessionId = await createSession(userId, request)
    const response = NextResponse.json({ success: true })
    return setSessionCookie(response, sessionId)
  } catch (e: any) {
    console.error('Create password error:', e.message)
    return NextResponse.json({ error: 'Failed to create password' }, { status: 500 })
  }
}
