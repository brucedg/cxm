import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAuth } from '@/lib/auth'

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM talents ORDER BY sort_order ASC, id ASC`
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, description, tag, icon, sort_order } = await request.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const sql = getDb()
  const [row] = await sql`
    INSERT INTO talents (title, description, tag, icon, sort_order)
    VALUES (${title.trim()}, ${(description || '').trim()}, ${(tag || '').trim()}, ${icon || 'Star'}, ${sort_order || 0})
    RETURNING *
  `
  return NextResponse.json(row)
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, title, description, tag, icon, sort_order } = await request.json()
  if (!id || !title?.trim()) return NextResponse.json({ error: 'ID and title required' }, { status: 400 })
  const sql = getDb()
  await sql`
    UPDATE talents SET
      title = ${title.trim()},
      description = ${(description || '').trim()},
      tag = ${(tag || '').trim()},
      icon = ${icon || 'Star'},
      sort_order = ${sort_order || 0}
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const sql = getDb()
  await sql`DELETE FROM talents WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
