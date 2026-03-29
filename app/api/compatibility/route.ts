import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET — returns all compatibility pairings as a lookup map
export async function GET() {
  const sql = getDb()
  const rows = await sql`
    SELECT tc.tech_a_id, tc.tech_b_id, tc.score, tc.note,
           a.name as tech_a_name, b.name as tech_b_name
    FROM tech_compatibility tc
    JOIN brands a ON a.id = tc.tech_a_id
    JOIN brands b ON b.id = tc.tech_b_id
    ORDER BY tc.score DESC
  `
  return NextResponse.json(rows)
}
