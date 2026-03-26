import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

const talents = [
  { title: 'CXM & UI Architecture', description: 'Experience frameworks and design systems that scale with your ambitions.', tag: 'Strategy + Build', icon: 'LayoutGrid', sort_order: 1 },
  { title: 'App Architecture & POCs', description: 'Fast, reliable proof-of-concept development. Test ideas without betting the farm.', tag: 'Dev + Prototype', icon: 'Code2', sort_order: 2 },
  { title: 'Rapid Marketing Sites', description: 'Campaign-ready landing pages and marketing sites built at pace, without cutting corners.', tag: 'Web + CRO', icon: 'Monitor', sort_order: 3 },
  { title: 'GA4 Analytics', description: 'Proper measurement architecture. Tag strategy, event taxonomy, dashboards, and insights.', tag: 'Data + Insight', icon: 'BarChart3', sort_order: 4 },
  { title: 'Animation & Interactivity', description: 'Motion design and micro-interactions that enhance rather than decorate.', tag: 'Motion + UX', icon: 'Sun', sort_order: 5 },
  { title: 'CMS Services', description: 'Any CMS, built and rescued. Platform transformations, content migrations, and emergency recoveries done properly.', tag: 'CMS + Migration', icon: 'Grid2x2', sort_order: 6 },
]

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  await sql`
    CREATE TABLE IF NOT EXISTS talents (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      tag         VARCHAR(100) NOT NULL DEFAULT '',
      icon        VARCHAR(100) NOT NULL DEFAULT 'Star',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  for (const t of talents) {
    await sql`
      INSERT INTO talents (title, description, tag, icon, sort_order)
      VALUES (${t.title}, ${t.description}, ${t.tag}, ${t.icon}, ${t.sort_order})
      ON CONFLICT DO NOTHING
    `
    console.log(`  ✓ ${t.title}`)
  }

  console.log('\n✓ Talents table created and seeded')
}

main().catch(e => { console.error(e.message); process.exit(1) })
