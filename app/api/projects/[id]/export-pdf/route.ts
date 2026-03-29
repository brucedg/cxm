import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { checkRateLimit } from '@/lib/auth/rateLimit'
import { renderToBuffer } from '@react-pdf/renderer'
import { ProjectPdfDocument } from '@/lib/pdf/ProjectPdf'
import React from 'react'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Rate limit: 10 exports per hour per user
  const { allowed } = await checkRateLimit(`pdf-export:${session.userId}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many exports. Try again later.' }, { status: 429 })
  }

  const { id } = await params
  const sql = getDb()

  // Get project with ownership check
  const [project] = await sql`
    SELECT * FROM projects WHERE id = ${parseInt(id)} AND user_id = ${session.userId}
  `
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get technology details for nodes on the canvas
  const nodes = (project.canvas_nodes || []) as any[]
  const edges = (project.canvas_edges || []) as any[]

  const techIds = nodes
    .filter((n: any) => n.type === 'tech' && n.data?.techId)
    .map((n: any) => n.data.techId as number)

  let technologies: any[] = []
  if (techIds.length > 0) {
    technologies = await sql`
      SELECT id, name, category, categories, color, description
      FROM brands WHERE id = ANY(${techIds})
    `
  }

  const techMap = new Map(technologies.map(t => [t.id, t]))

  // Build tech info for PDF
  const techInfos = nodes
    .filter((n: any) => n.type === 'tech' && n.data?.techId)
    .map((n: any) => {
      const tech = techMap.get(n.data.techId)
      return {
        id: n.id,
        name: tech?.name || n.data.label || 'Unknown',
        category: tech?.category || n.data.category || '',
        color: tech?.color || n.data.color || '#ddd',
        description: tech?.description || '',
      }
    })

  // Group by category
  const categorizedTechs: Record<string, typeof techInfos> = {}
  for (const t of techInfos) {
    const cat = t.category || 'Other'
    if (!categorizedTechs[cat]) categorizedTechs[cat] = []
    categorizedTechs[cat].push(t)
  }

  // Build connections
  const nodeNameMap = new Map<string, string>()
  for (const n of nodes) {
    if (n.type === 'root') nodeNameMap.set(n.id, project.name)
    else if (n.data?.label) nodeNameMap.set(n.id, n.data.label)
  }

  const connections = edges.map((e: any) => ({
    sourceName: nodeNameMap.get(e.source) || e.source,
    targetName: nodeNameMap.get(e.target) || e.target,
  }))

  const date = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })

  try {
    const element = React.createElement(ProjectPdfDocument, {
      projectName: project.name,
      projectType: project.project_type,
      userName: session.displayName || session.email,
      date,
      technologies: techInfos,
      connections,
      categorizedTechs,
    })
    // @ts-expect-error — react-pdf types are strict about DocumentProps
    const buffer = await renderToBuffer(element)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-zA-Z0-9\s-]/g, '')}-architecture.pdf"`,
      },
    })
  } catch (e: any) {
    console.error('PDF generation error:', e.message)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
