import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // 1. Evolve brands → technologies (additive — keeps backward compat)
  console.log('Evolving brands table...')
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'uncategorized'`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100)`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS svg_logo TEXT`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS color VARCHAR(7)`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`
  await sql`CREATE INDEX IF NOT EXISTS idx_brands_category ON brands(category)`
  await sql`CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active) WHERE is_active = true`
  console.log('  ✓ brands table evolved with category, svg_logo, color, tags')

  // 2. Users table
  console.log('Creating users table...')
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      email           VARCHAR(320) NOT NULL UNIQUE,
      email_verified  BOOLEAN NOT NULL DEFAULT false,
      password_hash   TEXT,
      totp_secret     TEXT,
      totp_enabled    BOOLEAN NOT NULL DEFAULT false,
      oauth_provider  VARCHAR(20),
      oauth_id        VARCHAR(255),
      display_name    VARCHAR(200),
      avatar_url      TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at   TIMESTAMPTZ
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
  console.log('  ✓ users table created')

  // 3. Email tokens
  console.log('Creating email_tokens table...')
  await sql`
    CREATE TABLE IF NOT EXISTS email_tokens (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       VARCHAR(64) NOT NULL UNIQUE,
      code        VARCHAR(6),
      type        VARCHAR(20) NOT NULL,
      expires_at  TIMESTAMPTZ NOT NULL,
      used_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_tokens(token)`
  await sql`CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id)`
  console.log('  ✓ email_tokens table created')

  // 4. Sessions
  console.log('Creating sessions table...')
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id          VARCHAR(64) PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ip_address  VARCHAR(45),
      user_agent  TEXT,
      expires_at  TIMESTAMPTZ NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`
  console.log('  ✓ sessions table created')

  // 5. Recovery codes
  console.log('Creating recovery_codes table...')
  await sql`
    CREATE TABLE IF NOT EXISTS recovery_codes (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code_hash   VARCHAR(128) NOT NULL,
      used_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_recovery_codes_user ON recovery_codes(user_id)`
  console.log('  ✓ recovery_codes table created')

  // 6. Projects
  console.log('Creating projects table...')
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id                SERIAL PRIMARY KEY,
      user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name              VARCHAR(300) NOT NULL,
      project_type      VARCHAR(20) NOT NULL,
      about_you         JSONB NOT NULL DEFAULT '{}',
      canvas_nodes      JSONB NOT NULL DEFAULT '[]',
      canvas_edges      JSONB NOT NULL DEFAULT '[]',
      canvas_direction  VARCHAR(2) NOT NULL DEFAULT 'TB',
      canvas_viewport   JSONB,
      status            VARCHAR(20) NOT NULL DEFAULT 'draft',
      completed_at      TIMESTAMPTZ,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`
  console.log('  ✓ projects table created')

  // 7. Project technologies
  console.log('Creating project_technologies table...')
  await sql`
    CREATE TABLE IF NOT EXISTS project_technologies (
      id              SERIAL PRIMARY KEY,
      project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      technology_id   INTEGER NOT NULL REFERENCES brands(id),
      context         VARCHAR(20) NOT NULL DEFAULT 'existing',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(project_id, technology_id, context)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_project_tech_project ON project_technologies(project_id)`
  console.log('  ✓ project_technologies table created')

  // 8. Rate limits
  console.log('Creating rate_limits table...')
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key           VARCHAR(200) PRIMARY KEY,
      count         INTEGER NOT NULL DEFAULT 1,
      window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  console.log('  ✓ rate_limits table created')

  // 9. Analytics events
  console.log('Creating analytics_events table...')
  await sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      session_id  VARCHAR(64),
      event_name  VARCHAR(100) NOT NULL,
      event_data  JSONB DEFAULT '{}',
      ip_address  VARCHAR(45),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name)`
  await sql`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at)`
  console.log('  ✓ analytics_events table created')

  console.log('\n✓ Phase 1 migration complete — all tables created')
}

main().catch(e => { console.error('Migration failed:', e.message); process.exit(1) })
