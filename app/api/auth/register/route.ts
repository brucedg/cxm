import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkRateLimit } from '@/lib/auth/rateLimit'
import { createEmailToken } from '@/lib/auth/tokens'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const { allowed } = await checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 })
  }

  try {
    const { email } = await request.json()
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const sql = getDb()
    const normalizedEmail = email.trim().toLowerCase()

    // Check if user already exists
    const [existing] = await sql`SELECT id, email_verified, password_hash FROM users WHERE email = ${normalizedEmail}`

    if (existing) {
      if (existing.email_verified && existing.password_hash) {
        // Fully registered — don't reveal this, send generic response
        // but actually don't send email (timing-safe: add small delay)
        await new Promise(r => setTimeout(r, 200))
        return NextResponse.json({ success: true, userId: existing.id })
      }

      // Partially registered — resend verification
      const { token, code } = await createEmailToken(existing.id, 'verify_email')
      await sendVerificationEmail(normalizedEmail, code, token)
      return NextResponse.json({ success: true, userId: existing.id })
    }

    // Create new user
    const [user] = await sql`
      INSERT INTO users (email) VALUES (${normalizedEmail}) RETURNING id
    `

    const { token, code } = await createEmailToken(user.id, 'verify_email')
    await sendVerificationEmail(normalizedEmail, code, token)

    return NextResponse.json({ success: true, userId: user.id })
  } catch (e: any) {
    console.error('Registration error:', e.message)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
