import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyEmailToken, verifyEmailCode } from '@/lib/auth/tokens'

export async function POST(request: NextRequest) {
  try {
    const { token, code, userId } = await request.json()

    let verifiedUserId: number | null = null

    if (token) {
      const result = await verifyEmailToken(token, 'verify_email')
      if (!result.valid) {
        return NextResponse.json({ error: 'Invalid or expired verification link' }, { status: 400 })
      }
      verifiedUserId = result.userId
    } else if (code && userId) {
      const valid = await verifyEmailCode(userId, code, 'verify_email')
      if (!valid) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
      }
      verifiedUserId = userId
    } else {
      return NextResponse.json({ error: 'Token or code required' }, { status: 400 })
    }

    const sql = getDb()
    await sql`UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = ${verifiedUserId}`

    return NextResponse.json({ success: true, userId: verifiedUserId })
  } catch (e: any) {
    console.error('Verify email error:', e.message)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
