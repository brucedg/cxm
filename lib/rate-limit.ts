type Entry = { count: number; resetAt: number }
const buckets = new Map<string, Entry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key)
  }
}, 5 * 60 * 1000).unref()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = buckets.get(key)
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  entry.count++
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) }
}
