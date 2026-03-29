import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // 1. Add categories column (TEXT array)
  console.log('1. Adding categories column...')
  await sql`ALTER TABLE brands ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'`

  // 2. Migrate existing category data to categories array
  console.log('2. Migrating category → categories...')
  await sql`
    UPDATE brands SET categories = ARRAY[category]
    WHERE category != 'uncategorized' AND category != ''
      AND (categories IS NULL OR categories = '{}')
  `

  // 3. Remove duplicates — for each duplicate name, keep the one with svg_logo, delete others
  console.log('3. Removing duplicates...')
  const dupes = await sql`
    SELECT name FROM brands GROUP BY name HAVING COUNT(*) > 1
  `
  for (const { name } of dupes) {
    const rows = await sql`SELECT id, svg_logo, logo_url, category FROM brands WHERE name = ${name} ORDER BY id`
    // Keep the one with SVG, or the latest one
    const keeper = rows.find(r => r.svg_logo && r.svg_logo !== '') || rows[rows.length - 1]
    const toDelete = rows.filter(r => r.id !== keeper.id)
    for (const d of toDelete) {
      // Merge any useful data from the duplicate into the keeper
      if (d.logo_url && !keeper.logo_url) {
        // Don't merge the old cloudinary logos — we want SVGs only
      }
      await sql`DELETE FROM brands WHERE id = ${d.id}`
    }
    console.log(`  Merged "${name}": kept id ${keeper.id}, deleted ${toDelete.map(d => d.id).join(',')}`)
  }

  // 4. Clear old Cloudinary logo_urls (the default lettered ones we don't want)
  console.log('4. Clearing old Cloudinary logo URLs...')
  await sql`UPDATE brands SET logo_url = '' WHERE logo_url LIKE '%cloudinary%'`

  // 5. Fix all SVGs and categories using correct SimpleIcons slugs
  console.log('5. Fixing SVGs and categories...')
  const si = await import('simple-icons')

  // Map of technology name → [simpleicons key, categories[], color override]
  const fixes: Record<string, { siKey?: string; categories: string[]; color?: string }> = {
    // Originally uncategorized (from old brands table)
    'Sitecore': { categories: ['CMS'], color: '#EB1F1F' },
    'Contentful': { siKey: 'siContentful', categories: ['CMS'] },
    'React': { siKey: 'siReact', categories: ['Frontend Framework'] },
    'Vercel': { siKey: 'siVercel', categories: ['Hosting', 'CI/CD'] },
    'Sanity': { siKey: 'siSanity', categories: ['CMS'] },
    'Strapi': { siKey: 'siStrapi', categories: ['CMS'] },
    'Next.js': { siKey: 'siNextdotjs', categories: ['Frontend Framework', 'Hosting'] },
    'TypeScript': { siKey: 'siTypescript', categories: ['Language'] },
    'Google Analytics': { siKey: 'siGoogleanalytics', categories: ['Analytics'] },
    'Cloudinary': { siKey: 'siCloudinary', categories: ['Image / Media', 'CDN'] },
    'Algolia': { siKey: 'siAlgolia', categories: ['Search'] },
    'Node.js': { siKey: 'siNodedotjs', categories: ['Build Tools', 'Language'] },
    'GraphQL': { siKey: 'siGraphql', categories: ['API'] },
    'Tailwind CSS': { siKey: 'siTailwindcss', categories: ['CSS Framework'] },
    'Figma': { siKey: 'siFigma', categories: ['Design'] },
    'GitHub': { siKey: 'siGithub', categories: ['Repository', 'CI/CD'] },
    'Docker': { siKey: 'siDocker', categories: ['Containerisation'] },
    'PostgreSQL': { siKey: 'siPostgresql', categories: ['Database'] },
    'Shopify': { siKey: 'siShopify', categories: ['Ecommerce'] },
    'WordPress': { siKey: 'siWordpress', categories: ['CMS'] },
    'Claude': { siKey: 'siAnthropic', categories: ['AI Tools'] },
    'GitHub Copilot': { siKey: 'siGithubcopilot', categories: ['AI Tools', 'Code Editor'] },

    // Missing SVGs from the seeded batch
    'VS Code': { siKey: 'siVisualstudiocode', categories: ['Code Editor'] },
    'Typesense': { siKey: 'siTypesense', categories: ['Search'] },
    'ChatGPT': { siKey: 'siOpenai', categories: ['AI Tools'] },
    'AWS': { siKey: 'siAmazonwebservices', categories: ['Hosting', 'CDN'] },
    'AWS CloudFront': { siKey: 'siAmazoncloudwatch', categories: ['CDN'] },
    'Azure': { siKey: 'siMicrosoftazure', categories: ['Hosting'] },
    'Azure DevOps': { siKey: 'siAzuredevops', categories: ['Repository', 'CI/CD'] },
    'Fly.io': { categories: ['Hosting'], color: '#7B3BE2' },
    'Heroku': { siKey: 'siHeroku', categories: ['Hosting'] },
    'C#': { siKey: 'siCsharp', categories: ['Language'] },
    'Java': { siKey: 'siOpenjdk', categories: ['Language'] },
    'Magento': { siKey: 'siMagento', categories: ['Ecommerce'] },
    'Neon': { siKey: 'siNeon', categories: ['Database'] },
    'DynamoDB': { siKey: 'siAmazondynamodb', categories: ['Database'] },
    'Optimizely': { categories: ['Personalisation', 'Analytics'], color: '#0037FF' },
    'Keystone': { siKey: 'siKeystonejs', categories: ['CMS'] },
    'Nuxt.js': { siKey: 'siNuxtdotjs', categories: ['Frontend Framework'] },
    'React Native': { siKey: 'siReact', categories: ['Frontend Framework', 'Language'] },
    'Apollo GraphQL': { siKey: 'siApollographql', categories: ['API'] },
    'Amplitude': { siKey: 'siAmplitude', categories: ['Analytics'] },
    'Playwright': { siKey: 'siPlaywright', categories: ['Testing'] },
    'SendGrid': { siKey: 'siSendgrid', categories: ['Email'] },
    'Amazon SES': { siKey: 'siAmazonsimpleemailservice', categories: ['Email'] },
    'imgix': { siKey: 'siImgix', categories: ['Image / Media'] },
    'Mux': { siKey: 'siMux', categories: ['Image / Media'] },
    'UploadThing': { categories: ['Image / Media'], color: '#E11D48' },
    'Adobe XD': { siKey: 'siAdobexd', categories: ['Design'] },
    'Canva': { siKey: 'siCanva', categories: ['Design'] },
    'InVision': { siKey: 'siInvision', categories: ['Design'] },
    'Slack': { siKey: 'siSlack', categories: ['Collaboration'] },
    'Microsoft Teams': { siKey: 'siMicrosoftteams', categories: ['Collaboration'] },

    // Multi-category fixes for existing techs
    'Supabase': { siKey: 'siSupabase', categories: ['Database', 'Authentication', 'Hosting'] },
    'Firebase Auth': { siKey: 'siFirebase', categories: ['Authentication', 'Database', 'Hosting'] },
    'Stripe': { siKey: 'siStripe', categories: ['Payment', 'Ecommerce'] },
    'Stripe (Commerce)': { siKey: 'siStripe', categories: ['Ecommerce', 'Payment'] },
    'GitLab': { siKey: 'siGitlab', categories: ['Repository', 'CI/CD'] },
    'GitLab CI': { siKey: 'siGitlab', categories: ['CI/CD', 'Repository'] },
    'GitHub Actions': { siKey: 'siGithubactions', categories: ['CI/CD'] },
    'Cloudflare': { siKey: 'siCloudflare', categories: ['CDN', 'Hosting', 'Security'] },
    'Redis': { siKey: 'siRedis', categories: ['Database', 'CDN'] },
    'Terraform': { siKey: 'siTerraform', categories: ['CI/CD', 'Hosting'] },
    'Sentry': { siKey: 'siSentry', categories: ['Monitoring', 'Testing'] },
    'Storybook': { siKey: 'siStorybook', categories: ['Testing', 'Design'] },
    'Electron': { siKey: 'siElectron', categories: ['Frontend Framework', 'Build Tools'] },
  }

  let fixed = 0
  for (const [name, fix] of Object.entries(fixes)) {
    let svgLogo = ''
    let color = fix.color || ''

    if (fix.siKey) {
      const icon = (si as any)[fix.siKey]
      if (icon) {
        svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="${icon.path}"/></svg>`
        if (!color) color = `#${icon.hex}`
      }
    }

    const [row] = await sql`SELECT id FROM brands WHERE name = ${name} LIMIT 1`
    if (!row) continue

    if (svgLogo) {
      await sql`
        UPDATE brands SET
          svg_logo = ${svgLogo},
          color = ${color},
          categories = ${fix.categories},
          category = ${fix.categories[0]}
        WHERE id = ${row.id}
      `
    } else {
      await sql`
        UPDATE brands SET
          categories = ${fix.categories},
          category = ${fix.categories[0]},
          color = COALESCE(NULLIF(${color}, ''), color)
        WHERE id = ${row.id}
      `
    }
    fixed++
  }
  console.log(`  Fixed ${fixed} technologies`)

  // 6. For any remaining techs with single category but empty categories array, populate it
  console.log('6. Syncing remaining categories...')
  await sql`
    UPDATE brands SET categories = ARRAY[category]
    WHERE (categories IS NULL OR categories = '{}')
      AND category != 'uncategorized' AND category != ''
  `

  // 7. Remove "Stripe (Commerce)" duplicate — merge into "Stripe"
  console.log('7. Cleaning up Stripe duplicate...')
  const [stripeCommerce] = await sql`SELECT id FROM brands WHERE name = 'Stripe (Commerce)' LIMIT 1`
  if (stripeCommerce) {
    await sql`DELETE FROM brands WHERE id = ${stripeCommerce.id}`
    // Make sure regular Stripe has Ecommerce category
    await sql`
      UPDATE brands SET categories = ARRAY['Payment', 'Ecommerce']
      WHERE name = 'Stripe'
    `
  }

  // 8. Remove "GitLab CI" duplicate — merge into "GitLab"
  const [gitlabCI] = await sql`SELECT id FROM brands WHERE name = 'GitLab CI' LIMIT 1`
  if (gitlabCI) {
    await sql`DELETE FROM brands WHERE id = ${gitlabCI.id}`
    await sql`UPDATE brands SET categories = ARRAY['Repository', 'CI/CD'] WHERE name = 'GitLab'`
  }

  // 9. Remove "AWS CloudFront" — merge into "AWS"
  const [cfRow] = await sql`SELECT id FROM brands WHERE name = 'AWS CloudFront' LIMIT 1`
  if (cfRow) {
    await sql`DELETE FROM brands WHERE id = ${cfRow.id}`
    await sql`UPDATE brands SET categories = ARRAY['Hosting', 'CDN'] WHERE name = 'AWS'`
  }

  // 10. Stats
  const [{ total }] = await sql`SELECT COUNT(*)::int as total FROM brands`
  const [{ with_svg }] = await sql`SELECT COUNT(*)::int as with_svg FROM brands WHERE svg_logo != '' AND svg_logo IS NOT NULL`
  const [{ with_cats }] = await sql`SELECT COUNT(*)::int as with_cats FROM brands WHERE categories != '{}' AND categories IS NOT NULL`
  const [{ still_uncat }] = await sql`SELECT COUNT(*)::int as still_uncat FROM brands WHERE categories = '{}' OR categories IS NULL`

  console.log(`\n✓ Done:`)
  console.log(`  Total: ${total}`)
  console.log(`  With SVG: ${with_svg}`)
  console.log(`  With categories: ${with_cats}`)
  console.log(`  Still uncategorized: ${still_uncat}`)
}

main().catch(e => { console.error('Fix failed:', e.message); process.exit(1) })
