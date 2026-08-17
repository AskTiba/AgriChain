/**
 * Run this script to make orders.buyer_id nullable for account deletion:
 *   npx tsx scripts/migrate-delete-account.ts
 */
import pg from 'pg'
import 'dotenv/config'

async function migrate() {
  console.log('Running delete-account migration...')

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    try {
      await client.connect()

      await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL`)
      console.log('  ✓ Made orders.buyer_id nullable')

      await client.end()
      console.log('Migration complete!')
      return
    } catch (e) {
      const err = e as Error
      console.log(`  Attempt ${attempt}/3 failed: ${err.message}`)
      await client.end().catch(() => {})
      if (attempt < 3) {
        console.log(`  Retrying in ${attempt * 5}s...`)
        await new Promise((r) => setTimeout(r, attempt * 5000))
      }
    }
  }

  console.error('Migration failed after 3 attempts.')
  process.exit(1)
}

migrate()
