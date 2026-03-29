import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const sql = getDb()
  const rows = await sql`
    SELECT id, name, description, project_type, icon, canvas_nodes, canvas_edges, canvas_direction, sort_order
    FROM project_templates
    WHERE is_active = true
    ORDER BY sort_order ASC
  `
  return NextResponse.json(rows)
}
