import crypto from 'crypto'
import { getDb } from '@/lib/db'

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createEmailToken(
  userId: number,
  type: 'verify_email' | 'reset_password' | 'magic_link',
  expiryMinutes: number = 15
): Promise<{ token: string; code: string }> {
  const sql = getDb()
  const token = generateToken()
  const code = generateCode()
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

  // Invalidate any existing unused tokens of this type for this user
  await sql`
    UPDATE email_tokens SET used_at = NOW()
    WHERE user_id = ${userId} AND type = ${type} AND used_at IS NULL
  `

  await sql`
    INSERT INTO email_tokens (user_id, token, code, type, expires_at)
    VALUES (${userId}, ${token}, ${code}, ${type}, ${expiresAt.toISOString()})
  `

  return { token, code }
}

export async function verifyEmailToken(
  token: string,
  type: 'verify_email' | 'reset_password' | 'magic_link'
): Promise<{ valid: true; userId: number } | { valid: false }> {
  const sql = getDb()
  const [row] = await sql`
    SELECT id, user_id FROM email_tokens
    WHERE token = ${token} AND type = ${type} AND used_at IS NULL AND expires_at > NOW()
  `

  if (!row) return { valid: false }

  // Mark as used
  await sql`UPDATE email_tokens SET used_at = NOW() WHERE id = ${row.id}`

  return { valid: true, userId: row.user_id }
}

export async function verifyEmailCode(
  userId: number,
  code: string,
  type: 'verify_email' | 'reset_password' | 'magic_link'
): Promise<boolean> {
  const sql = getDb()
  const [row] = await sql`
    SELECT id FROM email_tokens
    WHERE user_id = ${userId} AND code = ${code} AND type = ${type}
      AND used_at IS NULL AND expires_at > NOW()
  `

  if (!row) return false

  await sql`UPDATE email_tokens SET used_at = NOW() WHERE id = ${row.id}`
  return true
}
