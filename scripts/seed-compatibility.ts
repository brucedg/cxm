import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

// Score: 3=excellent, 2=good, 1=poor
// Pairs are bidirectional — we insert both directions
const PAIRINGS: [string, string, number, string][] = [
  // Excellent pairings (3)
  ['Next.js', 'Vercel', 3, 'Built by the same team — optimised deployment'],
  ['Next.js', 'React', 3, 'Next.js is built on React'],
  ['Next.js', 'TypeScript', 3, 'First-class TypeScript support'],
  ['Next.js', 'Tailwind CSS', 3, 'Official starter template available'],
  ['Nuxt.js', 'Vue.js', 3, 'Nuxt.js is built on Vue.js'],
  ['Nuxt.js', 'Vercel', 3, 'Excellent Vercel deployment support'],
  ['React', 'TypeScript', 3, 'Strongly typed React is industry standard'],
  ['Vue.js', 'TypeScript', 3, 'Full TypeScript support in Vue 3'],
  ['Svelte', 'TypeScript', 3, 'Native TypeScript support'],
  ['Astro', 'React', 3, 'React is a supported Astro integration'],
  ['Astro', 'Tailwind CSS', 3, 'Official Tailwind integration'],
  ['Astro', 'Netlify', 3, 'Excellent static deployment support'],
  ['Gatsby', 'React', 3, 'Gatsby is built on React'],
  ['Gatsby', 'GraphQL', 3, 'GraphQL is Gatsby\'s data layer'],
  ['Remix', 'React', 3, 'Remix is a React framework'],
  ['Flutter', 'Dart', 3, 'Flutter uses Dart exclusively'],
  ['Flutter', 'Firebase Auth', 3, 'Official Firebase Flutter SDK'],
  ['React Native', 'React', 3, 'Same component model'],
  ['Electron', 'React', 3, 'Popular combination for desktop apps'],
  ['Tauri', 'Rust', 3, 'Tauri is built with Rust'],
  ['Supabase', 'PostgreSQL', 3, 'Supabase is built on PostgreSQL'],
  ['Neon', 'PostgreSQL', 3, 'Neon is serverless PostgreSQL'],
  ['PlanetScale', 'MySQL', 3, 'PlanetScale is built on Vitess/MySQL'],
  ['Vercel', 'GitHub', 3, 'Seamless Git integration'],
  ['Vercel', 'GitHub Actions', 3, 'CI/CD pairs well with Vercel previews'],
  ['Netlify', 'GitHub', 3, 'Seamless Git integration'],
  ['Docker', 'Kubernetes', 3, 'K8s orchestrates Docker containers'],
  ['Stripe', 'Next.js', 3, 'Official Stripe + Next.js integration'],
  ['Auth0', 'Next.js', 3, 'Official Auth0 Next.js SDK'],
  ['Clerk', 'Next.js', 3, 'Built specifically for Next.js'],
  ['Sanity', 'Next.js', 3, 'Official Next.js toolkit'],
  ['Contentful', 'Next.js', 3, 'Official Next.js starter'],
  ['Storyblok', 'Nuxt.js', 3, 'Official Nuxt.js integration'],
  ['shadcn/ui', 'Tailwind CSS', 3, 'shadcn/ui is built on Tailwind'],
  ['shadcn/ui', 'Radix UI', 3, 'shadcn/ui wraps Radix primitives'],
  ['Chakra UI', 'React', 3, 'React-only component library'],
  ['Material UI', 'React', 3, 'React-only component library'],
  ['Jest', 'React', 3, 'Standard React testing setup'],
  ['Vitest', 'Vite', 3, 'Vitest is built for Vite projects'],
  ['Playwright', 'TypeScript', 3, 'First-class TypeScript support'],
  ['Storybook', 'React', 3, 'Best React component workshop'],
  ['Terraform', 'AWS', 3, 'Most popular IaC for AWS'],
  ['GitHub Actions', 'GitHub', 3, 'Native CI/CD for GitHub repos'],
  ['GitLab', 'Kubernetes', 3, 'Built-in K8s deployment'],
  ['Vite', 'React', 3, 'Officially supported framework'],
  ['Vite', 'TypeScript', 3, 'Built-in TypeScript support'],
  ['Turborepo', 'Vercel', 3, 'Built by Vercel'],
  ['tRPC', 'TypeScript', 3, 'End-to-end type safety requires TS'],
  ['tRPC', 'Next.js', 3, 'Popular Next.js integration'],
  ['Apollo GraphQL', 'GraphQL', 3, 'Apollo implements GraphQL'],
  ['Sentry', 'Next.js', 3, 'Official Next.js SDK'],
  ['Sentry', 'Vercel', 3, 'Official Vercel integration'],
  ['Resend', 'React', 3, 'React Email for templates'],
  ['Cloudinary', 'Next.js', 3, 'Official Next.js SDK'],
  ['Bun', 'TypeScript', 3, 'Native TypeScript execution'],

  // Good pairings (2)
  ['Next.js', 'Netlify', 2, 'Works but not as optimised as Vercel'],
  ['Next.js', 'AWS', 2, 'Possible via SST or custom setup'],
  ['React', 'Vue.js', 2, 'Different paradigms — pick one per project'],
  ['Angular', 'TypeScript', 3, 'Angular requires TypeScript'],
  ['Angular', 'Vercel', 2, 'Works but not optimised for Angular'],
  ['WordPress', 'Next.js', 2, 'Headless WordPress with Next.js frontend'],
  ['WordPress', 'GraphQL', 2, 'Via WPGraphQL plugin'],
  ['Shopify', 'Next.js', 2, 'Hydrogen is Shopify\'s own framework though'],
  ['MongoDB', 'Next.js', 2, 'Works but not serverless-optimised'],
  ['Redis', 'Vercel', 2, 'Use Upstash Redis for serverless'],
  ['Docker', 'Vercel', 2, 'Vercel doesn\'t use Docker — serverless only'],
  ['Figma', 'React', 2, 'Figma designs translate well to React'],
  ['Figma', 'Tailwind CSS', 2, 'Good workflow with plugins'],
  ['Cypress', 'React', 2, 'Works well, Playwright is gaining share'],
  ['Jenkins', 'Docker', 2, 'Traditional but complex setup'],
  ['Heroku', 'Node.js', 2, 'Good but pricier than alternatives'],
  ['Drupal', 'Next.js', 2, 'Headless Drupal is possible but complex'],

  // Poor pairings (1)
  ['Angular', 'React', 1, 'Competing frameworks — use one, not both'],
  ['Vue.js', 'React', 1, 'Competing frameworks — use one, not both'],
  ['Svelte', 'React', 1, 'Competing frameworks — use one, not both'],
  ['WordPress', 'Shopify', 1, 'Competing CMS/ecommerce platforms'],
  ['WooCommerce', 'Shopify', 1, 'Competing ecommerce platforms'],
  ['MySQL', 'PostgreSQL', 1, 'Pick one relational database'],
  ['MongoDB', 'PostgreSQL', 1, 'Different paradigms — choose based on use case'],
  ['Webpack', 'Vite', 1, 'Competing bundlers — Vite is the modern choice'],
  ['Jest', 'Vitest', 1, 'Competing test frameworks — pick one'],
  ['npm', 'pnpm', 1, 'Competing package managers'],
  ['Heroku', 'Vercel', 1, 'Competing hosting platforms'],
  ['Auth0', 'Clerk', 1, 'Competing auth providers'],
  ['Auth0', 'Firebase Auth', 1, 'Competing auth providers'],
  ['Sitecore', 'WordPress', 1, 'Competing CMS platforms'],
  ['Contentful', 'Sanity', 1, 'Competing headless CMS platforms'],
]

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // Get all tech IDs
  const techs = await sql`SELECT id, name FROM brands`
  const nameToId = new Map(techs.map(t => [t.name, t.id]))

  // Clear existing
  await sql`DELETE FROM tech_compatibility`

  let inserted = 0
  for (const [nameA, nameB, score, note] of PAIRINGS) {
    const idA = nameToId.get(nameA)
    const idB = nameToId.get(nameB)
    if (!idA || !idB) {
      console.log(`  ⚠ Skipped: ${nameA} ↔ ${nameB} (not found)`)
      continue
    }

    // Insert both directions
    await sql`
      INSERT INTO tech_compatibility (tech_a_id, tech_b_id, score, note)
      VALUES (${idA}, ${idB}, ${score}, ${note})
      ON CONFLICT (tech_a_id, tech_b_id) DO UPDATE SET score = ${score}, note = ${note}
    `
    await sql`
      INSERT INTO tech_compatibility (tech_a_id, tech_b_id, score, note)
      VALUES (${idB}, ${idA}, ${score}, ${note})
      ON CONFLICT (tech_a_id, tech_b_id) DO UPDATE SET score = ${score}, note = ${note}
    `
    inserted++
  }

  console.log(`✓ ${inserted} compatibility pairings seeded (${inserted * 2} directional entries)`)
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1) })
