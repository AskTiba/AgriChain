/**
 * Run this script to apply order fulfillment schema changes:
 *   npx tsx scripts/migrate-order-fulfillment.ts
 *
 * Changes:
 *   - Adds confirmed_by (uuid FK → users) to orders
 *   - Adds assigned_driver_id (uuid FK → users) to orders
 *   - Converts buyer_id from text to uuid
 */
import pg from 'pg'
import 'dotenv/config'

async function migrate() {
  console.log('Running order fulfillment migration...')

  for (let attempt = 1; attempt <= 3; attempt++) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    try {
      await client.connect()

      await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES users(id)`)
      console.log('  ✓ Added confirmed_by column')

      await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_id uuid REFERENCES users(id)`)
      console.log('  ✓ Added assigned_driver_id column')

      await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL`)
      await client.query(`UPDATE orders SET buyer_id = NULL WHERE buyer_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`)
      await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id TYPE uuid USING buyer_id::uuid`)
      await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id SET NOT NULL`)
      console.log('  ✓ Converted buyer_id to uuid')

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
  console.error('Your Neon project may be paused. Resume it at https://console.neon.tech')
  process.exit(1)
}

migrate()
