import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
config({ path: '.env.local' })
async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const [row] = await sql`SELECT value FROM settings WHERE key = 'hero'`
  console.log(JSON.stringify(row.value, null, 2))
}
main()
