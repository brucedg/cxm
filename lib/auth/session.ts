import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

const SESSION_COOKIE = 'cxm_session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createSession(userId: number, request: NextRequest): Promise<string> {
  const sql = getDb()
  const sessionId = generateSessionId()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
  const ua = request.headers.get('user-agent') || ''
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000)

  await sql`
    INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at)
    VALUES (${sessionId}, ${userId}, ${ip}, ${ua}, ${expiresAt.toISOString()})
  `

  // Update last login
  await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${userId}`

  return sessionId
}

export function setSessionCookie(response: NextResponse, sessionId: string): NextResponse {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export type SessionUser = {
  sessionId: string
  userId: number
  email: string
  emailVerified: boolean
  displayName: string | null
  avatarUrl: string | null
  totpEnabled: boolean
}

export async function getSession(request: NextRequest): Promise<SessionUser | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  const sql = getDb()
  const [row] = await sql`
    SELECT s.id as session_id, s.user_id, s.expires_at,
           u.email, u.email_verified, u.display_name, u.avatar_url, u.totp_enabled
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${sessionId} AND s.expires_at > NOW()
  `

  if (!row) return null

  // Sliding window: extend session if more than 1 day old
  const expiresAt = new Date(row.expires_at)
  const remainingDays = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (remainingDays < 6) {
    const newExpiry = new Date(Date.now() + SESSION_MAX_AGE * 1000)
    await sql`UPDATE sessions SET expires_at = ${newExpiry.toISOString()} WHERE id = ${sessionId}`
  }

  return {
    sessionId: row.session_id,
    userId: row.user_id,
    email: row.email,
    emailVerified: row.email_verified,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    totpEnabled: row.totp_enabled,
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM sessions WHERE id = ${sessionId}`
}

export async function destroyAllUserSessions(userId: number): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM sessions WHERE user_id = ${userId}`
}
