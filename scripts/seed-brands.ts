import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

const CLOUD = 'dum2tng78'
const base = `https://res.cloudinary.com/${CLOUD}/image/upload/brands`

const brands = [
  { name: 'Sitecore', logo: `${base}/sitecore.svg`, sort: 1 },
  { name: 'Contentful', logo: `${base}/contentful.svg`, sort: 2 },
  { name: 'React', logo: `${base}/react.svg`, sort: 3 },
  { name: 'Vercel', logo: `${base}/vercel.svg`, sort: 4 },
  { name: 'Azure DevOps', logo: `${base}/azure-devops.svg`, sort: 5 },
  { name: 'Sanity', logo: `${base}/sanity.svg`, sort: 6 },
  { name: 'Strapi', logo: `${base}/strapi.svg`, sort: 7 },
  { name: 'Next.js', logo: `${base}/nextjs.svg`, sort: 8 },
  { name: 'TypeScript', logo: `${base}/typescript.svg`, sort: 9 },
  { name: 'Google Analytics', logo: `${base}/google-analytics.svg`, sort: 10 },
  { name: 'Cloudinary', logo: `${base}/cloudinary.svg`, sort: 11 },
  { name: 'Algolia', logo: `${base}/algolia.svg`, sort: 12 },
  { name: 'AWS', logo: `${base}/aws.svg`, sort: 13 },
  { name: 'Node.js', logo: `${base}/nodejs.svg`, sort: 14 },
  { name: 'GraphQL', logo: `${base}/graphql.svg`, sort: 15 },
  { name: 'Tailwind CSS', logo: `${base}/tailwind.svg`, sort: 16 },
  { name: 'Figma', logo: `${base}/figma.svg`, sort: 17 },
  { name: 'GitHub', logo: `${base}/github.svg`, sort: 18 },
  { name: 'Docker', logo: `${base}/docker.svg`, sort: 19 },
  { name: 'PostgreSQL', logo: `${base}/postgresql.svg`, sort: 20 },
  { name: 'Shopify', logo: `${base}/shopify.svg`, sort: 21 },
  { name: 'WordPress', logo: `${base}/wordpress.svg`, sort: 22 },
  { name: 'Claude', logo: `${base}/claude.svg`, sort: 23 },
  { name: 'GitHub Copilot', logo: `${base}/copilot.svg`, sort: 24 },
]

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  
  for (const b of brands) {
    await sql`
      INSERT INTO brands (name, logo_url, sort_order)
      VALUES (${b.name}, ${b.logo}, ${b.sort})
      ON CONFLICT DO NOTHING
    `
    console.log(`  ✓ ${b.name}`)
  }
  
  console.log(`\n✓ ${brands.length} brands seeded`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
