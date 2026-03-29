import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })

/**
 * This script does two things:
 * 1. Updates brand colors from researched data (pass --colors flag with JSON file)
 * 2. Generates colorized SVGs from the monochrome versions
 *
 * The colorized SVG replaces fill="currentColor" with the brand color.
 * For single-path logos this produces a correctly branded version.
 * Multi-color logos should be uploaded manually via admin.
 *
 * Usage:
 *   npx tsx scripts/colorize-svgs.ts                  # Generate colorized SVGs from existing colors
 *   npx tsx scripts/colorize-svgs.ts --colors data.json  # Apply colors first, then colorize
 */

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  // Check for --colors flag
  const colorsIdx = process.argv.indexOf('--colors')
  if (colorsIdx !== -1 && process.argv[colorsIdx + 1]) {
    const fs = await import('fs')
    const colorsFile = process.argv[colorsIdx + 1]
    console.log(`1. Applying brand colors from ${colorsFile}...`)

    const raw = fs.readFileSync(colorsFile, 'utf-8')
    // Extract JSON from markdown code blocks if present
    const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) || raw.match(/(\[[\s\S]*\])/)
    if (!jsonMatch) {
      console.error('Could not parse JSON from file')
      process.exit(1)
    }
    const colors: { name: string; color: string }[] = JSON.parse(jsonMatch[1])

    let updated = 0
    for (const { name, color } of colors) {
      if (!color || !color.startsWith('#')) continue
      const result = await sql`UPDATE brands SET color = ${color} WHERE name = ${name} RETURNING id`
      if (result.length) updated++
    }
    console.log(`  Updated ${updated} brand colors`)
  }

  // 2. Generate colorized SVGs
  console.log('2. Generating colorized SVGs...')

  const techs = await sql`
    SELECT id, name, svg_logo, svg_logo_color, color
    FROM brands
    WHERE svg_logo != '' AND svg_logo IS NOT NULL
    ORDER BY name
  `

  let generated = 0
  let skipped = 0

  for (const tech of techs) {
    // Skip if already has a color SVG (manually uploaded, don't overwrite)
    if (tech.svg_logo_color && tech.svg_logo_color.trim() !== '') {
      skipped++
      continue
    }

    if (!tech.color) {
      console.log(`  ⚠ ${tech.name}: no brand color, skipping`)
      continue
    }

    // Create colorized version by replacing fill="currentColor" with the brand color
    let colorSvg = tech.svg_logo
      .replace(/fill="currentColor"/g, `fill="${tech.color}"`)
      .replace(/fill='currentColor'/g, `fill='${tech.color}'`)

    // If the SVG didn't have fill="currentColor", add fill to the path elements
    if (colorSvg === tech.svg_logo) {
      // Try adding fill to path elements that don't have one
      colorSvg = colorSvg.replace(/<path(?![^>]*fill=)/g, `<path fill="${tech.color}"`)
    }

    await sql`UPDATE brands SET svg_logo_color = ${colorSvg} WHERE id = ${tech.id}`
    generated++
  }

  const [{ total }] = await sql`SELECT COUNT(*)::int as total FROM brands`
  const [{ with_color_svg }] = await sql`SELECT COUNT(*)::int as with_color_svg FROM brands WHERE svg_logo_color != '' AND svg_logo_color IS NOT NULL`

  console.log(`\n✓ Done:`)
  console.log(`  Generated: ${generated}`)
  console.log(`  Skipped (already had color SVG): ${skipped}`)
  console.log(`  Total: ${total}, With color SVG: ${with_color_svg}`)
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1) })
