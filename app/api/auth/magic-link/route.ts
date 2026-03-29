import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkRateLimit } from '@/lib/auth/rateLimit'
import { createEmailToken } from '@/lib/auth/tokens'
import { Resend } from 'resend'

const appUrl = process.env.APP_URL || 'http://localhost:3008'

// POST — send magic link email
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const { allowed } = await checkRateLimit(`magic:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  try {
    const { email } = await request.json()
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const sql = getDb()

    const [user] = await sql`
      SELECT id, email_verified, password_hash FROM users WHERE email = ${normalizedEmail}
    `

    if (user && user.email_verified) {
      const { token } = await createEmailToken(user.id, 'magic_link', 15)
      const link = `${appUrl}/magic-login?token=${token}`

      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'CXM <noreply@cxm.nz>',
        to: normalizedEmail,
        subject: 'Your login link — CXM Project Builder',
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0;">CXM</h1>
              <p style="color: #666; font-size: 14px; margin-top: 4px;">Project Builder</p>
            </div>
            <h2 style="font-size: 20px; color: #1a1a2e; margin-bottom: 16px;">Sign in to CXM</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6;">
              Click the button below to sign in. This link expires in 15 minutes.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${link}" style="display: inline-block; padding: 14px 32px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Sign in to CXM
              </a>
            </div>
            <p style="color: #999; font-size: 13px; line-height: 1.5;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        `,
      })
    }

    // Always return success to prevent email enumeration
    await new Promise(r => setTimeout(r, 200))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Magic link error:', e.message)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
