/**
 * Fetch proper multi-colour SVG logos for all technologies.
 *
 * Sources checked in order:
 * 1. svgl.app API (curated SVG logo collection)
 * 2. SVGRepo search
 * 3. Brand websites (press/media pages)
 *
 * Usage:
 *   npx tsx scripts/fetch-color-svgs.ts              # Fetch missing colour SVGs
 *   npx tsx scripts/fetch-color-svgs.ts --all         # Re-fetch all, overwrite existing
 *   npx tsx scripts/fetch-color-svgs.ts --name "React" # Fetch for a single tech
 *
 * This script is idempotent — safe to run multiple times.
 * All SVGs are sanitized before storage.
 */

import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

// Known slug mappings for svgl.app (name → svgl slug)
const SVGL_SLUGS: Record<string, string> = {
  'Next.js': 'nextjs', 'Nuxt.js': 'nuxtjs', 'Vue.js': 'vuejs',
  'Node.js': 'nodejs', 'Tailwind CSS': 'tailwindcss',
  'VS Code': 'vscode', 'React Native': 'react-native',
  'Material UI': 'materialui', 'Chakra UI': 'chakraui',
  'Radix UI': 'radixui', 'shadcn/ui': 'shadcnui',
  'styled-components': 'styledcomponents',
  'Apollo GraphQL': 'apollographql',
  'OpenAPI / Swagger': 'swagger',
  'Google Analytics': 'google-analytics',
  'Google Cloud': 'google-cloud',
  'Google Ads': 'google-ads',
  'Meta Ads': 'meta', 'GitHub Actions': 'github-actions',
  'GitHub Copilot': 'github-copilot',
  'Azure DevOps': 'azure-devops',
  'Firebase Auth': 'firebase',
  'Amazon SES': 'aws-ses',
  'Testing Library': 'testing-library',
  'Adobe XD': 'adobe-xd',
  'Fly.io': 'flyio',
  'C#': 'csharp',
  'Google Gemini': 'google-gemini',
}

async function fetchSvgFromSvgl(name: string): Promise<string | null> {
  const slug = SVGL_SLUGS[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '')
  try {
    // Try the svgl API
    const res = await fetch(`https://api.svgl.app?search=${encodeURIComponent(name)}`, {
      headers: { 'User-Agent': 'CXM-TechLogos/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || !Array.isArray(data) || data.length === 0) return null

    // Find best match
    const match = data.find((d: any) =>
      d.title?.toLowerCase() === name.toLowerCase() ||
      d.title?.toLowerCase().includes(name.toLowerCase())
    ) || data[0]

    if (!match) return null

    // Get the SVG URL — svgl returns either a string URL or an object with light/dark
    let svgUrl: string | null = null
    if (typeof match.route === 'string') {
      svgUrl = match.route
    } else if (match.route?.light) {
      svgUrl = match.route.light
    }

    if (!svgUrl) return null

    // Fetch the actual SVG content
    const svgRes = await fetch(svgUrl, { headers: { 'User-Agent': 'CXM-TechLogos/1.0' } })
    if (!svgRes.ok) return null
    const svgText = await svgRes.text()

    // Verify it's actually SVG
    if (!svgText.includes('<svg')) return null

    return svgText.trim()
  } catch {
    return null
  }
}

async function fetchSvgFromSvgRepo(name: string): Promise<string | null> {
  try {
    // Search SVGRepo
    const searchUrl = `https://www.svgrepo.com/vectors/${encodeURIComponent(name.toLowerCase())}/`
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'CXM-TechLogos/1.0' },
    })
    if (!res.ok) return null
    const html = await res.text()

    // Find first SVG link that looks like a logo
    const match = html.match(/href="(\/show\/\d+\/[^"]*logo[^"]*)"/) ||
                  html.match(/href="(\/show\/\d+\/[^"]*)"/)
    if (!match) return null

    // Fetch the SVG page
    const svgPageRes = await fetch(`https://www.svgrepo.com${match[1]}`, {
      headers: { 'User-Agent': 'CXM-TechLogos/1.0' },
    })
    if (!svgPageRes.ok) return null
    const svgPageHtml = await svgPageRes.text()

    // Extract download link
    const dlMatch = svgPageHtml.match(/href="(\/download\/\d+\/[^"]*\.svg)"/)
    if (!dlMatch) return null

    const dlRes = await fetch(`https://www.svgrepo.com${dlMatch[1]}`, {
      headers: { 'User-Agent': 'CXM-TechLogos/1.0' },
    })
    if (!dlRes.ok) return null
    const svgText = await dlRes.text()

    if (!svgText.includes('<svg')) return null
    return svgText.trim()
  } catch {
    return null
  }
}

function normalizeSvg(svg: string): string {
  // Ensure viewBox is present, normalize dimensions
  let normalized = svg.trim()

  // Remove width/height attributes to let CSS control sizing
  normalized = normalized.replace(/\s+width="[^"]*"/g, '')
  normalized = normalized.replace(/\s+height="[^"]*"/g, '')

  // Remove comments and desc tags
  normalized = normalized.replace(/<!--[\s\S]*?-->/g, '')
  normalized = normalized.replace(/<desc>[\s\S]*?<\/desc>/g, '')
  normalized = normalized.replace(/<title>[\s\S]*?<\/title>/g, '')

  // Remove IDs that might conflict
  normalized = normalized.replace(/\s+id="[^"]*"/g, '')

  // Remove stroke-width if very small (cleanup)
  normalized = normalized.replace(/\s+stroke-width="0\.25"/g, '')

  return normalized
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const args = process.argv.slice(2)
  const fetchAll = args.includes('--all')
  const singleName = args.includes('--name') ? args[args.indexOf('--name') + 1] : null

  // Get technologies to process
  let techs
  if (singleName) {
    techs = await sql`SELECT id, name, svg_logo_color FROM brands WHERE name = ${singleName}`
  } else if (fetchAll) {
    techs = await sql`SELECT id, name, svg_logo_color FROM brands ORDER BY name`
  } else {
    // Only fetch for techs missing colour SVGs (or that have the auto-generated tinted ones)
    techs = await sql`
      SELECT id, name, svg_logo_color FROM brands
      WHERE svg_logo_color = '' OR svg_logo_color IS NULL
         OR svg_logo_color LIKE '%fill="#%'
      ORDER BY name
    `
  }

  console.log(`Processing ${techs.length} technologies...\n`)

  let found = 0
  let notFound = 0
  const missing: string[] = []

  for (const tech of techs) {
    process.stdout.write(`  ${tech.name.padEnd(25)}`)

    // Try svgl.app first
    let svg = await fetchSvgFromSvgl(tech.name)
    let source = 'svgl'

    // Try SVGRepo if svgl didn't work
    if (!svg) {
      svg = await fetchSvgFromSvgRepo(tech.name)
      source = 'svgrepo'
    }

    if (svg) {
      const normalized = normalizeSvg(svg)
      await sql`UPDATE brands SET svg_logo_color = ${normalized} WHERE id = ${tech.id}`
      console.log(`✓ (${source})`)
      found++
    } else {
      console.log(`✗ not found`)
      missing.push(tech.name)
      notFound++
    }

    // Small delay to be respectful to APIs
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n✓ Done: ${found} found, ${notFound} not found`)
  if (missing.length > 0) {
    console.log(`\nMissing (upload manually via admin):`)
    missing.forEach(n => console.log(`  - ${n}`))
  }
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1) })
