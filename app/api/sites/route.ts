import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAuth } from '@/lib/auth'

export async function GET() {
  const sql = getDb()
  const sites = await sql`SELECT * FROM sites ORDER BY sort_order ASC, id ASC`

  // Fetch relations
  const brandRels = await sql`SELECT site_id, brand_id FROM site_brands`
  const talentRels = await sql`SELECT site_id, talent_id FROM site_talents`
  const brands = await sql`SELECT id, name, logo_url, description, url FROM brands ORDER BY sort_order`
  const talents = await sql`SELECT id, title, icon, tag, description FROM talents ORDER BY sort_order`

  const brandMap = new Map(brands.map((b: any) => [b.id, b]))
  const talentMap = new Map(talents.map((t: any) => [t.id, t]))

  const result = sites.map((s: any) => ({
    ...s,
    brands: brandRels.filter((r: any) => r.site_id === s.id).map((r: any) => brandMap.get(r.brand_id)).filter(Boolean),
    talents: talentRels.filter((r: any) => r.site_id === s.id).map((r: any) => talentMap.get(r.talent_id)).filter(Boolean),
  }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { title, image_url, url, story, visible, sort_order, brand_ids, talent_ids } = await request.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const sql = getDb()
  const [row] = await sql`
    INSERT INTO sites (title, image_url, url, story, visible, sort_order)
    VALUES (${title.trim()}, ${image_url || ''}, ${(url || '').trim()}, ${(story || '').trim()}, ${visible !== false}, ${sort_order || 0})
    RETURNING *
  `

  if (brand_ids?.length) {
    for (const bid of brand_ids) await sql`INSERT INTO site_brands (site_id, brand_id) VALUES (${row.id}, ${bid}) ON CONFLICT DO NOTHING`
  }
  if (talent_ids?.length) {
    for (const tid of talent_ids) await sql`INSERT INTO site_talents (site_id, talent_id) VALUES (${row.id}, ${tid}) ON CONFLICT DO NOTHING`
  }

  return NextResponse.json(row)
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, title, image_url, url, story, visible, sort_order, brand_ids, talent_ids } = await request.json()
  if (!id || !title?.trim()) return NextResponse.json({ error: 'ID and title required' }, { status: 400 })

  const sql = getDb()
  await sql`
    UPDATE sites SET title = ${title.trim()}, image_url = ${image_url || ''}, url = ${(url || '').trim()},
    story = ${(story || '').trim()}, visible = ${visible !== false}, sort_order = ${sort_order || 0}
    WHERE id = ${id}
  `

  // Replace relations
  await sql`DELETE FROM site_brands WHERE site_id = ${id}`
  await sql`DELETE FROM site_talents WHERE site_id = ${id}`
  if (brand_ids?.length) {
    for (const bid of brand_ids) await sql`INSERT INTO site_brands (site_id, brand_id) VALUES (${id}, ${bid}) ON CONFLICT DO NOTHING`
  }
  if (talent_ids?.length) {
    for (const tid of talent_ids) await sql`INSERT INTO site_talents (site_id, talent_id) VALUES (${id}, ${tid}) ON CONFLICT DO NOTHING`
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const sql = getDb()
  await sql`DELETE FROM sites WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
