import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { generateTOTPSecret, verifyTOTP, encryptSecret, generateRecoveryCodes, storeRecoveryCodes } from '@/lib/auth/totp'

// GET — generate a new TOTP secret + QR URI
export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { secret, uri } = generateTOTPSecret()

  // Store the secret temporarily (unencrypted in a pending state)
  // We encrypt it only after verification succeeds
  const sql = getDb()
  await sql`
    INSERT INTO email_tokens (user_id, token, code, type, expires_at)
    VALUES (${session.userId}, ${secret}, ${'totp_setup'}, ${'totp_setup'}, ${new Date(Date.now() + 10 * 60 * 1000).toISOString()})
    ON CONFLICT DO NOTHING
  `

  return NextResponse.json({ uri, secret })
}

// POST — verify the TOTP code and enable 2FA
export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code, secret } = await request.json()
  if (!code || !secret) {
    return NextResponse.json({ error: 'Code and secret required' }, { status: 400 })
  }

  // Verify the code against the provided secret
  if (!verifyTOTP(secret, code)) {
    return NextResponse.json({ error: 'Invalid code. Try again.' }, { status: 400 })
  }

  // Encrypt and store the secret, enable TOTP
  const encrypted = encryptSecret(secret)
  const sql = getDb()
  await sql`
    UPDATE users SET
      totp_secret = ${encrypted},
      totp_enabled = true,
      updated_at = NOW()
    WHERE id = ${session.userId}
  `

  // Generate recovery codes
  const recoveryCodes = generateRecoveryCodes()
  await storeRecoveryCodes(session.userId, recoveryCodes)

  // Clean up setup token
  await sql`DELETE FROM email_tokens WHERE user_id = ${session.userId} AND type = 'totp_setup'`

  return NextResponse.json({ success: true, recoveryCodes })
}
