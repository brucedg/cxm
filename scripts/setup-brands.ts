import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  await sql`
    CREATE TABLE IF NOT EXISTS brands (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(200) NOT NULL,
      logo_url    TEXT NOT NULL DEFAULT '',
      url         VARCHAR(500) DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  console.log('✓ Brands table created')
}

main().catch(e => { console.error(e.message); process.exit(1) })
