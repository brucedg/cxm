import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  await sql`
    CREATE TABLE IF NOT EXISTS sites (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      image_url   TEXT NOT NULL DEFAULT '',
      url         VARCHAR(500) DEFAULT '',
      story       TEXT NOT NULL DEFAULT '',
      visible     BOOLEAN NOT NULL DEFAULT true,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS site_brands (
      site_id   INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      brand_id  INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      PRIMARY KEY (site_id, brand_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS site_talents (
      site_id    INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
      talent_id  INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
      PRIMARY KEY (site_id, talent_id)
    )
  `

  console.log('✓ Sites tables created')
}

main().catch(e => { console.error(e.message); process.exit(1) })
