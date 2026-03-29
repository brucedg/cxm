import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()
  const results: Record<string, number> = {}

  // 1. Delete expired sessions
  const expiredSessions = await sql`
    DELETE FROM sessions WHERE expires_at < NOW() RETURNING id
  `
  results.expired_sessions = expiredSessions.length

  // 2. Delete used/expired email tokens older than 24 hours
  const oldTokens = await sql`
    DELETE FROM email_tokens
    WHERE (used_at IS NOT NULL AND used_at < NOW() - INTERVAL '24 hours')
       OR (expires_at < NOW() - INTERVAL '24 hours')
    RETURNING id
  `
  results.old_tokens = oldTokens.length

  // 3. Delete stale rate limit entries (window older than 2 hours)
  const staleRateLimits = await sql`
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours' RETURNING key
  `
  results.stale_rate_limits = staleRateLimits.length

  // 4. Delete analytics events older than 12 months
  const oldAnalytics = await sql`
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '12 months' RETURNING id
  `
  results.old_analytics = oldAnalytics.length

  // 5. Delete used recovery codes older than 6 months
  const oldRecoveryCodes = await sql`
    DELETE FROM recovery_codes WHERE used_at IS NOT NULL AND used_at < NOW() - INTERVAL '6 months' RETURNING id
  `
  results.old_recovery_codes = oldRecoveryCodes.length

  return NextResponse.json({ success: true, cleaned: results, timestamp: new Date().toISOString() })
}
