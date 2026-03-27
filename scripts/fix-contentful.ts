import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })
async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  await sql`UPDATE brands SET logo_url = 'https://res.cloudinary.com/dum2tng78/image/upload/v1774568387/CXM/Brands/contentful-color.png' WHERE name = 'Contentful'`
  console.log('✓ Contentful logo updated to colour version')
}
main()
