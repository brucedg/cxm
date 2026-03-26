import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key         VARCHAR(100) PRIMARY KEY,
      value       JSONB NOT NULL DEFAULT '{}',
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Seed hero content
  const hero = {
    tagline: 'Senior Digital Consultancy',
    title: 'We build',
    titleLight: 'the digital',
    titleAccent: 'infrastructure',
    titleEnd: 'of great brands.',
    description: 'CXM brings twenty-plus years of hands-on expertise across CX strategy, UI engineering, analytics architecture, and CMS platform work. Senior thinking, without the senior overhead.',
    ctas: [
      { text: 'View our services', url: '#services', style: 'primary' },
      { text: 'Talk to us', url: '#contact', style: 'secondary' },
    ],
    disciplines: ['CXM', 'UI/UX', 'Analytics', 'CMS', 'Motion', 'POC Dev'],
  }

  await sql`
    INSERT INTO settings (key, value) VALUES ('hero', ${JSON.stringify(hero)})
    ON CONFLICT (key) DO NOTHING
  `

  // Seed social channels
  const social = [
    { name: 'LinkedIn', url: '' },
    { name: 'X', url: '' },
  ]

  await sql`
    INSERT INTO settings (key, value) VALUES ('social_channels', ${JSON.stringify(social)})
    ON CONFLICT (key) DO NOTHING
  `

  // Seed contact info
  const contact = {
    email: 'hello@cxm.nz',
    location: 'New Zealand · Remote-capable',
    availability: 'Currently taking projects',
    responseTime: 'Within 24 hours',
  }

  await sql`
    INSERT INTO settings (key, value) VALUES ('contact', ${JSON.stringify(contact)})
    ON CONFLICT (key) DO NOTHING
  `

  console.log('✓ Database setup complete')
}

main().catch(e => { console.error(e.message); process.exit(1) })
