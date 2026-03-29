import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { event_name, event_data } = await request.json()
    if (!event_name) return NextResponse.json({ error: 'Event name required' }, { status: 400 })

    const session = await getSession(request)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'

    const sql = getDb()
    await sql`
      INSERT INTO analytics_events (user_id, session_id, event_name, event_data, ip_address)
      VALUES (
        ${session?.userId || null},
        ${session?.sessionId || null},
        ${event_name},
        ${JSON.stringify(event_data || {})},
        ${ip}
      )
    `

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
