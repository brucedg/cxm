import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })
async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const [row] = await sql`SELECT value FROM settings WHERE key = 'hero'`
  const hero = row.value
  if (hero.tagline?.includes('Senior')) hero.tagline = hero.tagline.replace('Senior ', '')
  if (hero.description?.includes('Senior')) hero.description = hero.description.replace(/Senior /g, '').replace('senior ', '')
  await sql`UPDATE settings SET value = ${JSON.stringify(hero)} WHERE key = 'hero'`
  console.log('✓ Removed "Senior" from hero settings')
}
main()
