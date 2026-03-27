import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAuth } from '@/lib/auth'

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM brands ORDER BY sort_order ASC, id ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, logo_url, url, description, sort_order } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const sql = getDb()
  const [row] = await sql`
    INSERT INTO brands (name, logo_url, url, description, sort_order)
    VALUES (${name.trim()}, ${logo_url || ''}, ${(url || '').trim()}, ${(description || '').trim()}, ${sort_order || 0})
    RETURNING *
  `
  return NextResponse.json(row)
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, logo_url, url, description, sort_order } = await request.json()
  if (!id || !name?.trim()) return NextResponse.json({ error: 'ID and name required' }, { status: 400 })
  const sql = getDb()
  await sql`
    UPDATE brands SET name = ${name.trim()}, logo_url = ${logo_url || ''}, url = ${(url || '').trim()}, description = ${(description || '').trim()}, sort_order = ${sort_order || 0}
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const sql = getDb()
  await sql`DELETE FROM brands WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
