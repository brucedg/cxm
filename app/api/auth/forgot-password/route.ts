import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkRateLimit } from '@/lib/auth/rateLimit'
import { createEmailToken } from '@/lib/auth/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Rate limit by email
    const { allowed } = await checkRateLimit(`forgot:${normalizedEmail}`, 3, 60 * 60 * 1000)
    if (!allowed) {
      // Don't reveal rate limit — return success either way
      return NextResponse.json({ success: true })
    }

    const sql = getDb()
    const [user] = await sql`SELECT id FROM users WHERE email = ${normalizedEmail} AND email_verified = true AND password_hash IS NOT NULL`

    if (user) {
      const { token } = await createEmailToken(user.id, 'reset_password')
      await sendPasswordResetEmail(normalizedEmail, token)
    }

    // Always return success to prevent email enumeration
    await new Promise(r => setTimeout(r, 200))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Forgot password error:', e.message)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
