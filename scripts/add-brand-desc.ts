import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

const descriptions: Record<string, string> = {
  'Sitecore': 'Enterprise digital experience platform',
  'Contentful': 'API-first headless content management',
  'React': 'Component-based UI library by Meta',
  'Vercel': 'Frontend deployment and hosting platform',
  'Sanity': 'Real-time structured content platform',
  'Strapi': 'Open-source headless CMS',
  'Next.js': 'Full-stack React framework by Vercel',
  'TypeScript': 'Typed JavaScript at scale',
  'Google Analytics': 'Web analytics and measurement platform',
  'Cloudinary': 'Media management and delivery API',
  'Algolia': 'Search and discovery API',
  'Node.js': 'Server-side JavaScript runtime',
  'GraphQL': 'Query language for APIs',
  'Tailwind CSS': 'Utility-first CSS framework',
  'Figma': 'Collaborative interface design tool',
  'GitHub': 'Code hosting and version control',
  'Docker': 'Containerised application deployment',
  'PostgreSQL': 'Advanced open-source relational database',
  'Shopify': 'E-commerce platform and storefront',
  'WordPress': 'The world\'s most popular CMS',
  'Claude': 'AI assistant by Anthropic',
  'GitHub Copilot': 'AI-powered code completion',
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // Add column if not exists
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`
  console.log('✓ description column added')

  for (const [name, desc] of Object.entries(descriptions)) {
    await sql`UPDATE brands SET description = ${desc} WHERE name = ${name}`
    console.log(`  ✓ ${name}`)
  }

  console.log(`\n✓ ${Object.keys(descriptions).length} brands updated`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
