import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // Get some brand and talent IDs
  const brands = await sql`SELECT id, name FROM brands ORDER BY sort_order LIMIT 20`
  const talents = await sql`SELECT id, title FROM talents ORDER BY sort_order LIMIT 6`

  const brandByName = (name: string) => brands.find((b: any) => b.name === name)?.id
  const talentByTitle = (title: string) => talents.find((t: any) => t.title === title)?.id

  const sites = [
    {
      title: 'Waiheke Wine Dogs',
      image_url: 'https://res.cloudinary.com/dum2tng78/image/upload/CXM/backgroound_com8gp',
      url: 'https://waihekewinedogs.com',
      story: 'A community fundraiser celebrating the dogs of Waiheke Island vineyards. Built as a full-stack Next.js application with real-time voting, social sharing, admin panel, and a playable paw-catching game.\n\nFeaturing Cloudinary media management, Neon Postgres, Google Analytics with custom events, and a dynamic CMS for all content.',
      sort_order: 1,
      brands: ['React', 'Next.js', 'TypeScript', 'Vercel', 'Cloudinary', 'PostgreSQL', 'Google Analytics'],
      talents: ['CXM & UI Architecture', 'App Architecture & POCs', 'GA4 Analytics'],
    },
    {
      title: 'Coastal Property Group',
      image_url: '',
      url: 'https://example.com',
      story: 'A premium real estate platform for luxury coastal properties across New Zealand. Content-managed with Contentful, search powered by Algolia, and deployed globally via Vercel edge functions.\n\nThe site features interactive map-based property browsing, virtual tour integration, and a sophisticated lead management system.',
      sort_order: 2,
      brands: ['React', 'Next.js', 'Contentful', 'Algolia', 'Vercel', 'TypeScript'],
      talents: ['CXM & UI Architecture', 'Rapid Marketing Sites'],
    },
    {
      title: 'Auckland Arts Collective',
      image_url: '',
      url: 'https://example.com',
      story: 'An artist portfolio and exhibition platform built for a collective of 40+ Auckland-based artists. WordPress multisite with custom Gutenberg blocks, event management, and e-commerce for artwork sales.\n\nMigrated from a legacy Drupal installation with zero downtime and full content preservation.',
      sort_order: 3,
      brands: ['WordPress', 'Figma', 'Docker', 'PostgreSQL', 'Shopify'],
      talents: ['CMS Services', 'Rapid Marketing Sites', 'Animation & Interactivity'],
    },
  ]

  for (const s of sites) {
    const [row] = await sql`
      INSERT INTO sites (title, image_url, url, story, visible, sort_order)
      VALUES (${s.title}, ${s.image_url}, ${s.url}, ${s.story}, true, ${s.sort_order})
      RETURNING id
    `
    for (const bName of s.brands) {
      const bid = brandByName(bName)
      if (bid) await sql`INSERT INTO site_brands (site_id, brand_id) VALUES (${row.id}, ${bid}) ON CONFLICT DO NOTHING`
    }
    for (const tTitle of s.talents) {
      const tid = talentByTitle(tTitle)
      if (tid) await sql`INSERT INTO site_talents (site_id, talent_id) VALUES (${row.id}, ${tid}) ON CONFLICT DO NOTHING`
    }
    console.log(`  ✓ ${s.title} (${s.brands.length} brands, ${s.talents.length} talents)`)
  }

  console.log('\n✓ 3 sites seeded')
}

main().catch(e => { console.error(e.message); process.exit(1) })
