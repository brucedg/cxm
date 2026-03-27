import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

const urls: Record<string, string> = {
  'Sitecore': 'https://www.sitecore.com',
  'Contentful': 'https://www.contentful.com',
  'React': 'https://react.dev',
  'Vercel': 'https://vercel.com',
  'Sanity': 'https://www.sanity.io',
  'Strapi': 'https://strapi.io',
  'Next.js': 'https://nextjs.org',
  'TypeScript': 'https://www.typescriptlang.org',
  'Google Analytics': 'https://analytics.google.com',
  'Cloudinary': 'https://cloudinary.com',
  'Algolia': 'https://www.algolia.com',
  'Node.js': 'https://nodejs.org',
  'GraphQL': 'https://graphql.org',
  'Tailwind CSS': 'https://tailwindcss.com',
  'Figma': 'https://www.figma.com',
  'GitHub': 'https://github.com',
  'Docker': 'https://www.docker.com',
  'PostgreSQL': 'https://www.postgresql.org',
  'Shopify': 'https://www.shopify.com',
  'WordPress': 'https://wordpress.org',
  'Claude': 'https://claude.ai',
  'GitHub Copilot': 'https://github.com/features/copilot',
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  for (const [name, url] of Object.entries(urls)) {
    await sql`UPDATE brands SET url = ${url} WHERE name = ${name}`
    console.log(`  ✓ ${name} → ${url}`)
  }
  console.log(`\n✓ ${Object.keys(urls).length} brands updated with URLs`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
