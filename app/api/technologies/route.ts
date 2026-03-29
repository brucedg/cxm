import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { checkAuth } from '@/lib/auth'

// Lazy-load sanitizer only for write operations (jsdom is heavy)
async function getSanitizer() {
  const { sanitizeSvg } = await import('@/lib/sanitize-svg')
  return sanitizeSvg
}

// GET — public list with optional category/search filtering
export async function GET(request: NextRequest) {
  const sql = getDb()
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let rows
  if (category && search) {
    const q = `%${search}%`
    rows = await sql`
      SELECT id, name, category, categories, svg_logo, svg_logo_color, color, logo_url, url, description, tags, sort_order
      FROM brands
      WHERE is_active = true AND ${category} = ANY(categories)
        AND (name ILIKE ${q} OR ${search} = ANY(tags))
      ORDER BY sort_order ASC, name ASC
    `
  } else if (category) {
    rows = await sql`
      SELECT id, name, category, categories, svg_logo, svg_logo_color, color, logo_url, url, description, tags, sort_order
      FROM brands
      WHERE is_active = true AND ${category} = ANY(categories)
      ORDER BY sort_order ASC, name ASC
    `
  } else if (search) {
    const q = `%${search}%`
    rows = await sql`
      SELECT id, name, category, categories, svg_logo, svg_logo_color, color, logo_url, url, description, tags, sort_order
      FROM brands
      WHERE is_active = true
        AND (name ILIKE ${q} OR category ILIKE ${q} OR ${search} = ANY(tags))
      ORDER BY category ASC, sort_order ASC, name ASC
    `
  } else {
    rows = await sql`
      SELECT id, name, category, categories, svg_logo, svg_logo_color, color, logo_url, url, description, tags, sort_order
      FROM brands
      WHERE is_active = true
      ORDER BY category ASC, sort_order ASC, name ASC
    `
  }

  return NextResponse.json(rows)
}

// GET categories list
export async function OPTIONS() {
  const sql = getDb()
  const rows = await sql`
    SELECT DISTINCT category, COUNT(*)::int as count
    FROM brands
    WHERE is_active = true AND category != 'uncategorized'
    GROUP BY category
    ORDER BY category ASC
  `
  return NextResponse.json(rows)
}

// POST — create technology (admin only)
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name, category, svg_logo, color, logo_url, url, description, tags, sort_order } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const sanitizeSvg = await getSanitizer()
  const cleanSvg = svg_logo ? sanitizeSvg(svg_logo) : ''
  const sql = getDb()
  const [row] = await sql`
    INSERT INTO brands (name, category, svg_logo, color, logo_url, url, description, tags, sort_order)
    VALUES (
      ${name.trim()},
      ${(category || 'uncategorized').trim()},
      ${cleanSvg},
      ${(color || '').trim()},
      ${(logo_url || '').trim()},
      ${(url || '').trim()},
      ${(description || '').trim()},
      ${tags || []},
      ${sort_order || 0}
    )
    RETURNING *
  `
  return NextResponse.json(row)
}

// PATCH — update technology (admin only)
export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, name, category, categories, svg_logo, svg_logo_color, color, logo_url, url, description, tags, sort_order, is_active } = await request.json()
  if (!id || !name?.trim()) {
    return NextResponse.json({ error: 'ID and name required' }, { status: 400 })
  }

  const cats = categories || (category ? [category] : [])
  const sanitizeSvg = await getSanitizer()
  const cleanSvg = svg_logo ? sanitizeSvg(svg_logo) : ''
  const cleanSvgColor = svg_logo_color ? sanitizeSvg(svg_logo_color) : ''
  const sql = getDb()
  await sql`
    UPDATE brands SET
      name = ${name.trim()},
      category = ${cats[0] || 'uncategorized'},
      categories = ${cats},
      svg_logo = ${cleanSvg},
      svg_logo_color = ${cleanSvgColor},
      color = ${(color || '').trim()},
      logo_url = ${(logo_url || '').trim()},
      url = ${(url || '').trim()},
      description = ${(description || '').trim()},
      tags = ${tags || []},
      sort_order = ${sort_order || 0},
      is_active = ${is_active !== false}
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}

// DELETE — remove technology (admin only)
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const sql = getDb()
  await sql`DELETE FROM brands WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
