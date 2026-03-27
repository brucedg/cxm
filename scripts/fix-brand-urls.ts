import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

const base = 'https://res.cloudinary.com/dum2tng78/image/upload'

const urlMap: Record<string, string> = {
  'Sitecore': `${base}/CXM/Brands/sitecore_dnpfgl`,
  'Contentful': `${base}/CXM/Brands/contentful_k1vxbw`,
  'React': `${base}/CXM/Brands/react_zhh6fn`,
  'Vercel': `${base}/CXM/Brands/vercel_sunojs`,
  'Sanity': `${base}/CXM/Brands/sanity_xp1ory`,
  'Strapi': `${base}/CXM/Brands/strapi_znyxrr`,
  'Next.js': `${base}/CXM/Brands/nextjs_te6qjo`,
  'TypeScript': `${base}/CXM/Brands/typescript_dvcb2v`,
  'Google Analytics': `${base}/CXM/Brands/google-analytics_yjfnfv`,
  'Cloudinary': `${base}/CXM/Brands/cloudinary_kiq0ab`,
  'Algolia': `${base}/CXM/Brands/algolia_d5ndet`,
  'Node.js': `${base}/CXM/Brands/nodejs_fstumb`,
  'GraphQL': `${base}/CXM/Brands/graphql_zq6l7y`,
  'Tailwind CSS': `${base}/CXM/Brands/tailwind_ezgvir`,
  'Figma': `${base}/CXM/Brands/figma_chkqmu`,
  'GitHub': `${base}/CXM/Brands/github_xrropa`,
  'Docker': `${base}/CXM/Brands/docker_ni1xcn`,
  'PostgreSQL': `${base}/CXM/Brands/postgresql_thmvdn`,
  'Shopify': `${base}/CXM/Brands/shopify_eyxsdx`,
  'WordPress': `${base}/CXM/Brands/wordpress_swn5cw`,
  'Claude': `${base}/CXM/Brands/claude_prvngo`,
  'GitHub Copilot': `${base}/CXM/Brands/copilot_ltvo2g`,
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  for (const [name, url] of Object.entries(urlMap)) {
    await sql`UPDATE brands SET logo_url = ${url} WHERE name = ${name}`
    console.log(`  ✓ ${name}`)
  }
  // Remove brands with no Cloudinary asset (AWS, Azure DevOps)
  await sql`DELETE FROM brands WHERE name IN ('AWS', 'Azure DevOps')`
  console.log('  ✗ Removed AWS, Azure DevOps (not uploaded)')
  
  const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM brands`
  console.log(`\n✓ ${count} brands with correct URLs`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
