import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  const brands = await sql`SELECT id, name FROM brands ORDER BY sort_order`
  const talents = await sql`SELECT id, title FROM talents ORDER BY sort_order`
  const bn = (name: string) => brands.find((b: any) => b.name === name)?.id
  const tn = (title: string) => talents.find((t: any) => t.title === title)?.id

  // Get current max sort_order
  const [{ max }] = await sql`SELECT COALESCE(MAX(sort_order), 0)::int as max FROM sites`

  const sites = [
    {
      title: 'Hexagon',
      url: 'https://hexagon.com',
      story: 'Global technology leader in digital reality solutions. Enterprise-scale Sitecore implementation with complex multi-site architecture, personalisation engine, and integrated analytics.',
      brands: ['Sitecore', 'React', 'TypeScript', 'Google Analytics', 'Docker'],
      talents: ['CXM & UI Architecture', 'CMS Services', 'GA4 Analytics'],
    },
    {
      title: 'Southern Cross NZ',
      url: 'https://southerncross.co.nz',
      story: 'New Zealand\'s largest health insurer. Full CX platform build across web and mobile touchpoints with Sitecore, content strategy, and analytics architecture.',
      brands: ['Sitecore', 'React', 'TypeScript', 'Google Analytics'],
      talents: ['CXM & UI Architecture', 'CMS Services', 'GA4 Analytics'],
    },
    {
      title: 'Aurizon',
      url: 'https://aurizon.com.au',
      story: 'Australia\'s largest rail freight operator. Sitecore platform with custom integrations, content migration from legacy systems, and performance optimisation.',
      brands: ['Sitecore', 'React', 'TypeScript', 'Docker'],
      talents: ['CXM & UI Architecture', 'CMS Services'],
    },
    {
      title: 'Erie Insurance',
      url: 'https://erieinsurance.com',
      story: 'Top-tier US insurance provider. Enterprise Sitecore implementation with agent portal, policy management integration, and accessibility-first design.',
      brands: ['Sitecore', 'React', 'TypeScript', 'Google Analytics'],
      talents: ['CXM & UI Architecture', 'CMS Services', 'GA4 Analytics'],
    },
    {
      title: 'Waiheke Radio',
      url: 'https://waihekeradio.co.nz',
      story: 'Community radio station for Waiheke Island. Full-stack Next.js application with live streaming, show schedules, podcast archive, and a custom CMS for presenters.',
      brands: ['React', 'Next.js', 'TypeScript', 'Vercel', 'Cloudinary', 'PostgreSQL'],
      talents: ['App Architecture & POCs', 'CXM & UI Architecture', 'Animation & Interactivity'],
    },
    {
      title: 'Artworks Community Theatre',
      url: 'https://artworkstheatre.org.nz',
      story: 'Waiheke Island\'s community arts venue. Event management platform with online ticketing, membership system, and venue hire booking.',
      brands: ['React', 'Next.js', 'TypeScript', 'Vercel', 'PostgreSQL'],
      talents: ['Rapid Marketing Sites', 'App Architecture & POCs'],
    },
    {
      title: 'Waiheke Wine Dogs',
      url: 'https://waihekewinedogs.com',
      story: 'A community fundraiser celebrating the dogs of Waiheke Island vineyards. Full-stack Next.js application with real-time voting, social sharing, admin panel, and a playable paw-catching game.\n\nFeaturing Cloudinary media management, Neon Postgres, Google Analytics with custom events, and a dynamic CMS for all content.',
      brands: ['React', 'Next.js', 'TypeScript', 'Vercel', 'Cloudinary', 'PostgreSQL', 'Google Analytics'],
      talents: ['CXM & UI Architecture', 'App Architecture & POCs', 'GA4 Analytics', 'Animation & Interactivity'],
    },
  ]

  for (let i = 0; i < sites.length; i++) {
    const s = sites[i]
    const [row] = await sql`
      INSERT INTO sites (title, image_url, url, story, visible, sort_order)
      VALUES (${s.title}, '', ${s.url}, ${s.story}, true, ${max + i + 1})
      RETURNING id
    `
    for (const bName of s.brands) {
      const bid = bn(bName)
      if (bid) await sql`INSERT INTO site_brands (site_id, brand_id) VALUES (${row.id}, ${bid}) ON CONFLICT DO NOTHING`
    }
    for (const tTitle of s.talents) {
      const tid = tn(tTitle)
      if (tid) await sql`INSERT INTO site_talents (site_id, talent_id) VALUES (${row.id}, ${tid}) ON CONFLICT DO NOTHING`
    }
    console.log(`  ✓ ${s.title} (${s.brands.length} brands, ${s.talents.length} talents)`)
  }

  const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM sites`
  console.log(`\n✓ ${count} total sites`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
