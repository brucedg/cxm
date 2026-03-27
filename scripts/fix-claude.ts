import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })
async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`UPDATE brands SET logo_url = 'https://res.cloudinary.com/dum2tng78/image/upload/v1774568251/CXM/Brands/claude-logo.png' WHERE name = 'Claude'`
  console.log('✓ Claude logo updated')
}
main()
