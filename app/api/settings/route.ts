import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAuth } from '@/lib/auth'

const ALLOWED_KEYS = ['hero', 'social_channels', 'contact', 'services', 'profile', 'marquee']

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (!key || !ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }
  const sql = getDb()
  const [row] = await sql`SELECT value FROM settings WHERE key = ${key}`
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row.value)
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { key, value } = await request.json()
  if (!key || !ALLOWED_KEYS.includes(key) || value === undefined) {
    return NextResponse.json({ error: 'Invalid key or value' }, { status: 400 })
  }
  const sql = getDb()
  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW()
  `
  return NextResponse.json({ success: true })
}
