import crypto from 'crypto'
import * as OTPAuth from 'otpauth'
import { getDb } from '@/lib/db'
import { hashPassword } from './password'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY || 'cxm-totp-default-key-change-me!!'

function getKeyBuffer(): Buffer {
  // Ensure exactly 32 bytes for AES-256
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
}

export function encryptSecret(secret: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv)
  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${tag}:${encrypted}`
}

export function decryptSecret(encrypted: string): string {
  const [ivHex, tagHex, data] = encrypted.split(':')
  const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function generateTOTPSecret(): { secret: string; uri: string; qrData: string } {
  const totp = new OTPAuth.TOTP({
    issuer: 'CXM',
    label: 'CXM Project Builder',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  })

  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
    qrData: totp.toString(),
  }
}

export function verifyTOTP(secret: string, token: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: 'CXM',
    label: 'CXM Project Builder',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })

  // Allow 1-step window for clock drift
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex') // 8-char hex
    codes.push(code)
  }
  return codes
}

export async function storeRecoveryCodes(userId: number, codes: string[]): Promise<void> {
  const sql = getDb()
  // Clear existing codes
  await sql`DELETE FROM recovery_codes WHERE user_id = ${userId}`
  // Hash and store each code
  for (const code of codes) {
    const hash = crypto.createHash('sha256').update(code).digest('hex')
    await sql`INSERT INTO recovery_codes (user_id, code_hash) VALUES (${userId}, ${hash})`
  }
}

export async function verifyRecoveryCode(userId: number, code: string): Promise<boolean> {
  const sql = getDb()
  const hash = crypto.createHash('sha256').update(code.toLowerCase().trim()).digest('hex')
  const [row] = await sql`
    SELECT id FROM recovery_codes
    WHERE user_id = ${userId} AND code_hash = ${hash} AND used_at IS NULL
  `
  if (!row) return false
  await sql`UPDATE recovery_codes SET used_at = NOW() WHERE id = ${row.id}`
  return true
}
