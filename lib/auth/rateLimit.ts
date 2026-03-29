import { getDb } from '@/lib/db'

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const sql = getDb()
  const windowStart = new Date(Date.now() - windowMs)

  // Clean up expired entries and get current count
  const [row] = await sql`
    SELECT count, window_start FROM rate_limits WHERE key = ${key}
  `

  if (!row || new Date(row.window_start) < windowStart) {
    // No record or expired window — reset
    await sql`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, NOW())
      ON CONFLICT (key) DO UPDATE SET count = 1, window_start = NOW()
    `
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(Date.now() + windowMs),
    }
  }

  if (row.count >= maxRequests) {
    const resetAt = new Date(new Date(row.window_start).getTime() + windowMs)
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    }
  }

  // Increment
  await sql`UPDATE rate_limits SET count = count + 1 WHERE key = ${key}`

  return {
    allowed: true,
    remaining: maxRequests - row.count - 1,
    resetAt: new Date(new Date(row.window_start).getTime() + windowMs),
  }
}
