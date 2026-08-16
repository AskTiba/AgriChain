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

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('Running order fulfillment migration...')

  await client.connect()

  // Add new columns
  await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_by uuid REFERENCES users(id)`)
  console.log('  ✓ Added confirmed_by column')

  await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_id uuid REFERENCES users(id)`)
  console.log('  ✓ Added assigned_driver_id column')

  // Convert buyer_id from text to uuid
  await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id DROP NOT NULL`)
  await client.query(`UPDATE orders SET buyer_id = NULL WHERE buyer_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'`)
  await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id TYPE uuid USING buyer_id::uuid`)
  await client.query(`ALTER TABLE orders ALTER COLUMN buyer_id SET NOT NULL`)
  console.log('  ✓ Converted buyer_id to uuid')

  await client.end()
  console.log('Migration complete!')
}

migrate().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
