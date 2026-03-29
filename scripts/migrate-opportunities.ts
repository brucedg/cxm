import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // 1. Project templates table
  console.log('1. Creating project_templates table...')
  await sql`
    CREATE TABLE IF NOT EXISTS project_templates (
      id              SERIAL PRIMARY KEY,
      name            VARCHAR(200) NOT NULL,
      description     TEXT NOT NULL DEFAULT '',
      project_type    VARCHAR(20) NOT NULL,
      icon            VARCHAR(10) NOT NULL DEFAULT '🌐',
      canvas_nodes    JSONB NOT NULL DEFAULT '[]',
      canvas_edges    JSONB NOT NULL DEFAULT '[]',
      canvas_direction VARCHAR(2) NOT NULL DEFAULT 'TB',
      sort_order      INTEGER NOT NULL DEFAULT 0,
      is_active       BOOLEAN NOT NULL DEFAULT true,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✓ project_templates created')

  // 2. Tech compatibility table
  console.log('2. Creating tech_compatibility table...')
  await sql`
    CREATE TABLE IF NOT EXISTS tech_compatibility (
      id              SERIAL PRIMARY KEY,
      tech_a_id       INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      tech_b_id       INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      score           INTEGER NOT NULL CHECK (score >= 1 AND score <= 3),
      note            VARCHAR(200) NOT NULL DEFAULT '',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(tech_a_id, tech_b_id)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_compat_a ON tech_compatibility(tech_a_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_compat_b ON tech_compatibility(tech_b_id)`
  console.log('  ✓ tech_compatibility created')

  // 3. Add pricing columns to brands/technologies
  console.log('3. Adding pricing columns...')
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20) NOT NULL DEFAULT 'free'`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS monthly_cost_usd DECIMAL(10,2)`
  console.log('  ✓ pricing columns added')

  console.log('\n✓ Opportunities migration complete')
}

main().catch(e => { console.error('Migration failed:', e.message); process.exit(1) })
