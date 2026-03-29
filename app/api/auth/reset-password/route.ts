import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyEmailToken } from '@/lib/auth/tokens'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { destroyAllUserSessions } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      return NextResponse.json({ error: 'Password too weak', details: validation.errors }, { status: 400 })
    }

    const result = await verifyEmailToken(token, 'reset_password')
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    const hash = await hashPassword(password)
    const sql = getDb()
    await sql`UPDATE users SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${result.userId}`

    // Destroy all existing sessions for security
    await destroyAllUserSessions(result.userId)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Reset password error:', e.message)
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 })
  }
}
