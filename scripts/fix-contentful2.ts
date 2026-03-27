import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })
async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  // Use Cloudinary e_background_removal transformation for on-the-fly bg removal
  await sql`UPDATE brands SET logo_url = 'https://res.cloudinary.com/dum2tng78/image/upload/e_background_removal/CXM/Brands/contentful-color.png' WHERE name = 'Contentful'`
  console.log('✓ Contentful logo updated with transparent background')
}
main()
