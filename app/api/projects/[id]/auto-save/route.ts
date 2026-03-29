import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

// PATCH — auto-save canvas state (debounced from client)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { canvas_nodes, canvas_edges, canvas_direction, canvas_viewport } = await request.json()

  const sql = getDb()
  const [updated] = await sql`
    UPDATE projects SET
      canvas_nodes = ${JSON.stringify(canvas_nodes || [])},
      canvas_edges = ${JSON.stringify(canvas_edges || [])},
      canvas_direction = ${canvas_direction || 'TB'},
      canvas_viewport = ${canvas_viewport ? JSON.stringify(canvas_viewport) : null},
      updated_at = NOW()
    WHERE id = ${parseInt(id)} AND user_id = ${session.userId}
    RETURNING id
  `

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
