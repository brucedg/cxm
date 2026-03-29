import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

// GET — list user's projects
export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sql = getDb()
  const rows = await sql`
    SELECT id, name, project_type, status, created_at, updated_at
    FROM projects WHERE user_id = ${session.userId}
    ORDER BY updated_at DESC
  `
  return NextResponse.json(rows)
}

// POST — create a new project
export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, project_type, canvas_nodes, canvas_edges, canvas_direction } = await request.json()
  if (!name?.trim() || !project_type) {
    return NextResponse.json({ error: 'Name and project type required' }, { status: 400 })
  }

  const sql = getDb()
  const [project] = await sql`
    INSERT INTO projects (user_id, name, project_type, canvas_nodes, canvas_edges, canvas_direction)
    VALUES (
      ${session.userId},
      ${name.trim()},
      ${project_type},
      ${JSON.stringify(canvas_nodes || [])},
      ${JSON.stringify(canvas_edges || [])},
      ${canvas_direction || 'TB'}
    )
    RETURNING id, name, project_type, status
  `

  return NextResponse.json(project)
}
